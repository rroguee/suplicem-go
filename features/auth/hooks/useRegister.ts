import { useContext, useState } from "react";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from "@/context/authContext";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { createUserAccount } from "@/services/userService";
import { lookupRnc } from "@/services/authService";
import { RegisterFormData } from "@/types/users";
import { registerSchema } from "@/validations/registerSchema";
import { pickAndCompressImage } from "@/utils/imageUtils";
import { saveAuthSession, saveAcceptedTerms } from "@/utils/authStorage";
import { usePhoneRegister } from "./usePhoneRegister";

export const useRegister = () => {
  const authContext = useContext(AuthContext);
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();
  const router = useRouter();
  const phoneRegistration = usePhoneRegister();
  const [identificationImage, setIdentificationImage] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      registerMethod: "email",
      personType: "fisica",
      companyRnc: "",
      companyName: "",
      identificationType: "Cedula",
      identification: "",
      email: "",
      password: "",
      confirmPassword: "",
      names: "",
      lastNames: "",
      phone: "",
      userType: "client",
      addresses: [],
      vehicle: {
        brand: "",
        model: "",
        year: "",
        tons: "",
        plateNumber: "",
      },
    },
  });

  const addresses = watch("addresses") || [];
  const userType = watch("userType");
  const registerMethod = watch("registerMethod") || "email";
  const personType = watch("personType") || "fisica";
  const identificationType = watch("identificationType");
  const [isLookingUpRnc, setIsLookingUpRnc] = useState(false);

  const handleLookupRnc = async () => {
    const rawRnc = watch("companyRnc") || "";
    const cleanRnc = rawRnc.replace(/[^0-9]/g, "");

    if (cleanRnc.length !== 9 && cleanRnc.length !== 11) {
      showAlert({
        message: "Ingresa un RNC válido de 9 u 11 dígitos numéricos.",
        type: "warning",
      });
      return;
    }

    setIsLookingUpRnc(true);
    show();
    try {
      const response = await lookupRnc(cleanRnc);
      if (response?.data?.success && response?.data?.identity) {
        const { name, commercialName, status } = response.data.identity;
        const resolvedName = name || commercialName || "";
        setValue("companyName", resolvedName, { shouldValidate: true });
        setValue("names", resolvedName, { shouldValidate: false });
        setValue("lastNames", "", { shouldValidate: false });
        setValue("identification", cleanRnc, { shouldValidate: false });
        setValue("identificationType", "RNC", { shouldValidate: false });
        showAlert({
          message: `Empresa encontrada: ${resolvedName} (${status || "ACTIVO"})`,
          type: "success",
        });
      } else {
        showAlert({
          message:
            response?.data?.message ||
            response?.message ||
            "No se encontraron datos para el RNC en la DGII.",
          type: "warning",
        });
      }
    } catch (err: any) {
      showAlert({
        message: err?.message || "Error al consultar el RNC en la DGII.",
        type: "error",
      });
    } finally {
      setIsLookingUpRnc(false);
      hide();
    }
  };

  const handlePickIdImage = async (useCamera: boolean = false) => {
    const result = await pickAndCompressImage({ useCamera, maxWidth: 800, quality: 0.5 });
    if (!result.success) {
      if (result.errorMessage) {
        showAlert({ message: result.errorMessage, type: "warning" });
      }
      return;
    }
    if (result.uri) {
      setIdentificationImage(result.uri);
      showAlert({
        message: "¡Foto de la cédula/identificación adjuntada correctamente!",
        type: "success",
      });
    }
  };

  const addAddress = () => {
    setValue("addresses", [
      ...addresses,
      {
        placeId: "",
        description: "",
        latitude: 0,
        longitude: 0,
        additionalInfo: "",
      },
    ]);
  };

  const removeAddress = (index: number) => {
    const updated = addresses?.filter((_, i) => i !== index);
    setValue("addresses", updated);
  };

  const onSubmit = async (data: RegisterFormData) => {
    if (!acceptedTerms) {
      showAlert({
        message: "Debes aceptar los Términos y Condiciones y la Política de Privacidad para registrarte.",
        type: "warning",
      });
      return;
    }

    const isEmpresa = data.personType === "juridica";
    const isPhone = data.registerMethod === "phone";

    if (isPhone && isEmpresa) {
      showAlert({
        message: "El registro de empresas requiere correo electrónico.",
        type: "warning",
      });
      return;
    }

    // Obligatorio para personas físicas en ambos métodos (Correo y Teléfono)
    if (!identificationImage && !isEmpresa) {
      showAlert({
        message: "Debes adjuntar la foto de tu cédula o pasaporte para completar tu registro y pasar a verificación.",
        type: "warning",
      });
      return;
    }

    const payload: any = { ...data };
    delete payload.confirmPassword;
    delete payload.registerMethod;

    // Normalizar Cédula a dígitos numéricos puros
    if (payload.identification && (payload.identificationType === "Cedula" || !payload.identificationType)) {
      payload.identification = payload.identification.replace(/\D/g, "");
    }

    // Normalizar teléfono a formato internacional E.164 (+1XXXXXXXXXX)
    if (payload.phone) {
      const cleanPhoneDigits = payload.phone.replace(/\D/g, "");
      const localPhone =
        cleanPhoneDigits.startsWith("1") && cleanPhoneDigits.length === 11
          ? cleanPhoneDigits.slice(1)
          : cleanPhoneDigits;
      if (localPhone.length === 10) {
        payload.phone = `+1${localPhone}`;
      }
    }

    if (isEmpresa) {
      payload.userType = "client";
      payload.identificationType = "RNC";
      payload.identification = data.companyRnc || "";
      payload.names = data.companyName || "";
      payload.lastNames = "";
      delete payload.vehicle;
    } else if (payload.userType !== "driver") {
      delete payload.vehicle;
    }
    if (payload.userType === "driver" && (!payload.addresses || payload.addresses.length === 0)) {
      delete payload.addresses;
    }

    if (isPhone) {
      delete payload.password;
      delete payload.vehicle; // Los choferes no se registran por teléfono
      payload.userType = "client"; // Forzar rol cliente en SMS
      payload.identificationImage = identificationImage;
      if (!payload.email) delete payload.email;
      await phoneRegistration.requestCode(payload);
      return;
    }

    payload.identificationImage = identificationImage || undefined;

    show();
    try {
      const responseRegister = await createUserAccount(payload);

      if (responseRegister?.success && responseRegister?.data?.success) {
        const regData = responseRegister.data;
        if (regData.idToken && regData.user) {
          const now = Date.now();
          const newSession = {
            token: regData.idToken,
            refreshToken: regData.refreshToken,
            expiresAt: now + parseInt(regData.expiresIn || "3600") * 1000,
          };
          await saveAuthSession(newSession);
          if (regData.user.uid) {
            await saveAcceptedTerms(regData.user.uid);
          }
          authContext.logIn(regData.user);
        }

        reset();
        setIdentificationImage(null);
        showAlert({
          message:
            "¡Registro exitoso! Tu solicitud ha sido guardada y está pendiente de verificación por el Administrador.",
          type: "success",
        });
        router.replace("/pending-approval");
      } else {
        const errorList = responseRegister?.data?.errors;
        let errorMsg = responseRegister?.message;
        if (Array.isArray(errorList) && errorList.length > 0) {
          errorMsg = errorList.map((err: any) => `${err.field}: ${err.message}`).join("\n");
        }
        showAlert({
          message:
            errorMsg ||
            (responseRegister?.data as any)?.error ||
            "No se pudo completar el registro.",
          type: "error",
        });
      }
    } catch (err: any) {
      console.error(err);
      showAlert({
        message: err?.message || "Ocurrió un error inesperado al procesar el registro.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  return {
    control,
    handleSubmit,
    watch,
    setValue,
    errors,
    addresses,
    userType,
    identificationImage,
    handlePickIdImage,
    addAddress,
    removeAddress,
    onSubmit,
    acceptedTerms,
    setAcceptedTerms,
    handleLookupRnc,
    isLookingUpRnc,
    identificationType,
    personType,
    registerMethod,
    phoneRegistration,
  };
};

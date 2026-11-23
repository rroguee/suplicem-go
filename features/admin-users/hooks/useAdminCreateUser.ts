import { useState, useContext } from "react";
import { AuthContext } from "@/context/authContext";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { createUserAccountByAdmin } from "@/services/userService";
import { VehicleData } from "../components/AdminUserVehicleFields";
import { Address } from "@/types/users";

const INITIAL_VEHICLE: VehicleData = {
  brand: "Toyota",
  model: "Dyna",
  year: "2020",
  tons: "8.50",
  plateNumber: "",
};

export function useAdminCreateUser() {
  const [names, setNames] = useState("");
  const [lastNames, setLastNames] = useState("");
  const [email, setEmail] = useState("");
  const [identification, setIdentification] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<"client" | "driver" | "admin" | "seller">("client");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [vehicle, setVehicle] = useState<VehicleData>(INITIAL_VEHICLE);

  const { user: authUser } = useContext(AuthContext);
  const isSeller = authUser?.userType === "seller";
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { show, hide } = useLoading();
  const { showAlert } = useAlert();

  const addAddress = () => {
    setAddresses((prev) => [
      ...prev,
      { placeId: "", description: "", latitude: 0, longitude: 0, additionalInfo: "" },
    ]);
  };

  const removeAddress = (index: number) => {
    setAddresses((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAddressPlace = (index: number, place: any) => {
    setAddresses((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...place };
      return next;
    });
  };

  const updateAddressInfo = (index: number, additionalInfo: string) => {
    setAddresses((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], additionalInfo };
      return next;
    });
  };

  const updateVehicle = (updated: Partial<VehicleData>) => {
    setVehicle((prev) => ({ ...prev, ...updated }));
  };

  const resetForm = () => {
    setNames("");
    setLastNames("");
    setEmail("");
    setIdentification("");
    setPhone("");
    setPassword("");
    setUserType("client");
    setAddresses([]);
    setVehicle(INITIAL_VEHICLE);
  };

  const handleCreateUser = async () => {
    const cleanNames = names.trim();
    const cleanLastNames = lastNames.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanId = identification.replace(/[^0-9]/g, "");

    if (!cleanNames || !cleanLastNames || !cleanEmail || !password || !cleanPhone || !cleanId) {
      showAlert({
        message: "Por favor, completa todos los campos requeridos.",
        type: "warning",
      });
      return;
    }

    if (cleanId.length !== 11) {
      showAlert({
        message: "La cédula de identidad debe contener exactamente 11 dígitos numéricos.",
        type: "warning",
      });
      return;
    }

    if (password.length < 6) {
      showAlert({
        message: "La contraseña debe tener al menos 6 caracteres.",
        type: "warning",
      });
      return;
    }

    if (userType === "driver") {
      if (!vehicle.brand || !vehicle.model || !vehicle.year || !vehicle.tons || !vehicle.plateNumber.trim()) {
        showAlert({
          message: "Para registrar un conductor, debes completar todos los datos del vehículo (marca, modelo, año, capacidad y placa).",
          type: "warning",
        });
        return;
      }
    }

    const payload: any = {
      identificationType: "Cedula",
      identification: cleanId,
      email: cleanEmail,
      password,
      confirmPassword: password,
      names: cleanNames,
      lastNames: cleanLastNames,
      phone: cleanPhone,
      userType,
      sellerId: isSeller ? authUser?.uid : undefined,
    };

    if (userType === "client") {
      const validAddresses = addresses.filter((a) => a.description && a.placeId);
      if (validAddresses.length > 0) {
        payload.addresses = validAddresses;
      }
    }

    if (userType === "driver") {
      payload.vehicle = {
        brand: vehicle.brand.trim(),
        model: vehicle.model.trim(),
        year: String(vehicle.year).trim(),
        tons: String(vehicle.tons).trim(),
        plateNumber: vehicle.plateNumber.trim().toUpperCase(),
      };
    }

    try {
      show();
      const res = await createUserAccountByAdmin(payload);
      if (res?.success) {
        setSuccessMessage(
          isSeller
            ? `El cliente ${cleanNames} ${cleanLastNames} ha sido registrado y vinculado a tu cartera de ventas exitosamente.`
            : `Usuario con rol ${
                userType === "driver" ? "Conductor" : userType === "admin" ? "Administrador" : userType === "seller" ? "Vendedor" : "Cliente"
              } registrado con éxito en el servidor.`
        );
        setShowSuccessModal(true);
      } else {
        showAlert({
          message: res?.message || "No se pudo registrar el usuario en el servidor.",
          type: "error",
        });
      }
    } catch (error: any) {
      showAlert({
        message: error?.message || "Ocurrió un error al crear la cuenta.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  return {
    names,
    setNames,
    lastNames,
    setLastNames,
    email,
    setEmail,
    identification,
    setIdentification,
    phone,
    setPhone,
    userType,
    setUserType,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    addresses,
    addAddress,
    removeAddress,
    updateAddressPlace,
    updateAddressInfo,
    vehicle,
    updateVehicle,
    handleCreateUser,
    isSeller,
    showSuccessModal,
    setShowSuccessModal,
    successMessage,
    resetForm,
  };
}

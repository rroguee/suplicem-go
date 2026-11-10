import * as yup from "yup";
import { isValidCedula, isValidPassport } from "@/utils/validationUtils";

/**
 * Validador para Nombres y Apellidos:
 * Permite cualquier nombre o apellido válido (con acentos, espacios, guiones y apóstrofes).
 * Rechaza números (0-9) y secuencias o caracteres en código binario.
 */
const validateNameNoNumbersOrBinary = (value: string | undefined) => {
  if (!value) return true;
  // Prohibir dígitos numéricos (0-9)
  if (/[0-9]/.test(value)) return false;
  // Prohibir patrones binarios explícitos (ej. 010101, 10101)
  if (/\b[01]{2,}\b/.test(value)) return false;
  // Permitir letras latinas, caracteres acentuados, espacios, guiones y apóstrofes
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(value);
};

export const registerSchema = yup.object({
  registerMethod: yup
    .string()
    .oneOf(["email", "phone"])
    .default("email")
    .required(),
  personType: yup.string().oneOf(["fisica", "juridica"]).default("fisica"),
  companyRnc: yup.string().when("personType", {
    is: "juridica",
    then: (schema) =>
      schema
        .required("El RNC de la empresa es obligatorio")
        .test("is-valid-rnc", "El RNC debe contener 9 u 11 dígitos numéricos", (value) => {
          if (!value) return false;
          const clean = value.replace(/[^0-9]/g, "");
          return clean.length === 9 || clean.length === 11;
        }),
    otherwise: (schema) => schema.optional(),
  }),
  companyName: yup.string().when("personType", {
    is: "juridica",
    then: (schema) =>
      schema.required("El nombre comercial o razón social es obligatorio"),
    otherwise: (schema) => schema.optional(),
  }),
  identificationType: yup.string().when("personType", {
    is: "juridica",
    then: (schema) => schema.optional().default("RNC"),
    otherwise: (schema) => schema.required("Tipo de documento requerido"),
  }),
  identification: yup.string().when("personType", {
    is: "juridica",
    then: (schema) => schema.optional(),
    otherwise: (schema) =>
      schema
        .required("Número de identificación requerido")
        .test(
          "is-valid-document",
          "El número de cédula debe contener exactamente 11 dígitos numéricos",
          function (value) {
            if (!value) return false;
            const type = (this.parent.identificationType || "").toLowerCase();
            if (type.includes("cedul")) {
              return isValidCedula(value);
            }
            return isValidPassport(value);
          }
        ),
  }),
  email: yup.string().when("registerMethod", {
    is: "phone",
    then: (schema) =>
      schema
        .transform((value) => (value === "" ? undefined : value))
        .email("Correo electrónico no válido")
        .optional(),
    otherwise: (schema) =>
      schema
        .required("El correo electrónico es obligatorio")
        .email("Correo electrónico no válido"),
  }),
  password: yup.string().when("registerMethod", {
    is: "phone",
    then: (schema) => schema.optional(),
    otherwise: (schema) =>
      schema
        .required("Contraseña requerida")
        .min(6, "La contraseña debe tener al menos 6 caracteres"),
  }),
  confirmPassword: yup.string().when("registerMethod", {
    is: "phone",
    then: (schema) => schema.optional(),
    otherwise: (schema) =>
      schema
        .oneOf([yup.ref("password")], "Las contraseñas no coinciden")
        .required("Debe confirmar la contraseña"),
  }),
  names: yup.string().when("personType", {
    is: "juridica",
    then: (schema) => schema.optional(),
    otherwise: (schema) =>
      schema
        .required("Los nombres son requeridos")
        .test(
          "no-numbers-or-binary-names",
          "Los nombres no pueden contener números ni caracteres binarios",
          validateNameNoNumbersOrBinary
        ),
  }),
  lastNames: yup.string().when("personType", {
    is: "juridica",
    then: (schema) => schema.optional(),
    otherwise: (schema) =>
      schema
        .required("Los apellidos son requeridos")
        .test(
          "no-numbers-or-binary-lastnames",
          "Los apellidos no pueden contener números ni caracteres binarios",
          validateNameNoNumbersOrBinary
        ),
  }),
  phone: yup.string().when("personType", {
    is: "juridica",
    then: (schema) =>
      schema
        .optional()
        .transform((val) => (!val ? "" : val))
        .test("phone-optional-format", "Número de teléfono inválido (ej. 809..., 829..., 849...)", (val) => {
          if (!val || val.trim() === "") return true;
          return /^8[0249]\d{8}$/.test(val);
        }),
    otherwise: (schema) =>
      schema
        .required("Teléfono requerido")
        .matches(/^8[0249]\d{8}$/, "Número de teléfono inválido (ej. 809..., 829..., 849...)"),
  }),
  userType: yup.string().required("Tipo de usuario requerido"),

  addresses: yup.array().when("userType", {
    is: (val: string) => val === "client",
    then: () =>
      yup
        .array()
        .of(
          yup.object().shape({
            description: yup.string().required("La dirección es requerida"),
            latitude: yup
              .number()
              .typeError("Latitud inválida")
              .required("Latitud requerida"),
            longitude: yup
              .number()
              .typeError("Longitud inválida")
              .required("Longitud requerida"),
            additionalInfo: yup
              .string()
              .notRequired()
              .default(""),
          })
        )
        .min(1, "Debe agregar al menos una dirección"),
    otherwise: () => yup.mixed().notRequired(),
  }),

  vehicle: yup.mixed().when("userType", {
    is: (val: string) => val === "driver",
    then: () =>
      yup.object({
        brand: yup.string().required("Marca requerida"),
        model: yup.string().required("Modelo requerido"),
        year: yup
          .number()
          .typeError("Año debe ser un número")
          .required("Año requerido")
          .min(1990, "Año inválido")
          .max(new Date().getFullYear(), "Año inválido"),
        tons: yup
          .number()
          .typeError("Toneladas debe ser un número")
          .required("Toneladas requeridas")
          .positive("Debe ser mayor a 0")
          .max(100, "¿Seguro que más de 100 toneladas?"),
        plateNumber: yup
          .string()
          .required("Número de placa requerido")
          .matches(
            /^[A-Z0-9]{6,8}$/i,
            "Placa inválida (6-8 caracteres alfanuméricos)"
          ),
      }),
    otherwise: () => yup.mixed().notRequired(),
  }),
});

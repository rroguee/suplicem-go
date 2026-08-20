import * as yup from "yup";

const isValidCedula = (value: string) => {
  if (!/^\d{11}$/.test(value)) return false;
  const digits = value.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    let tmp = digits[i] * (i % 2 === 0 ? 1 : 2);
    if (tmp > 9) tmp -= 9;
    sum += tmp;
  }
  return (10 - (sum % 10)) % 10 === digits[10];
};

export const registerSchema = yup.object({
  identificationType: yup.string().required("Tipo de documento requerido"),
  identification: yup
    .string()
    .required("Identificación requerida")
    .when("identificationType", {
      is: (val: string) => val === "Cedula",
      then: (schema) =>
        schema
          .matches(/^\d{11}$/, "Debe tener 11 dígitos")
          .test("is-valid-cedula", "Cédula inválida", isValidCedula),
      otherwise: (schema) =>
        schema.matches(
          /^[A-Z0-9]{6,12}$/i,
          "Pasaporte inválido (letras y números, 6-12 caracteres)"
        ),
    }),
  email: yup
    .string()
    .required("El correo es obligatorio")
    .email("Correo no válido"),
  password: yup
    .string()
    .required("Contraseña requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden")
    .required("Debe confirmar la contraseña"),
  names: yup
    .string()
    .required("Nombres requeridos")
    .matches(
      /^[A-Za-zÁÉÍÓÚáéíóúñÑ]+( [A-Za-zÁÉÍÓÚáéíóúñÑ]+)?$/,
      "Solo letras y un espacio entre nombres"
    ),
  lastNames: yup
    .string()
    .required("Apellidos requeridos")
    .matches(
      /^[A-Za-zÁÉÍÓÚáéíóúñÑ]+( [A-Za-zÁÉÍÓÚáéíóúñÑ]+)?$/,
      "Solo letras y un espacio entre apellidos"
    ),
  phone: yup
    .string()
    .required("Teléfono requerido")
    .matches(/^8[0249]\d{8}$/, "Teléfono inválido"),
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
              .required("Información adicional es requerida"),
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

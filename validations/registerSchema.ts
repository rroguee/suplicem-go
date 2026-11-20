import { z } from "zod";
import { isValidCedula, isValidPassport } from "@/utils/validationUtils";

const validateNameNoNumbersOrBinary = (value: string | undefined) => {
  if (!value) return true;
  if (/[0-9]/.test(value)) return false;
  if (/\b[01]{2,}\b/.test(value)) return false;
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(value);
};

const addressItemSchema = z.object({
  description: z.string().min(1, "La dirección es requerida"),
  latitude: z.number({ invalid_type_error: "Latitud requerida" }),
  longitude: z.number({ invalid_type_error: "Longitud requerida" }),
  additionalInfo: z.string().optional().default(""),
});

const vehicleSchema = z.object({
  brand: z.string().min(1, "Marca requerida"),
  model: z.string().min(1, "Modelo requerido"),
  year: z
    .number({ invalid_type_error: "Año debe ser un número" })
    .min(1990, "Año inválido")
    .max(new Date().getFullYear(), "Año inválido"),
  tons: z
    .number({ invalid_type_error: "Toneladas debe ser un número" })
    .positive("Debe ser mayor a 0")
    .max(100, "¿Seguro que más de 100 toneladas?"),
  plateNumber: z
    .string()
    .regex(/^[A-Z0-9]{6,8}$/i, "Placa inválida (6-8 caracteres alfanuméricos)"),
});

export const registerSchema = z
  .object({
    registerMethod: z.enum(["email", "phone"]).default("email"),
    personType: z.enum(["fisica", "juridica"]).default("fisica"),
    companyRnc: z.string().optional().default(""),
    companyName: z.string().optional().default(""),
    identificationType: z.string().optional().default("Cedula"),
    identification: z.string().optional().default(""),
    email: z.string().optional().default(""),
    password: z.string().optional().default(""),
    confirmPassword: z.string().optional().default(""),
    names: z.string().optional().default(""),
    lastNames: z.string().optional().default(""),
    phone: z.string().optional().default(""),
    userType: z.string().min(1, "Tipo de usuario requerido"),
    addresses: z.array(addressItemSchema).optional().default([]),
    vehicle: vehicleSchema.optional(),
  })
  .superRefine((data, ctx) => {
    // 1. Validaciones para persona jurídica
    if (data.personType === "juridica") {
      if (!data.companyRnc || data.companyRnc.trim() === "") {
        ctx.addIssue({
          path: ["companyRnc"],
          message: "El RNC de la empresa es obligatorio",
          code: z.ZodIssueCode.custom,
        });
      } else {
        const clean = data.companyRnc.replace(/[^0-9]/g, "");
        if (clean.length !== 9 && clean.length !== 11) {
          ctx.addIssue({
            path: ["companyRnc"],
            message: "El RNC debe contener 9 u 11 dígitos numéricos",
            code: z.ZodIssueCode.custom,
          });
        }
      }

      if (!data.companyName || data.companyName.trim() === "") {
        ctx.addIssue({
          path: ["companyName"],
          message: "El nombre comercial o razón social es obligatorio",
          code: z.ZodIssueCode.custom,
        });
      }

      if (data.phone && data.phone.trim() !== "") {
        if (!/^8[0249]\d{8}$/.test(data.phone)) {
          ctx.addIssue({
            path: ["phone"],
            message: "Número de teléfono inválido (ej. 809..., 829..., 849...)",
            code: z.ZodIssueCode.custom,
          });
        }
      }
    } else {
      // 2. Validaciones para persona física
      if (!data.identification || data.identification.trim() === "") {
        ctx.addIssue({
          path: ["identification"],
          message: "Número de identificación requerido",
          code: z.ZodIssueCode.custom,
        });
      } else {
        const type = (data.identificationType || "").toLowerCase();
        const valid = type.includes("cedul")
          ? isValidCedula(data.identification)
          : isValidPassport(data.identification);
        if (!valid) {
          ctx.addIssue({
            path: ["identification"],
            message: "El número de cédula debe contener exactamente 11 dígitos numéricos",
            code: z.ZodIssueCode.custom,
          });
        }
      }

      if (!data.names || data.names.trim() === "") {
        ctx.addIssue({
          path: ["names"],
          message: "Los nombres son requeridos",
          code: z.ZodIssueCode.custom,
        });
      } else if (!validateNameNoNumbersOrBinary(data.names)) {
        ctx.addIssue({
          path: ["names"],
          message: "Los nombres no pueden contener números ni caracteres binarios",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.lastNames || data.lastNames.trim() === "") {
        ctx.addIssue({
          path: ["lastNames"],
          message: "Los apellidos son requeridos",
          code: z.ZodIssueCode.custom,
        });
      } else if (!validateNameNoNumbersOrBinary(data.lastNames)) {
        ctx.addIssue({
          path: ["lastNames"],
          message: "Los apellidos no pueden contener números ni caracteres binarios",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.phone || data.phone.trim() === "") {
        ctx.addIssue({
          path: ["phone"],
          message: "Teléfono requerido",
          code: z.ZodIssueCode.custom,
        });
      } else if (!/^8[0249]\d{8}$/.test(data.phone)) {
        ctx.addIssue({
          path: ["phone"],
          message: "Número de teléfono inválido (ej. 809..., 829..., 849...)",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    // 3. Método de registro: Email vs Teléfono
    if (data.registerMethod === "email") {
      if (!data.email || data.email.trim() === "") {
        ctx.addIssue({
          path: ["email"],
          message: "El correo electrónico es obligatorio",
          code: z.ZodIssueCode.custom,
        });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        ctx.addIssue({
          path: ["email"],
          message: "Correo electrónico no válido",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.password || data.password.length < 6) {
        ctx.addIssue({
          path: ["password"],
          message: "La contraseña debe tener al menos 6 caracteres",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.confirmPassword || data.confirmPassword !== data.password) {
        ctx.addIssue({
          path: ["confirmPassword"],
          message: "Las contraseñas no coinciden",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    // 4. Direcciones para cliente
    if (data.userType === "client") {
      if (!data.addresses || data.addresses.length === 0) {
        ctx.addIssue({
          path: ["addresses"],
          message: "Debe agregar al menos una dirección",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    // 5. Vehículo para chofer
    if (data.userType === "driver") {
      if (!data.vehicle) {
        ctx.addIssue({
          path: ["vehicle"],
          message: "Datos del vehículo requeridos",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

export type RegisterSchemaType = z.infer<typeof registerSchema>;

/**
 * Utilidades de formateo para entradas de usuario (República Dominicana)
 */

/**
 * Formatea dinámicamente una Cédula Dominicana al estándar 000-0000000-0 (11 dígitos).
 */
export const formatCedula = (val: string): string => {
  if (!val) return "";
  const digits = val.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`;
};

/**
 * Formatea dinámicamente un teléfono dominicano al estándar +1 (809) 000-0000
 */
export const formatDominicanPhone = (val: string): string => {
  if (!val) return "";
  let digits = val.replace(/\D/g, "");
  // Si el usuario escribe o pega el '1' inicial del código de país
  if (digits.startsWith("1") && digits.length > 1) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);

  if (digits.length === 0) return "";
  if (digits.length <= 3) return `+1 (${digits}`;
  if (digits.length <= 6) return `+1 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

/**
 * Extrae solo los dígitos numéricos de un string.
 */
export const cleanDigits = (val: string): string => {
  return (val || "").replace(/\D/g, "");
};

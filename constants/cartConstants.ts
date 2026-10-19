export type TonOption = {
  fundas: number;
  toneladas: number;
  label?: string;
};

// 1. Constantes físicas oficiales de Suplicem
export const TONS_PER_BAG_STANDARD = 0.0425; // 42.5 kg - Cemento Normal (Gris / Uso General)
export const TONS_PER_BAG_SPECIAL = 0.0400;   // 40.0 kg - Cemento Especial (Blanco / Estructural)
export const TONS_PER_BAG = TONS_PER_BAG_STANDARD;

export const isSpecialCement = (name?: string): boolean => {
  const n = (name || "").toLowerCase();
  return (
    n.includes("blanco") ||
    n.includes("especial") ||
    n.includes("estructural") ||
    n.includes("40kg") ||
    n.includes("40 kg")
  );
};

export const getTonsPerBag = (productName?: string): number => {
  return isSpecialCement(productName) ? TONS_PER_BAG_SPECIAL : TONS_PER_BAG_STANDARD;
};

// 2. Funciones de conversión universales y puras
export const bagsToTons = (bags: number, productName?: string): number => {
  const factor = getTonsPerBag(productName);
  return Number((bags * factor).toFixed(2));
};

export const tonsToBags = (tons: number, productName?: string): number => {
  const factor = getTonsPerBag(productName);
  return Math.round(tons / factor);
};

// 3. Cantidades estándar de fundas que ofrece la tienda
export const STANDARD_BAG_QUANTITIES = [100, 200, 300, 400, 500, 600, 1000];

// 4. Generación DINÁMICA de opciones según el tipo de cemento (42.5kg vs 40kg)
export const getTonOptions = (productName?: string): TonOption[] =>
  STANDARD_BAG_QUANTITIES.map((fundas) => {
    const toneladas = bagsToTons(fundas, productName);
    return {
      fundas,
      toneladas,
      label: `${toneladas} t (${fundas} fundas)`,
    };
  });

export const TON_OPTIONS: TonOption[] = getTonOptions();

// Opciones de capacidad de carga para vehículos de choferes acordes a las órdenes de la app
export const DRIVER_VEHICLE_TON_OPTIONS = [
  { label: "4.25 t (100 fundas - Camión Ligero)", value: "4.25" },
  { label: "8.50 t (200 fundas - Camión Mediano)", value: "8.50" },
  { label: "12.75 t (300 fundas - Camión Mediano)", value: "12.75" },
  { label: "17.00 t (400 fundas - Doble Eje)", value: "17.00" },
  { label: "21.25 t (500 fundas - Volteo Pesado)", value: "21.25" },
  { label: "25.50 t (600 fundas - Cabezal / Rígido)", value: "25.50" },
  { label: "30.00 t (Patana estándar)", value: "30.00" },
  { label: "35.00 t (Patana pesada)", value: "35.00" },
  { label: "42.50 t (1,000 fundas - Patana completa)", value: "42.50" },
];

// 5. Helper universal para formatear cantidad de productos (ej. cemento en fundas y toneladas)
export const formatProductQuantity = (quantity: number, unit?: string, name?: string): string => {
  const isCement = unit === "fundas" || name?.toLowerCase().includes("cemento") || unit === "toneladas";
  if (isCement) {
    const tons = bagsToTons(quantity, name);
    return `${quantity.toLocaleString()} fundas (${tons} t)`;
  }
  return `${quantity} ${unit || "uds."}`;
};

export const DELIVERY_OPTIONS = [
  { label: "Almacén", value: "almacen" },
  { label: "Domicilio", value: "domicilio" },
];

export type BankAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  currency: string;
  // Campos del nuevo API
  accountHolder?: string;
  isActive?: boolean;
  routingNumber?: string;
  swiftCode?: string;
  // Campos legacy (backward compatibility)
  rnc?: string;
  holder?: string;
};

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "banreservas",
    bankName: "Banreservas",
    accountNumber: "960-123456-7",
    accountType: "Cuenta Corriente",
    rnc: "131-45678-9",
    currency: "DOP (Pesos Dominicanos)",
    holder: "SUPLICEM S.R.L.",
  },
  {
    id: "bhd",
    bankName: "Banco BHD",
    accountNumber: "240-987654-3",
    accountType: "Cuenta Corriente",
    rnc: "131-45678-9",
    currency: "DOP (Pesos Dominicanos)",
    holder: "SUPLICEM S.R.L.",
  },
  {
    id: "popular",
    bankName: "Banco Popular",
    accountNumber: "780-451239-1",
    accountType: "Cuenta Corriente",
    rnc: "131-45678-9",
    currency: "DOP (Pesos Dominicanos)",
    holder: "SUPLICEM S.R.L.",
  },
  {
    id: "santacruz",
    bankName: "Banco Santa Cruz",
    accountNumber: "550-882314-9",
    accountType: "Cuenta de Ahorros",
    rnc: "131-45678-9",
    currency: "DOP (Pesos Dominicanos)",
    holder: "SUPLICEM S.R.L.",
  },
];

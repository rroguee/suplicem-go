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

export const getTonsPerBag = (productName?: string, weightKg?: number): number => {
  if (weightKg && weightKg > 0) {
    return weightKg / 1000;
  }
  return isSpecialCement(productName) ? TONS_PER_BAG_SPECIAL : TONS_PER_BAG_STANDARD;
};

// 2. Funciones de conversión universales y puras
export const bagsToTons = (bags: number, productName?: string, weightKg?: number): number => {
  const factor = getTonsPerBag(productName, weightKg);
  return Number((bags * factor).toFixed(2));
};

export const tonsToBags = (tons: number, productName?: string, weightKg?: number): number => {
  const factor = getTonsPerBag(productName, weightKg);
  return Math.round(tons / factor);
};

// 3. Cantidades estándar de fundas que ofrece la tienda (Fraccionable desde 50 fundas)
export const DEFAULT_CEMENT_LOT_SIZE = 500;
export const STANDARD_BAG_QUANTITIES = Array.from(
  { length: 20 },
  (_, i) => (i + 1) * 50
);

// 4. Generación DINÁMICA de opciones según el tipo de producto / cemento
export const getTonOptions = (productName?: string, weightKg?: number, unit?: string): TonOption[] => {
  const effectiveUnit = unit || "fundas";
  return STANDARD_BAG_QUANTITIES.map((fundas) => {
    const toneladas = bagsToTons(fundas, productName, weightKg);
    return {
      fundas,
      toneladas,
      label: `${toneladas} t (${fundas} ${effectiveUnit})`,
    };
  });
};

export const TON_OPTIONS: TonOption[] = getTonOptions();

export const calculateProductSubtotal = (
  quantity: number,
  unitPrice: number,
  lotSize?: number,
  lotPrice?: number,
  lotPrices?: Record<string, number>
): number => {
  const customForQty = lotPrices?.[String(quantity)];
  if (customForQty !== undefined && Number(customForQty) > 0) {
    return Number(Number(customForQty).toFixed(2));
  }
  const effectiveLotSize = lotSize || DEFAULT_CEMENT_LOT_SIZE;
  const effectiveLotPrice = lotPrice || unitPrice * effectiveLotSize;
  if (effectiveLotSize > 0 && effectiveLotPrice > 0 && quantity >= effectiveLotSize) {
    const fullLots = Math.floor(quantity / effectiveLotSize);
    const remainder = quantity % effectiveLotSize;
    return Number((fullLots * effectiveLotPrice + remainder * unitPrice).toFixed(2));
  }
  return Number((quantity * unitPrice).toFixed(2));
};

// Opciones de capacidad de carga para vehículos de choferes acordes a las órdenes de la app
export const DRIVER_VEHICLE_TON_OPTIONS = [
  // -- CAMIONES RÍGIDOS (Chasis Único) --
  { label: "• -- CAMIONES RÍGIDOS (Chasis Único) --", value: "header_rigidos", isHeader: true },
  { label: "Camión Pequeño / Liviano (2 - 5 Toneladas)", value: "5" },
  { label: "Camión Mediano / Semipesado (6 - 12 Toneladas)", value: "12" },
  { label: "Camión Grande / Tándem (14 - 19 Toneladas)", value: "19" },
  { label: "Camión Extra Grande / 4 Ejes (20 - 24 Toneladas)", value: "24" },

  // -- CAMIONES ARTICULADOS (Cabezote + Remolque) --
  { label: "• -- CAMIONES ARTICULADOS (Cabezote + Remolque) --", value: "header_articulados", isHeader: true },
  { label: "Tráiler Corto / Contenedor 20' (18 - 22 Toneladas)", value: "22" },
  { label: "Tráiler Estándar / Contenedor 40' (24 - 28 Toneladas)", value: "28" },
  { label: "Tráiler Pesado / Patineta (30 - 34 Toneladas)", value: "34" },
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

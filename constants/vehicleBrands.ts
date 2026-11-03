export interface VehicleBrand {
  name: string;
  models: string[];
}

export const VEHICLE_BRANDS: VehicleBrand[] = [
  { name: "Toyota", models: ["Dyna", "Hilux", "Hiace", "Tacoma", "Tundra", "Land Cruiser"] },
  { name: "Hyundai", models: ["H100", "Porter", "Mighty", "HD72", "HD78", "Xcient"] },
  { name: "Isuzu", models: ["Elf", "NPR", "NQR", "FRR", "FVR", "Forward", "Giga"] },
  { name: "Mitsubishi", models: ["Canter", "Fuso", "L200", "Triton", "Fighter", "Super Great"] },
  { name: "Daihatsu", models: ["Delta", "Hijet", "Gran Max"] },
  { name: "Hino", models: ["Dutro", "300 Series", "500 Series", "700 Series"] },
  { name: "Nissan", models: ["Cabstar", "Atlas", "Frontier", "Condor", "UD Quon"] },
  { name: "Mack", models: ["Granite", "Vision", "Pinnacle", "Anthem", "Titan"] },
  { name: "Freightliner", models: ["M2 106", "M2 112", "Cascadia", "Coronado", "Business Class"] },
  { name: "International", models: ["WorkStar", "DuraStar", "LT Series", "HX Series", "MV Series"] },
  { name: "Volvo", models: ["FH", "FM", "FMX", "VNL", "VHD"] },
  { name: "Scania", models: ["P Series", "G Series", "R Series", "S Series"] },
  { name: "Mercedes-Benz", models: ["Sprinter", "Atego", "Actros", "Axor", "Accelo"] },
  { name: "MAN", models: ["TGL", "TGM", "TGS", "TGX"] },
  { name: "DAF", models: ["LF", "CF", "XF", "XG"] },
  { name: "Kenworth", models: ["T170", "T270", "T370", "T680", "W900"] },
  { name: "Peterbilt", models: ["220", "337", "348", "389", "579"] },
  { name: "Chevrolet", models: ["NPR", "NQR", "FTR", "Silverado", "Kodiak"] },
  { name: "Ford", models: ["F-150", "F-250", "F-350", "F-650", "F-750", "Cargo"] },
  { name: "JAC", models: ["N-Series", "X-Series", "T6", "T8"] },
  { name: "Foton", models: ["Aumark", "Ollin", "Forland", "Tunland"] },
  { name: "Sinotruk", models: ["Howo", "Hohan", "Sitrak"] },
  { name: "Shacman", models: ["X3000", "F3000", "H3000"] },
  { name: "Dongfeng", models: ["Captain", "Kingrun", "K-series"] },
  { name: "FAW", models: ["J6", "J5", "Tiger", "V-series"] },
  { name: "Otro", models: ["Estándar", "Personalizado", "Otro"] },
];

export const getVehicleBrandOptions = () =>
  VEHICLE_BRANDS.map((brand) => ({ label: brand.name, value: brand.name }));

export const getVehicleModelOptions = (brand?: string) => {
  const match = VEHICLE_BRANDS.find(
    (item) => item.name.toLowerCase() === (brand || "").trim().toLowerCase()
  );
  const models = match?.models || ["Estándar", "Personalizado", "Otro"];
  return models.map((model) => ({ label: model, value: model }));
};

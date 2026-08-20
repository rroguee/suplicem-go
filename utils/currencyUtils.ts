export const formatRD = (value: number) =>
  new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 0,
  }).format(value);

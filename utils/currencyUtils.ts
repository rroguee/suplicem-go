export const formatRD = (value: number) =>
  new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

export const formatNumberWithCommas = (raw: string | number): string => {
  if (raw === "" || raw === null || raw === undefined) return "";
  const cleaned = String(raw).replace(/,/g, "").replace(/[^0-9.]/g, "");
  if (!cleaned) return "";

  const parts = cleaned.split(".");
  const intRaw = parts[0].replace(/^0+(?=\d)/, "");
  const intFormatted = intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (parts.length > 1) {
    const decPart = parts[1].slice(0, 2);
    return `${intFormatted || "0"}.${decPart}`;
  }
  return intFormatted;
};

export const parseNumberWithCommas = (val: string | number | undefined): number => {
  if (val === undefined || val === null || val === "") return 0;
  const num = parseFloat(String(val).replace(/,/g, ""));
  return isNaN(num) ? 0 : num;
};

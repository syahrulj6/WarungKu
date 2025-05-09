export const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export const parseRupiah = (value: string): number => {
  const digits = value.replace(/\D/g, "");
  return parseInt(digits) || 0;
};

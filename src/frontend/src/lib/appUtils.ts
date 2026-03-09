export const formatCurrency = (amount: number): string =>
  `₡${Math.round(amount).toLocaleString("es-CR")}`;

export const formatDate = (timestamp: bigint): string => {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleDateString("es-CR");
};

export const formatDateShort = (dateStr: string): string => {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

export const nowTimestamp = (): bigint =>
  BigInt(Date.now()) * BigInt(1_000_000);

export const generateId = (): string => crypto.randomUUID();

export const todayStr = (): string => new Date().toISOString().split("T")[0];

export const openWhatsApp = (phone: string, message: string): void => {
  const cleaned = phone.replace(/\D/g, "");
  const num = cleaned.startsWith("506") ? cleaned : `506${cleaned}`;
  window.open(
    `https://wa.me/${num}?text=${encodeURIComponent(message)}`,
    "_blank",
  );
};

export const statusColorJob = (status: string): string => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "inProgress":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const labelJob = (status: string): string => {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "inProgress":
      return "En Progreso";
    case "completed":
      return "Completado";
    case "cancelled":
      return "Cancelado";
    default:
      return status;
  }
};

export const labelQuote = (status: string): string => {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "sent":
      return "Enviada";
    case "accepted":
      return "Aceptada";
    case "rejected":
      return "Rechazada";
    default:
      return status;
  }
};

export const labelProspect = (status: string): string => {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "quoteSent":
      return "Cot. Enviada";
    case "accepted":
      return "Aceptado";
    case "rejected":
      return "Rechazado";
    default:
      return status;
  }
};

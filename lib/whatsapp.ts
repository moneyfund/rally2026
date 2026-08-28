export function nicaraguaWhatsappDigits(value: string) {
  let digits = value.replace(/\D/g, "");
  if (!digits) return "";

  // Accept numbers pasted as 00505..., +505..., 505..., or just the local number.
  if (digits.startsWith("00505")) digits = digits.slice(2);
  if (digits.startsWith("505")) return digits;

  return `505${digits}`;
}

export function nicaraguaWhatsappUrl(value: string) {
  const digits = nicaraguaWhatsappDigits(value);
  return digits ? `https://wa.me/${digits}` : "";
}

export function normalizeNicaraguaWhatsapp(value: string) {
  const digits = nicaraguaWhatsappDigits(value);
  if (!digits) return "";

  const local = digits.slice(3);
  if (local.length === 8) {
    return `+505 ${local.slice(0, 4)} ${local.slice(4)}`;
  }

  return `+${digits}`;
}

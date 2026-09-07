/** Shared site-wide constants used by the chatbot and elsewhere. */
export const WHATSAPP_NUMBER = '2349129797010';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export function whatsappUrlWithText(message: string): string {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}

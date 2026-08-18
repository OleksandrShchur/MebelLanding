/** Single source of truth for store contact & lead-gen links. Update values here before deploy. */

const phoneE164 = import.meta.env.VITE_STORE_PHONE ?? '380123456789';
const phoneDisplay =
  import.meta.env.VITE_STORE_PHONE_DISPLAY ?? '+380 (12) 345-67-89';

export const storeContact = {
  name: 'Магазин Mebel',
  tagline: 'Ваше найкраще місце для придбання високоякісних меблів. Широкий асортимент шаф, диванів та кухонних рішень, щоб зробити Ваш дім красивим та функціональним.',
  phone: {
    display: phoneDisplay,
    tel: `tel:+${phoneE164.replace(/\D/g, '')}`,
    e164: phoneE164.replace(/\D/g, ''),
  },
  email: {
    display: import.meta.env.VITE_STORE_EMAIL ?? 'info@mebel.if.ua',
    mailto: `mailto:${import.meta.env.VITE_STORE_EMAIL ?? 'info@mebel.if.ua'}`,
  },
  address: {
    display:
      import.meta.env.VITE_STORE_ADDRESS ??
      'вул. Незалежності, 15, Івано-Франківськ, 76000',
    mapsUrl:
      import.meta.env.VITE_STORE_MAPS_URL ??
      'https://maps.google.com/?q=48.631028,25.736806',
    embedUrl:
      import.meta.env.VITE_STORE_MAPS_EMBED ??
      'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d1318.4465471253077!2d25.735526538785397!3d48.6310277655136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNDjCsDM3JzUxLjciTiAyNcKwNDQnMTIuNSJF!5e0!3m2!1sen!2sua!4v1783378567433!5m2!1sen!2sua',
  },
  hours: 'Пн–Сб: 9:00–19:00, Нд: 10:00–17:00',
  social: {
    viber: `viber://chat?number=${phoneE164.replace(/\D/g, '')}`,
    whatsapp: `https://wa.me/${phoneE164.replace(/\D/g, '')}`,
    telegram: import.meta.env.VITE_STORE_TELEGRAM ?? 'https://t.me/',
    facebook: import.meta.env.VITE_STORE_FACEBOOK ?? 'https://www.facebook.com/',
  },
  siteUrl: import.meta.env.VITE_SITE_URL ?? 'https://preview.mebellanding.pages.dev/',
} as const;

export function buildLeadMessage(context?: string): string {
  const base = 'Вітаю! Хочу дізнатися про меблі та ціни.';
  if (!context) return encodeURIComponent(base);
  return encodeURIComponent(`${base} ${context}`);
}

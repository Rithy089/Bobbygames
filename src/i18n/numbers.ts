// Keep Khmer digits consistent even in browsers without Khmer Intl locale data.
export const formatCount = (count: number, language: string) =>
  language.startsWith('km')
    ? String(count).replace(/\d/g, (digit) => '០១២៣៤៥៦៧៨៩'[Number(digit)])
    : String(count);

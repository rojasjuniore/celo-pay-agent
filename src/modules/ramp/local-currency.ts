/**
 * Mapa puro país (ISO-3166 alpha-2) → moneda local (ISO-4217). Para el off-ramp
 * global de Noah: el corredor se elige por país, la moneda se deriva aquí.
 * No exhaustivo: cubre los corredores LATAM de la demo; ampliable sin tocar I/O.
 */
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  CO: "COP",
  MX: "MXN",
  BR: "BRL",
  AR: "ARS",
  PE: "PEN",
  CL: "CLP",
  US: "USD",
  EU: "EUR",
};

export function currencyForCountry(country: string): string {
  const c = COUNTRY_TO_CURRENCY[country.toUpperCase()];
  if (!c) {
    throw new Error(
      `Unsupported country '${country}' for off-ramp. / País no soportado para off-ramp.`,
    );
  }
  return c;
}

/** True si tenemos corredor para ese país. */
export function isCountrySupported(country: string): boolean {
  return country.toUpperCase() in COUNTRY_TO_CURRENCY;
}

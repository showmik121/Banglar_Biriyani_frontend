const BENGALI_ZERO_CODE_POINT = 0x09e6 // "০"

/** "০১৭১১২৩৪৫৬৭৮" -> "01711234567": digits typed on a Bangla keyboard become ordinary digits */
export const bengaliToAsciiDigits = (value: string): string =>
  value.replace(/[০-৯]/g, (digit) => String(digit.charCodeAt(0) - BENGALI_ZERO_CODE_POINT))

/**
 * "+880 1711-000001" or "+৮৮০ ১৭১১-০০০০০১" -> "01711000001".
 * Only a leading country code is removed; the result is checked by the caller.
 */
export const normalizePhone = (value: string): string => {
  const digits = bengaliToAsciiDigits(value).replace(/\D/g, "")
  return digits.startsWith("880") ? digits.slice(2) : digits
}

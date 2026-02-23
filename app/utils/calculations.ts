// ASHRAE engineering calculations for EngrAssist app

/**
 * Calculate duct velocity from airflow and area
 * @param cfm - Airflow in cubic feet per minute
 * @param area - Duct cross-sectional area in square feet
 * @returns Velocity in feet per minute
 */
export function calculateDuctVelocity(cfm: number, area: number): number {
  return cfm / area;
}

/**
 * Calculate rectangular duct area
 * @param width - Duct width in inches
 * @param height - Duct height in inches
 * @returns Area in square feet
 */
export function rectangularDuctArea(width: number, height: number): number {
  return (width * height) / 144;
}

/**
 * Calculate circular duct area
 * @param diameter - Duct diameter in inches
 * @returns Area in square feet
 */
export function circularDuctArea(diameter: number): number {
  return Math.PI * Math.pow(diameter / 2, 2) / 144;
}

/**
 * EngrAssist Engineering Calculations
 * 
 * Core HVAC calculation functions ported from the EngrAssist.com
 * website (scripts.js). Based on ASHRAE Fundamentals and SMACNA
 * standards.
 * 
 * All calculations use Imperial units internally:
 *   - Airflow: CFM
 *   - Velocity: FPM
 *   - Pressure: in. w.g. per 100 ft
 *   - Dimensions: inches
 *   - Temperature: °F
 */

// ─── CONSTANTS ───────────────────────────────────

/** Standard air density at 70°F, sea level (lb/ft³) */
export const STD_AIR_DENSITY = 0.075;

/** Standard air viscosity (lb/(ft·s)) */
export const STD_AIR_VISCOSITY = 1.216e-5;

/** Common duct material roughness values (ft) */
export const DUCT_MATERIALS: Record<string, { name: string; roughness: number }> = {
  'galvanized':        { name: 'Galvanized Steel',          roughness: 0.0003 },
  'galvanized-spiral': { name: 'Galvanized Steel (Spiral)', roughness: 0.0003 },
  'aluminum':          { name: 'Aluminum',                  roughness: 0.0002 },
  'stainless':         { name: 'Stainless Steel',           roughness: 0.00015 },
  'pvc':               { name: 'PVC / Plastic',             roughness: 0.00003 },
  'fiberglass-lined':  { name: 'Fiberglass Lined',          roughness: 0.003 },
  'fiberglass-board':  { name: 'Fiberglass Duct Board',     roughness: 0.01 },
  'flexible':          { name: 'Flexible Duct',             roughness: 0.01 },
  'concrete':          { name: 'Concrete',                  roughness: 0.005 },
};

// ─── DUCT SIZING CALCULATIONS ────────────────────

/**
 * Calculate equivalent round duct diameter for a rectangular duct.
 * Uses the Huebscher equation (ASHRAE Fundamentals).
 * 
 * @param width  - Duct width in inches
 * @param height - Duct height in inches
 * @returns Equivalent round diameter in inches
 */
export function equivalentDiameter(width: number, height: number): number {
  return 1.3 * Math.pow(width * height, 0.625) / Math.pow(width + height, 0.25);
}

/**
 * Calculate duct cross-sectional area.
 * 
 * @param shape    - 'round' or 'rectangular'
 * @param dim1     - Diameter (round) or Width (rectangular) in inches
 * @param dim2     - Height in inches (rectangular only)
 * @returns Area in square feet
 */
export function ductArea(
  shape: 'round' | 'rectangular',
  dim1: number,
  dim2?: number
): number {
  if (shape === 'round') {
    return Math.PI * Math.pow(dim1 / 12 / 2, 2);
  }
  return (dim1 * (dim2 ?? dim1)) / 144;
}

/**
 * Calculate air velocity from CFM and duct area.
 * 
 * @param cfm  - Airflow in CFM
 * @param area - Cross-sectional area in ft²
 * @returns Velocity in FPM
 */
export function velocity(cfm: number, area: number): number {
  if (area <= 0) return 0;
  return cfm / area;
}

/**
 * Calculate Reynolds number for duct flow.
 * 
 * @param vel       - Velocity in FPM
 * @param diameter  - Duct diameter in inches
 * @param density   - Air density in lb/ft³ (default: 0.075)
 * @param viscosity - Dynamic viscosity in lb/(ft·s) (default: std)
 * @returns Reynolds number (dimensionless)
 */
export function reynoldsNumber(
  vel: number,
  diameter: number,
  density: number = STD_AIR_DENSITY,
  viscosity: number = STD_AIR_VISCOSITY
): number {
  const velFPS = vel / 60;         // FPM to ft/s
  const diamFt = diameter / 12;    // inches to ft
  return (density * velFPS * diamFt) / viscosity;
}

/**
 * Calculate Darcy friction factor using the Colebrook-White equation
 * solved iteratively.
 * 
 * @param Re        - Reynolds number
 * @param roughness - Absolute roughness in ft
 * @param diameter  - Duct diameter in ft
 * @returns Darcy friction factor
 */
export function frictionFactor(
  Re: number,
  roughness: number,
  diameter: number
): number {
  if (Re < 2300) {
    // Laminar flow
    return 64 / Re;
  }
  // Colebrook-White iterative solution
  let f = 0.02; // Initial guess
  for (let i = 0; i < 50; i++) {
    const rhs = -2.0 * Math.log10(
      roughness / (3.7 * diameter) + 2.51 / (Re * Math.sqrt(f))
    );
    const fNew = 1 / (rhs * rhs);
    if (Math.abs(fNew - f) < 1e-8) break;
    f = fNew;
  }
  return f;
}

/**
 * Calculate friction loss per 100 ft of duct using the Darcy-Weisbach
 * equation.
 * 
 * @param vel       - Velocity in FPM
 * @param diameter  - Equivalent round diameter in inches
 * @param roughness - Absolute roughness in ft
 * @param density   - Air density in lb/ft³
 * @returns Friction rate in in. w.g. per 100 ft
 */
export function frictionLoss(
  vel: number,
  diameter: number,
  roughness: number,
  density: number = STD_AIR_DENSITY
): number {
  const diamFt = diameter / 12;
  const velFPS = vel / 60;
  const Re = reynoldsNumber(vel, diameter, density);
  const f = frictionFactor(Re, roughness, diamFt);

  // Darcy-Weisbach: ΔP = f × (L/D) × (ρ × V²) / (2 × gc)
  // Convert to in. w.g. per 100 ft
  const deltaP = f * (100 / diamFt) * (density * velFPS * velFPS) / (2 * 32.174);
  // Convert from lb/ft² to in. w.g. (1 in. w.g. = 5.2 lb/ft²)
  return deltaP / 5.2;
}

/**
 * Calculate velocity pressure.
 * 
 * @param vel     - Velocity in FPM
 * @param density - Air density in lb/ft³
 * @returns Velocity pressure in in. w.g.
 */
export function velocityPressure(
  vel: number,
  density: number = STD_AIR_DENSITY
): number {
  return density * Math.pow(vel / 1097, 2);
}

/**
 * Calculate round duct diameter for a given CFM and friction rate.
 * Iterative solver.
 * 
 * @param cfm          - Airflow in CFM
 * @param frictionRate - Target friction rate in in. w.g. per 100 ft
 * @param roughness    - Absolute roughness in ft
 * @param density      - Air density in lb/ft³
 * @returns Required round duct diameter in inches
 */
export function sizeRoundDuct(
  cfm: number,
  frictionRate: number,
  roughness: number,
  density: number = STD_AIR_DENSITY
): number {
  // Initial guess using simplified formula
  let diameter = Math.pow(cfm, 0.4) * 2;
  
  for (let i = 0; i < 100; i++) {
    const area = Math.PI * Math.pow(diameter / 12 / 2, 2);
    const vel = cfm / area;
    const calcFriction = frictionLoss(vel, diameter, roughness, density);
    
    // Adjust diameter
    const ratio = calcFriction / frictionRate;
    const adjustment = Math.pow(ratio, 0.2);
    const newDiameter = diameter * adjustment;
    
    if (Math.abs(newDiameter - diameter) < 0.01) break;
    diameter = newDiameter;
  }
  
  return diameter;
}

/**
 * Get the nearest standard round duct size (2-inch increments).
 * 
 * @param diameter - Calculated diameter in inches
 * @returns Nearest standard size in inches
 */
export function nearestStandardRound(diameter: number): number {
  return Math.ceil(diameter / 2) * 2;
}

/**
 * Find rectangular duct sizes for a given equivalent round diameter.
 * Returns multiple width × height options.
 * 
 * @param equivDiam - Equivalent round diameter in inches
 * @param maxAspect - Maximum aspect ratio (default 4:1)
 * @returns Array of { width, height } options in inches
 */
export function rectangularEquivalents(
  equivDiam: number,
  maxAspect: number = 4
): Array<{ width: number; height: number }> {
  const targetArea = Math.PI * Math.pow(equivDiam / 2, 2); // in²
  const options: Array<{ width: number; height: number }> = [];

  // Standard duct sizes: 4" increments from 6" to 96"
  const stdSizes = [];
  for (let s = 6; s <= 96; s += 2) stdSizes.push(s);

  for (const w of stdSizes) {
    for (const h of stdSizes) {
      if (h > w) continue; // Avoid duplicates (w ≥ h)
      if (w / h > maxAspect) continue;

      const eqDiam = equivalentDiameter(w, h);
      if (Math.abs(eqDiam - equivDiam) < 1.5) {
        options.push({ width: w, height: h });
      }
    }
  }

  // Sort by aspect ratio (closer to 1:1 first)
  options.sort((a, b) => (a.width / a.height) - (b.width / b.height));
  return options.slice(0, 5);
}

// ─── COMPREHENSIVE DUCT CALCULATION ──────────────

export interface DuctInputs {
  cfm: number;
  frictionRate?: number;      // in. w.g. per 100 ft
  targetVelocity?: number;    // FPM
  ductShape: 'round' | 'rectangular';
  width?: number;             // inches (if known)
  height?: number;            // inches (if known)
  diameter?: number;          // inches (if known)
  material: string;           // key from DUCT_MATERIALS
  density?: number;           // lb/ft³
}

export interface DuctResults {
  diameter: number;           // Equivalent round diameter
  standardDiameter: number;   // Nearest standard round size
  width?: number;
  height?: number;
  area: number;               // ft²
  velocity: number;           // FPM
  frictionRate: number;       // in. w.g. / 100 ft
  velocityPressure: number;   // in. w.g.
  reynoldsNumber: number;
  frictionFactor: number;
  aspectRatio?: number;
  rectangularOptions?: Array<{ width: number; height: number }>;
}

/**
 * Perform a complete duct sizing calculation.
 * 
 * Supports multiple modes:
 * - Given CFM + friction rate → size the duct
 * - Given CFM + duct size → calculate friction loss
 * - Given CFM + target velocity → size the duct
 */
export function calculateDuct(inputs: DuctInputs): DuctResults {
  const materialData = DUCT_MATERIALS[inputs.material] ?? DUCT_MATERIALS['galvanized'];
  const roughness = materialData.roughness;
  const density = inputs.density ?? STD_AIR_DENSITY;
  const cfm = inputs.cfm;

  let diameter: number;
  let calcFrictionRate: number;
  let calcVelocity: number;

  if (inputs.frictionRate && !inputs.diameter && !inputs.width) {
    // MODE: Size duct for given friction rate
    diameter = sizeRoundDuct(cfm, inputs.frictionRate, roughness, density);
  } else if (inputs.diameter) {
    // MODE: Calculate friction for given round size
    diameter = inputs.diameter;
  } else if (inputs.width && inputs.height) {
    // MODE: Calculate friction for given rectangular size
    diameter = equivalentDiameter(inputs.width, inputs.height);
  } else if (inputs.targetVelocity) {
    // MODE: Size duct for given velocity
    const reqArea = cfm / inputs.targetVelocity;
    diameter = Math.sqrt(4 * reqArea / Math.PI) * 12;
  } else {
    // Default: use 0.08 friction rate
    diameter = sizeRoundDuct(cfm, 0.08, roughness, density);
  }

  const stdDiam = nearestStandardRound(diameter);
  const area = ductArea('round', stdDiam);
  calcVelocity = velocity(cfm, area);
  calcFrictionRate = frictionLoss(calcVelocity, stdDiam, roughness, density);

  const results: DuctResults = {
    diameter: Math.round(diameter * 10) / 10,
    standardDiameter: stdDiam,
    area: Math.round(area * 1000) / 1000,
    velocity: Math.round(calcVelocity),
    frictionRate: Math.round(calcFrictionRate * 1000) / 1000,
    velocityPressure: Math.round(velocityPressure(calcVelocity, density) * 1000) / 1000,
    reynoldsNumber: Math.round(reynoldsNumber(calcVelocity, stdDiam, density)),
    frictionFactor: Math.round(
      frictionFactor(
        reynoldsNumber(calcVelocity, stdDiam, density),
        roughness,
        stdDiam / 12
      ) * 10000
    ) / 10000,
  };

  // Add rectangular equivalents
  if (inputs.ductShape === 'rectangular' || true) {
    results.rectangularOptions = rectangularEquivalents(stdDiam);
    if (results.rectangularOptions.length > 0) {
      const best = results.rectangularOptions[0];
      results.width = best.width;
      results.height = best.height;
      results.aspectRatio = Math.round((best.width / best.height) * 10) / 10;
    }
  }

  return results;
}

// ─── PSYCHROMETRIC CALCULATIONS ──────────────────

/**
 * Calculate saturation vapor pressure using ASHRAE formula.
 * 
 * @param T - Temperature in °F
 * @returns Saturation pressure in psia
 */
export function saturationPressure(T: number): number {
  const C1 = -1.0440397e4;
  const C2 = -1.1294650e1;
  const C3 = -2.7022355e-2;
  const C4 = 1.2890360e-5;
  const C5 = -2.4780681e-9;
  const C6 = 6.5459673;

  const T_R = T + 459.67; // Convert °F to Rankine
  const lnPws =
    C1 / T_R + C2 + C3 * T_R + C4 * T_R * T_R + C5 * T_R * T_R * T_R +
    C6 * Math.log(T_R);

  return Math.exp(lnPws);
}

/**
 * Calculate humidity ratio from dry-bulb and relative humidity.
 * 
 * @param Tdb - Dry-bulb temperature in °F
 * @param RH  - Relative humidity (0-100)
 * @param P   - Atmospheric pressure in psia (default: 14.696)
 * @returns Humidity ratio in lb water / lb dry air
 */
export function humidityRatio(Tdb: number, RH: number, P: number = 14.696): number {
  const Pws = saturationPressure(Tdb);
  const Pw = (RH / 100) * Pws;
  return 0.62198 * Pw / (P - Pw);
}

/**
 * Calculate enthalpy of moist air.
 * 
 * @param Tdb - Dry-bulb temperature in °F
 * @param W   - Humidity ratio (lb water / lb dry air)
 * @returns Enthalpy in BTU/lb dry air
 */
export function enthalpy(Tdb: number, W: number): number {
  return 0.24 * Tdb + W * (1061 + 0.444 * Tdb);
}

/**
 * Calculate dew-point temperature.
 * 
 * @param W - Humidity ratio
 * @param P - Atmospheric pressure in psia
 * @returns Dew-point temperature in °F
 */
export function dewPoint(W: number, P: number = 14.696): number {
  const Pw = (W * P) / (0.62198 + W);
  // Iterate to find temperature where Pws = Pw
  let Tdp = 50; // initial guess
  for (let i = 0; i < 100; i++) {
    const Pws = saturationPressure(Tdp);
    const error = Pws - Pw;
    if (Math.abs(error) < 0.0001) break;
    // Newton-like adjustment
    const Pws2 = saturationPressure(Tdp + 0.1);
    const dPdT = (Pws2 - Pws) / 0.1;
    if (dPdT === 0) break;
    Tdp -= error / dPdT;
  }
  return Tdp;
}

/**
 * EngrAssist Tools Configuration
 * 
 * Master list of ALL tools matching engrassist.com's actual pages.
 * 
 * status: 'available' = has calculator in the app
 * status: 'web_only'  = links to engrassist.com (reference/guide pages)
 * status: 'coming_soon' = placeholder for future development
 * 
 * webUrl: URL on engrassist.com for "Learn More" / "Open on Web" links
 */

export type ToolStatus = 'available' | 'web_only' | 'coming_soon';
export type Discipline = 'mechanical' | 'electrical' | 'plumbing';

export interface Tool {
  id: string;
  name: string;
  description: string;
  discipline: Discipline;
  subCategory: string;
  status: ToolStatus;
  icon: string;
  tags: string[];
  route?: string;
  webUrl?: string;
}

export interface DisciplineInfo {
  id: Discipline;
  name: string;
  description: string;
  icon: string;
  color: string;
  webUrl: string;
}

export const DISCIPLINES: DisciplineInfo[] = [
  {
    id: 'mechanical',
    name: 'Mechanical',
    description: 'HVAC airside & waterside tools',
    icon: 'construct',
    color: '#3b82f6',
    webUrl: 'https://engrassist.com/mechanical_page.html',
  },
  {
    id: 'electrical',
    name: 'Electrical',
    description: 'Power, lighting & low voltage tools',
    icon: 'flash',
    color: '#f59e0b',
    webUrl: 'https://engrassist.com/electrical_page.html',
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    description: 'Water, drainage & gas tools',
    icon: 'water',
    color: '#10b981',
    webUrl: 'https://engrassist.com/plumbing_page.html',
  },
];

export const TOOLS: Tool[] = [
  // ━━━ MECHANICAL — Airside ━━━━━━━━━━━━━━━━━━━━━
  { id: 'duct-sizing', name: 'Duct Sizing', description: 'SMACNA equal friction & velocity method for round and rectangular ducts', discipline: 'mechanical', subCategory: 'Airside', status: 'available', icon: 'git-compare', tags: ['SMACNA', 'HVAC', 'Airflow'], route: '/tools/duct-sizing', webUrl: 'https://engrassist.com/ductulator.html' },
  { id: 'psychrometric', name: 'Psychrometric Chart', description: 'Interactive chart with state point plotting and property calculations', discipline: 'mechanical', subCategory: 'Airside', status: 'available', icon: 'analytics', tags: ['Psychrometrics', 'HVAC', 'Humidity'], route: '/tools/psychrometric', webUrl: 'https://engrassist.com/psychrometric.html' },
  { id: 'load-calculation', name: 'HVAC Load Calculator', description: 'Calculate heating and cooling loads for buildings', discipline: 'mechanical', subCategory: 'Airside', status: 'available', icon: 'thermometer', tags: ['Cooling', 'Heating', 'Load Calc'], route: '/tools/load-calculation', webUrl: 'https://engrassist.com/load_calculation.html' },
  { id: 'fan-selection', name: 'Fan Selection Tool', description: 'Select fans based on airflow and system static pressure', discipline: 'mechanical', subCategory: 'Airside', status: 'web_only', icon: 'sunny', tags: ['Fans', 'HVAC', 'Static Pressure'], webUrl: 'https://engrassist.com/fan_selection.html' },
  { id: 'air-balance', name: 'Air Balance Calculator', description: 'Calculate building pressurization and airflow balance', discipline: 'mechanical', subCategory: 'Airside', status: 'available', icon: 'scale', tags: ['Air Balance', 'Pressurization'], route: '/tools/air-balance', webUrl: 'https://engrassist.com/air_balance.html' },

  // ━━━ MECHANICAL — Waterside ━━━━━━━━━━━━━━━━━━━
  { id: 'pipe-sizing', name: 'Pipe Sizing Calculator', description: 'Size pipes for water and glycol hydronic systems', discipline: 'mechanical', subCategory: 'Waterside', status: 'web_only', icon: 'git-network', tags: ['Hydronic', 'Piping'], webUrl: 'https://engrassist.com/pipe_sizing.html' },
  { id: 'pump-sizing', name: 'Pump Selection Tool', description: 'Select pumps for hydronic and plumbing systems', discipline: 'mechanical', subCategory: 'Waterside', status: 'web_only', icon: 'refresh-circle', tags: ['Pumps', 'Hydronic'], webUrl: 'https://engrassist.com/pump_sizing.html' },
  { id: 'coil-selection', name: 'Coil Selection Calculator', description: 'Size heating and cooling coils with fluid flow calculations', discipline: 'mechanical', subCategory: 'Waterside', status: 'web_only', icon: 'swap-horizontal', tags: ['Coils', 'AHU', 'Heat Transfer'], webUrl: 'https://engrassist.com/coil_selection.html' },
  { id: 'boiler-calculator', name: 'Boiler Sizing Calculator', description: 'Size boilers for heating applications', discipline: 'mechanical', subCategory: 'Waterside', status: 'available', icon: 'flame', tags: ['Boiler', 'Heating'], route: '/tools/boiler-calculator', webUrl: 'https://engrassist.com/boiler_calculator.html' },
  { id: 'chiller-calculator', name: 'Chiller Sizing Calculator', description: 'Size chillers for cooling applications', discipline: 'mechanical', subCategory: 'Waterside', status: 'available', icon: 'snow', tags: ['Chiller', 'Cooling'], route: '/tools/chiller-calculator', webUrl: 'https://engrassist.com/chiller_calculator.html' },

  // ━━━ MECHANICAL — Reference & Education ━━━━━━━
  { id: 'conversions', name: 'Unit Conversions', description: 'Comprehensive engineering unit converter', discipline: 'mechanical', subCategory: 'Reference', status: 'available', icon: 'calculator', tags: ['Conversions', 'Units'], route: '/tools/conversions', webUrl: 'https://engrassist.com/conversions.html' },
  { id: 'engineering-calcs', name: 'Engineering Calculations', description: 'Common engineering formulas and calculation reference', discipline: 'mechanical', subCategory: 'Reference', status: 'web_only', icon: 'document-text', tags: ['Formulas', 'Reference'], webUrl: 'https://engrassist.com/engineering_calculations.html' },
  { id: 'ashrae-standards', name: 'ASHRAE Standards', description: 'Key ASHRAE standards and guidelines for HVAC design', discipline: 'mechanical', subCategory: 'Reference', status: 'web_only', icon: 'book', tags: ['ASHRAE', 'Standards'], webUrl: 'https://engrassist.com/ashrae_standards.html' },
  { id: 'equipment-specs', name: 'Equipment Specifications', description: 'Standard mechanical equipment specs and ratings', discipline: 'mechanical', subCategory: 'Reference', status: 'web_only', icon: 'cog', tags: ['Equipment', 'Specs'], webUrl: 'https://engrassist.com/equipment_specifications.html' },
  { id: 'hvac-fundamentals', name: 'HVAC Fundamentals', description: 'Educational guide to HVAC principles and thermodynamics', discipline: 'mechanical', subCategory: 'Education', status: 'web_only', icon: 'school', tags: ['Education', 'Fundamentals'], webUrl: 'https://engrassist.com/hvac_fundamentals.html' },
  { id: 'hvac-design-guide', name: 'HVAC Design Guide', description: 'Step-by-step guide to designing HVAC systems', discipline: 'mechanical', subCategory: 'Education', status: 'web_only', icon: 'map', tags: ['Design Guide', 'HVAC'], webUrl: 'https://engrassist.com/hvac_design_guide.html' },
  { id: 'troubleshooting', name: 'Troubleshooting Guide', description: 'Common HVAC issues and diagnostic procedures', discipline: 'mechanical', subCategory: 'Education', status: 'web_only', icon: 'build', tags: ['Troubleshooting', 'Field'], webUrl: 'https://engrassist.com/troubleshooting_guide.html' },

  // ━━━ ELECTRICAL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { id: 'voltage-drop', name: 'Voltage Drop Calculator', description: 'Calculate voltage drop in electrical circuits per NEC', discipline: 'electrical', subCategory: 'Power Distribution', status: 'coming_soon', icon: 'trending-down', tags: ['NEC', 'Voltage Drop'] },
  { id: 'load-calc-elec', name: 'Electrical Load Calc', description: 'Calculate electrical loads per NEC Article 220', discipline: 'electrical', subCategory: 'Power Distribution', status: 'coming_soon', icon: 'flash', tags: ['NEC', 'Load Calc'] },
  { id: 'circuit-sizing', name: 'Circuit Sizing', description: 'Size conductors, conduit, and overcurrent protection', discipline: 'electrical', subCategory: 'Power Distribution', status: 'coming_soon', icon: 'git-branch', tags: ['NEC', 'Conductor'] },
  { id: 'conduit-fill', name: 'Conduit Fill', description: 'NEC conduit fill percentage for multiple conductors', discipline: 'electrical', subCategory: 'Power Distribution', status: 'coming_soon', icon: 'ellipse-outline', tags: ['Conduit', 'NEC'] },
  { id: 'panel-schedule', name: 'Panel Schedule', description: 'Create and calculate electrical panel schedules', discipline: 'electrical', subCategory: 'Power Distribution', status: 'coming_soon', icon: 'grid', tags: ['Panel', 'Schedule'] },
  { id: 'transformer', name: 'Transformer Sizing', description: 'Size transformers for various applications', discipline: 'electrical', subCategory: 'Power Distribution', status: 'coming_soon', icon: 'swap-vertical', tags: ['Transformer', 'kVA'] },
  { id: 'lighting-calc', name: 'Lighting Calculations', description: 'Calculate illuminance levels and fixture requirements', discipline: 'electrical', subCategory: 'Lighting Design', status: 'coming_soon', icon: 'bulb', tags: ['Lighting', 'Illuminance'] },
  { id: 'short-circuit', name: 'Short Circuit Analysis', description: 'Calculate available fault current and protective device ratings', discipline: 'electrical', subCategory: 'Power Distribution', status: 'coming_soon', icon: 'warning', tags: ['Fault Current', 'Protection'] },

  // ━━━ PLUMBING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { id: 'dwv-pipe', name: 'DWV Pipe Sizing', description: 'Drain, waste & vent pipe sizing per IPC/UPC', discipline: 'plumbing', subCategory: 'Drainage & Venting', status: 'coming_soon', icon: 'arrow-down-circle', tags: ['DWV', 'IPC'] },
  { id: 'fixture-unit', name: 'Fixture Unit Calculator', description: 'Water supply and drainage fixture unit counts per code', discipline: 'plumbing', subCategory: 'Domestic Water', status: 'coming_soon', icon: 'options', tags: ['Fixture Units', 'IPC'] },
  { id: 'water-heater', name: 'Water Heater Sizing', description: 'Size domestic hot water heaters and storage tanks', discipline: 'plumbing', subCategory: 'Domestic Water', status: 'coming_soon', icon: 'flame', tags: ['Water Heater', 'DHW'] },
  { id: 'gas-pipe', name: 'Gas Pipe Sizing', description: 'Size natural gas piping for appliance loads', discipline: 'plumbing', subCategory: 'Natural Gas', status: 'coming_soon', icon: 'bonfire', tags: ['Gas', 'Piping', 'BTU'] },
  { id: 'pressure-loss-plumb', name: 'Pressure Loss Calculator', description: 'Calculate friction loss and pressure drop in water lines', discipline: 'plumbing', subCategory: 'Domestic Water', status: 'coming_soon', icon: 'trending-down', tags: ['Pressure', 'Friction'] },
  { id: 'vent-sizing', name: 'Vent Sizing Calculator', description: 'Calculate vent pipe sizes for drainage systems', discipline: 'plumbing', subCategory: 'Drainage & Venting', status: 'coming_soon', icon: 'cloud-upload', tags: ['Vents', 'Drainage'] },
];

export const WEBSITE_LINKS = {
  home: 'https://engrassist.com',
  about: 'https://engrassist.com/about.html',
  contact: 'https://engrassist.com/contact.html',
};

// ─── HELPERS ─────────────────────────────────────

export const getAvailableTools = (): Tool[] => TOOLS.filter(t => t.status === 'available');
export const getWebOnlyTools = (): Tool[] => TOOLS.filter(t => t.status === 'web_only');
export const getToolsByDiscipline = (d: Discipline): Tool[] => TOOLS.filter(t => t.discipline === d);
export const getSubCategories = (d: Discipline): string[] => [...new Set(TOOLS.filter(t => t.discipline === d).map(t => t.subCategory))];
export const getDisciplineToolCount = (d: Discipline): number => TOOLS.filter(t => t.discipline === d).length;
export const getStats = () => ({
  available: TOOLS.filter(t => t.status === 'available').length,
  total: TOOLS.length,
  disciplines: DISCIPLINES.length,
});

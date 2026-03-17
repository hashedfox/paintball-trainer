export type EquipmentSlot = 'mask' | 'jersey' | 'pants' | 'gloves' | 'cleats' | 'marker' | 'hopper' | 'tank' | 'pack' | 'barrel'

export type EquipmentRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface EquipmentItem {
  id: string
  name: string
  slot: EquipmentSlot
  rarity: EquipmentRarity
  color: string
  brand?: string
  description: string
  owned: boolean
}

export interface PersonaState {
  equipped: Partial<Record<EquipmentSlot, string>> // slot -> item id
  inventory: string[] // owned item ids
  activeColor: string
  teamNumber: string
}

export const EQUIPMENT_SLOTS: { slot: EquipmentSlot; label: string; y: number }[] = [
  { slot: 'mask', label: 'Mask', y: 45 },
  { slot: 'jersey', label: 'Jersey', y: 110 },
  { slot: 'pants', label: 'Pants', y: 195 },
  { slot: 'gloves', label: 'Gloves', y: 135 },
  { slot: 'cleats', label: 'Cleats', y: 260 },
  { slot: 'marker', label: 'Marker', y: 120 },
  { slot: 'hopper', label: 'Hopper', y: 95 },
  { slot: 'tank', label: 'Tank', y: 155 },
  { slot: 'pack', label: 'Pod Pack', y: 175 },
  { slot: 'barrel', label: 'Barrel Kit', y: 110 },
]

export const RARITY_COLORS: Record<EquipmentRarity, string> = {
  common: '#94a3b8',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#eab308',
}

export function createDefaultPersona(): PersonaState {
  return {
    equipped: {},
    inventory: getStarterItems().map(i => i.id),
    activeColor: '#22c55e',
    teamNumber: '7',
  }
}

export function getStarterItems(): EquipmentItem[] {
  return [
    { id: 'mask-basic', name: 'Basic Thermal Mask', slot: 'mask', rarity: 'common', color: '#64748b', brand: 'Virtue', description: 'Standard thermal lens mask', owned: true },
    { id: 'jersey-basic', name: 'Practice Jersey', slot: 'jersey', rarity: 'common', color: '#22c55e', description: 'Basic practice jersey', owned: true },
    { id: 'pants-basic', name: 'Slider Pants', slot: 'pants', rarity: 'common', color: '#334155', description: 'Basic padded slider pants', owned: true },
    { id: 'marker-basic', name: 'Entry Marker', slot: 'marker', rarity: 'common', color: '#475569', brand: 'Planet Eclipse', description: 'Reliable entry-level electronic marker', owned: true },
    { id: 'hopper-basic', name: 'Gravity Hopper', slot: 'hopper', rarity: 'common', color: '#475569', description: 'Standard gravity-fed hopper', owned: true },
    { id: 'tank-basic', name: '48/3000 Tank', slot: 'tank', rarity: 'common', color: '#475569', description: 'Basic aluminum HPA tank', owned: true },
  ]
}

export function getShopItems(): EquipmentItem[] {
  return [
    { id: 'mask-vio', name: 'Virtue VIO Ascend', slot: 'mask', rarity: 'rare', color: '#3b82f6', brand: 'Virtue', description: 'Wide field of vision, excellent ventilation', owned: false },
    { id: 'mask-eflex', name: 'JT ProFlex X', slot: 'mask', rarity: 'rare', color: '#ef4444', brand: 'JT', description: 'Classic pro-level mask with supreme breathability', owned: false },
    { id: 'mask-cmd', name: 'Bunker Kings CMD', slot: 'mask', rarity: 'epic', color: '#a855f7', brand: 'Bunkerkings', description: 'Premium tournament mask with magnetic chin strap', owned: false },
    { id: 'jersey-dynasty', name: 'Dynasty Pro Jersey', slot: 'jersey', rarity: 'legendary', color: '#eab308', brand: 'Dynasty', description: 'Official San Diego Dynasty replica jersey', owned: false },
    { id: 'jersey-damage', name: 'Damage Pro Jersey', slot: 'jersey', rarity: 'legendary', color: '#ef4444', brand: 'Damage', description: 'Official Tampa Bay Damage replica jersey', owned: false },
    { id: 'jersey-custom', name: 'Custom Team Jersey', slot: 'jersey', rarity: 'epic', color: '#a855f7', description: 'Design your own team colors', owned: false },
    { id: 'pants-exalt', name: 'Exalt Thrasher V5', slot: 'pants', rarity: 'rare', color: '#3b82f6', brand: 'Exalt', description: 'Lightweight tournament pants with knee pads', owned: false },
    { id: 'marker-cs3', name: 'Planet Eclipse CS3', slot: 'marker', rarity: 'epic', color: '#a855f7', brand: 'Planet Eclipse', description: 'Top-tier tournament marker, smooth as butter', owned: false },
    { id: 'marker-luxe', name: 'DLX Luxe TM40', slot: 'marker', rarity: 'legendary', color: '#eab308', brand: 'DLX', description: 'The gold standard of tournament markers', owned: false },
    { id: 'marker-dsr', name: 'Dye DSR+', slot: 'marker', rarity: 'rare', color: '#3b82f6', brand: 'Dye', description: 'Ergonomic and lightweight with excellent shot quality', owned: false },
    { id: 'hopper-spire', name: 'Virtue Spire IV', slot: 'hopper', rarity: 'rare', color: '#3b82f6', brand: 'Virtue', description: 'Fast feed, tool-less disassembly', owned: false },
    { id: 'hopper-ctrl', name: 'Bunker Kings CTRL 2', slot: 'hopper', rarity: 'epic', color: '#a855f7', brand: 'Bunkerkings', description: 'Magnetic lid, rapid feed system', owned: false },
    { id: 'tank-ninja', name: 'Ninja SL2 77/4500', slot: 'tank', rarity: 'rare', color: '#22c55e', brand: 'Ninja', description: 'Lightweight carbon fiber tank', owned: false },
    { id: 'tank-pe', name: 'PE Supercore', slot: 'tank', rarity: 'epic', color: '#a855f7', brand: 'Planet Eclipse', description: 'Ultra-light pro tank with quick-fill nipple', owned: false },
    { id: 'gloves-exalt', name: 'Exalt Death Grip', slot: 'gloves', rarity: 'rare', color: '#3b82f6', brand: 'Exalt', description: 'Silicone palm grip, full finger protection', owned: false },
    { id: 'cleats-hk', name: 'HK Army Diggerz X1', slot: 'cleats', rarity: 'rare', color: '#ef4444', brand: 'HK Army', description: 'Paintball-specific cleats for all field conditions', owned: false },
    { id: 'pack-bk', name: 'Bunkerkings Fly Pack', slot: 'pack', rarity: 'rare', color: '#3b82f6', brand: 'Bunkerkings', description: '4+7 pod pack, lightweight harness', owned: false },
    { id: 'barrel-freak', name: 'Freak XL Kit', slot: 'barrel', rarity: 'epic', color: '#a855f7', brand: 'GOG', description: 'Multi-bore barrel kit for paint matching', owned: false },
  ]
}

import { useState } from 'react'
import { useAppState, useDispatch } from '../../store/context'
import { EQUIPMENT_SLOTS, RARITY_COLORS, getStarterItems, getShopItems, type EquipmentSlot, type EquipmentItem } from '../../types/persona'

const ALL_ITEMS = [...getStarterItems(), ...getShopItems()]

const COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4', '#f97316', '#ffffff', '#64748b']

export function PersonaSection() {
  const state = useAppState()
  const dispatch = useDispatch()
  const { personaState } = state
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null)
  const ownedItems = ALL_ITEMS.filter(i => personaState.inventory.includes(i.id))

  const getEquippedItem = (slot: EquipmentSlot): EquipmentItem | undefined => {
    const itemId = personaState.equipped[slot]
    return itemId ? ALL_ITEMS.find(i => i.id === itemId) : undefined
  }

  const slotItems = selectedSlot
    ? ownedItems.filter(i => i.slot === selectedSlot)
    : []

  const handleEquip = (slot: EquipmentSlot, itemId: string) => {
    dispatch({ type: 'EQUIP_ITEM', slot, itemId })
    setSelectedSlot(null)
  }

  const handleUnequip = (slot: EquipmentSlot) => {
    dispatch({ type: 'UNEQUIP_ITEM', slot })
  }

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-black text-white">Paintball Persona</h2>
        <p className="text-xs text-pb-text-dim">Customize your 2D paintball character with earned equipment.</p>
      </div>

      {/* Character + Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 2D Character */}
        <div className="card-gaming p-6 flex flex-col items-center">
          <div className="relative w-48 h-72">
            {/* Character body */}
            <svg viewBox="0 0 200 300" className="w-full h-full">
              {/* Head/Mask */}
              <ellipse cx="100" cy="45" rx="28" ry="32" fill={getEquippedItem('mask')?.color || '#1e293b'} stroke="#334155" strokeWidth="2" />
              <circle cx="100" cy="38" r="12" fill="#0a0e1a" opacity="0.6" />
              {/* Visor */}
              <ellipse cx="100" cy="38" rx="18" ry="8" fill="none" stroke={personaState.activeColor} strokeWidth="1.5" opacity="0.8" />

              {/* Jersey/Body */}
              <rect x="65" y="78" width="70" height="65" rx="8" fill={getEquippedItem('jersey')?.color || '#1e293b'} stroke="#334155" strokeWidth="2" />
              {/* Number */}
              <text x="100" y="120" textAnchor="middle" fill={personaState.activeColor} fontSize="24" fontWeight="900" fontFamily="sans-serif">
                {personaState.teamNumber}
              </text>

              {/* Arms */}
              <rect x="42" y="85" width="22" height="50" rx="8" fill={getEquippedItem('jersey')?.color || '#1e293b'} stroke="#334155" strokeWidth="1.5" />
              <rect x="136" y="85" width="22" height="50" rx="8" fill={getEquippedItem('jersey')?.color || '#1e293b'} stroke="#334155" strokeWidth="1.5" />

              {/* Gloves */}
              <circle cx="53" cy="140" r="8" fill={getEquippedItem('gloves')?.color || '#1e293b'} stroke="#334155" strokeWidth="1.5" />
              <circle cx="147" cy="140" r="8" fill={getEquippedItem('gloves')?.color || '#1e293b'} stroke="#334155" strokeWidth="1.5" />

              {/* Marker (in right hand) */}
              <rect x="150" y="100" width="40" height="8" rx="3" fill={getEquippedItem('marker')?.color || '#475569'} stroke="#334155" strokeWidth="1" />
              <rect x="185" y="101" width="12" height="6" rx="2" fill={getEquippedItem('barrel')?.color || '#334155'} />
              {/* Hopper */}
              <ellipse cx="165" cy="96" rx="8" ry="6" fill={getEquippedItem('hopper')?.color || '#334155'} stroke="#475569" strokeWidth="1" />

              {/* Tank (on back) */}
              <rect x="56" y="90" width="10" height="40" rx="4" fill={getEquippedItem('tank')?.color || '#334155'} stroke="#475569" strokeWidth="1" />

              {/* Pod Pack */}
              <rect x="72" y="140" width="56" height="12" rx="4" fill={getEquippedItem('pack')?.color || '#1e293b'} stroke="#334155" strokeWidth="1" />

              {/* Pants */}
              <rect x="68" y="148" width="28" height="70" rx="6" fill={getEquippedItem('pants')?.color || '#1e293b'} stroke="#334155" strokeWidth="2" />
              <rect x="104" y="148" width="28" height="70" rx="6" fill={getEquippedItem('pants')?.color || '#1e293b'} stroke="#334155" strokeWidth="2" />

              {/* Cleats */}
              <rect x="65" y="218" width="34" height="16" rx="6" fill={getEquippedItem('cleats')?.color || '#1e293b'} stroke="#334155" strokeWidth="1.5" />
              <rect x="101" y="218" width="34" height="16" rx="6" fill={getEquippedItem('cleats')?.color || '#1e293b'} stroke="#334155" strokeWidth="1.5" />
              {/* Cleats detail */}
              <line x1="70" y1="234" x2="94" y2="234" stroke="#475569" strokeWidth="1" />
              <line x1="106" y1="234" x2="130" y2="234" stroke="#475569" strokeWidth="1" />
            </svg>
          </div>

          {/* Color picker */}
          <div className="mt-4">
            <span className="text-[10px] text-pb-text-muted uppercase tracking-wider block mb-2 text-center">Accent Color</span>
            <div className="flex gap-2 justify-center">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_PERSONA_COLOR', color: c })}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    personaState.activeColor === c ? 'border-white scale-125' : 'border-transparent'
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {/* Number */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] text-pb-text-muted">Number:</span>
            <input
              type="text"
              value={personaState.teamNumber}
              onChange={(e) => dispatch({ type: 'SET_PERSONA_NUMBER', number: e.target.value.slice(0, 3) })}
              className="w-12 bg-pb-surface border border-pb-border rounded px-2 py-1 text-center text-sm text-white focus:outline-none focus:border-pb-neon"
              maxLength={3}
            />
          </div>
        </div>

        {/* Equipment Slots */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Equipment</h3>
          <div className="grid grid-cols-2 gap-2">
            {EQUIPMENT_SLOTS.map(({ slot, label }) => {
              const equipped = getEquippedItem(slot)
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(selectedSlot === slot ? null : slot)}
                  className={`persona-slot p-3 text-left transition-all ${
                    equipped ? 'equipped' : ''
                  } ${selectedSlot === slot ? 'border-pb-neon bg-pb-neon/5' : ''}`}
                >
                  <span className="text-[9px] text-pb-text-muted uppercase tracking-wider">{label}</span>
                  {equipped ? (
                    <div className="mt-1">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded" style={{ background: equipped.color }} />
                        <span className="text-[11px] font-medium text-white truncate">{equipped.name}</span>
                      </div>
                      <span className="text-[9px] capitalize" style={{ color: RARITY_COLORS[equipped.rarity] }}>{equipped.rarity}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-pb-text-muted mt-1 block">Empty</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Slot items panel */}
          {selectedSlot && (
            <div className="card-gaming p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-white capitalize">{selectedSlot} Options</h4>
                {personaState.equipped[selectedSlot] && (
                  <button
                    type="button"
                    onClick={() => handleUnequip(selectedSlot)}
                    className="text-[10px] text-pb-red"
                  >
                    Unequip
                  </button>
                )}
              </div>
              {slotItems.length === 0 ? (
                <p className="text-[10px] text-pb-text-muted">No items owned for this slot. Earn coins in Challenges to buy equipment!</p>
              ) : (
                <div className="space-y-2">
                  {slotItems.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleEquip(selectedSlot, item.id)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg border transition-all ${
                        personaState.equipped[selectedSlot] === item.id
                          ? 'border-pb-neon bg-pb-neon/5'
                          : 'border-pb-border bg-pb-surface hover:border-pb-border-light'
                      }`}
                    >
                      <div className="w-8 h-8 rounded border flex items-center justify-center" style={{ borderColor: RARITY_COLORS[item.rarity], background: `${RARITY_COLORS[item.rarity]}10` }}>
                        <div className="w-4 h-4 rounded" style={{ background: item.color }} />
                      </div>
                      <div className="text-left">
                        <span className="text-[11px] font-medium text-white">{item.name}</span>
                        <span className="text-[9px] capitalize block" style={{ color: RARITY_COLORS[item.rarity] }}>{item.rarity}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Inventory count */}
          <div className="bg-pb-surface rounded-lg p-3">
            <span className="text-[10px] text-pb-text-muted">Inventory: {ownedItems.length} items owned</span>
          </div>
        </div>
      </div>
    </div>
  )
}

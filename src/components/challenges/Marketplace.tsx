import { useState } from 'react'
import { useAppState, useDispatch } from '../../store/context'
import { RARITY_COLORS, getShopItems, type EquipmentSlot } from '../../types/persona'

const SLOT_FILTERS: { id: 'all' | EquipmentSlot; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'mask', label: 'Masks' },
  { id: 'jersey', label: 'Jerseys' },
  { id: 'marker', label: 'Markers' },
  { id: 'hopper', label: 'Hoppers' },
  { id: 'tank', label: 'Tanks' },
  { id: 'pants', label: 'Pants' },
  { id: 'gloves', label: 'Gloves' },
  { id: 'cleats', label: 'Cleats' },
  { id: 'pack', label: 'Packs' },
  { id: 'barrel', label: 'Barrels' },
]

const RARITY_PRICES: Record<string, number> = {
  common: 25,
  rare: 75,
  epic: 200,
  legendary: 500,
}

export function Marketplace() {
  const state = useAppState()
  const dispatch = useDispatch()
  const [filter, setFilter] = useState<'all' | EquipmentSlot>('all')

  const shopItems = getShopItems()
  const ownedIds = state.personaState.inventory

  const filtered = shopItems.filter(item =>
    (filter === 'all' || item.slot === filter) && !ownedIds.includes(item.id)
  )

  const handlePurchase = (itemId: string, rarity: string) => {
    const cost = RARITY_PRICES[rarity] || 100
    if (state.challengesState.coins >= cost) {
      dispatch({ type: 'PURCHASE_ITEM', itemId, cost })
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-black text-white mb-1">Equipment Shop</h2>
        <p className="text-xs text-pb-text-dim">Spend your earned coins on equipment for your persona.</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SLOT_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
              filter === f.id
                ? 'bg-pb-neon text-pb-darker'
                : 'bg-pb-surface text-pb-text-dim border border-pb-border'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map((item) => {
          const price = RARITY_PRICES[item.rarity]
          const canAfford = state.challengesState.coins >= price

          return (
            <div key={item.id} className="card-gaming p-4 relative overflow-hidden">
              {/* Rarity glow */}
              <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full" style={{ background: `${RARITY_COLORS[item.rarity]}10` }} />

              {/* Item display */}
              <div
                className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center border-2"
                style={{ borderColor: RARITY_COLORS[item.rarity], background: `${RARITY_COLORS[item.rarity]}10` }}
              >
                <div className="w-6 h-6 rounded" style={{ background: item.color }} />
              </div>

              <h4 className="text-xs font-bold text-white text-center truncate">{item.name}</h4>
              {item.brand && <p className="text-[9px] text-pb-text-muted text-center">{item.brand}</p>}
              <p className="text-[9px] text-pb-text-dim text-center mt-1 line-clamp-2">{item.description}</p>

              {/* Rarity tag */}
              <div className="flex justify-center mt-2">
                <span
                  className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full"
                  style={{ color: RARITY_COLORS[item.rarity], background: `${RARITY_COLORS[item.rarity]}15` }}
                >
                  {item.rarity}
                </span>
              </div>

              {/* Buy button */}
              <button
                type="button"
                onClick={() => handlePurchase(item.id, item.rarity)}
                disabled={!canAfford}
                className={`w-full mt-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  canAfford
                    ? 'bg-pb-amber/20 text-pb-amber border border-pb-amber/30 hover:bg-pb-amber/30'
                    : 'bg-pb-surface text-pb-text-muted cursor-not-allowed'
                }`}
              >
                {price} coins
              </button>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-pb-text-muted text-sm">
            {filter === 'all' ? 'You own everything! Nice collection.' : 'No items in this category.'}
          </p>
        </div>
      )}
    </div>
  )
}

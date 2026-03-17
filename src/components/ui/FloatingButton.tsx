interface Props {
  label: string
  onClick: () => void
}

export function FloatingButton({ label, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-20 right-4 bg-[#D4A843] text-black font-bold px-4 py-3 rounded-full shadow-lg hover:bg-yellow-400 active:scale-95 transition-all z-40"
    >
      {label}
    </button>
  )
}

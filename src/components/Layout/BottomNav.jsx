export default function BottomNav({ tab, setTab }) {
  const tabs = [
    { id: 'player', icon: '🎵', label: 'Playing' },
    { id: 'queue', icon: '🎶', label: 'Queue' },
    { id: 'discover', icon: '✨', label: 'Discover' },
    { id: 'ourSongs', icon: '♥', label: 'Our Songs' },
    { id: 'notes', icon: '📝', label: 'Notes' },
    { id: 'history', icon: '⏱', label: 'History' },
  ]

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-surface border-t border-white/10 flex justify-around items-center py-2 px-0.5 overflow-x-auto">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`flex flex-col items-center gap-0.5 px-1.5 py-1 shrink-0 ${
            tab === t.id ? 'text-accent' : 'text-subtext'
          }`}
        >
          <span className="text-base">{t.icon}</span>
          <span className="text-[9px]">{t.label}</span>
        </button>
      ))}
    </div>
  )
}
export default function BottomNav({ tab, setTab }) {
  const tabs = [
    { id: 'player', icon: '🎵', label: 'Playing' },
    { id: 'queue', icon: '🎶', label: 'Queue' },
    { id: 'discover', icon: '✨', label: 'Discover' },
    { id: 'ourSongs', icon: '♥', label: 'Our Songs' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 flex">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
            tab === t.id ? 'text-accent' : 'text-subtext'
          }`}
        >
          <span className="text-xl">{t.icon}</span>
          <span className="text-xs">{t.label}</span>
        </button>
      ))}
    </div>
  )
}
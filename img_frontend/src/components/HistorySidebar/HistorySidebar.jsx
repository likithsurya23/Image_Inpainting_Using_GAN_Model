import React from 'react'

const HistorySidebar = ({ history, onSelect, selectedId }) => {
  if (history.length === 0) {
    return (
      <aside className="w-full lg:w-72 min-h-[300px] lg:max-h-[calc(100vh-280px)] bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl flex flex-col text-white overflow-hidden shadow-xl relative">
        {/* Gradient top bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500" />

        <div className="flex justify-between items-center px-5 py-4 bg-white/5 border-b border-white/10">
          <h3 className="text-sm font-semibold text-slate-200">History</h3>
          <span className="px-3 py-1 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full text-xs font-semibold shadow-lg shadow-primary-500/30">
            {history.length}
          </span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="text-4xl mb-5 opacity-60">🖼️</div>
          <p className="text-slate-400 text-sm font-medium mb-2">Your inpainted images will appear here</p>
          <span className="text-slate-600 text-xs">Complete your first edit to get started</span>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-full lg:w-72 min-h-[300px] lg:max-h-[calc(100vh-280px)] bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl flex flex-col text-white overflow-hidden shadow-xl relative">
      {/* Gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500" />

      <div className="flex justify-between items-center px-5 py-4 bg-white/5 border-b border-white/10">
        <h3 className="text-sm font-semibold text-slate-200">Recent Results</h3>
        <span className="px-3 py-1 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full text-xs font-semibold shadow-lg shadow-primary-500/30">
          {history.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto lg:overflow-y-auto overflow-x-auto lg:overflow-x-hidden p-3 flex lg:flex-col flex-row lg:gap-2 gap-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {history.map((item) => (
          <div
            key={item.id}
            className={`
              flex lg:flex-row flex-col items-center lg:items-center p-3 rounded-xl cursor-pointer transition-all duration-200 relative overflow-hidden group
              min-w-[130px] lg:min-w-0
              ${selectedId === item.id
                ? 'bg-gradient-to-r from-primary-500/20 to-purple-500/20 border border-primary-500/50'
                : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary-500/30 lg:hover:translate-x-1'}
            `}
            onClick={() => onSelect(item)}
          >
            <div className="relative lg:mr-3 lg:mb-0 mb-2 flex-shrink-0">
              <img
                src={item.result}
                alt="Previous result"
                className={`
                  lg:w-14 lg:h-14 w-24 h-20 rounded-lg object-cover transition-all duration-200
                  ${selectedId === item.id
                    ? 'border-2 border-primary-500 shadow-lg shadow-primary-500/30'
                    : 'border-2 border-white/10 group-hover:border-primary-500/50'}
                `}
                loading="lazy"
              />
              {selectedId === item.id && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">✓</span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col lg:items-start items-center gap-0.5">
              <span className="text-sm font-semibold text-slate-100">
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <span className="text-xs text-slate-500">
                {new Date(item.timestamp).toLocaleDateString()}
              </span>
            </div>

            <button
              className="lg:opacity-0 lg:group-hover:opacity-100 opacity-100 p-2 rounded-lg bg-white/10 hover:bg-primary-500/30 text-slate-400 hover:text-primary-300 transition-all lg:mt-0 mt-2"
              onClick={(e) => {
                e.stopPropagation()
                // Download functionality
                const link = document.createElement('a')
                link.href = item.result
                link.download = `inpainted-${item.id}.png`
                link.click()
              }}
              title="Download"
            >
              ⬇️
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/10 bg-black/20">
        <button
          className="w-full py-3 px-5 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-500/20 hover:border-red-500/40 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
          onClick={() => console.log('Clear history')}
        >
          Clear History
        </button>
      </div>
    </aside>
  )
}

export default HistorySidebar
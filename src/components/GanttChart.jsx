import { AnimatePresence, motion } from 'framer-motion'
import { TimerReset } from 'lucide-react'

const MotionDiv = motion.div

const colors = [
  'from-cyan-400 to-blue-500',
  'from-violet-400 to-fuchsia-500',
  'from-emerald-400 to-teal-500',
  'from-amber-300 to-orange-500',
  'from-rose-400 to-pink-500',
]

const getColor = (processId) => {
  if (!processId) return 'from-slate-500 to-slate-700'
  return colors[Math.abs(Number(processId)) % colors.length]
}

function GanttChart({ gantt, currentTime }) {
  return (
    <section className="glass-panel overflow-hidden p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Gantt Timeline</p>
          <h2 className="mt-1 text-xl font-bold text-white">Execution slices</h2>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm font-black text-cyan-100">
          <TimerReset size={16} />
          <span>t = {currentTime}</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-h-[116px] min-w-max items-stretch gap-2">
          <AnimatePresence mode="popLayout">
            {gantt.map((slice) => (
              <MotionDiv
                key={slice.id}
                layout
                className={`flex w-28 flex-col justify-between rounded-lg border border-white/15 bg-gradient-to-br ${getColor(slice.processId)} p-3 shadow-lg`}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              >
                <div>
                  <p className="truncate text-sm font-black text-white">{slice.label}</p>
                  <p className="mt-1 text-xs font-semibold text-white/80">{slice.cpuUsage}% CPU</p>
                </div>
                <div className="mt-4 flex justify-between text-xs font-black text-white/85">
                  <span>{slice.start}</span>
                  <span>{slice.end}</span>
                </div>
              </MotionDiv>
            ))}
          </AnimatePresence>
          {gantt.length === 0 && (
            <div className="flex min-h-[116px] w-full min-w-[280px] items-center justify-center rounded-lg border border-dashed border-white/15 text-sm text-slate-500">
              Start the simulation to draw CPU execution.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default GanttChart

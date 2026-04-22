import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Clock3, Cpu } from 'lucide-react'

const MotionDiv = motion.div

function QueueList({ title, icon, processes, emptyText, accentClass }) {
  const QueueIcon = icon

  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/35 p-4">
      <div className="mb-3 flex items-center gap-2">
        <QueueIcon size={17} className={accentClass} />
        <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-300">{title}</h3>
      </div>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {processes.map((process) => (
            <MotionDiv
              key={process.id}
              layout
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-bold text-white">{process.name}</p>
                <span className="shrink-0 rounded-md bg-cyan-300/10 px-2 py-1 text-xs font-black text-cyan-100">
                  P{process.priority}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                arrival {process.arrivalTime} · remaining {process.remainingTime}/{process.burstTime}
              </p>
            </MotionDiv>
          ))}
        </AnimatePresence>
        {processes.length === 0 && <p className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-sm text-slate-500">{emptyText}</p>}
      </div>
    </div>
  )
}

function ReadyQueue({ runningProcess, readyQueue, completedProcesses }) {
  return (
    <section className="glass-panel p-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Scheduler Queues</p>
        <h2 className="mt-1 text-xl font-bold text-white">CPU execution state</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <QueueList
          title="Running"
          icon={Cpu}
          processes={runningProcess ? [runningProcess] : []}
          emptyText="CPU idle"
          accentClass="text-cyan-200"
        />
        <QueueList
          title="Ready Queue"
          icon={Clock3}
          processes={readyQueue}
          emptyText="No waiting processes"
          accentClass="text-amber-200"
        />
        <QueueList
          title="Completed"
          icon={CheckCircle2}
          processes={completedProcesses.slice(-5).reverse()}
          emptyText="No completed processes"
          accentClass="text-emerald-200"
        />
      </div>
    </section>
  )
}

export default ReadyQueue

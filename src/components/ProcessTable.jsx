import { motion } from 'framer-motion'
import { Ban, Gauge, Plus, RotateCcw, Search, SlidersHorizontal, Trash2 } from 'lucide-react'

const MotionTr = motion.tr

const statusClass = {
  Running: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100',
  Waiting: 'border-amber-300/30 bg-amber-400/10 text-amber-100',
  Completed: 'border-slate-500/40 bg-slate-600/20 text-slate-300',
}

function ProcessTable({
  processes,
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  onAdd,
  onKill,
  onPriority,
  onReset,
}) {
  const filtered = processes
    .filter((process) => process.name.toLowerCase().includes(query.toLowerCase()))
    .filter((process) => statusFilter === 'All' || process.status === statusFilter)
    .sort((a, b) => b.cpuUsage - a.cpuUsage || a.arrivalTime - b.arrivalTime || a.priority - b.priority)

  return (
    <section className="glass-panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Process Manager</p>
          <h2 className="mt-1 text-xl font-bold text-white">Scheduling process list</h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-slate-300">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search process"
              className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </label>

          <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-slate-300">
            <SlidersHorizontal size={16} />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="bg-transparent text-sm text-white outline-none"
            >
              <option className="bg-slate-950">All</option>
              <option className="bg-slate-950">Running</option>
              <option className="bg-slate-950">Waiting</option>
              <option className="bg-slate-950">Completed</option>
            </select>
          </label>

          <div className="flex gap-2">
            <button className="icon-button bg-cyan-400/15 text-cyan-100 hover:bg-cyan-400/25" onClick={onAdd} title="Add process">
              <Plus size={18} />
              <span>Add</span>
            </button>
            <button className="icon-button bg-slate-800/80 text-slate-200 hover:bg-slate-700" onClick={onReset} title="Reset system">
              <RotateCcw size={18} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[820px] w-full text-left">
          <thead className="bg-slate-950/50 text-xs uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="px-5 py-4">Process</th>
              <th className="px-5 py-4">Arrival</th>
              <th className="px-5 py-4">Burst</th>
              <th className="px-5 py-4">Remaining</th>
              <th className="px-5 py-4">CPU</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Priority</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.map((process) => (
              <MotionTr
                key={process.id}
                className="text-sm text-slate-200 transition hover:bg-white/[0.04]"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-100">
                      <Gauge size={16} />
                    </span>
                    <div>
                      <p className="font-semibold text-white">{process.name}</p>
                      <p className="text-xs text-slate-500">PID {process.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 font-bold text-slate-200">{process.arrivalTime}</td>
                <td className="px-5 py-4 font-bold text-violet-100">{process.burstTime}</td>
                <td className={`px-5 py-4 font-bold ${process.remainingTime <= 2 && process.remainingTime > 0 ? 'text-amber-200' : 'text-cyan-100'}`}>
                  {process.remainingTime}
                </td>
                <td className={`px-5 py-4 font-bold ${process.cpuUsage > 80 ? 'text-rose-300' : process.cpuUsage > 0 ? 'text-cyan-100' : 'text-slate-500'}`}>
                  {process.cpuUsage}%
                </td>
                <td className="px-5 py-4">
                  <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${statusClass[process.status]}`}>{process.status}</span>
                </td>
                <td className="px-5 py-4">
                  <button
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-cyan-300/40 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={process.status === 'Completed'}
                    onClick={() => onPriority(process.id)}
                  >
                    P{process.priority}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      className="icon-button bg-rose-500/12 text-rose-100 hover:bg-rose-500/22 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={process.status === 'Completed'}
                      onClick={() => onKill(process.id)}
                      title="Kill process"
                    >
                      <Trash2 size={16} />
                      <span>Kill</span>
                    </button>
                  </div>
                </td>
              </MotionTr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 px-5 py-14 text-center text-slate-400">
          <Ban size={30} />
          <p className="font-semibold text-slate-200">No processes match the current view.</p>
          <p className="max-w-md text-sm">Add a process or clear the search and status filter to restore the process list.</p>
        </div>
      )}
    </section>
  )
}

export default ProcessTable

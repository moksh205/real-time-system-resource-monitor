import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Moon, Pause, Play, RotateCcw, Server, Sun } from 'lucide-react'
import AlertBox from '../components/AlertBox.jsx'
import Charts from '../components/Charts.jsx'
import GanttChart from '../components/GanttChart.jsx'
import ProcessTable from '../components/ProcessTable.jsx'
import ReadyQueue from '../components/ReadyQueue.jsx'
import StatCard from '../components/StatCard.jsx'
import { createInitialProcesses, createProcess, getAnalyzerInsights, nextPriority } from '../utils/simulation.js'
import { createSchedulerState, deriveSchedulerSnapshot, stepScheduler } from '../utils/schedulerEngine.js'

const MotionHeader = motion.header

const initialMetrics = { cpu: 0, memory: 46, disk: 18 }
const maxHistory = 28

const makeHistoryPoint = (metrics, time = 0) => ({
  label: `t${time}`,
  cpu: metrics.cpu,
  memory: metrics.memory,
  disk: metrics.disk,
})

const activateArrivedProcesses = (processes, currentTime = 0) =>
  processes.map((process) => ({
    ...process,
    status: process.remainingTime <= 0 ? 'Completed' : process.arrivalTime <= currentTime ? 'Waiting' : 'Waiting',
    cpuUsage: 0,
  }))

function Dashboard() {
  const [processes, setProcesses] = useState(() => activateArrivedProcesses(createInitialProcesses()))
  const [metrics, setMetrics] = useState(initialMetrics)
  const [previousMetrics, setPreviousMetrics] = useState(initialMetrics)
  const [history, setHistory] = useState(() => [makeHistoryPoint(initialMetrics)])
  const [schedulerState, setSchedulerState] = useState(() => createSchedulerState())
  const [algorithm, setAlgorithm] = useState('FCFS')
  const [timeQuantum, setTimeQuantum] = useState(3)
  const [isRunning, setIsRunning] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [toasts, setToasts] = useState([])
  const [lightMode, setLightMode] = useState(false)
  const toastGate = useRef({ cpu: false, queue: false, complete: false })
  const schedulerStateRef = useRef(schedulerState)

  useEffect(() => {
    schedulerStateRef.current = schedulerState
  }, [schedulerState])

  const pushToast = (message, type = 'info') => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, message, type }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 4200)
  }

  const resetSchedulerOnly = () => {
    const resetState = createSchedulerState()
    schedulerStateRef.current = resetState
    setSchedulerState(resetState)
    setProcesses((current) =>
      current.map((process) => ({
        ...process,
        remainingTime: process.burstTime,
        cpuUsage: 0,
        status: 'Waiting',
      })),
    )
    setMetrics(initialMetrics)
    setPreviousMetrics(initialMetrics)
    setHistory([makeHistoryPoint(initialMetrics)])
    toastGate.current = { cpu: false, queue: false, complete: false }
  }

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (!isRunning) return

      setProcesses((currentProcesses) => {
        if (currentProcesses.length === 0 || currentProcesses.every((process) => process.remainingTime <= 0)) {
          setMetrics((currentMetrics) => {
            const idleMetrics = { ...currentMetrics, cpu: 0, disk: 10 }
            setPreviousMetrics(currentMetrics)
            return idleMetrics
          })
          return currentProcesses
        }

        const stepResult = stepScheduler({
          processes: currentProcesses,
          state: schedulerStateRef.current,
          algorithm,
          quantum: timeQuantum,
        })
        schedulerStateRef.current = stepResult.state
        setSchedulerState(stepResult.state)

        setMetrics((currentMetrics) => {
          setPreviousMetrics(currentMetrics)
          setHistory((currentHistory) => [...currentHistory, makeHistoryPoint(stepResult.metrics, stepResult.state.currentTime)].slice(-maxHistory))
          return stepResult.metrics
        })

        return stepResult.processes
      })
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [algorithm, isRunning, timeQuantum])

  useEffect(() => {
    const gates = toastGate.current
    const waitingCount = processes.filter((process) => process.status === 'Waiting' && process.arrivalTime <= schedulerState.currentTime && process.remainingTime > 0).length
    const allComplete = processes.length > 0 && processes.every((process) => process.status === 'Completed')

    if (metrics.cpu > 80 && !gates.cpu) {
      pushToast('High CPU usage detected from current scheduled process', 'critical')
      gates.cpu = true
    }
    if (metrics.cpu < 70) gates.cpu = false

    if (waitingCount >= 5 && !gates.queue) {
      pushToast('Ready queue pressure is high', 'warning')
      gates.queue = true
    }
    if (waitingCount < 4) gates.queue = false

    if (allComplete && !gates.complete) {
      pushToast('All processes completed', 'stable')
      gates.complete = true
      setIsRunning(false)
    }
  }, [metrics.cpu, processes, schedulerState.currentTime])

  const schedulerSnapshot = useMemo(
    () => deriveSchedulerSnapshot(processes, schedulerState),
    [processes, schedulerState],
  )
  const insights = useMemo(() => getAnalyzerInsights(metrics, processes, schedulerState), [metrics, processes, schedulerState])
  const memoryBars = useMemo(
    () => processes.filter((process) => process.status !== 'Completed').sort((a, b) => b.memoryUsage - a.memoryUsage).slice(0, 7),
    [processes],
  )

  const runningCount = processes.filter((process) => process.status === 'Running').length
  const waitingCount = processes.filter((process) => process.status === 'Waiting' && process.arrivalTime <= schedulerState.currentTime && process.remainingTime > 0).length
  const completedCount = processes.filter((process) => process.status === 'Completed').length

  const addProcess = () => {
    const next = createProcess(Date.now(), schedulerState.currentTime)
    setProcesses((current) => [next, ...current])
    setIsRunning(true)
    toastGate.current.complete = false
    pushToast(`${next.name} entered the ready queue`, 'info')
  }

  const killProcess = (id) => {
    setProcesses((current) =>
      current.map((process) =>
        process.id === id
          ? { ...process, remainingTime: 0, cpuUsage: 0, status: 'Completed' }
          : process,
      ),
    )
    const nextState = {
      ...schedulerStateRef.current,
      runningProcessId: schedulerStateRef.current.runningProcessId === id ? null : schedulerStateRef.current.runningProcessId,
      rrQueue: schedulerStateRef.current.rrQueue.filter((queuedId) => queuedId !== id),
    }
    schedulerStateRef.current = nextState
    setSchedulerState(nextState)
    pushToast('Process terminated and marked completed', 'critical')
  }

  const changePriority = (id) => {
    setProcesses((current) =>
      current.map((process) =>
        process.id === id && process.status !== 'Completed' ? { ...process, priority: nextPriority(process.priority) } : process,
      ),
    )
  }

  const resetSystem = () => {
    const resetProcesses = activateArrivedProcesses(createInitialProcesses())
    const resetState = createSchedulerState()
    setProcesses(resetProcesses)
    schedulerStateRef.current = resetState
    setSchedulerState(resetState)
    setMetrics(initialMetrics)
    setPreviousMetrics(initialMetrics)
    setHistory([makeHistoryPoint(initialMetrics)])
    setQuery('')
    setStatusFilter('All')
    setIsRunning(true)
    toastGate.current = { cpu: false, queue: false, complete: false }
    pushToast('Scheduling simulation reset', 'stable')
  }

  const handleAlgorithmChange = (event) => {
    setAlgorithm(event.target.value)
    const nextState = { ...schedulerStateRef.current, rrQueue: [], quantumCounter: 0, runningProcessId: null }
    schedulerStateRef.current = nextState
    setSchedulerState(nextState)
    setProcesses((current) => current.map((process) => ({ ...process, cpuUsage: 0, status: process.remainingTime <= 0 ? 'Completed' : 'Waiting' })))
  }

  const statCards = [
    {
      title: 'CPU Usage',
      value: metrics.cpu,
      type: 'cpu',
      detail: schedulerSnapshot.runningProcess ? schedulerSnapshot.runningProcess.name : 'CPU idle',
      trend: Number((metrics.cpu - previousMetrics.cpu).toFixed(1)),
    },
    {
      title: 'Memory Usage',
      value: metrics.memory,
      type: 'memory',
      detail: `${processes.length - completedCount} active allocations`,
      trend: Number((metrics.memory - previousMetrics.memory).toFixed(1)),
    },
    {
      title: 'Ready Queue',
      value: waitingCount,
      unit: '',
      type: 'disk',
      detail: `${algorithm} scheduler`,
      trend: waitingCount - runningCount,
    },
    {
      title: 'Completed',
      value: completedCount,
      unit: '',
      type: 'processes',
      detail: `time t=${schedulerState.currentTime}`,
      trend: runningCount,
    },
  ]

  return (
    <main className={lightMode ? 'app-shell light-mode' : 'app-shell'}>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_80%_8%,rgba(168,85,247,0.16),transparent_32%),linear-gradient(135deg,#030712_0%,#111827_48%,#050816_100%)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <MotionHeader
          className="flex flex-col gap-4 rounded-lg border border-white/10 bg-slate-950/55 p-5 shadow-2xl backdrop-blur-xl xl:flex-row xl:items-center xl:justify-between"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-lg border border-cyan-300/40 bg-cyan-300/10 text-cyan-100 shadow-[0_0_32px_rgba(34,211,238,0.2)]">
              <Server size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">CPU Scheduling Engine</p>
              <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">System Resource Monitor & Analyzer</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-sm font-bold text-slate-200">
              Algorithm
              <select value={algorithm} onChange={handleAlgorithmChange} className="bg-transparent text-white outline-none">
                <option className="bg-slate-950">FCFS</option>
                <option className="bg-slate-950">Round Robin</option>
                <option className="bg-slate-950">Priority</option>
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-sm font-bold text-slate-200">
              Quantum
              <input
                type="number"
                min="1"
                max="8"
                value={timeQuantum}
                disabled={algorithm !== 'Round Robin'}
                onChange={(event) => setTimeQuantum(Math.max(1, Math.min(8, Number(event.target.value) || 1)))}
                className="w-14 bg-transparent text-white outline-none disabled:opacity-40"
              />
            </label>

            <button
              className="icon-button bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20"
              onClick={() => setIsRunning((current) => !current)}
              title={isRunning ? 'Pause simulation' : 'Start simulation'}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              <span>{isRunning ? 'Pause' : 'Start'}</span>
            </button>

            <button className="icon-button bg-slate-800/80 text-slate-200 hover:bg-slate-700" onClick={resetSchedulerOnly} title="Reset scheduler run">
              <RotateCcw size={18} />
              <span>Run</span>
            </button>

            <div className="flex items-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-sm font-bold text-emerald-100">
              <Activity size={16} />
              <span>{isRunning ? 'Executing' : 'Paused'}</span>
            </div>
            <button
              className="icon-button bg-white/10 text-slate-100 hover:bg-white/15"
              onClick={() => setLightMode((current) => !current)}
              title="Toggle theme"
            >
              {lightMode ? <Moon size={18} /> : <Sun size={18} />}
              <span>{lightMode ? 'Dark' : 'Light'}</span>
            </button>
          </div>
        </MotionHeader>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </section>

        <ReadyQueue
          runningProcess={schedulerSnapshot.runningProcess}
          readyQueue={schedulerSnapshot.readyQueue}
          completedProcesses={schedulerSnapshot.completedProcesses}
        />

        <div className="grid gap-5 2xl:grid-cols-[1fr_360px]">
          <Charts history={history} memoryBars={memoryBars} lightMode={lightMode} />
          <AlertBox insights={insights} toasts={toasts} />
        </div>

        <GanttChart gantt={schedulerState.gantt} currentTime={schedulerState.currentTime} />

        <ProcessTable
          processes={processes}
          query={query}
          setQuery={setQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onAdd={addProcess}
          onKill={killProcess}
          onPriority={changePriority}
          onReset={resetSystem}
        />
      </div>
    </main>
  )
}

export default Dashboard

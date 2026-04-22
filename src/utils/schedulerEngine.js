import { selectFcfsProcess } from '../algorithms/fcfs.js'
import { selectPriorityProcess } from '../algorithms/priority.js'
import { selectRoundRobinProcess } from '../algorithms/roundRobin.js'
import { clamp } from './simulation.js'

const applyStatuses = (processes, currentTime, runningProcessId) =>
  processes.map((process) => {
    if (process.remainingTime <= 0) return { ...process, remainingTime: 0, cpuUsage: 0, status: 'Completed' }
    if (process.arrivalTime > currentTime) return { ...process, cpuUsage: 0, status: 'Waiting' }
    if (process.id === runningProcessId) return { ...process, status: 'Running' }
    return { ...process, cpuUsage: 0, status: 'Waiting' }
  })

const getReadyQueue = (processes, currentTime, runningProcessId) =>
  processes
    .filter((process) => process.arrivalTime <= currentTime && process.remainingTime > 0 && process.id !== runningProcessId)
    .sort((a, b) => a.arrivalTime - b.arrivalTime || a.priority - b.priority || a.id - b.id)

const getCpuUsage = (runningProcess, waitingCount) => {
  if (!runningProcess) return 0

  const priorityPressure = Math.max(0, 6 - runningProcess.priority) * 4
  const burstPressure = Math.min(18, runningProcess.burstTime * 2.4)
  return clamp(52 + priorityPressure + burstPressure + waitingCount * 3, 0, 100)
}

export const createSchedulerState = () => ({
  currentTime: 0,
  runningProcessId: null,
  rrQueue: [],
  quantumCounter: 0,
  gantt: [],
})

export const deriveSchedulerSnapshot = (processes, state) => {
  const runningProcess = processes.find((process) => process.id === state.runningProcessId && process.status === 'Running')
  const readyQueue = getReadyQueue(processes, state.currentTime, state.runningProcessId)
  const completedProcesses = processes.filter((process) => process.status === 'Completed')

  return { runningProcess, readyQueue, completedProcesses }
}

export const stepScheduler = ({ processes, state, algorithm, quantum }) => {
  const safeQuantum = Math.max(1, Number(quantum) || 1)
  let runningProcessId = null
  let rrQueue = state.rrQueue

  if (algorithm === 'FCFS') {
    runningProcessId = selectFcfsProcess(processes, state.currentTime, state.runningProcessId)
  } else if (algorithm === 'Priority') {
    runningProcessId = selectPriorityProcess(processes, state.currentTime)
  } else {
    const rrSelection = selectRoundRobinProcess({
      processes,
      currentTime: state.currentTime,
      queue: state.rrQueue,
      runningProcessId: state.runningProcessId,
      quantumCounter: state.quantumCounter,
      quantum: safeQuantum,
    })
    runningProcessId = rrSelection.selectedId
    rrQueue = rrSelection.queue
  }

  const waitingCount = processes.filter(
    (process) => process.arrivalTime <= state.currentTime && process.remainingTime > 0 && process.id !== runningProcessId,
  ).length
  const selectedProcess = processes.find((process) => process.id === runningProcessId)
  const cpuUsage = getCpuUsage(selectedProcess, waitingCount)

  let updatedProcesses = processes.map((process) => {
    if (process.id !== runningProcessId || process.remainingTime <= 0) return { ...process, cpuUsage: 0 }

    const remainingTime = Math.max(0, process.remainingTime - 1)
    return {
      ...process,
      remainingTime,
      cpuUsage: remainingTime === 0 ? 0 : cpuUsage,
    }
  })

  const executedProcess = updatedProcesses.find((process) => process.id === runningProcessId)
  const completedNow = executedProcess?.remainingTime === 0
  const nextTime = state.currentTime + 1

  if (algorithm === 'Round Robin') {
    rrQueue = rrQueue.filter((id) => updatedProcesses.some((process) => process.id === id && process.remainingTime > 0))

    if (runningProcessId && completedNow) {
      rrQueue = rrQueue.filter((id) => id !== runningProcessId)
    } else if (runningProcessId && state.quantumCounter + 1 >= safeQuantum && rrQueue[0] === runningProcessId) {
      rrQueue.push(rrQueue.shift())
    }
  }

  const nextRunningProcessId = completedNow ? null : runningProcessId
  updatedProcesses = applyStatuses(updatedProcesses, nextTime, nextRunningProcessId)

  return {
    processes: updatedProcesses,
    metrics: {
      cpu: runningProcessId ? cpuUsage : 0,
      memory: clamp(
        updatedProcesses
          .filter((process) => process.status !== 'Completed')
          .reduce((total, process) => total + process.memoryUsage, 0) / 2.8,
      ),
      disk: clamp(18 + waitingCount * 5 + (runningProcessId ? 12 : 0)),
    },
    state: {
      currentTime: nextTime,
      runningProcessId: nextRunningProcessId,
      rrQueue,
      quantumCounter: algorithm === 'Round Robin' && runningProcessId && !completedNow ? (state.quantumCounter + 1) % safeQuantum : 0,
      gantt: [
        ...state.gantt,
        {
          id: `${state.currentTime}-${runningProcessId ?? 'idle'}`,
          processId: runningProcessId,
          label: selectedProcess?.name ?? 'Idle',
          start: state.currentTime,
          end: nextTime,
          cpuUsage: runningProcessId ? cpuUsage : 0,
        },
      ].slice(-36),
    },
  }
}

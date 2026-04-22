const processNames = [
  'Chrome Renderer',
  'VS Code Server',
  'Docker Engine',
  'Node Worker',
  'System Kernel',
  'Window Manager',
  'Postgres',
  'Telemetry Agent',
  'Audio Service',
  'Backup Sync',
  'GPU Composer',
  'Indexing Service',
]

export const clamp = (value, min = 0, max = 100) =>
  Math.min(max, Math.max(min, Number(value.toFixed(1))))

export const randomBetween = (min, max) =>
  Number((Math.random() * (max - min) + min).toFixed(1))

const createSchedulerProcess = (id, index = 0, arrivalOverride) => {
  const burstTime = Math.floor(randomBetween(4, 13))

  return {
    id,
    name: processNames[Math.floor(Math.random() * processNames.length)],
    arrivalTime: arrivalOverride ?? Math.floor(index * 1.4),
    burstTime,
    remainingTime: burstTime,
    priority: Math.floor(randomBetween(1, 6)),
    cpuUsage: 0,
    memoryUsage: randomBetween(12, 42),
    status: 'Waiting',
  }
}

export const createProcess = (id = Date.now(), currentTime = 0) =>
  createSchedulerProcess(id, 0, currentTime)

export const createInitialProcesses = () =>
  Array.from({ length: 8 }, (_, index) => createSchedulerProcess(1000 + index, index))

export const nextPriority = (priority) => (priority >= 5 ? 1 : priority + 1)

export const getAnalyzerInsights = (metrics, processes, scheduler = {}) => {
  const insights = []
  const waitingProcesses = processes.filter((process) => process.status === 'Waiting' && process.remainingTime > 0)
  const completedCount = processes.filter((process) => process.status === 'Completed').length
  const runningProcess = processes.find((process) => process.status === 'Running')
  const memoryHeavyProcess = [...processes].sort((a, b) => b.memoryUsage - a.memoryUsage)[0]

  if (metrics.cpu > 80) {
    insights.push({ type: 'critical', message: 'High CPU usage detected. The running process is saturating the simulated core.' })
  }

  if (waitingProcesses.length >= 5) {
    insights.push({ type: 'warning', message: 'High CPU load due to multiple waiting processes in the ready queue.' })
  }

  if (metrics.memory > 75) {
    insights.push({ type: 'warning', message: 'Memory pressure is elevated across active scheduled processes.' })
  }

  if (runningProcess) {
    insights.push({
      type: 'info',
      message: `${runningProcess.name} is executing at t=${scheduler.currentTime ?? 0} with ${runningProcess.remainingTime} ticks remaining.`,
    })
  }

  if (memoryHeavyProcess && memoryHeavyProcess.memoryUsage > 65 && memoryHeavyProcess.status !== 'Completed') {
    insights.push({ type: 'warning', message: `${memoryHeavyProcess.name} is reserving a large memory allocation.` })
  }

  if (completedCount > 0) {
    insights.push({ type: 'stable', message: `${completedCount} process${completedCount === 1 ? '' : 'es'} completed successfully.` })
  }

  if (processes.length === 0) {
    insights.push({ type: 'info', message: 'No processes loaded. Add a process to start scheduling.' })
  }

  if (insights.length === 0) {
    insights.push({ type: 'stable', message: 'Scheduler stable. Ready queue and resource usage are within normal range.' })
  }

  return insights
}

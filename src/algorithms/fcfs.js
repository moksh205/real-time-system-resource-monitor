export const selectFcfsProcess = (processes, currentTime, runningProcessId) => {
  const runningProcess = processes.find(
    (process) => process.id === runningProcessId && process.remainingTime > 0 && process.arrivalTime <= currentTime,
  )

  if (runningProcess) return runningProcess.id

  const readyProcesses = processes
    .filter((process) => process.arrivalTime <= currentTime && process.remainingTime > 0)
    .sort((a, b) => a.arrivalTime - b.arrivalTime || a.id - b.id)

  return readyProcesses[0]?.id ?? null
}

export const selectPriorityProcess = (processes, currentTime) => {
  const readyProcesses = processes
    .filter((process) => process.arrivalTime <= currentTime && process.remainingTime > 0)
    .sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime || a.id - b.id)

  return readyProcesses[0]?.id ?? null
}

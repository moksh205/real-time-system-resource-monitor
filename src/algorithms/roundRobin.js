const normalizeQueue = (queue, processes, currentTime) => {
  const validIds = new Set(
    processes
      .filter((process) => process.arrivalTime <= currentTime && process.remainingTime > 0)
      .map((process) => process.id),
  )

  const uniqueQueue = []
  queue.forEach((id) => {
    if (validIds.has(id) && !uniqueQueue.includes(id)) uniqueQueue.push(id)
  })

  processes
    .filter((process) => validIds.has(process.id))
    .sort((a, b) => a.arrivalTime - b.arrivalTime || a.id - b.id)
    .forEach((process) => {
      if (!uniqueQueue.includes(process.id)) uniqueQueue.push(process.id)
    })

  return uniqueQueue
}

export const selectRoundRobinProcess = ({ processes, currentTime, queue, runningProcessId, quantumCounter, quantum }) => {
  const normalizedQueue = normalizeQueue(queue, processes, currentTime)
  const runningProcess = processes.find((process) => process.id === runningProcessId && process.remainingTime > 0)
  const canContinue = runningProcess && quantumCounter < quantum && normalizedQueue[0] === runningProcessId

  if (canContinue) {
    return { selectedId: runningProcessId, queue: normalizedQueue }
  }

  if (runningProcess && normalizedQueue[0] === runningProcessId) {
    normalizedQueue.push(normalizedQueue.shift())
  }

  return {
    selectedId: normalizedQueue[0] ?? null,
    queue: normalizedQueue,
  }
}

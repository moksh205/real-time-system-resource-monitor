import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler)

function Charts({ history, memoryBars, lightMode }) {
  const labels = history.map((point) => point.label)
  const palette = lightMode
    ? {
        grid: 'rgba(51, 65, 85, 0.2)',
        text: '#334155',
        cpuLine: '#0369a1',
        cpuFill: 'rgba(14, 165, 233, 0.18)',
        memoryLine: '#7c3aed',
        memoryFill: 'rgba(124, 58, 237, 0.12)',
        bar: 'rgba(2, 132, 199, 0.78)',
        barBorder: '#0369a1',
        dangerBar: 'rgba(225, 29, 72, 0.82)',
        dangerBorder: '#be123c',
        tooltipBg: 'rgba(255, 255, 255, 0.96)',
        tooltipBorder: 'rgba(2, 132, 199, 0.35)',
        tooltipTitle: '#0f172a',
        tooltipBody: '#334155',
      }
    : {
        grid: 'rgba(148, 163, 184, 0.14)',
        text: 'rgba(226, 232, 240, 0.74)',
        cpuLine: '#22d3ee',
        cpuFill: 'rgba(34, 211, 238, 0.16)',
        memoryLine: '#c084fc',
        memoryFill: 'rgba(192, 132, 252, 0.1)',
        bar: 'rgba(96, 165, 250, 0.76)',
        barBorder: '#67e8f9',
        dangerBar: 'rgba(251, 113, 133, 0.82)',
        dangerBorder: '#fb7185',
        tooltipBg: 'rgba(15, 23, 42, 0.95)',
        tooltipBorder: 'rgba(34, 211, 238, 0.35)',
        tooltipTitle: '#ffffff',
        tooltipBody: '#cbd5e1',
      }

  const lineData = {
    labels,
    datasets: [
      {
        label: 'CPU Usage',
        data: history.map((point) => point.cpu),
        borderColor: palette.cpuLine,
        backgroundColor: palette.cpuFill,
        borderWidth: 3,
        pointRadius: lightMode ? 2 : 0,
        pointBackgroundColor: palette.cpuLine,
        pointBorderColor: palette.cpuLine,
        tension: 0.42,
        fill: true,
      },
      {
        label: 'Memory Usage',
        data: history.map((point) => point.memory),
        borderColor: palette.memoryLine,
        backgroundColor: palette.memoryFill,
        borderWidth: lightMode ? 3 : 2,
        pointRadius: lightMode ? 2 : 0,
        pointBackgroundColor: palette.memoryLine,
        pointBorderColor: palette.memoryLine,
        tension: 0.42,
      },
    ],
  }

  const barData = {
    labels: memoryBars.map((item) => item.name),
    datasets: [
      {
        label: 'Memory %',
        data: memoryBars.map((item) => item.memoryUsage),
        backgroundColor: memoryBars.map((item) => (item.memoryUsage > 65 ? palette.dangerBar : palette.bar)),
        borderColor: memoryBars.map((item) => (item.memoryUsage > 65 ? palette.dangerBorder : palette.barBorder)),
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 650, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        labels: { color: palette.text, boxWidth: 10, boxHeight: 10, useBorderRadius: true },
      },
      tooltip: {
        backgroundColor: palette.tooltipBg,
        borderColor: palette.tooltipBorder,
        borderWidth: 1,
        titleColor: palette.tooltipTitle,
        bodyColor: palette.tooltipBody,
      },
    },
    scales: {
      x: {
        ticks: { color: palette.text, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
        grid: { color: palette.grid },
      },
      y: {
        min: 0,
        max: 100,
        ticks: { color: palette.text, callback: (value) => `${value}%` },
        grid: { color: palette.grid },
      },
    },
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
      <div className="glass-panel min-h-[360px] p-5">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Telemetry Stream</p>
            <h2 className="mt-1 text-xl font-bold text-white">CPU and memory over time</h2>
          </div>
          <span className="hidden rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100 sm:inline-flex">
            1.5s refresh
          </span>
        </div>
        <div className="h-[280px]">
          <Line key={lightMode ? 'line-light' : 'line-dark'} data={lineData} options={commonOptions} />
        </div>
      </div>

      <div className="glass-panel min-h-[360px] p-5">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Memory Heat</p>
          <h2 className="mt-1 text-xl font-bold text-white">Top process allocation</h2>
        </div>
        <div className="h-[280px]">
          <Bar
            key={lightMode ? 'bar-light' : 'bar-dark'}
            data={barData}
            options={{ ...commonOptions, indexAxis: 'y', plugins: { ...commonOptions.plugins, legend: { display: false } } }}
          />
        </div>
      </div>
    </section>
  )
}

export default Charts

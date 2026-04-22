import { motion } from 'framer-motion'
import { Activity, Cpu, Database, HardDrive, TrendingUp } from 'lucide-react'

const MotionArticle = motion.article
const MotionDiv = motion.div

const iconMap = {
  cpu: Cpu,
  memory: Database,
  disk: HardDrive,
  processes: Activity,
}

function StatCard({ title, value, unit = '%', type = 'cpu', detail, trend }) {
  const Icon = iconMap[type] || TrendingUp
  const danger = value >= 80 || (type === 'memory' && value >= 75)
  const caution = value >= 65 && !danger

  return (
    <MotionArticle
      className={`glass-panel relative overflow-hidden p-5 ${danger ? 'danger-glow' : caution ? 'warning-glow' : ''}`}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-blue-500" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</p>
          <div className="mt-3 flex items-end gap-1">
            <span className={`text-4xl font-black ${danger ? 'text-rose-300' : 'text-white'}`}>{value}</span>
            <span className="pb-1 text-sm font-semibold text-slate-400">{unit}</span>
          </div>
        </div>
        <div className={`rounded-lg border p-3 ${danger ? 'border-rose-400/50 bg-rose-500/15 text-rose-200' : 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200'}`}>
          <Icon size={22} />
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-900/80">
        <MotionDiv
          className={`h-full rounded-full ${danger ? 'bg-rose-400' : caution ? 'bg-amber-300' : 'bg-cyan-300'}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
        <span>{detail}</span>
        <span className={trend >= 0 ? 'text-cyan-200' : 'text-violet-200'}>{trend >= 0 ? '+' : ''}{trend}%</span>
      </div>
    </MotionArticle>
  )
}

export default StatCard

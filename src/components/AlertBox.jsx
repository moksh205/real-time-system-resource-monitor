import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react'

const MotionDiv = motion.div

const styles = {
  critical: {
    icon: ShieldAlert,
    className: 'border-rose-400/40 bg-rose-500/12 text-rose-100',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-amber-300/40 bg-amber-400/12 text-amber-100',
  },
  info: {
    icon: Info,
    className: 'border-cyan-300/35 bg-cyan-400/10 text-cyan-100',
  },
  stable: {
    icon: CheckCircle2,
    className: 'border-emerald-300/35 bg-emerald-400/10 text-emerald-100',
  },
}

function AlertBox({ insights, toasts }) {
  return (
    <>
      <section className="glass-panel p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Smart Analyzer</p>
            <h2 className="mt-1 text-xl font-bold text-white">Live operating signals</h2>
          </div>
          <span className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">
            AI Rules
          </span>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {insights.map((insight) => {
              const style = styles[insight.type] || styles.info
              const Icon = style.icon

              return (
                <MotionDiv
                  key={insight.message}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${style.className}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <Icon className="mt-0.5 shrink-0" size={18} />
                  <p className="text-sm leading-6">{insight.message}</p>
                </MotionDiv>
              )
            })}
          </AnimatePresence>
        </div>
      </section>

      <div className="pointer-events-none fixed right-5 top-5 z-50 flex w-[min(360px,calc(100vw-40px))] flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => {
            const style = styles[toast.type] || styles.info
            const Icon = style.icon

            return (
              <MotionDiv
                key={toast.id}
                className={`rounded-lg border px-4 py-3 shadow-2xl backdrop-blur-xl ${style.className}`}
                initial={{ opacity: 0, x: 40, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.96 }}
              >
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 shrink-0" size={18} />
                  <p className="text-sm font-medium leading-5">{toast.message}</p>
                </div>
              </MotionDiv>
            )
          })}
        </AnimatePresence>
      </div>
    </>
  )
}

export default AlertBox

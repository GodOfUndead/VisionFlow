import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, CreditCard, Clock, Users } from 'lucide-react';
import { formatCurrency, cn } from '@/src/lib/utils';
import { PatientRecord } from '@/src/types';

interface DashboardProps {
  records: PatientRecord[];
}

export function Dashboard({ records }: DashboardProps) {
  const stats = React.useMemo(() => {
    const total = records.reduce((acc, r) => acc + (r.payment?.total || 0), 0);
    const paid = records.reduce((acc, r) => acc + (r.payment?.paid || 0), 0);
    const remaining = records.reduce((acc, r) => acc + (r.payment?.remaining || 0), 0);
    return { total, paid, remaining, count: records.length };
  }, [records]);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-semibold text-text-main">Clinic Overview</h2>
        <p className="text-sm text-text-muted mt-1">Patient management and financial summary.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats.total)}
          delay={0}
          className="bg-pastel-blue"
        />
        <StatCard
          label="Pending Balance"
          value={formatCurrency(stats.remaining)}
          isWarning
          delay={0.1}
          className="bg-pastel-orange"
        />
        <StatCard
          label="Total Patients"
          value={stats.count.toString()}
          delay={0.2}
          className="bg-pastel-mint"
        />
      </div>

      <section className="bg-white border-2 border-black shadow-brutal overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-semibold text-text-main">Recent Patients</h3>
        </div>
        <div className="divide-y divide-border">
          {records.slice(0, 5).map((record, i) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 flex items-center justify-between hover:bg-bg transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-bg flex items-center justify-center text-text-muted font-medium text-sm border border-border">
                  {record.patientName?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-main">{record.patientName || 'Unnamed Patient'}</p>
                  <p className="text-xs text-text-muted">{record.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-text-main">{formatCurrency(record.payment?.total || 0)}</p>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded-full",
                  record.payment?.remaining > 0 ? "bg-[#FEF3C7] text-[#92400E]" : "bg-[#DCFCE7] text-[#166534]"
                )}>
                  {record.payment?.remaining > 0 ? 'DUE' : 'PAID'}
                </span>
              </div>
            </motion.div>
          ))}
          {records.length === 0 && (
            <div className="p-10 text-center">
              <p className="text-sm text-text-muted">No records found yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, isWarning, delay, className }: { label: string; value: string; isWarning?: boolean; delay: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={cn("p-5 border-2 border-black shadow-brutal", className)}
    >
      <div className="stat-label text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">{label}</div>
      <p className={cn(
        "text-2xl font-bold tracking-tight",
        isWarning ? "text-warning" : "text-text-main"
      )}>{value}</p>
    </motion.div>
  );
}

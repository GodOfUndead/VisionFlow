import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, CreditCard, Clock, Users, CalendarDays, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { formatCurrency, cn } from '@/src/lib/utils';
import { PatientRecord } from '@/src/types';

interface DashboardProps {
  records: PatientRecord[];
}

export function Dashboard({ records }: DashboardProps) {
  const [selectedMonth, setSelectedMonth] = React.useState<string>(() => {
    return format(new Date(), 'yyyy-MM');
  });

  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    months.add(format(new Date(), 'yyyy-MM'));
    records.forEach(r => {
      if (r.date) {
        try {
          const date = parseISO(r.date);
          months.add(format(date, 'yyyy-MM'));
        } catch (e) {}
      }
    });
    return Array.from(months).sort().reverse();
  }, [records]);

  const filteredRecords = React.useMemo(() => {
    return records.filter(r => {
      if (selectedMonth === 'all') return true;
      try {
        const recordDate = parseISO(r.date);
        return format(recordDate, 'yyyy-MM') === selectedMonth;
      } catch (e) {
        return false;
      }
    });
  }, [records, selectedMonth]);

  const stats = React.useMemo(() => {
    const total = filteredRecords.reduce((acc, r) => acc + (r.payment?.total || 0), 0);
    const paid = filteredRecords.reduce((acc, r) => acc + (r.payment?.paid || 0), 0);
    const remaining = filteredRecords.reduce((acc, r) => acc + (r.payment?.remaining || 0), 0);
    return { total, paid, remaining, count: filteredRecords.length };
  }, [filteredRecords]);

  const formatMonthLabel = (monthStr: string) => {
    try {
      const [year, month] = monthStr.split('-');
      return format(new Date(parseInt(year), parseInt(month) - 1), 'MMMM yyyy');
    } catch (e) {
      return monthStr;
    }
  };

  return (
    <div className="space-y-4 md:space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-text-main uppercase tracking-tighter italic">Clinic Overview</h2>
          <p className="text-[11px] md:text-sm text-text-muted mt-0.5 font-bold uppercase tracking-tight">Monthly patient and financial summary.</p>
        </div>

        <div className="bg-white border-2 border-black px-4 py-2 shadow-brutal flex items-center gap-2">
          <CalendarDays size={18} className="text-text-muted" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent border-none appearance-none font-black uppercase tracking-tight text-xs outline-none cursor-pointer pr-6"
          >
            <option value="all">All Time</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>
                {formatMonthLabel(month)}
              </option>
            ))}
          </select>
          <div className="pointer-events-none -ml-6">
            <ChevronRight size={14} className="rotate-90" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
        <StatCard
          label={selectedMonth === 'all' ? "Lifetime Revenue" : `${formatMonthLabel(selectedMonth)} Revenue`}
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
          label={selectedMonth === 'all' ? "Total Patients" : "Patients Seen"}
          value={stats.count.toString()}
          delay={0.2}
          className="bg-pastel-mint"
        />
      </div>

      <section className="bg-white border-2 border-black shadow-brutal overflow-hidden">
        <div className="p-4 md:p-6 border-b-2 border-black flex items-center justify-between bg-zinc-50/50">
          <h3 className="text-xs md:text-base font-black text-text-main uppercase tracking-tighter">
            Recent activity {selectedMonth === 'all' ? 'overall' : `in ${formatMonthLabel(selectedMonth)}`}
          </h3>
        </div>
        <div className="divide-y-2 divide-zinc-100">
          {filteredRecords.slice(0, 5).map((record, i) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-none bg-accent flex items-center justify-center text-black font-black text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {record.patientName?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-black text-text-main uppercase tracking-tight">{record.patientName || 'Unnamed Patient'}</p>
                  <p className="text-[10px] font-bold text-text-muted">{record.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-text-main italic">{formatCurrency(record.payment?.total || 0)}</p>
                <span className={cn(
                  "text-[9px] font-black tracking-widest px-2 py-0.5 uppercase border border-black italic",
                  record.payment?.remaining > 0 ? "bg-pastel-orange" : "bg-pastel-mint"
                )}>
                  {record.payment?.remaining > 0 ? 'DUE' : 'PAID'}
                </span>
              </div>
            </motion.div>
          ))}
          {filteredRecords.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center">
              <Clock size={40} className="text-zinc-300 mb-4 stroke-1" />
              <p className="font-black uppercase tracking-tight text-zinc-400">No activity recorded for this month.</p>
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
      className={cn("p-4 md:p-6 border-2 border-black shadow-brutal", className)}
    >
      <div className="stat-label text-[10px] md:text-[11px] font-bold text-black uppercase tracking-wider mb-2">{label}</div>
      <p className={cn(
        "text-xl md:text-3xl font-black tracking-tight uppercase italic",
        isWarning ? "text-zinc-900" : "text-black"
      )}>{value}</p>
    </motion.div>
  );
}

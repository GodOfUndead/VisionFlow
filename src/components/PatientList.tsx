import React from 'react';
import { Search, Download, Eye, Phone, MapPin, Calendar, ExternalLink, X, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { formatCurrency, cn } from '@/src/lib/utils';
import { PatientRecord } from '@/src/types';

interface PatientListProps {
  records: PatientRecord[];
  onDelete?: (id: string) => Promise<void>;
  onEdit?: (record: PatientRecord) => void;
}

export function PatientList({ records, onDelete, onEdit }: PatientListProps) {
  const [search, setSearch] = React.useState('');
  const [selectedPatient, setSelectedPatient] = React.useState<PatientRecord | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState<string>(() => {
    // Default to current month (YYYY-MM)
    return format(new Date(), 'yyyy-MM');
  });

  // Get unique months from records to populate filter
  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    // Always include current month in options
    months.add(format(new Date(), 'yyyy-MM'));
    
    records.forEach(r => {
      if (r.date) {
        try {
          const date = parseISO(r.date);
          months.add(format(date, 'yyyy-MM'));
        } catch (e) {
          console.error('Invalid date format', r.date);
        }
      }
    });

    return Array.from(months).sort().reverse();
  }, [records]);

  const filteredRecords = React.useMemo(() => {
    return records
      .filter(r => {
        const matchesSearch = 
          r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
          r.mobileNumber?.includes(search);
        
        if (!matchesSearch) return false;

        // Filter by month
        try {
          const recordDate = parseISO(r.date);
          const formattedRecordMonth = format(recordDate, 'yyyy-MM');
          return formattedRecordMonth === selectedMonth;
        } catch (e) {
          return false;
        }
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [records, search, selectedMonth]);

  const handleSelectPatient = (record: PatientRecord) => {
    setSelectedPatient(record);
  };

  const handleDelete = async () => {
    if (!selectedPatient) return;
    if (!window.confirm('Are you sure you want to delete this patient record? This action cannot be undone.')) return;
    
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(selectedPatient.id);
      }
      setSelectedPatient(null);
    } catch (error) {
      console.error('Failed to delete record', error);
      alert('Failed to delete record. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Clinic', 'Name', 'Mobile', 'Address', 'RE', 'LE', 'ADD', 'Glass', 'Frame', 'Eye Drop', 'Total', 'Paid', 'Remaining', 'Complication', 'Delivered', 'Delivery Date'];
    const rows = records.map(r => [
      r.date,
      r.clinicName,
      r.patientName,
      r.mobileNumber,
      r.address,
      r.power?.re,
      r.power?.le,
      r.power?.add,
      r.glass,
      r.frame,
      r.eyeDrop,
      r.payment?.total,
      r.payment?.paid,
      r.payment?.remaining,
      r.complication,
      r.glassesDelivered ? 'YES' : 'NO',
      r.deliveryDate || '-'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `patients_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatMonthLabel = (monthStr: string) => {
    try {
      const [year, month] = monthStr.split('-');
      return format(new Date(parseInt(year), parseInt(month) - 1), 'MMMM yyyy');
    } catch (e) {
      return monthStr;
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-6 border-b-2 border-black pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-text-main uppercase tracking-tighter italic">Patient Records</h2>
            <p className="text-sm text-text-muted mt-1 font-bold">Manage and retrieve patient history.</p>
          </div>
          <button
            onClick={exportToCSV}
            className="w-full md:w-auto bg-pastel-blue text-black px-6 py-3 font-black uppercase tracking-tighter hover:bg-white transition-all shadow-brutal active:shadow-none active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2"
          >
            <Download size={18} />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 bg-white border-2 border-black p-4 shadow-brutal">
          <div className="w-full md:w-64 relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-transparent border-none appearance-none font-black uppercase tracking-tight text-sm outline-none cursor-pointer"
            >
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {formatMonthLabel(month)}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronRight size={16} className="rotate-90" />
            </div>
          </div>

          <div className="hidden md:block w-px h-8 bg-zinc-200" />

          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search by name or number within this month..."
              className="w-full pl-10 pr-4 py-2 bg-transparent border-none font-bold text-sm outline-none placeholder:text-zinc-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List View */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border-2 border-black shadow-brutal flex flex-col h-full">
            <div className="p-4 border-b-2 border-black bg-zinc-50 flex items-center justify-between">
              <h3 className="font-black uppercase tracking-tight text-xs md:text-sm italic">
                {formatMonthLabel(selectedMonth)} Records
              </h3>
              <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {filteredRecords.length}
              </span>
            </div>
            
            <div className="divide-y-2 divide-zinc-100 overflow-y-auto max-h-[600px]">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  onClick={() => handleSelectPatient(record)}
                  className={cn(
                    "p-5 flex justify-between items-center cursor-pointer group transition-all",
                    selectedPatient?.id === record.id 
                      ? "bg-accent" 
                      : "hover:bg-pastel-mint"
                  )}
                >
                  <div className="patient-info flex-1 min-w-0 pr-4">
                    <div className="text-sm md:text-base font-black text-text-main uppercase tracking-tight truncate">
                      {record.patientName || 'Unnamed Patient'}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="text-[10px] md:text-[11px] font-bold text-text-muted flex items-center gap-1">
                        <Calendar size={12} />
                        {record.date}
                      </div>
                      <div className="text-[10px] md:text-[11px] font-bold text-text-muted flex items-center gap-1">
                        <Phone size={12} />
                        {record.mobileNumber || '-'}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={cn(
                      "payment-badge text-[10px] font-black tracking-widest px-2.5 py-1 uppercase italic border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                      record.payment?.remaining > 0 ? "bg-pastel-orange" : "bg-pastel-mint"
                    )}>
                      {record.payment?.remaining > 0 ? `₹${record.payment.remaining} DUE` : 'CLEARED'}
                    </span>
                  </div>
                </div>
              ))}
              {filteredRecords.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center justify-center p-6 bg-zinc-50/50">
                  <CalendarDays size={48} className="text-zinc-300 mb-4 stroke-1" />
                  <p className="font-black uppercase tracking-tight text-zinc-400">No records found for this month</p>
                  <p className="text-xs text-zinc-400 mt-1 font-bold">Try selecting a different month or add a new patient.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detail View (Desktop) */}
        <div className="hidden lg:block lg:sticky lg:top-8 h-fit">
          {selectedPatient ? (
            <PatientDetailContent 
              patient={selectedPatient} 
              onEdit={onEdit} 
              onDelete={handleDelete} 
              isDeleting={isDeleting} 
            />
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center p-10 text-center bg-white border-2 border-black border-dashed text-text-muted shadow-brutal-sm">
              <Eye className="mb-3 opacity-20" size={40} />
              <p className="font-black uppercase tracking-tight text-xs">Select a patient for details</p>
            </div>
          )}
        </div>

        {/* Detail View (Mobile Bottom Sheet) */}
        <AnimatePresence>
          {selectedPatient && (
            <div className="lg:hidden fixed inset-0 z-[60] flex items-end justify-center">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPatient(null)}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              />
              
              {/* Sheet */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-h-[90vh] bg-white border-t-4 border-x-4 border-black rounded-t-[3rem] shadow-2xl overflow-y-auto"
              >
                <div className="sticky top-0 right-0 p-4 flex justify-end z-10">
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="p-2 bg-pastel-orange border-2 border-black rounded-full shadow-brutal active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="px-6 pb-24">
                  <PatientDetailContent 
                    patient={selectedPatient} 
                    onEdit={onEdit} 
                    onDelete={handleDelete} 
                    isDeleting={isDeleting} 
                    isMobile
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PatientDetailContent({ 
  patient, 
  onEdit, 
  onDelete, 
  isDeleting,
  isMobile 
}: { 
  patient: PatientRecord; 
  onEdit?: (p: PatientRecord) => void; 
  onDelete?: () => void; 
  isDeleting: boolean;
  isMobile?: boolean;
}) {
  const showActions = !!onEdit || !!onDelete;

  return (
    <div className={cn(
      "bg-white overflow-hidden",
      !isMobile && "border-2 border-black shadow-brutal"
    )}>
      {patient.imageUrl ? (
        <div className="aspect-video w-full border-b-2 border-black">
          <img src={patient.imageUrl} alt="Patient" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      ) : (
        <div className="aspect-video w-full bg-bg flex items-center justify-center text-text-muted border-b-2 border-black">
          <Eye size={48} strokeWidth={1} />
        </div>
      )}
      
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-xl font-black text-text-main uppercase tracking-tighter italic">{patient.patientName}</h3>
          <p className="text-xs text-text-muted mt-1 uppercase tracking-wider font-bold">{patient.clinicName || 'No Clinic Specified'}</p>
        </div>

        {patient.complication && (
          <div className="p-3 bg-red-50 border-2 border-red-200 rounded-md">
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest block mb-1">Complication</span>
            <p className="text-sm font-medium text-red-900">{patient.complication}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <DetailItem label="MOBILE" value={patient.mobileNumber} />
          <DetailItem label="DATE" value={patient.date} />
          <div className="col-span-2">
            <DetailItem label="ADDRESS" value={patient.address} />
          </div>
        </div>

        <div className="p-4 bg-bg border-2 border-black rounded-md space-y-4">
          <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Power Details</h4>
          <div className="space-y-3 font-mono">
            <div className="flex justify-between items-center border-b border-black/10 pb-2">
              <span className="text-[10px] text-text-muted font-bold uppercase">RE (Right Eye)</span>
              <span className="text-sm font-bold text-text-main">{patient.power?.re || '-'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-black/10 pb-2">
              <span className="text-[10px] text-text-muted font-bold uppercase">LE (Left Eye)</span>
              <span className="text-sm font-bold text-text-main">{patient.power?.le || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-text-muted font-bold uppercase">ADD</span>
              <span className="text-sm font-bold text-text-main">{patient.power?.add || '-'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DetailItem label="GLASS / FRAME" value={patient.glass} />
          <DetailItem label="EYE DROP" value={patient.eyeDrop} />
          <div className="col-span-2">
            <div className={cn(
              "p-3 border-2 border-black rounded-md flex items-center justify-between",
              patient.glassesDelivered ? "bg-pastel-mint" : "bg-pastel-orange/20"
            )}>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Delivery Status</span>
              <div className="text-right">
                <span className="text-xs font-black uppercase tracking-tight">
                  {patient.glassesDelivered ? 'Delivered' : 'Pending'}
                </span>
                {patient.glassesDelivered && patient.deliveryDate && (
                  <p className="text-[9px] font-bold text-text-muted">{patient.deliveryDate}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t-2 border-black flex items-center justify-between">
          <div>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Remaining</p>
            <p className={cn(
              "text-xl font-black italic uppercase italic tracking-tighter",
              patient.payment?.remaining > 0 ? "text-red-500" : "text-green-600"
            )}>
              {formatCurrency(patient.payment?.remaining || 0)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Total</p>
            <p className="text-lg font-black text-text-main">{formatCurrency(patient.payment?.total || 0)}</p>
          </div>
        </div>

        {showActions && (
          <div className="pt-6 border-t-2 border-black flex flex-col gap-3">
            {onEdit && (
              <button
                onClick={() => onEdit(patient)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-accent text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-brutal active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
              >
                <span>Edit Record</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className="w-full flex items-center justify-center gap-2 py-4 bg-pastel-orange text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-brutal active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
              >
                <span>{isDeleting ? 'Deleting...' : 'Delete Record'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{label}</span>
      <p className="text-sm font-black text-text-main truncate">{value || '-'}</p>
    </div>
  );
}

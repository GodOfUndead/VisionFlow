import React from 'react';
import { Search, Download, Eye, Phone, MapPin, Calendar, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, cn } from '@/src/lib/utils';
import { PatientRecord } from '@/src/types';

interface PatientListProps {
  records: PatientRecord[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (record: PatientRecord) => void;
}

export function PatientList({ records, onDelete, onEdit }: PatientListProps) {
  const [search, setSearch] = React.useState('');
  const [selectedPatient, setSelectedPatient] = React.useState<PatientRecord | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const detailRef = React.useRef<HTMLDivElement>(null);

  const filteredRecords = React.useMemo(() => {
    return records.filter(r =>
      r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      r.mobileNumber?.includes(search)
    );
  }, [records, search]);

  const handleSelectPatient = (record: PatientRecord) => {
    setSelectedPatient(record);
  };

  const handleDelete = async () => {
    if (!selectedPatient) return;
    if (!window.confirm('Are you sure you want to delete this patient record? This action cannot be undone.')) return;
    
    setIsDeleting(true);
    try {
      await onDelete(selectedPatient.id);
      setSelectedPatient(null);
    } catch (error) {
      console.error('Failed to delete record', error);
      alert('Failed to delete record. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Clinic', 'Name', 'Mobile', 'Address', 'RE', 'LE', 'ADD', 'Glass', 'Frame', 'Eye Drop', 'Total', 'Paid', 'Remaining'];
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
      r.payment?.remaining
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

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-black pb-6">
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
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List View */}
        <div className="lg:col-span-2 bg-white border-2 border-black shadow-brutal p-4 md:p-6 flex flex-col h-full overflow-y-auto">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input
                type="text"
                placeholder="Search by name or number..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-md text-sm outline-none focus:border-accent transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="divide-y divide-border">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                onClick={() => handleSelectPatient(record)}
                className={cn(
                  "py-4 flex justify-between items-center cursor-pointer group transition-colors",
                  selectedPatient?.id === record.id ? "bg-accent -mx-6 px-6" : "hover:bg-pastel-mint -mx-6 px-6"
                )}
              >
                <div className="patient-info flex-1 min-w-0 pr-4">
                  <div className="text-sm font-semibold text-text-main truncate">{record.patientName || 'Unnamed Patient'}</div>
                  <div className="text-xs text-text-muted mt-0.5 truncate">
                    RE: {record.power?.re || '-'} | LE: {record.power?.le || '-'}
                  </div>
                </div>
                <span className={cn(
                  "payment-badge text-[11px] font-bold px-2 py-1 rounded-full",
                  record.payment?.remaining > 0 ? "bg-[#FEF3C7] text-[#92400E]" : "bg-[#DCFCE7] text-[#166534]"
                )}>
                  {record.payment?.remaining > 0 ? `₹${record.payment.remaining} DUE` : 'PAID'}
                </span>
              </div>
            ))}
            {filteredRecords.length === 0 && (
              <div className="py-10 text-center text-sm text-text-muted">
                No matching records found.
              </div>
            )}
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
            <div className="h-[400px] flex flex-col items-center justify-center p-10 text-center bg-white rounded-theme border border-dashed border-border text-text-muted">
              <Eye className="mb-3 opacity-20" size={40} />
              <p className="text-sm">Select a patient to view details</p>
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
                className="relative w-full max-h-[90vh] bg-white border-t-2 border-x-2 border-black rounded-t-[2rem] shadow-2xl overflow-y-auto"
              >
                <div className="sticky top-0 right-0 p-4 flex justify-end z-10 bg-white/80 backdrop-blur-md">
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="p-2 bg-pastel-mint border-2 border-black rounded-full shadow-brutal active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
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
  onEdit: (p: PatientRecord) => void; 
  onDelete: () => void; 
  isDeleting: boolean;
  isMobile?: boolean;
}) {
  return (
    <div className={cn(
      "bg-white overflow-hidden",
      !isMobile && "border-2 border-black shadow-brutal"
    )}>
      {patient.imageUrl ? (
        <div className="aspect-video w-full">
          <img src={patient.imageUrl} alt="Patient" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      ) : (
        <div className="aspect-video w-full bg-bg flex items-center justify-center text-text-muted border-b border-border">
          <Eye size={48} strokeWidth={1} />
        </div>
      )}
      
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-xl font-black text-text-main uppercase tracking-tighter italic">{patient.patientName}</h3>
          <p className="text-xs text-text-muted mt-1 uppercase tracking-wider font-bold">{patient.clinicName || 'No Clinic Specified'}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DetailItem label="MOBILE" value={patient.mobileNumber} />
          <DetailItem label="DATE" value={patient.date} />
          <div className="col-span-2">
            <DetailItem label="ADDRESS" value={patient.address} />
          </div>
        </div>

        <div className="p-4 bg-bg border-2 border-black rounded-md space-y-4">
          <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Power Details</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <span className="text-[10px] text-text-muted font-bold uppercase">RE (Right Eye)</span>
              <span className="text-sm font-bold text-text-main">{patient.power?.re || '-'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
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

        <div className="pt-6 border-t-2 border-black flex flex-col gap-3">
          <button
            onClick={() => onEdit(patient)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-accent text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-brutal active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            <span>Edit Record</span>
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="w-full flex items-center justify-center gap-2 py-4 bg-pastel-orange text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-brutal active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
          >
            <span>{isDeleting ? 'Deleting...' : 'Delete Record'}</span>
          </button>
        </div>
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

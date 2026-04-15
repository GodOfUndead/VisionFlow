import React from 'react';
import { Search, Download, Eye, Phone, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { formatCurrency, cn } from '@/src/lib/utils';
import { PatientRecord } from '@/src/types';

interface PatientListProps {
  records: PatientRecord[];
}

export function PatientList({ records }: PatientListProps) {
  const [search, setSearch] = React.useState('');
  const [selectedPatient, setSelectedPatient] = React.useState<PatientRecord | null>(null);

  const filteredRecords = React.useMemo(() => {
    return records.filter(r =>
      r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      r.mobileNumber?.includes(search)
    );
  }, [records, search]);

  const exportToCSV = () => {
    const headers = ['Date', 'Clinic', 'Name', 'Mobile', 'Address', 'RE', 'LE', 'ADD', 'Glass', 'Frame', 'Total', 'Paid', 'Remaining'];
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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-semibold text-text-main">Patient Records</h2>
          <p className="text-sm text-text-muted mt-1">Manage and retrieve patient history.</p>
        </div>
        <button
          onClick={exportToCSV}
          className="btn btn-outline border border-border text-text-main px-4 py-2 rounded-md text-sm font-semibold hover:bg-bg transition-colors flex items-center gap-2"
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List View */}
        <div className="lg:col-span-2 bg-white border border-border rounded-theme p-6 flex flex-col h-fit">
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
                onClick={() => setSelectedPatient(record)}
                className={cn(
                  "py-4 flex justify-between items-center cursor-pointer group transition-colors",
                  selectedPatient?.id === record.id ? "bg-[#F0F4FF] -mx-6 px-6" : "hover:bg-bg -mx-6 px-6"
                )}
              >
                <div className="patient-info">
                  <div className="text-sm font-semibold text-text-main">{record.patientName || 'Unnamed Patient'}</div>
                  <div className="text-xs text-text-muted mt-0.5">
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

        {/* Detail View */}
        <div className="lg:sticky lg:top-8 h-fit">
          {selectedPatient ? (
            <div className="bg-white rounded-theme border border-border shadow-sm overflow-hidden">
              {selectedPatient.imageUrl ? (
                <div className="aspect-video w-full">
                  <img src={selectedPatient.imageUrl} alt="Patient" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video w-full bg-bg flex items-center justify-center text-text-muted border-b border-border">
                  <Eye size={48} strokeWidth={1} />
                </div>
              )}
              
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-text-main">{selectedPatient.patientName}</h3>
                  <p className="text-xs text-text-muted mt-1 uppercase tracking-wider font-bold">{selectedPatient.clinicName || 'No Clinic Specified'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="MOBILE" value={selectedPatient.mobileNumber} />
                  <DetailItem label="DATE" value={selectedPatient.date} />
                  <div className="col-span-2">
                    <DetailItem label="ADDRESS" value={selectedPatient.address} />
                  </div>
                </div>

                <div className="p-4 bg-bg rounded-md space-y-3">
                  <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Power Details</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[9px] text-text-muted font-bold">RE</p>
                      <p className="text-sm font-bold text-text-main">{selectedPatient.power?.re || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-text-muted font-bold">LE</p>
                      <p className="text-sm font-bold text-text-main">{selectedPatient.power?.le || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-text-muted font-bold">ADD</p>
                      <p className="text-sm font-bold text-text-main">{selectedPatient.power?.add || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="GLASS" value={selectedPatient.glass} />
                  <DetailItem label="FRAME" value={selectedPatient.frame} />
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-text-muted font-bold uppercase">Remaining</p>
                    <p className={cn(
                      "text-lg font-bold",
                      selectedPatient.payment?.remaining > 0 ? "text-warning" : "text-success"
                    )}>
                      {formatCurrency(selectedPatient.payment?.remaining || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-text-muted font-bold uppercase">Total</p>
                    <p className="text-base font-bold text-text-main">{formatCurrency(selectedPatient.payment?.total || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center bg-white rounded-theme border border-dashed border-border text-text-muted">
              <Eye className="mb-3 opacity-20" size={40} />
              <p className="text-sm">Select a patient to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{label}</span>
      <p className="text-sm font-medium text-text-main truncate">{value || '-'}</p>
    </div>
  );
}

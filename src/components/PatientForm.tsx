import React from 'react';
import { Camera, Upload, X, Save, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/src/lib/utils';
import { PatientRecordInput } from '@/src/types';

interface PatientFormProps {
  onSubmit: (data: PatientRecordInput) => Promise<void>;
  isSubmitting: boolean;
}

export function PatientForm({ onSubmit, isSubmitting }: PatientFormProps) {
  const [formData, setFormData] = React.useState<PatientRecordInput>({
    date: new Date().toISOString().split('T')[0],
    clinicName: '',
    patientName: '',
    mobileNumber: '',
    address: '',
    power: { re: '', le: '', add: '' },
    glass: '',
    frame: '',
    payment: { total: 0, paid: 0, remaining: 0 },
    imageUrl: null,
  });

  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  } as any);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        const val = (child === 'total' || child === 'paid') ? Number(value) : value;
        const updatedParent = { ...(prev[parent as keyof PatientRecordInput] as any), [child]: val };
        
        if (parent === 'payment') {
          const total = updatedParent.total;
          const paid = updatedParent.paid;
          updatedParent.remaining = total - paid;
        }
        return { ...prev, [parent]: updatedParent };
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      clinicName: '',
      patientName: '',
      mobileNumber: '',
      address: '',
      power: { re: '', le: '', add: '' },
      glass: '',
      frame: '',
      payment: { total: 0, paid: 0, remaining: 0 },
      imageUrl: null,
    });
    setImagePreview(null);
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-semibold text-text-main">New Patient Record</h2>
        <p className="text-sm text-text-muted mt-1">Fill in the clinical and payment details below.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white border border-border rounded-theme p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input label="PATIENT NAME" name="patientName" placeholder="e.g. Rahul Sharma" value={formData.patientName} onChange={handleChange} />
              <Input label="MOBILE NUMBER" name="mobileNumber" placeholder="+91 ..." value={formData.mobileNumber} onChange={handleChange} />
            </div>
            
            <div className="input-group">
              <label className="block text-[11px] font-bold text-text-muted uppercase mb-1">ADDRESS</label>
              <textarea
                name="address"
                rows={2}
                className="w-full border border-border rounded-md p-2 text-sm focus:ring-1 focus:ring-accent outline-none"
                placeholder="Street name, Apartment, City"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="power-grid grid grid-cols-3 gap-3 bg-[#F9FAFB] p-4 rounded-md">
              <Input label="RE (RIGHT EYE)" name="power.re" placeholder="-1.25" value={formData.power.re} onChange={handleChange} />
              <Input label="LE (LEFT EYE)" name="power.le" placeholder="-1.00" value={formData.power.le} onChange={handleChange} />
              <Input label="ADD" name="power.add" placeholder="+2.00" value={formData.power.add} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="GLASS / FRAME" name="glass" placeholder="Ray-Ban Aviator" value={formData.glass} onChange={handleChange} />
              <Input label="PAYMENT RECEIVED (₹)" name="payment.paid" type="number" value={formData.payment.paid.toString()} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="input-group">
              <label className="block text-[11px] font-bold text-text-muted uppercase mb-1">PATIENT PHOTO</label>
              <div
                {...getRootProps()}
                className={cn(
                  "relative aspect-video rounded-md border border-dashed border-border flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-bg",
                  isDragActive && "border-accent bg-[#F0F4FF]"
                )}
              >
                <input {...getInputProps()} />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Camera className="mx-auto text-text-muted mb-2" size={24} />
                    <p className="text-xs text-text-muted">Click or drag to add photo</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="CLINIC NAME" name="clinicName" placeholder="Vision Care" value={formData.clinicName} onChange={handleChange} />
              <Input label="DATE" name="date" type="date" value={formData.date} onChange={handleChange} />
            </div>

            <div className="p-4 bg-[#F9FAFB] rounded-md flex justify-between items-center">
              <span className="text-[11px] font-bold text-text-muted uppercase">Total Amount</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text-main">₹</span>
                <input
                  type="number"
                  name="payment.total"
                  className="w-24 bg-transparent border-b border-border text-sm font-bold text-right outline-none focus:border-accent"
                  value={formData.payment.total.toString()}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="btn-row flex gap-3 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary bg-accent text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Record'}
          </button>
          <button
            type="button"
            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
            className="btn btn-secondary bg-[#E5E7EB] text-text-main px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-zinc-300 transition-colors"
          >
            Capture Photo
          </button>
          <button
            type="button"
            onClick={() => setFormData({
              date: new Date().toISOString().split('T')[0],
              clinicName: '',
              patientName: '',
              mobileNumber: '',
              address: '',
              power: { re: '', le: '', add: '' },
              glass: '',
              frame: '',
              payment: { total: 0, paid: 0, remaining: 0 },
              imageUrl: null,
            })}
            className="btn btn-outline border border-border text-text-main px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-bg transition-colors ml-auto"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="input-group">
      <label className="block text-[11px] font-bold text-text-muted uppercase mb-1">{label}</label>
      <input
        {...props}
        className="w-full border border-border rounded-md p-2 text-sm focus:ring-1 focus:ring-accent outline-none"
      />
    </div>
  );
}

import React from 'react';
import { Camera, Upload, X, Save, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import DatePicker from 'react-datepicker';
import { parseISO, format } from 'date-fns';
import { cn } from '@/src/lib/utils';
import { PatientRecordInput, PatientRecord } from '@/src/types';

interface PatientFormProps {
  onSubmit: (data: PatientRecordInput) => Promise<void>;
  isSubmitting: boolean;
  initialData?: PatientRecord | null;
  onCancel?: () => void;
}

export function PatientForm({ onSubmit, isSubmitting, initialData, onCancel }: PatientFormProps) {
  const [formData, setFormData] = React.useState<PatientRecordInput>(() => {
    if (initialData) {
      const { id, createdAt, ...rest } = initialData;
      return rest;
    }
    return {
      date: new Date().toISOString().split('T')[0],
      clinicName: '',
      patientName: '',
      mobileNumber: '',
      address: '',
      power: { re: '', le: '', add: '' },
      glass: '',
      frame: '',
      eyeDrop: '',
      payment: { total: 0, paid: 0, remaining: 0 },
      complication: '',
      glassesDelivered: false,
      deliveryDate: null,
      imageUrl: null,
    };
  });

  const [imagePreview, setImagePreview] = React.useState<string | null>(initialData?.imageUrl || null);

  React.useEffect(() => {
    if (initialData) {
      const { id, createdAt, ...rest } = initialData;
      setFormData(rest);
      setImagePreview(initialData.imageUrl);
    }
  }, [initialData]);

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
      eyeDrop: '',
      payment: { total: 0, paid: 0, remaining: 0 },
      complication: '',
      glassesDelivered: false,
      deliveryDate: null,
      imageUrl: null,
    });
    setImagePreview(null);
  };

  return (
    <div className="space-y-4 md:space-y-8">
      <header>
        <h2 className="text-xl md:text-3xl font-black text-text-main uppercase tracking-tighter italic">
          {initialData ? 'Edit Patient Record' : 'New Patient Record'}
        </h2>
        <p className="text-[11px] md:text-sm text-text-muted mt-0.5 font-bold uppercase tracking-tight">
          {initialData ? 'Update the clinical and payment details below.' : 'Fill in the clinical and payment details below.'}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white border-2 border-black shadow-brutal p-4 md:p-8 space-y-4 md:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
          <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <Input label="PATIENT NAME" name="patientName" placeholder="e.g. Rahul Sharma" value={formData.patientName} onChange={handleChange} />
              <Input label="MOBILE NUMBER" name="mobileNumber" placeholder="+91 ..." value={formData.mobileNumber} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label className="block text-[10px] md:text-[11px] font-bold text-text-muted uppercase mb-1">COMPLICATION</label>
              <input
                type="text"
                name="complication"
                className="w-full border-2 border-black p-2 text-xs md:text-sm focus:ring-1 focus:ring-accent outline-none bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-none transition-all font-bold"
                placeholder="Mention any complications..."
                value={formData.complication}
                onChange={handleChange}
              />
            </div>
            
            <div className="input-group">
              <label className="block text-[10px] md:text-[11px] font-bold text-text-muted uppercase mb-1">ADDRESS</label>
              <textarea
                name="address"
                rows={1}
                className="w-full border-2 border-black p-1 md:p-2 text-xs md:text-sm focus:ring-1 focus:ring-accent outline-none bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-none transition-all"
                placeholder="Street name, City"
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
              <Input label="EYE DROP" name="eyeDrop" placeholder="e.g. Moxifloxacin" value={formData.eyeDrop} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <Input label="PAYMENT (₹)" name="payment.paid" type="number" value={formData.payment.paid.toString()} onChange={handleChange} />
              <div className="input-group">
                <label className="block text-[10px] md:text-[11px] font-bold text-text-muted uppercase mb-1">CLINIC</label>
                <select
                  name="clinicName"
                  className="w-full border-2 border-black p-2 text-xs md:text-sm focus:ring-1 focus:ring-accent outline-none bg-white h-[38px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-none transition-all font-bold uppercase tracking-tight appearance-none"
                  value={formData.clinicName}
                  onChange={handleChange as any}
                >
                  <option value="">Select Clinic</option>
                  <option value="Shakuntala Eye Care">Shakuntala Eye Care</option>
                  <option value="Arogya Eye Care">Arogya Eye Care</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="input-group">
              <label className="block text-[10px] md:text-[11px] font-bold text-text-muted uppercase mb-1">PATIENT PHOTO</label>
              <div
                {...getRootProps()}
                className={cn(
                  "relative aspect-[3/1] md:aspect-video rounded-md border border-dashed border-border flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-bg",
                  isDragActive && "border-accent bg-[#F0F4FF]"
                )}
              >
                <input {...getInputProps()} />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center flex items-center gap-2">
                    <Camera className="text-text-muted" size={16} />
                    <p className="text-[10px] text-text-muted font-bold uppercase italic">Add Photo</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="input-group">
                <label className="block text-[10px] md:text-[11px] font-bold text-text-muted uppercase mb-1">DATE</label>
                <div className="relative">
                  <DatePicker
                    selected={parseISO(formData.date)}
                    onChange={(date: Date | null) => {
                      if (date) {
                        setFormData(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }));
                      }
                    }}
                    dateFormat="yyyy-MM-dd"
                    popperPlacement="bottom-end"
                    portalId="root"
                    className="w-full border-2 border-black p-2 text-xs md:text-sm focus:ring-1 focus:ring-accent outline-none bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-none transition-all font-bold"
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={14} />
                </div>
              </div>
            </div>

            <div className="p-3 md:p-4 bg-[#F9FAFB] border-2 border-black rounded-md flex justify-between items-center">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Total Bill</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text-main">₹</span>
                <input
                  type="number"
                  name="payment.total"
                  className="w-20 md:w-24 bg-transparent border-b border-border text-sm font-bold text-right outline-none focus:border-accent"
                  value={formData.payment.total.toString()}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="p-3 md:p-4 bg-white border-2 border-black rounded-md space-y-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between">
                <label className="text-[10px] md:text-[11px] font-bold text-text-muted uppercase cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="glassesDelivered"
                    checked={formData.glassesDelivered}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      glassesDelivered: e.target.checked,
                      deliveryDate: e.target.checked ? (prev.deliveryDate || new Date().toISOString().split('T')[0]) : null
                    }))}
                    className="w-4 h-4 border-2 border-black rounded-none appearance-none checked:bg-accent cursor-pointer relative checked:after:content-['✓'] checked:after:absolute checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center checked:after:text-[10px] checked:after:font-black"
                  />
                  Glasses Delivered?
                </label>
                
                {formData.glassesDelivered && (
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[9px] font-bold text-text-muted whitespace-nowrap">DATE:</span>
                    <div className="relative">
                      <DatePicker
                        selected={formData.deliveryDate ? parseISO(formData.deliveryDate) : null}
                        onChange={(date: Date | null) => {
                          if (date) {
                            setFormData(prev => ({ ...prev, deliveryDate: format(date, 'yyyy-MM-dd') }));
                          }
                        }}
                        dateFormat="yyyy-MM-dd"
                        popperPlacement="bottom-end"
                        portalId="root"
                        className="w-24 bg-transparent border-b border-black text-[11px] font-bold text-right outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="btn-row flex flex-wrap gap-2 md:gap-4 pt-4 md:pt-6 border-t-2 border-black">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 md:flex-none bg-accent text-black px-4 md:px-8 py-2 md:py-3 font-black uppercase tracking-tighter hover:bg-white transition-all shadow-brutal active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
          >
            {isSubmitting ? '...' : initialData ? 'Update' : 'Save'}
          </button>
          {!initialData && (
            <button
              type="button"
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
              className="flex-1 md:flex-none bg-pastel-mint text-black px-4 md:px-8 py-2 md:py-3 font-black uppercase tracking-tighter hover:bg-white transition-all shadow-brutal active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
            >
              Photo
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 md:flex-none border-2 border-black bg-white text-black px-4 md:px-8 py-2 md:py-3 font-black uppercase tracking-tighter hover:bg-pastel-orange transition-all shadow-brutal active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="input-group">
      <label className="block text-[10px] md:text-[11px] font-bold text-text-muted uppercase mb-1">{label}</label>
      <input
        {...props}
        className="w-full border-2 border-black p-2 text-xs md:text-sm focus:ring-1 focus:ring-accent outline-none bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-none transition-all font-bold"
      />
    </div>
  );
}

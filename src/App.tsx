import React from 'react';
import { patientService } from './services/patientService';
import { PatientRecord, PatientRecordInput } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PatientForm } from './components/PatientForm';
import { PatientList } from './components/PatientList';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'entry' | 'list'>('dashboard');
  const [records, setRecords] = React.useState<PatientRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [editingRecord, setEditingRecord] = React.useState<PatientRecord | null>(null);

  React.useEffect(() => {
    const unsubscribe = patientService.subscribeToRecords(
      (data) => {
        setRecords(data);
        setError(null);
      },
      (err) => {
        setError('Failed to fetch records. Please check your network or permissions.');
        console.error(err);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleAddRecord = async (data: PatientRecordInput) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (editingRecord) {
        await patientService.updateRecord(editingRecord.id, data);
        setEditingRecord(null);
      } else {
        await patientService.addRecord(data);
      }
      setActiveTab('list');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError('Failed to save record. Please check your connection.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRecord = (record: PatientRecord) => {
    setEditingRecord(record);
    setActiveTab('entry');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await patientService.deleteRecord(id);
    } catch (err) {
      console.error('Delete error:', err);
      throw err;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-4">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-xs font-bold uppercase tracking-widest">Dismiss</button>
        </div>
      )}

      {activeTab === 'dashboard' && <Dashboard records={records} />}
      {activeTab === 'entry' && (
        <PatientForm
          onSubmit={handleAddRecord}
          isSubmitting={isSubmitting}
          initialData={editingRecord}
          onCancel={editingRecord ? () => {
            setEditingRecord(null);
            setActiveTab('list');
          } : undefined}
        />
      )}
      {activeTab === 'list' && (
        <PatientList
          records={records}
          onDelete={handleDeleteRecord}
          onEdit={handleEditRecord}
        />
      )}
    </Layout>
  );
}

import React from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginWithGoogle, logout } from './firebase';
import { patientService } from './services/patientService';
import { PatientRecord, PatientRecordInput } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PatientForm } from './components/PatientForm';
import { PatientList } from './components/PatientList';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'entry' | 'list'>('dashboard');
  const [records, setRecords] = React.useState<PatientRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [editingRecord, setEditingRecord] = React.useState<PatientRecord | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (user) {
      const unsubscribe = patientService.subscribeToRecords((data) => {
        setRecords(data);
      });
      return () => unsubscribe();
    } else {
      setRecords([]);
    }
  }, [user]);

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
      // On mobile, the new or updated record will be at the top level or easily visible
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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-400" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-zinc-200 border border-zinc-100 text-center">
          <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-zinc-200">
            <span className="text-white text-3xl font-bold">O</span>
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">OptiTrack</h1>
          <p className="text-zinc-500 mb-10">Sign in to manage your eye clinic patients securely.</p>
          
          <button
            onClick={() => loginWithGoogle()}
            className="w-full flex items-center justify-center gap-3 bg-white border border-zinc-200 py-4 px-6 rounded-2xl font-semibold text-zinc-900 hover:bg-zinc-50 transition-all shadow-sm active:scale-[0.98]"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            <span>Continue with Google</span>
          </button>
          
          <p className="mt-8 text-xs text-zinc-400 uppercase tracking-widest font-medium">Personal Use Only</p>
        </div>
      </div>
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      userEmail={user.email}
      onLogout={() => logout()}
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

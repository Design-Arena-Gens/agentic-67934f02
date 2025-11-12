'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface Student {
  id: string;
  nama: string;
  kelas: string;
  saldo: number;
}

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/');
      } else {
        loadStudents();
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadStudents = async () => {
    try {
      if (!db) return;
      const q = query(collection(db, 'students'), orderBy('kelas'), orderBy('nama'));
      const querySnapshot = await getDocs(q);
      const studentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Student));
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (!auth) return;
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleOpenTransaction = (student: Student, type: 'setor' | 'tarik') => {
    setSelectedStudent({ ...student, transactionType: type } as any);
    setShowTransactionForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-600">Dashboard TabunganKu SD</h1>
              <p className="text-gray-600 mt-1">Kelola tabungan siswa dengan mudah</p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Keluar
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            + Tambah Siswa
          </button>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">No</th>
                  <th className="px-4 py-3 text-left">Nama Siswa</th>
                  <th className="px-4 py-3 text-left">Kelas</th>
                  <th className="px-4 py-3 text-right">Saldo</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Belum ada data siswa. Klik "Tambah Siswa" untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  students.map((student, index) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3 font-medium">{student.nama}</td>
                      <td className="px-4 py-3">{student.kelas}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatRupiah(student.saldo)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleOpenTransaction(student, 'setor')}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition"
                          >
                            Setor
                          </button>
                          <button
                            onClick={() => handleOpenTransaction(student, 'tarik')}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition"
                          >
                            Tarik
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        {students.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Ringkasan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Siswa</p>
                <p className="text-2xl font-bold text-blue-600">{students.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Saldo</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatRupiah(students.reduce((sum, s) => sum + s.saldo, 0))}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Rata-rata Saldo</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatRupiah(students.reduce((sum, s) => sum + s.saldo, 0) / students.length)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddForm && (
        <AddStudentModal
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            loadStudents();
          }}
        />
      )}

      {showTransactionForm && selectedStudent && (
        <TransactionModal
          student={selectedStudent}
          onClose={() => {
            setShowTransactionForm(false);
            setSelectedStudent(null);
          }}
          onSuccess={() => {
            setShowTransactionForm(false);
            setSelectedStudent(null);
            loadStudents();
          }}
        />
      )}
    </div>
  );
}

// Add Student Modal Component
function AddStudentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('');
  const [saldo, setSaldo] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!db) throw new Error('Database not initialized');
      const { addDoc, collection } = await import('firebase/firestore');
      await addDoc(collection(db, 'students'), {
        nama,
        kelas,
        saldo: parseFloat(saldo) || 0,
        createdAt: new Date()
      });
      onSuccess();
    } catch (err) {
      setError('Gagal menambahkan siswa. Coba lagi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Tambah Siswa Baru</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Siswa *
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="input-field"
              placeholder="Contoh: Ahmad Fauzi"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kelas *
            </label>
            <select
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Pilih Kelas</option>
              <option value="1A">1A</option>
              <option value="1B">1B</option>
              <option value="2A">2A</option>
              <option value="2B">2B</option>
              <option value="3A">3A</option>
              <option value="3B">3B</option>
              <option value="4A">4A</option>
              <option value="4B">4B</option>
              <option value="5A">5A</option>
              <option value="5B">5B</option>
              <option value="6A">6A</option>
              <option value="6B">6B</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Saldo Awal (Rp)
            </label>
            <input
              type="number"
              value={saldo}
              onChange={(e) => setSaldo(e.target.value)}
              className="input-field"
              min="0"
              placeholder="0"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Transaction Modal Component
function TransactionModal({
  student,
  onClose,
  onSuccess
}: {
  student: Student & { transactionType?: 'setor' | 'tarik' };
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [jumlah, setJumlah] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSetor = (student as any).transactionType === 'setor';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const amount = parseFloat(jumlah);

    if (amount <= 0) {
      setError('Jumlah harus lebih dari 0');
      setLoading(false);
      return;
    }

    if (!isSetor && amount > student.saldo) {
      setError('Saldo tidak mencukupi');
      setLoading(false);
      return;
    }

    try {
      if (!db) throw new Error('Database not initialized');
      const { doc, updateDoc, addDoc, collection } = await import('firebase/firestore');

      // Update student balance
      const newSaldo = isSetor ? student.saldo + amount : student.saldo - amount;
      await updateDoc(doc(db, 'students', student.id), {
        saldo: newSaldo
      });

      // Record transaction
      await addDoc(collection(db, 'transactions'), {
        studentId: student.id,
        studentName: student.nama,
        kelas: student.kelas,
        type: isSetor ? 'setor' : 'tarik',
        amount: amount,
        keterangan: keterangan || '-',
        saldoBefore: student.saldo,
        saldoAfter: newSaldo,
        timestamp: new Date()
      });

      onSuccess();
    } catch (err) {
      setError('Gagal menyimpan transaksi. Coba lagi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {isSetor ? 'Setor' : 'Tarik'} Tabungan
        </h2>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Nama Siswa</p>
          <p className="font-semibold text-lg">{student.nama}</p>
          <p className="text-sm text-gray-600 mt-2">Saldo Saat Ini</p>
          <p className="font-bold text-xl text-blue-600">{formatRupiah(student.saldo)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah (Rp) *
            </label>
            <input
              type="number"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              className="input-field"
              placeholder="Masukkan jumlah"
              min="1"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="input-field"
              placeholder="Opsional"
            />
          </div>

          {jumlah && parseFloat(jumlah) > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Saldo Setelah Transaksi</p>
              <p className="font-bold text-xl text-blue-600">
                {formatRupiah(
                  isSetor
                    ? student.saldo + parseFloat(jumlah)
                    : student.saldo - parseFloat(jumlah)
                )}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 ${isSetor ? 'btn-success' : 'bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200'} disabled:opacity-50`}
            >
              {loading ? 'Memproses...' : `${isSetor ? 'Setor' : 'Tarik'} Sekarang`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

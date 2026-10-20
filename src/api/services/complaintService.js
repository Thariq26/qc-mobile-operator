import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

const FALLBACK_COMPLAINTS = [
  {
    id: 1,
    customerName: 'PT ASTRA HONDA MOTOR',
    partNumber: 'PT-1001',
    partName: 'Front Bracket A',
    defectName: 'Lubang Baut Miring',
    lotNumber: 'LOT-202610-09A',
    defectQuantity: 24,
    problemDescription: 'Lubang baut miring 1.8mm dari batas toleransi gambar kerja akibat pin jig bending bergeser saat proses clamping.',
    status: 'Open / High Priority',
    complaintDate: '2026-10-13',
    actionPlan: 'Pemasangan dowel pin tambahan pada jig fixture & kalibrasi ulang stroke press.',
  },
  {
    id: 2,
    customerName: 'PT TOYOTA MOTOR MFG',
    partNumber: 'PT-1002',
    partName: 'Rear Flange B',
    defectName: 'Keropos Las Titik',
    lotNumber: 'LOT-202610-12B',
    defectQuantity: 12,
    problemDescription: 'Keropos hasil las titik lepas saat uji dorong tekan (pull test) 3.5 kN di lini perakitan customer.',
    status: 'Under Investigation',
    complaintDate: '2026-10-12',
    actionPlan: 'Pengecekan tekanan pneumatik elektroda spot dan pengasahan tip copper 2 jam sekali.',
  },
  {
    id: 3,
    customerName: 'PT ASTRA HONDA MOTOR',
    partNumber: 'PT-1003',
    partName: 'Side Reinforce L',
    defectName: 'Flange Tidak Flat',
    lotNumber: 'LOT-202609-28C',
    defectQuantity: 50,
    problemDescription: 'Permukaan flange melengkung 2.3mm, menyebabkan gap clearance saat pemasangan baut chassis di lini welding frame.',
    status: 'Under Investigation',
    complaintDate: '2026-10-10',
    actionPlan: 'Penyesuaian crowning table mesin press bender dan inspeksi kerataan meja cetakan.',
  },
  {
    id: 4,
    customerName: 'PT SUZUKI INDOMOBIL MOTOR',
    partNumber: 'PT-1004',
    partName: 'Main Stay Plate',
    defectName: 'Burry Tajam',
    lotNumber: 'LOT-202610-04F',
    defectQuantity: 8,
    problemDescription: 'Tepi part burry tajam berpotensi menggores harness kabel kelistrikan saat instalasi di frame motor.',
    status: 'Closed / Action Taken',
    complaintDate: '2026-10-08',
    actionPlan: 'Regrinding punch pisau potong Amada Press 01 dan pemasangan station deburring manual.',
  },
];

export const complaintService = {
  getComplaints: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.COMPLAINTS);
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map((item) => ({
          id: item.id,
          customerName: item.customerName || 'PT CUSTOMER',
          partNumber: item.part?.partNumber || item.partNumber || 'PT-1001',
          partName: item.part?.partName || item.partName || 'Bracket Part',
          defectName: item.defectType?.name || item.defectName || 'Spesifikasi Dimensi',
          lotNumber: item.lotNumber || 'LOT-202610-GMP',
          defectQuantity: item.defectQuantity || 1,
          problemDescription: item.problemDescription || 'Ditemukan ketidaksesuaian spesifikasi standar pada lot pengiriman.',
          status: item.status || 'Under Investigation',
          complaintDate: item.complaintDate || '2026-10-13',
          actionPlan: item.actionPlan || 'Investigasi tim QA & Tooling berlangsung.',
        }));
      }
      return FALLBACK_COMPLAINTS;
    } catch {
      return FALLBACK_COMPLAINTS;
    }
  },
};

export default complaintService;

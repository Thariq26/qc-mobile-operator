import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

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
      return [];
    } catch {
      return [];
    }
  },
};

export default complaintService;

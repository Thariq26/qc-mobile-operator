import { getLocalDateString, normalizeDateString } from './dateFormatter';

/**
 * Normalizes machine name to remove variations in punctuation, casing, and spacing.
 * Examples:
 *   "Mesin 6 Ton (1)" -> "mesin6ton1"
 *   "Mesin 6 Ton - 1" -> "mesin6ton1"
 *   "Amada Press 01"  -> "amadapress01"
 */
export const normalizeMachineName = (name) => {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .replace(/[\s\-_()/.]+/g, '')
    .trim();
};

/**
 * Normalizes part number/name to remove variations in formatting.
 * Examples:
 *   "50107- K59- A100-23 Stay R" -> "50107k59a10023stayr"
 *   "50107-K59-A100-23 Stay R"   -> "50107k59a10023stayr"
 */
export const normalizePartIdentifier = (part) => {
  if (!part) return '';
  return String(part)
    .toLowerCase()
    .replace(/[\s\-_()/.]+/g, '')
    .trim();
};

/**
 * Normalizes shift.
 * Examples:
 *   "Shift 1" -> "shift1"
 *   "Shift 2" -> "shift2"
 */
export const normalizeShift = (shift) => {
  if (!shift) return '';
  return String(shift)
    .toLowerCase()
    .replace(/[\s\-_]+/g, '')
    .trim();
};

/**
 * Parses date string (YYYY-MM-DD, array, ISO timestamp, or Date) into days since Unix epoch (UTC).
 * Returns null if invalid.
 */
export const parseDateDays = (dateVal) => {
  if (!dateVal && dateVal !== 0) return null;
  const str = normalizeDateString(dateVal);
  if (!str) return null;
  const parts = str.split('-').map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return null;
  }
  return Math.floor(Date.UTC(parts[0], parts[1] - 1, parts[2]) / (1000 * 60 * 60 * 24));
};

/**
 * Determines if a defect record D is eligible to match a production record P.
 * Handles the common shop floor scenario where Operator reports on Day T (e.g. 22 Oct 2026),
 * and QC staff enters defect inspection on Day T or Day T+1 (e.g. 23 Oct 2026).
 *
 * Matching criteria:
 * 1. Machine: Normalized machine names must match (or one contains the other).
 * 2. Part: Normalized part numbers/names or part IDs must match.
 * 3. Shift: If both specify a shift, normalized shifts must match.
 * 4. Date:
 *    - Same date (diff = 0)
 *    - QC inspected next day (diff = 1)
 *    - QC inspected within 3 days (e.g., weekend / Monday morning audit) (diff <= 3 and diff >= 0)
 */
export const isDefectEligibleForProduction = (prod, defect) => {
  // 1. Machine matching
  const pMachine = normalizeMachineName(prod.machineName);
  const dMachine = normalizeMachineName(defect.namaMesin || defect.machineName);
  if (!pMachine || !dMachine) return false;
  const machineMatches =
    pMachine === dMachine || pMachine.includes(dMachine) || dMachine.includes(pMachine);
  if (!machineMatches) return false;

  // 2. Part matching
  const pPartId = prod.partId ?? prod.part?.id;
  const dPartId = defect.partId ?? defect.part?.id;
  const hasPartIdMatch = pPartId && dPartId && Number(pPartId) === Number(dPartId);

  const pPartNum = normalizePartIdentifier(prod.partNumber || prod.part?.partNumber);
  const dPartNum = normalizePartIdentifier(defect.partNumber || defect.part?.partNumber);
  const hasPartNumMatch =
    pPartNum &&
    dPartNum &&
    (pPartNum === dPartNum || pPartNum.includes(dPartNum) || dPartNum.includes(pPartNum));

  const pPartName = normalizePartIdentifier(prod.partName || prod.part?.partName);
  const dPartName = normalizePartIdentifier(defect.partName || defect.part?.partName);
  const hasPartNameMatch =
    pPartName &&
    dPartName &&
    (pPartName === dPartName || pPartName.includes(dPartName) || dPartName.includes(pPartName));

  const partMatches = hasPartIdMatch || hasPartNumMatch || hasPartNameMatch;
  if (!partMatches && (pPartNum || dPartNum)) return false;

  // 3. Shift matching (if specified)
  const pShift = normalizeShift(prod.shift);
  const dShift = normalizeShift(defect.shift);
  if (pShift && dShift && pShift !== dShift) {
    return false;
  }

  // 4. Date matching with tolerance window (0 to +3 days)
  const pDays = parseDateDays(prod.productionDate);
  const dDays = parseDateDays(defect.defectDate);

  if (pDays !== null && dDays !== null) {
    const diff = dDays - pDays; // defectDate - productionDate in days
    // Defect must not precede the production date (diff >= 0)
    // and must fall within a 3-day turnaround inspection window (diff <= 3)
    if (diff < 0 || diff > 3) {
      return false;
    }
  }

  return true;
};

/**
 * Synchronizes an array of production records with shop floor QC defect records.
 * Assigns each defect to the closest matching production batch to prevent double-counting.
 * Computes netProduced, variance, efficiency, and status according to ISO 9001:2015.
 */
export const syncProductionWithDefects = (productionList, defectList) => {
  if (!Array.isArray(productionList) || productionList.length === 0) {
    return [];
  }

  const safeDefects = Array.isArray(defectList) ? defectList : [];

  // Map to hold matched defects per production record ID or index
  const matchedDefectsMap = new Map();
  productionList.forEach((p, idx) => {
    const key = p.id != null ? String(p.id) : `prod_idx_${idx}`;
    matchedDefectsMap.set(key, []);
  });

  // Assign each defect to its best matching production run
  safeDefects.forEach((d) => {
    let bestProdKey = null;
    let minDiff = Infinity;

    productionList.forEach((p, idx) => {
      if (isDefectEligibleForProduction(p, d)) {
        const pDays = parseDateDays(p.productionDate);
        const dDays = parseDateDays(d.defectDate);
        const diff = pDays !== null && dDays !== null ? Math.max(0, dDays - pDays) : 0;

        if (diff < minDiff) {
          minDiff = diff;
          bestProdKey = p.id != null ? String(p.id) : `prod_idx_${idx}`;
        }
      }
    });

    if (bestProdKey) {
      matchedDefectsMap.get(bestProdKey)?.push(d);
    }
  });

  // Calculate net metrics for each production record
  return productionList.map((p, idx) => {
    const key = p.id != null ? String(p.id) : `prod_idx_${idx}`;
    const assignedDefects = matchedDefectsMap.get(key) || [];

    const target = Number(p.targetQuantity ?? p.target ?? 0);
    const grossProduced = Number(p.producedQuantity ?? p.grossProduced ?? p.produced ?? 0);

    const defectsFromQc = assignedDefects.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);
    const directNg = Number(p.totalNg ?? p.ngQuantity ?? 0);
    const totalNg = Math.max(defectsFromQc, directNg);

    const netProduced = Math.max(0, grossProduced - totalNg);
    const variance = netProduced - target;
    const efficiency = target > 0 ? Number(((netProduced / target) * 100).toFixed(1)) : 100;
    const status = netProduced >= target ? 'On Target' : 'Below Target';

    return {
      ...p,
      targetQuantity: target,
      target,
      producedQuantity: grossProduced,
      grossProduced,
      produced: grossProduced,
      totalNg,
      netProduced,
      variance,
      efficiency,
      status,
      defects: assignedDefects,
    };
  });
};

export default {
  normalizeMachineName,
  normalizePartIdentifier,
  normalizeShift,
  parseDateDays,
  isDefectEligibleForProduction,
  syncProductionWithDefects,
};

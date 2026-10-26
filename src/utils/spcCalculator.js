/**
 * Statistical Process Control (SPC) - p-Chart (Proportion Defective) Calculator
 * Reference: ISO 7870-2 / AIAG SPC Manual (3-Sigma Control Limits)
 *
 * Formulas:
 * - Fraction Defective: p_i = d_i / n_i (where d_i = NG count, n_i = produced quantity)
 * - Center Line (CL): p_bar = Sum(d_i) / Sum(n_i)
 * - Standard Error: sigma_p = sqrt( p_bar * (1 - p_bar) / n_i )
 * - Upper Control Limit (UCL): min(1.0, p_bar + 3 * sigma_p)
 * - Lower Control Limit (LCL): max(0.0, p_bar - 3 * sigma_p)
 */

/**
 * Calculates p-Chart control limits, fractions, and flags out-of-control points.
 * @param {Array<{ id: string|number, label: string, date: string, produced: number, ng: number, machineName?: string, process?: string, topDefect?: string }>} subgroups
 * @returns {Object} Calculated SPC metrics and enriched points
 */
export const calculatePChart = (subgroups = []) => {
  const validSubgroups = Array.isArray(subgroups)
    ? subgroups.filter((sg) => Number(sg.produced || 0) > 0)
    : [];

  if (validSubgroups.length === 0) {
    return {
      status: 'NO-DATA',
      centerLine: 0,
      ucl: 0,
      lcl: 0,
      totalProduced: 0,
      totalNg: 0,
      averageDefectRate: 0,
      sampleCount: 0,
      outOfControlCount: 0,
      anomalousPoints: [],
      topAnomaly: null,
      points: [],
    };
  }

  // 1. Accumulate total production and total NG
  let totalProduced = 0;
  let totalNg = 0;

  validSubgroups.forEach((sg) => {
    totalProduced += Math.max(0, Number(sg.produced || 0));
    totalNg += Math.max(0, Number(sg.ng || 0));
  });

  const sampleCount = validSubgroups.length;
  const pBar = totalProduced > 0 ? totalNg / totalProduced : 0;
  const avgSampleSize = sampleCount > 0 ? totalProduced / sampleCount : 0;

  // Average 3-sigma standard error for baseline line
  const avgSigmaP =
    avgSampleSize > 0 && pBar > 0 && pBar < 1
      ? Math.sqrt((pBar * (1 - pBar)) / avgSampleSize)
      : 0;

  const uclAvg = Math.min(1.0, pBar + 3 * avgSigmaP);
  const lclAvg = Math.max(0.0, pBar - 3 * avgSigmaP);

  // 2. Calculate point-by-point limits and flag special cause variations
  const points = [];
  const anomalousPoints = [];
  let consecutiveAboveCl = 0;

  validSubgroups.forEach((sg, index) => {
    const n = Math.max(0, Number(sg.produced || 0));
    const d = Math.max(0, Number(sg.ng || 0));
    const p = n > 0 ? d / n : 0;

    // Subgroup-specific sigma and control limits based on actual sample size
    const sigma_i =
      n > 0 && pBar > 0 && pBar < 1
        ? Math.sqrt((pBar * (1 - pBar)) / n)
        : avgSigmaP;

    const ucl_i = Math.min(1.0, pBar + 3 * sigma_i);
    const lcl_i = Math.max(0.0, pBar - 3 * sigma_i);

    // Rule 1: Point exceeds Upper Control Limit (Defect spike beyond 3-sigma)
    const isBeyondUcl = p > ucl_i && d > 0;

    // Rule 2: Run of 7 consecutive points above Center Line
    if (p > pBar) {
      consecutiveAboveCl += 1;
    } else {
      consecutiveAboveCl = 0;
    }
    const isRunViolation = consecutiveAboveCl >= 7;

    const isOutOfControl = isBeyondUcl || isRunViolation;
    let outOfControlReason = null;
    if (isBeyondUcl) {
      outOfControlReason = `Porsi cacat (${(p * 100).toFixed(2)}%) melampaui batas kendali UCL (${(ucl_i * 100).toFixed(2)}%)`;
    } else if (isRunViolation) {
      outOfControlReason = `Trend 7 titik berturut-turut di atas batas rata-rata (Center Line)`;
    }

    const enrichedPoint = {
      id: sg.id || `point-${index}`,
      index: index + 1,
      label: sg.label || sg.date || `#${index + 1}`,
      date: sg.date || '',
      produced: n,
      ng: d,
      p,
      pPercent: Number((p * 100).toFixed(2)),
      ucl: Number((ucl_i * 100).toFixed(2)),
      lcl: Number((lcl_i * 100).toFixed(2)),
      centerLine: Number((pBar * 100).toFixed(2)),
      machineName: sg.machineName || 'Mesin',
      process: sg.process || 'Stamping',
      topDefect: sg.topDefect || 'Gompal',
      isOutOfControl,
      outOfControlReason,
    };

    points.push(enrichedPoint);
    if (isOutOfControl) {
      anomalousPoints.push(enrichedPoint);
    }
  });

  const outOfControlCount = anomalousPoints.length;
  const status = outOfControlCount > 0 ? 'OUT-OF-CONTROL' : 'IN-CONTROL';

  // Find top anomaly (highest defect proportion) for quick AI resolution handoff
  const topAnomaly =
    anomalousPoints.length > 0
      ? [...anomalousPoints].sort((a, b) => b.p - a.p)[0]
      : points.length > 0
      ? [...points].sort((a, b) => b.p - a.p)[0]
      : null;

  return {
    status,
    centerLine: Number((pBar * 100).toFixed(2)),
    ucl: Number((uclAvg * 100).toFixed(2)),
    lcl: Number((lclAvg * 100).toFixed(2)),
    totalProduced,
    totalNg,
    averageDefectRate: Number((pBar * 100).toFixed(2)),
    sampleCount,
    outOfControlCount,
    anomalousPoints,
    topAnomaly,
    points,
  };
};

export default calculatePChart;

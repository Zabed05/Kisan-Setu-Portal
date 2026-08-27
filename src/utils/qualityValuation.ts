import { CropType } from '../types';

export interface QualityPricingResult {
  baseMspRate: number;
  grade: 'A' | 'FAQ' | 'B' | 'REJECTED';
  moisturePercentage: number;
  foreignMatterPercentage: number;
  isOptimal: boolean;
  passed: boolean;
  qualityBonusOrDeductionPercent: number; // e.g. +2.0, 0, -2.5
  qualityAdjustmentPerQtl: number; // e.g. +45.50 or -56.88
  effectiveRatePerQuintal: number;
  qualityStatus: 'PREMIUM_BONUS' | 'STANDARD_FAQ' | 'SUB_FAQ_DEDUCTION' | 'REJECTED';
  explanationEn: string;
  explanationHi: string;
}

export const CROP_QUALITY_SPECS: Record<CropType, {
  baseMsp: number;
  optimalMoisture: number;
  maxFaqMoisture: number;
  maxRelaxedMoisture: number;
  maxFaqForeignMatter: number;
}> = {
  wheat: {
    baseMsp: 2275,
    optimalMoisture: 11.5,
    maxFaqMoisture: 12.0,
    maxRelaxedMoisture: 13.5,
    maxFaqForeignMatter: 1.5
  },
  paddy: {
    baseMsp: 2300,
    optimalMoisture: 14.0,
    maxFaqMoisture: 17.0,
    maxRelaxedMoisture: 18.5,
    maxFaqForeignMatter: 1.5
  },
  mustard: {
    baseMsp: 5650,
    optimalMoisture: 8.0,
    maxFaqMoisture: 9.0,
    maxRelaxedMoisture: 10.0,
    maxFaqForeignMatter: 1.5
  },
  cotton: {
    baseMsp: 7020,
    optimalMoisture: 8.5,
    maxFaqMoisture: 10.0,
    maxRelaxedMoisture: 11.5,
    maxFaqForeignMatter: 1.5
  },
  maize: {
    baseMsp: 2090,
    optimalMoisture: 12.0,
    maxFaqMoisture: 14.0,
    maxRelaxedMoisture: 15.5,
    maxFaqForeignMatter: 1.5
  }
};

export function calculateQualityValuation(
  cropType: CropType,
  moisturePercentage: number,
  foreignMatterPercentage: number = 0.8,
  forcedGrade?: 'A' | 'FAQ' | 'B' | 'REJECTED'
): QualityPricingResult {
  const spec = CROP_QUALITY_SPECS[cropType] || CROP_QUALITY_SPECS.wheat;
  const baseMsp = spec.baseMsp;
  const moisture = Number(moisturePercentage);
  const foreignMatter = Number(foreignMatterPercentage);

  // Automatic grading based on Fair Average Quality (FAQ) standards
  let calculatedGrade: 'A' | 'FAQ' | 'B' | 'REJECTED' = 'FAQ';
  let passed = true;
  let bonusOrDeductionPercent = 0;
  let status: 'PREMIUM_BONUS' | 'STANDARD_FAQ' | 'SUB_FAQ_DEDUCTION' | 'REJECTED' = 'STANDARD_FAQ';

  if (moisture > spec.maxRelaxedMoisture || foreignMatter > 2.5) {
    calculatedGrade = 'REJECTED';
    passed = false;
    bonusOrDeductionPercent = -100;
    status = 'REJECTED';
  } else if (moisture <= spec.optimalMoisture && foreignMatter <= 0.75) {
    calculatedGrade = 'A';
    bonusOrDeductionPercent = 2.0; // +2% Quality Bonus
    status = 'PREMIUM_BONUS';
  } else if (moisture <= spec.maxFaqMoisture && foreignMatter <= spec.maxFaqForeignMatter) {
    calculatedGrade = 'FAQ';
    bonusOrDeductionPercent = 0.0; // Standard 100% MSP
    status = 'STANDARD_FAQ';
  } else {
    calculatedGrade = 'B';
    // Pro-rata moisture / refraction deduction (-2.5% to -4.0%)
    const excessMoisture = Math.max(0, moisture - spec.maxFaqMoisture);
    const excessForeign = Math.max(0, foreignMatter - spec.maxFaqForeignMatter);
    bonusOrDeductionPercent = -Math.min(5.0, Number((2.0 + (excessMoisture * 1.5) + (excessForeign * 1.0)).toFixed(1)));
    status = 'SUB_FAQ_DEDUCTION';
  }

  const finalGrade = forcedGrade || calculatedGrade;
  if (finalGrade === 'A') {
    bonusOrDeductionPercent = 2.0;
    status = 'PREMIUM_BONUS';
    passed = true;
  } else if (finalGrade === 'FAQ') {
    bonusOrDeductionPercent = 0.0;
    status = 'STANDARD_FAQ';
    passed = true;
  } else if (finalGrade === 'B') {
    bonusOrDeductionPercent = bonusOrDeductionPercent < 0 ? bonusOrDeductionPercent : -2.5;
    status = 'SUB_FAQ_DEDUCTION';
    passed = true;
  } else if (finalGrade === 'REJECTED') {
    bonusOrDeductionPercent = -100;
    status = 'REJECTED';
    passed = false;
  }

  const qualityAdjustmentPerQtl = passed 
    ? Number(((baseMsp * bonusOrDeductionPercent) / 100).toFixed(2))
    : -baseMsp;

  const effectiveRatePerQuintal = passed 
    ? Number((baseMsp + qualityAdjustmentPerQtl).toFixed(2))
    : 0;

  let explanationEn = '';
  let explanationHi = '';

  if (status === 'PREMIUM_BONUS') {
    explanationEn = `Grade A (+2% Incentive): Low moisture (${moisture}%) and clean grain earns +₹${qualityAdjustmentPerQtl}/Qtl bonus.`;
    explanationHi = `ग्रेड A (+2% प्रोत्साहन): कम नमी (${moisture}%) एवं साफ उपज पर +₹${qualityAdjustmentPerQtl}/क्विंटल का बोनस।`;
  } else if (status === 'STANDARD_FAQ') {
    explanationEn = `Fair Average Quality (100% MSP): Standard grain quality meets all government FAQ norms. Full MSP ₹${baseMsp}/Qtl applied.`;
    explanationHi = `उचित औसत गुणवत्ता (100% एमएसपी): मानक उपज सरकारी मानदंडों पर खरी। पूर्ण एमएसपी ₹${baseMsp}/क्विंटल लागू।`;
  } else if (status === 'SUB_FAQ_DEDUCTION') {
    explanationEn = `Grade B (Moisture/Refraction Cut): Slightly elevated moisture (${moisture}%) results in ${Math.abs(bonusOrDeductionPercent)}% (₹${Math.abs(qualityAdjustmentPerQtl)}/Qtl) deduction.`;
    explanationHi = `ग्रेड B (नमी कटौती): अधिक नमी (${moisture}%) के कारण ${Math.abs(bonusOrDeductionPercent)}% (₹${Math.abs(qualityAdjustmentPerQtl)}/क्विंटल) की मानक कटौती।`;
  } else {
    explanationEn = `Below FAQ Standards: Moisture (${moisture}%) exceeds government tolerance limit (${spec.maxRelaxedMoisture}%). Lot not eligible for procurement.`;
    explanationHi = `मानक से बाहर: नमी (${moisture}%) अधिकतम सीमा (${spec.maxRelaxedMoisture}%) से अधिक। खरीद हेतु अमान्य।`;
  }

  return {
    baseMspRate: baseMsp,
    grade: finalGrade,
    moisturePercentage: moisture,
    foreignMatterPercentage: foreignMatter,
    isOptimal: moisture <= spec.optimalMoisture,
    passed,
    qualityBonusOrDeductionPercent: bonusOrDeductionPercent,
    qualityAdjustmentPerQtl,
    effectiveRatePerQuintal,
    qualityStatus: status,
    explanationEn,
    explanationHi
  };
}

export function calculateLotPayout(
  netQuintals: number,
  valuation: QualityPricingResult
) {
  const baseValue = Number((netQuintals * valuation.baseMspRate).toFixed(2));
  const qualityAdjustmentValue = Number((netQuintals * valuation.qualityAdjustmentPerQtl).toFixed(2));
  const finalPayout = Number(Math.max(0, baseValue + qualityAdjustmentValue).toFixed(2));

  return {
    baseValue,
    qualityAdjustmentValue,
    finalPayout
  };
}

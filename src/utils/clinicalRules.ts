import { SwellingLevel, FetalMovement, AlertSeverity } from '../types';

export interface EvaluationInput {
  systolic_bp: number;
  sub_diastolic_bp: number;
  weight_kg: number;
  swelling_level: SwellingLevel;
  headache_or_vision_change: boolean;
  epigastric_pain?: boolean;
  fetal_movement?: FetalMovement;
  gestational_age_weeks?: number;
  risk_factors?: string[];
  previous_weight_kg?: number;
  baseline_bp_systolic?: number;
  baseline_bp_diastolic?: number;
}

export interface EvaluationResult {
  risk_score: number; // 0 - 100
  risk_level: 'green' | 'yellow' | 'red';
  severity: AlertSeverity | null;
  danger_signs: string[];
  clinical_summary: string;
  recommended_action: string;
  requires_immediate_alert: boolean;
  map_value: number; // Mean Arterial Pressure
}

export function evaluateVitals(input: EvaluationInput): EvaluationResult {
  const {
    systolic_bp,
    sub_diastolic_bp,
    weight_kg,
    swelling_level,
    headache_or_vision_change,
    epigastric_pain = false,
    fetal_movement = 'normal',
    gestational_age_weeks = 28,
    risk_factors = [],
    previous_weight_kg,
    baseline_bp_systolic = 115,
    baseline_bp_diastolic = 75,
  } = input;

  const danger_signs: string[] = [];
  let score = 5;

  // Mean Arterial Pressure: (SBP + 2 * DBP) / 3
  const map_value = Math.round((systolic_bp + 2 * sub_diastolic_bp) / 3);

  // 1. Blood Pressure evaluation (WHO / ACOG Gestational Hypertension Criteria)
  const isSevereHypertension = systolic_bp >= 160 || sub_diastolic_bp >= 110;
  const isModerateHypertension = (systolic_bp >= 140 && systolic_bp < 160) || (sub_diastolic_bp >= 90 && sub_diastolic_bp < 110);
  const isSurgeAboveBaseline = (systolic_bp - baseline_bp_systolic >= 30) || (sub_diastolic_bp - baseline_bp_diastolic >= 15);

  if (isSevereHypertension) {
    score += 45;
    danger_signs.push(`Critical Blood Pressure (${systolic_bp}/${sub_diastolic_bp} mmHg) — Severe Pre-eclampsia range`);
  } else if (isModerateHypertension) {
    score += 25;
    danger_signs.push(`Elevated Blood Pressure (${systolic_bp}/${sub_diastolic_bp} mmHg) — Gestational Hypertension range`);
  } else if (isSurgeAboveBaseline) {
    score += 15;
    danger_signs.push(`Rapid BP escalation above patient baseline (+${systolic_bp - baseline_bp_systolic}/+${sub_diastolic_bp - baseline_bp_diastolic} mmHg)`);
  }

  // 2. Neurological / Cerebral symptoms (Eclampsia warning)
  if (headache_or_vision_change) {
    score += 30;
    danger_signs.push('Persistent frontal headache or visual disturbances (scotomata/flashing lights)');
  }

  // 3. Hepatic distension / HELLP signs
  if (epigastric_pain) {
    score += 35;
    danger_signs.push('Severe epigastric or right upper quadrant pain (hepatic swelling / HELLP risk)');
  }

  // 4. Edema & fluid retention
  if (swelling_level === 'severe') {
    score += 20;
    danger_signs.push('Severe generalized edema (rapid onset swelling in face, hands, pretibia)');
  } else if (swelling_level === 'mild') {
    score += 6;
  }

  // Rapid weight gain (>1.5kg in a week indicative of occult edema)
  if (previous_weight_kg && (weight_kg - previous_weight_kg) >= 1.5) {
    score += 15;
    danger_signs.push(`Sudden rapid weight gain (+${(weight_kg - previous_weight_kg).toFixed(1)} kg) suggesting fluid retention`);
  }

  // 5. Fetal well-being
  if (fetal_movement === 'absent' && gestational_age_weeks >= 24) {
    score += 40;
    danger_signs.push('Absent fetal movement in past 12 hours (Acute fetal distress concern)');
  } else if (fetal_movement === 'decreased' && gestational_age_weeks >= 24) {
    score += 15;
    danger_signs.push('Noticeably decreased fetal movement');
  }

  // 6. Pre-existing maternal risk factors
  if (risk_factors.includes('history_of_hypertension') || risk_factors.includes('previous_preeclampsia')) {
    score += 10;
  }
  if (risk_factors.includes('gestational_diabetes')) {
    score += 6;
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(100, Math.max(5, score));

  // Determine triage category
  let risk_level: 'green' | 'yellow' | 'red' = 'green';
  let severity: AlertSeverity | null = null;
  let recommended_action = '';
  let clinical_summary = '';

  const isRed =
    isSevereHypertension ||
    (isModerateHypertension && (headache_or_vision_change || epigastric_pain)) ||
    (headache_or_vision_change && epigastric_pain) ||
    fetal_movement === 'absent' ||
    finalScore >= 60;

  const isYellow =
    !isRed &&
    (isModerateHypertension ||
      swelling_level === 'severe' ||
      headache_or_vision_change ||
      fetal_movement === 'decreased' ||
      finalScore >= 30);

  if (isRed) {
    risk_level = 'red';
    severity = 'red_critical';
    recommended_action =
      'Immediate Community Health Worker (CHW) dispatch, emergency district clinic referral, place patient in left lateral recumbent position, prepare for Magnesium Sulfate loading dose and emergency antihypertensive protocol (Oral Nifedipine / IV Labetalol).';
    clinical_summary =
      'HIGH RISK: Imminent pre-eclampsia/eclampsia emergency. Severe hemodynamic compromise and danger signs detected.';
  } else if (isYellow) {
    risk_level = 'yellow';
    severity = 'yellow_warning';
    recommended_action =
      'Community Health Worker visit within 24 hours. Repeat blood pressure in 4 hours, test urine for proteinuria (dipstick), ensure rest, review danger signs with family.';
    clinical_summary =
      'MODERATE RISK: Developing gestational hypertension or pre-eclampsia signs. Requires close surveillance.';
  } else {
    risk_level = 'green';
    severity = null;
    recommended_action =
      'Maintain routine prenatal visits. Continue daily iron/folate supplementation, maintain adequate hydration and continue daily vital self-monitoring.';
    clinical_summary =
      'STABLE: Normal maternal vital parameters and fetal activity.';
  }

  return {
    risk_score: finalScore,
    risk_level,
    severity,
    danger_signs,
    clinical_summary,
    recommended_action,
    requires_immediate_alert: risk_level !== 'green',
    map_value,
  };
}

import { pool } from "../pool.js";
import fs from "fs";

function calculateZScores(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  );
  return values.map((v) => (stdDev === 0 ? 0 : (v - mean) / stdDev));
}

function detectAnomalies(surveyData) {
  const anomalies = [];

  surveyData.forEach((record) => {
    const anomalyReasons = [];

    // 1️⃣ All Likert scale questions
    const likertQuestions = [
      record.trust_analyze_2d,
      record.trust_imagination_2d,
      record.trust_view_2d,
      record.trust_materials_2d,
      record.trust_details_2d,
      record.trust_developer_2d,
      record.conversation_presence_2d,
      record.conversation_buy_decision_2d,
      record.conversation_action_2d,
      record.uncertainty_real_presence_2d,
      record.uncertainty_clarity_2d,
      record.uncertainty_details_decision_2d,
      record.uncertainty_enough_details_2d,
      record.trust_analyze_vr,
      record.trust_imagination_vr,
      record.trust_materials_vr,
      record.trust_details_vr,
      record.trust_developer_vr,
      record.conversation_presence_vr,
      record.conversation_buy_decision_vr,
      record.conversation_action_vr,
      record.uncertainty_real_presence_vr,
      record.uncertainty_clarity_vr,
      record.uncertainty_details_decision_vr,
      record.uncertainty_enough_details_vr,
    ];

    // 2️⃣ Straightlining detection
    const allSame = likertQuestions.every((a) => a === likertQuestions[0]);
    if (allSame) {
      anomalyReasons.push("Straightlining: All answers are the same");
    }

    // 3️⃣ Z-score extreme detection
    const zScores = calculateZScores(likertQuestions);
    if (zScores.some((z) => Math.abs(z) > 3)) {
      anomalyReasons.push("Outlier: Extreme deviation detected");
    }

    // 4️⃣ Age validation
    if (record.age < 10 || record.age > 100) {
      anomalyReasons.push(`Unrealistic age: ${record.age}`);
    }

    if (anomalyReasons.length > 0) {
      anomalies.push({
        respondent_id: record.id,
        submitted_at: record.submitted_at,
        reasons: anomalyReasons,
      });
    }
  });

  return anomalies;
}

console.log("=== Detecting survey anomalies ===");

pool.query("SELECT * FROM survey_results").then(({ rows: surveyData }) => {
  const anomalies = detectAnomalies(surveyData);

  console.log(`Found ${anomalies.length} potential anomalies`);
  anomalies.forEach((a) => {
    console.log(
      `ID: ${a.respondent_id} @ ${a.submitted_at} => ${a.reasons.join("; ")}`
    );
  });

  fs.writeFileSync(
    "survey_anomalies.json",
    JSON.stringify(anomalies, null, 2),
    "utf-8"
  );
  console.log("=== survey_anomalies.json file created ===");

  pool.end();
});

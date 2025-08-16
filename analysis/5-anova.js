// demographic-analysis.js - تحلیل تأثیر متغیرهای جمعیت‌شناختی
import { pool } from "../pool.js";
import * as ss from "simple-statistics";
import jStat from "jstat";
import fs from "fs";
/* -------------------------------------------------------------------------- */
/*                          Query for Demographic Analysis                    */
/* -------------------------------------------------------------------------- */
const DEMOGRAPHIC_QUERY = `
WITH calculated_means AS (
  SELECT
    id,
    gender,
    age,
    college_degree,
    occupation,
    
    -- Trust means
    (trust_analyze_2d + trust_imagination_2d + trust_view_2d +
     trust_materials_2d + trust_details_2d + trust_developer_2d) / 6.0 AS trust_2d,
    (trust_analyze_vr + trust_imagination_vr + trust_materials_vr +
     trust_details_vr + trust_developer_vr) / 5.0 AS trust_vr,

    -- Uncertainty means  
    (uncertainty_real_presence_2d + uncertainty_clarity_2d +
     uncertainty_details_decision_2d + uncertainty_enough_details_2d) / 4.0 AS uncertainty_2d,
    (uncertainty_real_presence_vr + uncertainty_clarity_vr +
     uncertainty_details_decision_vr + uncertainty_enough_details_vr) / 4.0 AS uncertainty_vr,

    -- Purchase intent means
    (conversation_presence_2d + conversation_buy_decision_2d +
     conversation_action_2d) / 3.0 AS intent_2d,
    (conversation_presence_vr + conversation_buy_decision_vr +
     conversation_action_vr) / 3.0 AS intent_vr
  FROM survey_results
  WHERE gender IS NOT NULL 
    AND age IS NOT NULL 
    AND college_degree IS NOT NULL 
    AND occupation IS NOT NULL
)
SELECT
  id,
  gender,
  age,
  college_degree,
  occupation,
  trust_2d,
  trust_vr,
  uncertainty_2d,
  uncertainty_vr,
  intent_2d,
  intent_vr,
  trust_vr - trust_2d AS trust_diff,
  uncertainty_vr - uncertainty_2d AS uncertainty_diff,
  intent_vr - intent_2d AS intent_diff
FROM calculated_means;
`;

/* -------------------------------------------------------------------------- */
/*                            One-Way ANOVA Function                          */
/* -------------------------------------------------------------------------- */
function performOneWayANOVA(data, groupColumn, valueColumn) {
  // Group data by demographic variable
  const groups = {};
  data.forEach((row) => {
    const groupKey = row[groupColumn];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(Number(row[valueColumn]));
  });

  const groupNames = Object.keys(groups);
  const k = groupNames.length; // number of groups
  let N = 0; // total observations

  // Calculate grand mean
  let grandSum = 0;
  groupNames.forEach((groupName) => {
    const groupValues = groups[groupName];
    N += groupValues.length;
    grandSum += groupValues.reduce((sum, value) => sum + value, 0);
  });
  const grandMean = grandSum / N;

  // Calculate between-group sum of squares (SSB)
  let SSB = 0;
  groupNames.forEach((groupName) => {
    const groupValues = groups[groupName];
    const groupMean = ss.mean(groupValues);
    SSB += groupValues.length * Math.pow(groupMean - grandMean, 2);
  });

  // Calculate within-group sum of squares (SSW)
  let SSW = 0;
  groupNames.forEach((groupName) => {
    const groupValues = groups[groupName];
    const groupMean = ss.mean(groupValues);
    groupValues.forEach((value) => {
      SSW += Math.pow(value - groupMean, 2);
    });
  });

  // Calculate degrees of freedom
  const dfB = k - 1;
  const dfW = N - k;

  // Calculate mean squares
  const MSB = SSB / dfB;
  const MSW = SSW / dfW;

  // Calculate F statistic
  const F = MSB / MSW;

  // Calculate p-value using F-distribution
  const p = 1 - jStat.centralF.cdf(F, dfB, dfW);

  // Calculate group statistics
  const groupStats = {};
  groupNames.forEach((groupName) => {
    const values = groups[groupName];
    groupStats[groupName] = {
      mean: ss.mean(values),
      std: ss.standardDeviation(values),
      count: values.length,
      min: ss.min(values),
      max: ss.max(values),
    };
  });

  return {
    F: F,
    p: p,
    dfB: dfB,
    dfW: dfW,
    SSB: SSB,
    SSW: SSW,
    MSB: MSB,
    MSW: MSW,
    groups: groupStats,
    grandMean: grandMean,
  };
}

/* -------------------------------------------------------------------------- */
/*                         Demographic Analysis Function                      */
/* -------------------------------------------------------------------------- */
async function analyzeDemographicEffects() {
  console.log("=== بخش 4.4: تحلیل تأثیر متغیرهای جمعیت‌شناختی ===\n");

  try {
    const { rows } = await pool.query(DEMOGRAPHIC_QUERY);
    console.log(`تعداد کل داده‌های قابل استفاده: ${rows.length}`);

    if (rows.length === 0) {
      throw new Error("هیچ داده‌ای در پایگاه داده یافت نشد");
    }

    const results = {};
    const demographicVariables = [
      { column: "gender", name: "جنسیت" },
      { column: "age", name: "سن" },
      { column: "college_degree", name: "تحصیلات" },
      { column: "occupation", name: "وضعیت شغلی" },
    ];

    const dependentVariables = [
      { column: "trust_diff", name: "تفاوت اعتماد" },
      { column: "uncertainty_diff", name: "تفاوت عدم قطعیت" },
      { column: "intent_diff", name: "تفاوت تمایل به خرید" },
    ];

    // Analyze each demographic variable
    for (const demographic of demographicVariables) {
      console.log(`\n--- تحلیل ${demographic.name} ---`);
      results[demographic.column] = {};

      // Show distribution of demographic variable
      const distribution = {};
      rows.forEach((row) => {
        const value = row[demographic.column];
        distribution[value] = (distribution[value] || 0) + 1;
      });

      console.log("توزیع گروه‌ها:");
      Object.entries(distribution).forEach(([key, count]) => {
        console.log(
          `  ${key}: ${count} نفر (${((count / rows.length) * 100).toFixed(
            1
          )}%)`
        );
      });

      // Analyze each dependent variable
      for (const dependent of dependentVariables) {
        console.log(`\n${dependent.name}:`);

        const anovaResult = performOneWayANOVA(
          rows,
          demographic.column,
          dependent.column
        );

        // Display group statistics
        Object.entries(anovaResult.groups).forEach(([groupName, stats]) => {
          console.log(
            `  ${groupName}: میانگین=${stats.mean.toFixed(
              3
            )}, انحراف معیار=${stats.std.toFixed(3)}, تعداد=${stats.count}`
          );
        });

        console.log(
          `  آزمون ANOVA: F(${anovaResult.dfB},${
            anovaResult.dfW
          }) = ${anovaResult.F.toFixed(3)}, p = ${anovaResult.p.toFixed(4)}`
        );

        if (anovaResult.p < 0.05) {
          console.log(
            `  *** تأثیر معنادار ${demographic.name} بر ${dependent.name} ***`
          );
        } else {
          console.log(
            `  تأثیر غیر معنادار ${demographic.name} بر ${dependent.name}`
          );
        }

        results[demographic.column][dependent.column] = anovaResult;
      }
    }

    // Generate HTML report
    await generateDemographicHTML(results, rows);

    // Generate summary for text replacement
    generateTextSummary(results);

    return results;
  } catch (error) {
    console.error("خطا در تحلیل جمعیت‌شناختی:", error);
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*                            HTML Report Generation                          */
/* -------------------------------------------------------------------------- */
async function generateDemographicHTML(results, rawData) {
  const htmlContent = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>تحلیل تأثیر متغیرهای جمعیت‌شناختی</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        @font-face {
            font-family: 'B Nazanin';
            src: local('B Nazanin');
            font-weight: normal;
            font-style: normal;
        }
        
        body { 
            font-family: 'B Nazanin', 'Tahoma', sans-serif; 
            margin: 20px; 
            line-height: 1.8;
            font-size: 14px;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        h1, h2, h3 {
            color: #2c3e50;
            font-family: 'B Nazanin', 'Tahoma', sans-serif;
        }
        
        h1 { font-size: 24px; text-align: center; margin-bottom: 30px; }
        h2 { font-size: 20px; margin-top: 40px; margin-bottom: 20px; }
        h3 { font-size: 16px; margin-top: 30px; margin-bottom: 15px; }
        
        .summary-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
        }
        
        .demographic-section {
            margin: 40px 0;
            padding: 25px;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            background: #f8f9fa;
        }
        
        table { 
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 13px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        
        th { 
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            color: white; 
            padding: 12px 8px; 
            text-align: center;
            font-weight: bold;
            font-size: 12px;
        }
        
        td { 
            padding: 10px 8px; 
            text-align: center; 
            border-bottom: 1px solid #ecf0f1;
        }
        
        tr:nth-child(even) { background-color: #f8f9fa; }
        tr:hover { background-color: #e3f2fd; }
        
        .significant { 
            background-color: #ffebee !important; 
            color: #c62828; 
            font-weight: bold; 
        }
        
        .not-significant { 
            background-color: #e8f5e8 !important; 
            color: #2e7d32; 
        }
        
        .chart-container { 
            margin: 30px 0; 
            height: 400px;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .key-findings {
            background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
            color: #2d3436;
            padding: 20px;
            margin: 30px 0;
            border-radius: 10px;
            border-left: 5px solid #e17055;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .stat-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
            border-left: 4px solid #3498db;
        }
        
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin: 10px 0;
        }
        
        .stat-label {
            font-size: 14px;
            color: #7f8c8d;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>۴.۴. تحلیل تأثیر متغیرهای جمعیت‌شناختی بر نتایج پژوهش</h1>
        
        <div class="summary-box">
            <h3>خلاصه نتایج</h3>
            <p>این بخش تأثیر متغیرهای جمعیت‌شناختی (جنسیت، سن، تحصیلات، شغل) بر اثربخشی واقعیت مجازی را بررسی می‌کند</p>
            <p><strong>تعداد کل شرکت‌کنندگان:</strong> ${rawData.length} نفر</p>
        </div>

        ${generateDemographicSectionHTML("gender", "جنسیت", results.gender)}
        ${generateDemographicSectionHTML("age", "سن", results.age)}
        ${generateDemographicSectionHTML(
          "college_degree",
          "تحصیلات",
          results.college_degree
        )}
        ${generateDemographicSectionHTML(
          "occupation",
          "وضعیت شغلی",
          results.occupation
        )}

        <div class="key-findings">
            <h3>نتیجه‌گیری کلی:</h3>
            <div class="stats-grid">
                ${generateConclusionCards(results)}
            </div>
            <p style="margin-top: 20px;">
                بر اساس تحلیل‌های انجام‌شده، متغیرهای جمعیت‌شناختی تأثیرات متفاوتی بر پذیرش و اثربخشی 
                فناوری واقعیت مجازی در حوزه معماری و املاک دارند. این یافته‌ها می‌تواند در طراحی استراتژی‌های 
                بازاریابی هدفمند مورد استفاده قرار گیرد.
            </p>
        </div>
    </div>

    <script>
        Chart.defaults.font.family = "'B Nazanin', 'Tahoma', sans-serif";
        Chart.defaults.font.size = 18;
        
        document.addEventListener('DOMContentLoaded', function() {
            ${generateAllChartsScript(results, rawData)}
        });
    </script>
</body>
</html>`;

  fs.writeFileSync("5-anova.html", htmlContent, "utf8");
  console.log("\n✅ فایل 5-anova.html تولید شد");
}

function generateDemographicSectionHTML(key, name, sectionResults) {
  const trustResult = sectionResults.trust_diff;
  const uncertaintyResult = sectionResults.uncertainty_diff;
  const intentResult = sectionResults.intent_diff;

  return `
    <div class="demographic-section">
        <h2>تأثیر ${name}</h2>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">اعتماد</div>
                <div class="stat-value ${
                  trustResult.p < 0.05 ? "significant" : "not-significant"
                }">
                    p = ${trustResult.p.toFixed(4)}
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-label">عدم قطعیت</div>
                <div class="stat-value ${
                  uncertaintyResult.p < 0.05 ? "significant" : "not-significant"
                }">
                    p = ${uncertaintyResult.p.toFixed(4)}
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-label">تمایل خرید</div>
                <div class="stat-value ${
                  intentResult.p < 0.05 ? "significant" : "not-significant"
                }">
                    p = ${intentResult.p.toFixed(4)}
                </div>
            </div>
        </div>

        ${generateDemographicTable(name, sectionResults)}
        
        <div class="chart-container">
            <canvas id="${key}Chart"></canvas>
        </div>
    </div>`;
}

function generateDemographicTable(demographicName, sectionResults) {
  const trustResult = sectionResults.trust_diff;
  const uncertaintyResult = sectionResults.uncertainty_diff;
  const intentResult = sectionResults.intent_diff;

  const groupNames = Object.keys(trustResult.groups);

  let tableHTML = `
    <table>
        <thead>
            <tr>
                <th rowspan="2">${demographicName}</th>
                <th colspan="4">تفاوت اعتماد (VR - 2D)</th>
                <th colspan="4">تفاوت عدم قطعیت (VR - 2D)</th>
                <th colspan="4">تفاوت تمایل خرید (VR - 2D)</th>
            </tr>
            <tr>
                <th>میانگین</th><th>انحراف معیار</th><th>تعداد</th><th>دامنه</th>
                <th>میانگین</th><th>انحراف معیار</th><th>تعداد</th><th>دامنه</th>
                <th>میانگین</th><th>انحراف معیار</th><th>تعداد</th><th>دامنه</th>
            </tr>
        </thead>
        <tbody>`;

  groupNames.forEach((groupName) => {
    const trustStats = trustResult.groups[groupName];
    const uncertaintyStats = uncertaintyResult.groups[groupName];
    const intentStats = intentResult.groups[groupName];

    tableHTML += `
      <tr>
        <td><strong>${groupName}</strong></td>
        <td>${trustStats.mean.toFixed(3)}</td>
        <td>${trustStats.std.toFixed(3)}</td>
        <td>${trustStats.count}</td>
        <td>${trustStats.min.toFixed(2)} - ${trustStats.max.toFixed(2)}</td>
        <td>${uncertaintyStats.mean.toFixed(3)}</td>
        <td>${uncertaintyStats.std.toFixed(3)}</td>
        <td>${uncertaintyStats.count}</td>
        <td>${uncertaintyStats.min.toFixed(2)} - ${uncertaintyStats.max.toFixed(
      2
    )}</td>
        <td>${intentStats.mean.toFixed(3)}</td>
        <td>${intentStats.std.toFixed(3)}</td>
        <td>${intentStats.count}</td>
        <td>${intentStats.min.toFixed(2)} - ${intentStats.max.toFixed(2)}</td>
      </tr>`;
  });

  tableHTML += `
        </tbody>
        <tfoot>
            <tr style="background-color: #e9ecef; font-weight: bold;">
                <td>آزمون ANOVA</td>
                <td colspan="4" class="${
                  trustResult.p < 0.05 ? "significant" : "not-significant"
                }">
                    F = ${trustResult.F.toFixed(
                      3
                    )}, p = ${trustResult.p.toFixed(4)}
                </td>
                <td colspan="4" class="${
                  uncertaintyResult.p < 0.05 ? "significant" : "not-significant"
                }">
                    F = ${uncertaintyResult.F.toFixed(
                      3
                    )}, p = ${uncertaintyResult.p.toFixed(4)}
                </td>
                <td colspan="4" class="${
                  intentResult.p < 0.05 ? "significant" : "not-significant"
                }">
                    F = ${intentResult.F.toFixed(
                      3
                    )}, p = ${intentResult.p.toFixed(4)}
                </td>
            </tr>
        </tfoot>
    </table>`;

  return tableHTML;
}

function generateAllChartsScript(results, rawData) {
  let chartsScript = "";

  const demographics = [
    { key: "gender", name: "جنسیت" },
    { key: "age", name: "سن" },
    { key: "college_degree", name: "تحصیلات" },
    { key: "occupation", name: "وضعیت شغلی" },
  ];

  demographics.forEach((demo) => {
    const sectionResults = results[demo.key];
    const groupNames = Object.keys(sectionResults.trust_diff.groups);

    chartsScript += `
      // نمودار ${demo.name}
      const ${demo.key}Ctx = document.getElementById('${
      demo.key
    }Chart').getContext('2d');
      new Chart(${demo.key}Ctx, {
          type: 'bar',
          data: {
              labels: ${JSON.stringify(groupNames)},
              datasets: [{
                  label: 'تفاوت اعتماد',
                  data: ${JSON.stringify(
                    groupNames.map(
                      (name) => sectionResults.trust_diff.groups[name].mean
                    )
                  )},
                  backgroundColor: 'rgba(52, 152, 219, 0.7)',
                  borderColor: 'rgba(52, 152, 219, 1)',
                  borderWidth: 2
              }, {
                  label: 'تفاوت عدم قطعیت',
                  data: ${JSON.stringify(
                    groupNames.map(
                      (name) =>
                        sectionResults.uncertainty_diff.groups[name].mean
                    )
                  )},
                  backgroundColor: 'rgba(231, 76, 60, 0.7)',
                  borderColor: 'rgba(231, 76, 60, 1)',
                  borderWidth: 2
              }, {
                  label: 'تفاوت تمایل خرید',
                  data: ${JSON.stringify(
                    groupNames.map(
                      (name) => sectionResults.intent_diff.groups[name].mean
                    )
                  )},
                  backgroundColor: 'rgba(46, 204, 113, 0.7)',
                  borderColor: 'rgba(46, 204, 113, 1)',
                  borderWidth: 2
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                  title: {
                      display: true,
                      text: 'تأثیر ${demo.name} بر اثربخشی واقعیت مجازی',
                      font: { size: 16, weight: 'bold' }
                  },
                  legend: {
                      position: 'top',
                      labels: { padding: 20 }
                  }
              },
              scales: {
                  x: {
                      title: {
                          display: true,
                          text: '${demo.name}',
                          font: { size: 14, weight: 'bold' }
                      }
                  },
                  y: {
                      beginAtZero: true,
                      title: {
                          display: true,
                          text: 'میانگین تفاوت (VR - 2D)',
                          font: { size: 14, weight: 'bold' }
                      }
                  }
              }
          }
      });
      `;
  });

  return chartsScript;
}

function generateConclusionCards(results) {
  const demographics = [
    { key: "gender", name: "جنسیت" },
    { key: "age", name: "سن" },
    { key: "college_degree", name: "تحصیلات" },
    { key: "occupation", name: "وضعیت شغلی" },
  ];

  return demographics
    .map((demo) => {
      const trustP = results[demo.key].trust_diff.p;
      const status = trustP < 0.05 ? "معنادار" : "غیر معنادار";
      const color = trustP < 0.05 ? "#e74c3c" : "#27ae60";

      return `
      <div class="stat-card" style="border-left-color: ${color}">
        <div class="stat-label">${demo.name}</div>
        <div class="stat-value" style="color: ${color}">
          ${status}
        </div>
        <div class="stat-label">p = ${trustP.toFixed(4)}</div>
      </div>
    `;
    })
    .join("");
}

/* -------------------------------------------------------------------------- */
/*                         Text Summary Generation                            */
/* -------------------------------------------------------------------------- */
function generateTextSummary(results) {
  console.log("\n=== خلاصه نتایج برای جایگزینی در متن ===");

  const demographics = [
    { key: "gender", name: "جنسیت" },
    { key: "age", name: "سن" },
    { key: "college_degree", name: "تحصیلات" },
    { key: "occupation", name: "وضعیت شغلی" },
  ];

  demographics.forEach((demo) => {
    const trustResult = results[demo.key].trust_diff;
    const uncertaintyResult = results[demo.key].uncertainty_diff;
    const intentResult = results[demo.key].intent_diff;

    console.log(`\n${demo.name}:`);
    console.log(
      `  - تأثیر بر اعتماد: F = ${trustResult.F.toFixed(
        3
      )}, p = ${trustResult.p.toFixed(4)} ${
        trustResult.p < 0.05 ? "(معنادار)" : "(غیر معنادار)"
      }`
    );
    console.log(
      `  - تأثیر بر عدم قطعیت: F = ${uncertaintyResult.F.toFixed(
        3
      )}, p = ${uncertaintyResult.p.toFixed(4)} ${
        uncertaintyResult.p < 0.05 ? "(معنادار)" : "(غیر معنادار)"
      }`
    );
    console.log(
      `  - تأثیر بر تمایل خرید: F = ${intentResult.F.toFixed(
        3
      )}, p = ${intentResult.p.toFixed(4)} ${
        intentResult.p < 0.05 ? "(معنادار)" : "(غیر معنادار)"
      }`
    );

    // Find best performing group
    let bestGroup = "";
    let highestMean = -Infinity;
    Object.entries(trustResult.groups).forEach(([groupName, stats]) => {
      if (stats.mean > highestMean) {
        highestMean = stats.mean;
        bestGroup = groupName;
      }
    });
    console.log(
      `  - بهترین گروه: ${bestGroup} (میانگین تفاوت اعتماد: ${highestMean.toFixed(
        3
      )})`
    );
  });

  // Generate replacement text
  const replacements = {
    genderP: results.gender.trust_diff.p.toFixed(4),
    ageP: results.age.trust_diff.p.toFixed(4),
    educationP: results.college_degree.trust_diff.p.toFixed(4),
    occupationP: results.occupation.trust_diff.p.toFixed(4),
  };

  console.log("\n=== مقادیر برای جایگزینی در متن ===");
  console.log(`p-value جنسیت: ${replacements.genderP}`);
  console.log(`p-value سن: ${replacements.ageP}`);
  console.log(`p-value تحصیلات: ${replacements.educationP}`);
  console.log(`p-value وضعیت شغلی: ${replacements.occupationP}`);

  return replacements;
}

/* -------------------------------------------------------------------------- */
/*                                Main Execution                              */
/* -------------------------------------------------------------------------- */
(async () => {
  try {
    const results = await analyzeDemographicEffects();
    console.log("\n✅ تحلیل جمعیت‌شناختی با موفقیت تکمیل شد");
    console.log("📄 فایل demographic_analysis.html آماده مشاهده است");
  } catch (error) {
    console.error("❌ خطا در اجرای تحلیل:", error.message);
  } finally {
    await pool.end();
  }
})();

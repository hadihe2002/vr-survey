import { pool } from "../pool.js";
import fs from "fs";

// آزمون نرمال بودن جارک-برا
function jarqueBera(data) {
  const n = data.length;
  const mean = data.reduce((sum, val) => sum + val, 0) / n;
  const variance =
    data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  // محاسبه skewness و kurtosis
  const skewness =
    data.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / n;
  const kurtosis =
    data.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 4), 0) / n;

  // آماره جارک-برا
  const JB = (n / 6) * (Math.pow(skewness, 2) + Math.pow(kurtosis - 3, 2) / 4);

  // تبدیل به p-value (تقریبی با توزیع کای-دو با 2 درجه آزادی)
  const pValue = 1 - chiSquareCDF(JB, 2);

  return {
    JB: Number(JB.toFixed(4)),
    pValue: Number(pValue.toFixed(4)),
    skewness: Number(skewness.toFixed(4)),
    kurtosis: Number(kurtosis.toFixed(4)),
    isNormal: pValue > 0.05,
  };
}

// تقریب تابع توزیع کای-دو
function chiSquareCDF(x, df) {
  if (x <= 0) return 0;
  return gammaIncomplete(df / 2, x / 2) / gamma(df / 2);
}

function gamma(z) {
  const g = 7;
  const C = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];

  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));

  z -= 1;
  let x = C[0];
  for (let i = 1; i < g + 2; i++) {
    x += C[i] / (z + i);
  }
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

function gammaIncomplete(a, x) {
  if (x === 0) return 0;
  if (x < 0 || a <= 0) return NaN;

  let sum = 0;
  let term = 1 / a;
  let n = 0;

  while (Math.abs(term) > 1e-15 && n < 100) {
    sum += term;
    n++;
    term *= x / (a + n);
  }

  return Math.pow(x, a) * Math.exp(-x) * sum;
}

// محاسبه هیستوگرام
function calculateHistogram(data, bins = 10) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / bins;

  const histogram = Array(bins).fill(0);
  const binLabels = [];

  for (let i = 0; i < bins; i++) {
    binLabels.push(Number((min + i * binWidth).toFixed(2)));
  }

  data.forEach((value) => {
    const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
    histogram[binIndex]++;
  });

  return { histogram, binLabels, binWidth };
}

// تولید جدول آزمون نرمال بودن
function generateNormalityTable(normalityResults) {
  return `
  <style>
    @font-face {
      font-family: 'B Nazanin';
      src: local('B Nazanin');
      font-weight: normal;
      font-style: normal;
    }

    body {
      font-family: "B Nazanin";
      font-size: 18px;
    }
  </style>
<table border="1" style="border-collapse: collapse; width: 100%; text-align: center;">
<caption><b>جدول ۴.۲: نتایج آزمون نرمال بودن توزیع (آزمون جارک-برا)</b></caption>
<thead>
  <tr style="background-color: #f2f2f2;">
    <th>متغیر</th>
    <th>حالت</th>
    <th>آماره JB</th>
    <th>مقدار p</th>
    <th>چولگی</th>
    <th>کشیدگی</th>
    <th>توزیع نرمال</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td rowspan="2"><b>کاهش عدم‌قطعیت</b></td>
    <td>تصاویر دوبعدی</td>
    <td>${normalityResults.uncertainty_2d.JB}</td>
    <td>${normalityResults.uncertainty_2d.pValue}</td>
    <td>${normalityResults.uncertainty_2d.skewness}</td>
    <td>${normalityResults.uncertainty_2d.kurtosis}</td>
    <td>${normalityResults.uncertainty_2d.isNormal ? "✓" : "✗"}</td>
  </tr>
  <tr>
    <td>واقعیت مجازی</td>
    <td>${normalityResults.uncertainty_vr.JB}</td>
    <td>${normalityResults.uncertainty_vr.pValue}</td>
    <td>${normalityResults.uncertainty_vr.skewness}</td>
    <td>${normalityResults.uncertainty_vr.kurtosis}</td>
    <td>${normalityResults.uncertainty_vr.isNormal ? "✓" : "✗"}</td>
  </tr>
  <tr>
    <td rowspan="2"><b>افزایش اعتماد</b></td>
    <td>تصاویر دوبعدی</td>
    <td>${normalityResults.trust_2d.JB}</td>
    <td>${normalityResults.trust_2d.pValue}</td>
    <td>${normalityResults.trust_2d.skewness}</td>
    <td>${normalityResults.trust_2d.kurtosis}</td>
    <td>${normalityResults.trust_2d.isNormal ? "✓" : "✗"}</td>
  </tr>
  <tr>
    <td>واقعیت مجازی</td>
    <td>${normalityResults.trust_vr.JB}</td>
    <td>${normalityResults.trust_vr.pValue}</td>
    <td>${normalityResults.trust_vr.skewness}</td>
    <td>${normalityResults.trust_vr.kurtosis}</td>
    <td>${normalityResults.trust_vr.isNormal ? "✓" : "✗"}</td>
  </tr>
  <tr>
    <td rowspan="2"><b>تمایل به خرید</b></td>
    <td>تصاویر دوبعدی</td>
    <td>${normalityResults.purchase_intent_2d.JB}</td>
    <td>${normalityResults.purchase_intent_2d.pValue}</td>
    <td>${normalityResults.purchase_intent_2d.skewness}</td>
    <td>${normalityResults.purchase_intent_2d.kurtosis}</td>
    <td>${normalityResults.purchase_intent_2d.isNormal ? "✓" : "✗"}</td>
  </tr>
  <tr>
    <td>واقعیت مجازی</td>
    <td>${normalityResults.purchase_intent_vr.JB}</td>
    <td>${normalityResults.purchase_intent_vr.pValue}</td>
    <td>${normalityResults.purchase_intent_vr.skewness}</td>
    <td>${normalityResults.purchase_intent_vr.kurtosis}</td>
    <td>${normalityResults.purchase_intent_vr.isNormal ? "✓" : "✗"}</td>
  </tr>
</tbody>
</table>`;
}

// تولید نمودارهای توزیع
function generateDistributionCharts(variables) {
  const charts = [];

  const variableNames = {
    uncertainty: "کاهش عدم‌قطعیت",
    trust: "افزایش اعتماد",
    purchase_intent: "تمایل به خرید",
  };

  Object.keys(variableNames).forEach((variable, index) => {
    const data2d = variables[`${variable}_2d`];
    const dataVr = variables[`${variable}_vr`];

    const hist2d = calculateHistogram(data2d);
    const histVr = calculateHistogram(dataVr);

    charts.push(`
      <style>
        @font-face {
          font-family: 'B Nazanin';
          src: local('B Nazanin');
          font-weight: normal;
          font-style: normal;
        }

        body {
          font-family: 'B Nazanin';
          font-size: 18px;
        }
      </style>

    <div class="chart-container" style="width: 100%; margin: 30px 0;">
      <h3>شکل ۴.${index + 2}: توزیع ${variableNames[variable]}</h3>
      <canvas id="dist_${variable}" style="max-height: 400px;"></canvas>
    </div>
    
    <script>
    Chart.defaults.font.family = "'B Nazanin', 'Tahoma', sans-serif";
    Chart.defaults.font.size = "18";

    new Chart(document.getElementById('dist_${variable}'), {
        type: 'bar',
        data: {
            labels: ${JSON.stringify(
              hist2d.binLabels.map((x) => x.toFixed(1))
            )},
            datasets: [{
                label: 'تصاویر دوبعدی',
                data: ${JSON.stringify(hist2d.histogram)},
                backgroundColor: 'rgba(52, 152, 219, 0.7)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 1
            }, {
                label: 'واقعیت مجازی',  
                data: ${JSON.stringify(histVr.histogram)},
                backgroundColor: 'rgba(231, 76, 60, 0.7)',
                borderColor: 'rgba(231, 76, 60, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'توزیع فراوانی ${variableNames[variable]}'
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'بازه امتیاز'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'فراوانی'
                    }
                }
            }
        }
    });
    </script>`);
  });

  return charts.join("\n");
}

// استخراج متغیرهای اصلی (همان تابع قبلی)
function extractMainVariables(surveyData) {
  const results = {
    uncertainty_2d: [],
    uncertainty_vr: [],
    trust_2d: [],
    trust_vr: [],
    purchase_intent_2d: [],
    purchase_intent_vr: [],
  };

  surveyData.forEach((record) => {
    const uncertainty_2d =
      (record.uncertainty_real_presence_2d +
        record.uncertainty_clarity_2d +
        record.uncertainty_details_decision_2d +
        record.uncertainty_enough_details_2d) /
      4;
    const uncertainty_vr =
      (record.uncertainty_real_presence_vr +
        record.uncertainty_clarity_vr +
        record.uncertainty_details_decision_vr +
        record.uncertainty_enough_details_vr) /
      4;

    const trust_2d =
      (record.trust_analyze_2d +
        record.trust_imagination_2d +
        record.trust_view_2d +
        record.trust_materials_2d +
        record.trust_details_2d +
        record.trust_developer_2d) /
      6;
    const trust_vr =
      (record.trust_analyze_vr +
        record.trust_imagination_vr +
        record.trust_materials_vr +
        record.trust_details_vr +
        record.trust_developer_vr) /
      5;

    const purchase_intent_2d =
      (record.conversation_presence_2d +
        record.conversation_buy_decision_2d +
        record.conversation_action_2d) /
      3;
    const purchase_intent_vr =
      (record.conversation_presence_vr +
        record.conversation_buy_decision_vr +
        record.conversation_action_vr) /
      3;

    results.uncertainty_2d.push(Number(uncertainty_2d.toFixed(3)));
    results.uncertainty_vr.push(Number(uncertainty_vr.toFixed(3)));
    results.trust_2d.push(Number(trust_2d.toFixed(3)));
    results.trust_vr.push(Number(trust_vr.toFixed(3)));
    results.purchase_intent_2d.push(Number(purchase_intent_2d.toFixed(3)));
    results.purchase_intent_vr.push(Number(purchase_intent_vr.toFixed(3)));
  });

  return results;
}

console.log("=== آزمون نرمال بودن و توزیع داده‌ها ===");

pool.query("SELECT * FROM survey_results").then(({ rows: surveyData }) => {
  const variables = extractMainVariables(surveyData);

  // آزمون نرمال بودن برای تمام متغیرها
  const normalityResults = {};
  Object.keys(variables).forEach((key) => {
    normalityResults[key] = jarqueBera(variables[key]);
  });

  console.log("نتایج آزمون نرمال بودن:");
  console.table(normalityResults);

  console.log("\n=== خلاصه نتایج ===");
  Object.keys(normalityResults).forEach((key) => {
    const result = normalityResults[key];
    console.log(
      `${key}: ${result.isNormal ? "نرمال" : "غیر نرمال"} (p = ${
        result.pValue
      })`
    );
  });

  // تولید فایل HTML کامل
  const htmlContent = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>آزمون نرمال بودن و توزیع داده‌ها</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { 
            font-family: 'Tahoma', sans-serif; 
            margin: 20px; 
            line-height: 1.8;
        }
        table { 
            margin: 20px auto; 
            border-collapse: collapse;
        }
        .chart-container { 
            margin: 30px 0; 
            text-align: center; 
        }
        .results-summary {
            background-color: #f8f9fa;
            padding: 15px;
            border-right: 4px solid #007bff;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <h2>آزمون نرمال بودن توزیع داده‌ها</h2>
    
    <div class="results-summary">
        <h3>خلاصه نتایج آزمون جارک-برا:</h3>
        <ul>
            ${Object.keys(normalityResults)
              .map((key) => {
                const result = normalityResults[key];
                const name = key.includes("uncertainty")
                  ? "عدم‌قطعیت"
                  : key.includes("trust")
                  ? "اعتماد"
                  : "تمایل به خرید";
                const condition = key.includes("2d")
                  ? "دوبعدی"
                  : "واقعیت مجازی";
                return `<li><strong>${name} (${condition}):</strong> ${
                  result.isNormal ? "نرمال" : "غیر نرمال"
                } - p = ${result.pValue}</li>`;
              })
              .join("")}
        </ul>
    </div>

    ${generateNormalityTable(normalityResults)}
    
    <h3>نمودارهای توزیع متغیرها</h3>
    ${generateDistributionCharts(variables)}
    
</body>
</html>`;

  fs.writeFileSync("3-normality-test.html", htmlContent);
  console.log("\n=== فایل 3-normality-test.html تولید شد ===");

  // آماده‌سازی برای t-test در مرحله بعد
  console.log("\n=== آماده برای t-test ===");
  console.log("متغیرهای نرمال که می‌توانند از paired t-test استفاده کنند:");
  Object.keys(normalityResults).forEach((key) => {
    if (normalityResults[key].isNormal) {
      console.log(`✓ ${key}`);
    }
  });

  console.log("\nمتغیرهای غیر نرمال که باید از Wilcoxon استفاده کنند:");
  Object.keys(normalityResults).forEach((key) => {
    if (!normalityResults[key].isNormal) {
      console.log(`✗ ${key}`);
    }
  });

  pool.end();
});

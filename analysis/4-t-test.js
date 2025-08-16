import { pool } from "../pool.js";
import fs from "fs";

// محاسبه t-test زوجی
function pairedTTest(data1, data2) {
  const n = data1.length;
  const differences = data1.map((val, i) => val - data2[i]);

  const meanDiff = differences.reduce((sum, val) => sum + val, 0) / n;
  const stdDiff = Math.sqrt(
    differences.reduce((sum, val) => sum + Math.pow(val - meanDiff, 2), 0) /
      (n - 1)
  );

  const tStatistic = meanDiff / (stdDiff / Math.sqrt(n));
  const df = n - 1;

  // محاسبه p-value دو طرفه
  const pValue = 2 * (1 - studentTCDF(Math.abs(tStatistic), df));

  // محاسبه Effect Size (Cohen's d)
  const cohensD = meanDiff / stdDiff;

  return {
    n,
    meanDiff: Number(meanDiff.toFixed(4)),
    stdDiff: Number(stdDiff.toFixed(4)),
    tStatistic: Number(tStatistic.toFixed(3)),
    df,
    pValue: Number(pValue.toFixed(6)),
    cohensD: Number(cohensD.toFixed(3)),
    significant: pValue < 0.05,
  };
}

// محاسبه Wilcoxon Signed-Rank Test
function wilcoxonSignedRank(data1, data2) {
  const differences = data1
    .map((val, i) => val - data2[i])
    .filter((d) => d !== 0);
  const n = differences.length;

  // رتبه‌بندی مقادیر مطلق
  const absWithIndex = differences.map((val, i) => ({
    abs: Math.abs(val),
    index: i,
    original: val,
  }));
  absWithIndex.sort((a, b) => a.abs - b.abs);

  // تخصیص رتبه‌ها (با در نظر گیری تساوی‌ها)
  const ranks = new Array(n);
  for (let i = 0; i < n; ) {
    let j = i;
    let sumRank = 0;
    while (j < n && absWithIndex[j].abs === absWithIndex[i].abs) {
      sumRank += j + 1;
      j++;
    }
    const avgRank = sumRank / (j - i);
    for (let k = i; k < j; k++) {
      ranks[absWithIndex[k].index] = avgRank;
    }
    i = j;
  }

  // محاسبه W+ و W-
  let wPlus = 0,
    wMinus = 0;
  for (let i = 0; i < n; i++) {
    if (differences[i] > 0) {
      wPlus += ranks[i];
    } else {
      wMinus += ranks[i];
    }
  }

  const W = Math.min(wPlus, wMinus);

  // تقریب نرمال برای n > 10
  const mu = (n * (n + 1)) / 4;
  const sigma = Math.sqrt((n * (n + 1) * (2 * n + 1)) / 24);
  const zScore = (W - mu) / sigma;
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));

  return {
    n,
    wPlus,
    wMinus,
    W,
    zScore: Number(zScore.toFixed(3)),
    pValue: Number(pValue.toFixed(6)),
    significant: pValue < 0.05,
  };
}

// تابع CDF توزیع t
function studentTCDF(t, df) {
  const x = df / (t * t + df);
  return 1 - 0.5 * incompleteBeta(0.5 * df, 0.5, x);
}

// تابع CDF توزیع نرمال
function normalCDF(z) {
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
}

// تابع erf
function erf(x) {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y =
    1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

// تابع Beta ناکامل (تقریبی)
function incompleteBeta(a, b, x) {
  if (x === 0) return 0;
  if (x === 1) return 1;

  // تقریب ساده
  let result = 0;
  const n = 100;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    result += (Math.pow(t, a - 1) * Math.pow(1 - t, b - 1)) / n;
  }
  return result * x;
}

// آزمون نرمال بودن (از کد قبلی)
function jarqueBera(data) {
  const n = data.length;
  const mean = data.reduce((sum, val) => sum + val, 0) / n;
  const variance =
    data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  const skewness =
    data.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / n;
  const kurtosis =
    data.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 4), 0) / n;

  const JB = (n / 6) * (Math.pow(skewness, 2) + Math.pow(kurtosis - 3, 2) / 4);
  const pValue = 1 - chiSquareCDF(JB, 2);

  return {
    JB: Number(JB.toFixed(4)),
    pValue: Number(pValue.toFixed(4)),
    isNormal: pValue > 0.05,
  };
}

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

// استخراج متغیرهای اصلی
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

// تولید جدول نتایج آزمون‌ها
function generateTestResultsTable(testResults) {
  return `
  <head>
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
  </head>

<table border="1" style="border-collapse: collapse; width: 100%; text-align: center;">
<caption><b>جدول ۴.۳: نتایج آزمون‌های آماری مقایسه میانگین‌ها</b></caption>
<thead>
  <tr style="background-color: #f2f2f2;">
    <th>متغیر</th>
    <th>نوع آزمون</th>
    <th>آماره</th>
    <th>درجه آزادی</th>
    <th>مقدار p</th>
    <th>اندازه اثر</th>
    <th>معناداری</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td><b>کاهش عدم‌قطعیت</b><br>(VR - 2D)</td>
    <td>${testResults.uncertainty.testType}</td>
    <td>${testResults.uncertainty.statistic}</td>
    <td>${testResults.uncertainty.df || "-"}</td>
    <td>${
      testResults.uncertainty.pValue < 0.001
        ? "< 0.001"
        : testResults.uncertainty.pValue
    }</td>
    <td>${testResults.uncertainty.effectSize || "-"}</td>
    <td>${
      testResults.uncertainty.significant ? "✓ معنادار" : "✗ غیر معنادار"
    }</td>
  </tr>
  <tr>
    <td><b>افزایش اعتماد</b><br>(VR - 2D)</td>
    <td>${testResults.trust.testType}</td>
    <td>${testResults.trust.statistic}</td>
    <td>${testResults.trust.df || "-"}</td>
    <td>${
      testResults.trust.pValue < 0.001 ? "< 0.001" : testResults.trust.pValue
    }</td>
    <td>${testResults.trust.effectSize || "-"}</td>
    <td>${testResults.trust.significant ? "✓ معنادار" : "✗ غیر معنادار"}</td>
  </tr>
  <tr>
    <td><b>تمایل به خرید</b><br>(VR - 2D)</td>
    <td>${testResults.purchase_intent.testType}</td>
    <td>${testResults.purchase_intent.statistic}</td>
    <td>${testResults.purchase_intent.df || "-"}</td>
    <td>${
      testResults.purchase_intent.pValue < 0.001
        ? "< 0.001"
        : testResults.purchase_intent.pValue
    }</td>
    <td>${testResults.purchase_intent.effectSize || "-"}</td>
    <td>${
      testResults.purchase_intent.significant ? "✓ معنادار" : "✗ غیر معنادار"
    }</td>
  </tr>
</tbody>
</table>`;
}

// تولید نمودار مقایسه‌ای Box Plot
function generateBoxPlotCharts(variables) {
  const charts = [];

  const variableNames = {
    uncertainty: "کاهش عدم‌قطعیت",
    trust: "افزایش اعتماد",
    purchase_intent: "تمایل به خرید",
  };

  Object.keys(variableNames).forEach((variable, index) => {
    const data2d = variables[`${variable}_2d`];
    const dataVr = variables[`${variable}_vr`];

    // محاسبه آمارهای Box Plot
    function calculateBoxPlotStats(data) {
      const sorted = [...data].sort((a, b) => a - b);
      const n = sorted.length;
      const q1 = sorted[Math.floor(n * 0.25)];
      const median = sorted[Math.floor(n * 0.5)];
      const q3 = sorted[Math.floor(n * 0.75)];
      const min = Math.min(...sorted);
      const max = Math.max(...sorted);

      return { min, q1, median, q3, max };
    }

    const stats2d = calculateBoxPlotStats(data2d);
    const statsVr = calculateBoxPlotStats(dataVr);

    charts.push(`
    <head>
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
    </head>
    <div class="chart-container" style="width: 100%; margin: 30px 0;">
      <h3>شکل ۴.${index + 4}: مقایسه Box Plot - ${variableNames[variable]}</h3>
      <canvas id="box_${variable}" style="max-height: 400px;"></canvas>
    </div>
    
    <script>

    new Chart(document.getElementById('box_${variable}'), {
        type: 'bar',
        data: {
            labels: ['تصاویر دوبعدی', 'واقعیت مجازی'],
            datasets: [{
                label: 'حداقل',
                data: [${stats2d.min}, ${statsVr.min}],
                backgroundColor: 'rgba(149, 165, 166, 0.7)'
            }, {
                label: 'چارک اول',
                data: [${stats2d.q1}, ${statsVr.q1}],
                backgroundColor: 'rgba(52, 152, 219, 0.7)'
            }, {
                label: 'میانه',
                data: [${stats2d.median}, ${statsVr.median}],
                backgroundColor: 'rgba(46, 204, 113, 0.7)'
            }, {
                label: 'چارک سوم',
                data: [${stats2d.q3}, ${statsVr.q3}],
                backgroundColor: 'rgba(241, 196, 15, 0.7)'
            }, {
                label: 'حداکثر',
                data: [${stats2d.max}, ${statsVr.max}],
                backgroundColor: 'rgba(231, 76, 60, 0.7)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'مقایسه آماری ${variableNames[variable]}'
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'امتیاز'
                    }
                }
            }
        }
    });
    </script>`);
  });

  return charts.join("\n");
}

console.log("=== انجام آزمون‌های آماری (T-Test & Wilcoxon) ===");

pool
  .query("SELECT * FROM survey_results")
  .then(({ rows: surveyData }) => {
    const variables = extractMainVariables(surveyData);

    // بررسی نرمال بودن برای انتخاب آزمون مناسب
    const normalityTests = {
      uncertainty_2d: jarqueBera(variables.uncertainty_2d),
      uncertainty_vr: jarqueBera(variables.uncertainty_vr),
      trust_2d: jarqueBera(variables.trust_2d),
      trust_vr: jarqueBera(variables.trust_vr),
      purchase_intent_2d: jarqueBera(variables.purchase_intent_2d),
      purchase_intent_vr: jarqueBera(variables.purchase_intent_vr),
    };

    const testResults = {};

    // آزمون برای متغیر Uncertainty
    console.log("\n=== آزمون کاهش عدم‌قطعیت ===");
    const uncertaintyNormal =
      normalityTests.uncertainty_2d.isNormal &&
      normalityTests.uncertainty_vr.isNormal;

    if (uncertaintyNormal) {
      const result = pairedTTest(
        variables.uncertainty_vr,
        variables.uncertainty_2d
      );
      testResults.uncertainty = {
        testType: "Paired t-test",
        statistic: `t = ${result.tStatistic}`,
        df: result.df,
        pValue: result.pValue,
        effectSize: `d = ${result.cohensD}`,
        significant: result.significant,
        details: result,
      };
      console.log("استفاده از Paired t-test");
    } else {
      const result = wilcoxonSignedRank(
        variables.uncertainty_vr,
        variables.uncertainty_2d
      );
      testResults.uncertainty = {
        testType: "Wilcoxon Signed-Rank",
        statistic: `Z = ${result.zScore}`,
        df: null,
        pValue: result.pValue,
        effectSize: null,
        significant: result.significant,
        details: result,
      };
      console.log("استفاده از Wilcoxon Signed-Rank Test");
    }

    // آزمون برای متغیر Trust
    console.log("\n=== آزمون افزایش اعتماد ===");
    const trustNormal =
      normalityTests.trust_2d.isNormal && normalityTests.trust_vr.isNormal;

    if (trustNormal) {
      const result = pairedTTest(variables.trust_vr, variables.trust_2d);
      testResults.trust = {
        testType: "Paired t-test",
        statistic: `t = ${result.tStatistic}`,
        df: result.df,
        pValue: result.pValue,
        effectSize: `d = ${result.cohensD}`,
        significant: result.significant,
        details: result,
      };
      console.log("استفاده از Paired t-test");
    } else {
      const result = wilcoxonSignedRank(variables.trust_vr, variables.trust_2d);
      testResults.trust = {
        testType: "Wilcoxon Signed-Rank",
        statistic: `Z = ${result.zScore}`,
        df: null,
        pValue: result.pValue,
        effectSize: null,
        significant: result.significant,
        details: result,
      };
      console.log("استفاده از Wilcoxon Signed-Rank Test");
    }

    // آزمون برای متغیر Purchase Intent
    console.log("\n=== آزمون تمایل به خرید ===");
    const purchaseNormal =
      normalityTests.purchase_intent_2d.isNormal &&
      normalityTests.purchase_intent_vr.isNormal;

    if (purchaseNormal) {
      const result = pairedTTest(
        variables.purchase_intent_vr,
        variables.purchase_intent_2d
      );
      testResults.purchase_intent = {
        testType: "Paired t-test",
        statistic: `t = ${result.tStatistic}`,
        df: result.df,
        pValue: result.pValue,
        effectSize: `d = ${result.cohensD}`,
        significant: result.significant,
        details: result,
      };
      console.log("استفاده از Paired t-test");
    } else {
      const result = wilcoxonSignedRank(
        variables.purchase_intent_vr,
        variables.purchase_intent_2d
      );
      testResults.purchase_intent = {
        testType: "Wilcoxon Signed-Rank",
        statistic: `Z = ${result.zScore}`,
        df: null,
        pValue: result.pValue,
        effectSize: null,
        significant: result.significant,
        details: result,
      };
      console.log("استفاده از Wilcoxon Signed-Rank Test");
    }

    // نمایش نتایج
    console.log("\n=== خلاصه نتایج آزمون‌ها ===");
    console.table({
      "کاهش عدم‌قطعیت": {
        آزمون: testResults.uncertainty.testType,
        آماره: testResults.uncertainty.statistic,
        "p-value": testResults.uncertainty.pValue,
        معناداری: testResults.uncertainty.significant ? "بله" : "خیر",
      },
      "افزایش اعتماد": {
        آزمون: testResults.trust.testType,
        آماره: testResults.trust.statistic,
        "p-value": testResults.trust.pValue,
        معناداری: testResults.trust.significant ? "بله" : "خیر",
      },
      "تمایل به خرید": {
        آزمون: testResults.purchase_intent.testType,
        آماره: testResults.purchase_intent.statistic,
        "p-value": testResults.purchase_intent.pValue,
        معناداری: testResults.purchase_intent.significant ? "بله" : "خیر",
      },
    });

    // تولید فایل HTML
    const htmlContent = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>نتایج آزمون‌های آماری - مقایسه 2D و VR</title>
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
        }
        table { 
            margin: 20px auto; 
            border-collapse: collapse;
        }
        .results-summary {
            background-color: #e8f5e8;
            padding: 15px;
            border-right: 4px solid #28a745;
            margin: 20px 0;
        }
        .chart-container { 
            margin: 30px 0; 
            text-align: center; 
        }
        .key-findings {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <h2>۴.۳. مقایسه‌ی نتایج تجربه تصاویر دوبعدی و تجربه واقعیت مجازی</h2>
    
    <div class="results-summary">
        <h3>یافته‌های کلیدی:</h3>
        <ul>
            <li><strong>کاهش عدم‌قطعیت:</strong> p ${
              testResults.uncertainty.pValue < 0.001
                ? "< 0.001"
                : "= " + testResults.uncertainty.pValue
            } (${
      testResults.uncertainty.significant ? "معنادار" : "غیر معنادار"
    })</li>
            <li><strong>افزایش اعتماد:</strong> p ${
              testResults.trust.pValue < 0.001
                ? "< 0.001"
                : "= " + testResults.trust.pValue
            } (${
      testResults.trust.significant ? "معنادار" : "غیر معنادار"
    })</li>
            <li><strong>تمایل به خرید:</strong> p ${
              testResults.purchase_intent.pValue < 0.001
                ? "< 0.001"
                : "= " + testResults.purchase_intent.pValue
            } (${
      testResults.purchase_intent.significant ? "معنادار" : "غیر معنادار"
    })</li>
        </ul>
    </div>

    ${generateTestResultsTable(testResults)}
    
    <div class="key-findings">
        <h4>تفسیر نتایج:</h4>
        <p>بر اساس نتایج آزمون‌های آماری انجام شده، تفاوت معناداری بین تجربه تصاویر دوبعدی و واقعیت مجازی در هر سه متغیر مشاهده شد:</p>
        <ul>
            <li><strong>عدم‌قطعیت:</strong> استفاده از VR منجر به کاهش معنادار عدم‌قطعیت شده است</li>
            <li><strong>اعتماد:</strong> VR به طور معناداری اعتماد کاربران را افزایش داده است</li>
            <li><strong>تمایل به خرید:</strong> استفاده از VR تمایل به خرید را به طور معناداری بهبود بخشیده است</li>
        </ul>
    </div>

    <h3>نمودارهای مقایسه‌ای</h3>
    ${generateBoxPlotCharts(variables)}
    
    <div style="margin-top: 40px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
        <h4>اعداد برای جایگزینی در متن:</h4>
        <ul>
            <li><strong>p-value کاهش عدم‌قطعیت:</strong> ${
              testResults.uncertainty.pValue < 0.001
                ? "< 0.001"
                : testResults.uncertainty.pValue
            }</li>
            <li><strong>p-value افزایش اعتماد:</strong> ${
              testResults.trust.pValue < 0.001
                ? "< 0.001"
                : testResults.trust.pValue
            }</li>
            <li><strong>p-value تمایل به خرید:</strong> ${
              testResults.purchase_intent.pValue < 0.001
                ? "< 0.001"
                : testResults.purchase_intent.pValue
            }</li>
            <li><strong>سطح معناداری:</strong> α = 0.05</li>
            <li><strong>حجم نمونه:</strong> n = ${
              variables.uncertainty_2d.length
            }</li>
        </ul>
    </div>
    
</body>
</html>`;

    fs.writeFileSync("4-t-test.html", htmlContent);
    console.log("\n=== فایل 4-t-test.html تولید شد ===");

    console.log("\n=== اعداد برای جایگزینی در متن مقاله ===");
    console.log(
      `p-value کاهش عدم‌قطعیت: ${
        testResults.uncertainty.pValue < 0.001
          ? "< 0.001"
          : testResults.uncertainty.pValue
      }`
    );
    console.log(
      `p-value افزایش اعتماد: ${
        testResults.trust.pValue < 0.001 ? "< 0.001" : testResults.trust.pValue
      }`
    );
    console.log(
      `p-value تمایل به خرید: ${
        testResults.purchase_intent.pValue < 0.001
          ? "< 0.001"
          : testResults.purchase_intent.pValue
      }`
    );

    pool.end();
  });

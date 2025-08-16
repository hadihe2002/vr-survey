import { pool } from "../pool.js";
import fs from "fs";

// محاسبه آمارهای توصیفی
function calculateDescriptiveStats(data) {
  const n = data.length;
  const mean = data.reduce((sum, val) => sum + val, 0) / n;
  const sortedData = [...data].sort((a, b) => a - b);
  const median =
    n % 2 === 0
      ? (sortedData[n / 2 - 1] + sortedData[n / 2]) / 2
      : sortedData[Math.floor(n / 2)];
  const variance =
    data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1);
  const stdDev = Math.sqrt(variance);

  return {
    n: n,
    mean: Number(mean.toFixed(3)),
    median: Number(median.toFixed(3)),
    stdDev: Number(stdDev.toFixed(3)),
    min: Math.min(...data),
    max: Math.max(...data),
  };
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
    // عدم قطعیت (Uncertainty) - نمرات بالاتر = عدم قطعیت بیشتر
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

    // اعتماد (Trust)
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

    // تمایل به خرید (Purchase Intent)
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

// تولید جدول آمارهای توصیفی
function generateDescriptiveTable(stats) {
  return `
<table border="1" style="border-collapse: collapse; width: 100%; text-align: center;">
<caption><b>جدول ۴.۱: آمارهای توصیفی متغیرهای پژوهش</b></caption>
<thead>
  <tr style="background-color: #f2f2f2;">
    <th rowspan="2">متغیر</th>
    <th colspan="5">تصاویر دوبعدی</th>
    <th colspan="5">واقعیت مجازی</th>
  </tr>
  <tr style="background-color: #f9f9f9;">
    <th>تعداد</th>
    <th>میانگین</th>
    <th>انحراف معیار</th>
    <th>حداقل</th>
    <th>حداکثر</th>
    <th>تعداد</th>
    <th>میانگین</th>
    <th>انحراف معیار</th>
    <th>حداقل</th>
    <th>حداکثر</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td><b>کاهش عدم‌قطعیت</b></td>
    <td>${stats.uncertainty_2d.n}</td>
    <td>${stats.uncertainty_2d.mean}</td>
    <td>${stats.uncertainty_2d.stdDev}</td>
    <td>${stats.uncertainty_2d.min}</td>
    <td>${stats.uncertainty_2d.max}</td>
    <td>${stats.uncertainty_vr.n}</td>
    <td>${stats.uncertainty_vr.mean}</td>
    <td>${stats.uncertainty_vr.stdDev}</td>
    <td>${stats.uncertainty_vr.min}</td>
    <td>${stats.uncertainty_vr.max}</td>
  </tr>
  <tr>
    <td><b>افزایش اعتماد</b></td>
    <td>${stats.trust_2d.n}</td>
    <td>${stats.trust_2d.mean}</td>
    <td>${stats.trust_2d.stdDev}</td>
    <td>${stats.trust_2d.min}</td>
    <td>${stats.trust_2d.max}</td>
    <td>${stats.trust_vr.n}</td>
    <td>${stats.trust_vr.mean}</td>
    <td>${stats.trust_vr.stdDev}</td>
    <td>${stats.trust_vr.min}</td>
    <td>${stats.trust_vr.max}</td>
  </tr>
  <tr>
    <td><b>تمایل به خرید</b></td>
    <td>${stats.purchase_intent_2d.n}</td>
    <td>${stats.purchase_intent_2d.mean}</td>
    <td>${stats.purchase_intent_2d.stdDev}</td>
    <td>${stats.purchase_intent_2d.min}</td>
    <td>${stats.purchase_intent_2d.max}</td>
    <td>${stats.purchase_intent_vr.n}</td>
    <td>${stats.purchase_intent_vr.mean}</td>
    <td>${stats.purchase_intent_vr.stdDev}</td>
    <td>${stats.purchase_intent_vr.min}</td>
    <td>${stats.purchase_intent_vr.max}</td>
  </tr>
</tbody>
</table>`;
}

// تولید نمودار مقایسه‌ای
function generateComparisonChart(stats) {
  return `

  <style>
    @font-face {
      font-family: 'B Nazanin';
      src: local('B Nazanin');
      font-weight: normal;
      font-style: normal;
    }
    body {
      font-family: 'B Nazanin', 'Tahoma', sans-serif; 
      font-size: 18px;
    }
  </style>
<div style="width: 100%; height: 400px;">
<canvas id="comparisonChart"></canvas>
</div>

<script>
Chart.defaults.font.family = "'B Nazanin', 'Tahoma', sans-serif";
Chart.defaults.font.size = "18";
const ctx = document.getElementById('comparisonChart').getContext('2d');
new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['کاهش عدم‌قطعیت', 'افزایش اعتماد', 'تمایل به خرید'],
        datasets: [{
            label: 'تصاویر دوبعدی',
            data: [${stats.uncertainty_2d.mean}, ${stats.trust_2d.mean}, ${stats.purchase_intent_2d.mean}],
            backgroundColor: '#3498db',
            borderColor: '#2980b9',
            borderWidth: 1
        }, {
            label: 'واقعیت مجازی',
            data: [${stats.uncertainty_vr.mean}, ${stats.trust_vr.mean}, ${stats.purchase_intent_vr.mean}],
            backgroundColor: '#e74c3c',
            borderColor: '#c0392b',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'شکل ۴.۱: مقایسه میانگین متغیرهای پژوهش'
            },
            legend: {
                position: 'top'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 5,
                title: {
                    display: true,
                    text: 'میانگین امتیاز'
                }
            }
        }
    }
});
</script>`;
}

console.log("=== تحلیل آمارهای توصیفی - بخش ۴.۲ ===");

pool.query("SELECT * FROM survey_results").then(({ rows: surveyData }) => {
  const variables = extractMainVariables(surveyData);
  const stats = {};

  Object.keys(variables).forEach((key) => {
    stats[key] = calculateDescriptiveStats(variables[key]);
  });

  console.log("جدول آمارهای توصیفی:");
  console.table({
    "عدم‌قطعیت 2D": stats.uncertainty_2d,
    "عدم‌قطعیت VR": stats.uncertainty_vr,
    "اعتماد 2D": stats.trust_2d,
    "اعتماد VR": stats.trust_vr,
    "تمایل خرید 2D": stats.purchase_intent_2d,
    "تمایل خرید VR": stats.purchase_intent_vr,
  });

  // اعداد برای جایگزینی در متن
  console.log("\n=== اعداد برای جایگزینی [...] ===");
  console.log(`کاهش عدم‌قطعیت - دوبعدی: ${stats.uncertainty_2d.mean}`);
  console.log(`کاهش عدم‌قطعیت - واقعیت مجازی: ${stats.uncertainty_vr.mean}`);
  console.log(`افزایش اعتماد - دوبعدی: ${stats.trust_2d.mean}`);
  console.log(`افزایش اعتماد - واقعیت مجازی: ${stats.trust_vr.mean}`);
  console.log(`تمایل به خرید - دوبعدی: ${stats.purchase_intent_2d.mean}`);
  console.log(`تمایل به خرید - واقعیت مجازی: ${stats.purchase_intent_vr.mean}`);

  // تولید فایل HTML
  const htmlContent = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>بخش ۴.۲ - توصیف آماری متغیرها</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: 'Tahoma', sans-serif; margin: 20px; }
        table { margin: 20px auto; }
        .chart-container { margin: 30px 0; text-align: center; }
    </style>
</head>
<body>
    <h2>۴.۲. توصیف آماری متغیرهای پژوهش</h2>
    
    ${generateDescriptiveTable(stats)}
    
    <div class="chart-container">
        ${generateComparisonChart(stats)}
    </div>
</body>
</html>`;

  fs.writeFileSync("2-demographic-distrobution.html", htmlContent);
});

pool.end();

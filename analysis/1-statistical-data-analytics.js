import { pool } from "../pool.js";
import fs from "fs";

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

function extractVariables(surveyData) {
  const results = {
    trust_2d: [],
    trust_vr: [],
    uncertainty_2d: [],
    uncertainty_vr: [],
    intent_2d: [],
    intent_vr: [],
  };

  surveyData.forEach((record) => {
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

    const intent_2d =
      (record.conversation_presence_2d +
        record.conversation_buy_decision_2d +
        record.conversation_action_2d) /
      3;

    const intent_vr =
      (record.conversation_presence_vr +
        record.conversation_buy_decision_vr +
        record.conversation_action_vr) /
      3;

    results.trust_2d.push(Number(trust_2d.toFixed(3)));
    results.trust_vr.push(Number(trust_vr.toFixed(3)));
    results.uncertainty_2d.push(Number(uncertainty_2d.toFixed(3)));
    results.uncertainty_vr.push(Number(uncertainty_vr.toFixed(3)));
    results.intent_2d.push(Number(intent_2d.toFixed(3)));
    results.intent_vr.push(Number(intent_vr.toFixed(3)));
  });

  return results;
}

function analyzeDemographics(surveyData) {
  const demographics = {
    total_participants: surveyData.length,
    gender: { Man: 0, Female: 0 },
    age_groups: {},
    education: {},
    occupation: {},
    vr_access: { Yes: 0, No: 0 },
  };

  surveyData.forEach((record) => {
    demographics.gender[record.gender]++;
    demographics.age_groups[record.age] =
      (demographics.age_groups[record.age] || 0) + 1;
    demographics.education[record.college_degree] =
      (demographics.education[record.college_degree] || 0) + 1;
    demographics.occupation[record.occupation] =
      (demographics.occupation[record.occupation] || 0) + 1;
    demographics.vr_access[record.vr_access]++;
  });

  return demographics;
}

function generateChartHTML(stats, demographics) {
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نمودارهای تحلیل آماری</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: 'B Nazanin', 'Tahoma', sans-serif; margin: 20px; }
        .chart-container { width: 48%; display: inline-block; margin: 1%; }
        .chart-title { text-align: center; font-weight: bold; margin-bottom: 10px; }
        .full-width { width: 98%; }
        @font-face {
            font-family: 'B Nazanin';
            src: local('B Nazanin');
            font-weight: normal;
            font-style: normal;
        }
    </style>
</head>
<body>

<div class="chart-container">
    <div class="chart-title">مقایسه میانگین‌ها</div>
    <canvas id="meanComparisonChart"></canvas>
</div>

<div class="chart-container">
    <div class="chart-title">توزیع جنسیت</div>
    <canvas id="genderChart"></canvas>
</div>

<div class="chart-container">
    <div class="chart-title">توزیع سنی</div>
    <canvas id="ageChart"></canvas>
</div>

<div class="chart-container">
    <div class="chart-title">سطح تحصیلات</div>
    <canvas id="educationChart"></canvas>
</div>

<div class="chart-container full-width">
    <div class="chart-title">Box Plot مقایسه متغیرها</div>
    <canvas id="boxPlotChart"></canvas>
</div>

<script>
Chart.defaults.font.family = "'B Nazanin', 'Tahoma', sans-serif";
Chart.defaults.font.size = "18";

const stats = ${JSON.stringify(stats)};
const demographics = ${JSON.stringify(demographics)};

new Chart(document.getElementById('meanComparisonChart'), {
    type: 'bar',
    data: {
        labels: ['Trust', 'Uncertainty', 'Purchase Intent'],
        datasets: [{
            label: '2D',
            data: [stats.trust_2d.mean, stats.uncertainty_2d.mean, stats.intent_2d.mean],
            backgroundColor: '#3498db',
            borderWidth: 1
        }, {
            label: 'VR',
            data: [stats.trust_vr.mean, stats.uncertainty_vr.mean, stats.intent_vr.mean],
            backgroundColor: '#e74c3c',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: { y: { beginAtZero: true, max: 5 } },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.dataset.label + ': ' + context.raw.toFixed(3);
                    }
                }
            }
        }
    }
});

new Chart(document.getElementById('genderChart'), {
    type: 'pie',
    data: {
        labels: ['مرد', 'زن'],
        datasets: [{
            data: [demographics.gender.Man, demographics.gender.Female],
            backgroundColor: ['#3498db', '#e74c3c']
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'bottom' },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const total = demographics.total_participants;
                        const percent = ((context.raw / total) * 100).toFixed(1);
                        return context.label + ': ' + context.raw + ' نفر (' + percent + '%)';
                    }
                }
            }
        }
    }
});

const ageLabels = Object.keys(demographics.age_groups);
const ageData = Object.values(demographics.age_groups);
new Chart(document.getElementById('ageChart'), {
    type: 'doughnut',
    data: {
        labels: ageLabels.map(age => {
            const ageMap = {
                'zero-to-twenty': '0-20 سال',
                'twenty-to-forty': '20-40 سال',
                'forty-to-sixty': '40-60 سال',
                'sixty-or-more': '60+ سال'
            };
            return ageMap[age] || age;
        }),
        datasets: [{
            data: ageData,
            backgroundColor: ['#9b59b6', '#2ecc71', '#f39c12', '#34495e']
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'bottom' },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const total = demographics.total_participants;
                        const percent = ((context.raw / total) * 100).toFixed(1);
                        return context.label + ': ' + context.raw + ' نفر (' + percent + '%)';
                    }
                }
            }
        }
    }
});

const eduLabels = Object.keys(demographics.education);
const eduData = Object.values(demographics.education);
new Chart(document.getElementById('educationChart'), {
    type: 'bar',
    data: {
        labels: eduLabels.map(edu => {
            const eduMap = {
                'Below Diploma': 'زیر دیپلم',
                'Diploma': 'دیپلم',
                'Bachelor': 'کارشناسی',
                'Master': 'کارشناسی ارشد',
                'Doctorate': 'دکتری'
            };
            return eduMap[edu] || edu;
        }),
        datasets: [{
            data: eduData,
            backgroundColor: '#2ecc71',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: { y: { beginAtZero: true } },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const total = demographics.total_participants;
                        const percent = ((context.raw / total) * 100).toFixed(1);
                        return 'تعداد: ' + context.raw + ' نفر (' + percent + '%)';
                    }
                }
            }
        }
    }
});

new Chart(document.getElementById('boxPlotChart'), {
    type: 'bar',
    data: {
        labels: ['Trust 2D', 'Trust VR', 'Uncertainty 2D', 'Uncertainty VR', 'Intent 2D', 'Intent VR'],
        datasets: [{
            label: 'میانگین',
            data: [
                stats.trust_2d.mean, stats.trust_vr.mean,
                stats.uncertainty_2d.mean, stats.uncertainty_vr.mean,
                stats.intent_2d.mean, stats.intent_vr.mean
            ],
            backgroundColor: ['#3498db', '#e74c3c', '#3498db', '#e74c3c', '#3498db', '#e74c3c'],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: { y: { beginAtZero: true, max: 5 } },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    afterLabel: function(context) {
                        const key = ['trust_2d', 'trust_vr', 'uncertainty_2d', 'uncertainty_vr', 'intent_2d', 'intent_vr'][context.dataIndex];
                        const stat = stats[key];
                        return [
                            'انحراف معیار: ' + stat.stdDev,
                            'میانه: ' + stat.median,
                            'حداقل: ' + stat.min,
                            'حداکثر: ' + stat.max
                        ];
                    }
                }
            }
        }
    }
});

</script>
</body>
</html>`;
}

console.log("=== تحلیل آمارهای توصیفی ===");

pool.query("SELECT * FROM survey_results").then(({ rows: surveyData }) => {
  const variables = extractVariables(surveyData);
  const stats = {};
  Object.keys(variables).forEach((key) => {
    stats[key] = calculateDescriptiveStats(variables[key]);
  });

  console.table(stats);

  const demographics = analyzeDemographics(surveyData);
  console.log("\n=== اطلاعات دموگرافیک ===");
  console.log(`تعداد کل شرکت‌کنندگان: ${demographics.total_participants}`);
  console.log("توزیع جنسیت:", demographics.gender);
  console.log("توزیع سنی:", demographics.age_groups);
  console.log("سطح تحصیلات:", demographics.education);
  console.log("شغل:", demographics.occupation);
  console.log("دسترسی به VR:", demographics.vr_access);

  const differences = {
    trust_diff: variables.trust_vr.map((vr, i) =>
      Number((vr - variables.trust_2d[i]).toFixed(3))
    ),
    uncertainty_diff: variables.uncertainty_vr.map((vr, i) =>
      Number((vr - variables.uncertainty_2d[i]).toFixed(3))
    ),
    intent_diff: variables.intent_vr.map((vr, i) =>
      Number((vr - variables.intent_2d[i]).toFixed(3))
    ),
  };

  console.log("\n=== آمارهای توصیفی تفاوت‌ها ===");
  Object.keys(differences).forEach((key) => {
    const diffStats = calculateDescriptiveStats(differences[key]);
    console.log(`${key}:`, diffStats);
  });

  const chartHTML = generateChartHTML(stats, demographics);
  fs.writeFileSync("1-statistical-data-analytics.html", chartHTML);
  console.log("\n=== فایل 1-statistical-data-analytics.html تولید شد ===");
});

pool.end();

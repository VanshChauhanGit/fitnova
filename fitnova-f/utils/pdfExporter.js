import { Alert, Share } from 'react-native';

export const exportPlanToPDF = async (plan, userName = 'FitNova Athlete') => {
  try {
    let printModule = null;
    let sharingModule = null;
    let fileSystemModule = null;

    try {
      printModule = require('expo-print');
      sharingModule = require('expo-sharing');
    } catch (e) {
      console.log('PDF export modules loading warning:', e);
    }

    try {
      fileSystemModule = require('expo-file-system');
    } catch (e) {
      console.log('FileSystem module loading warning:', e);
    }

    const htmlContent = generatePlanHTML(plan, userName);

    // Create filename format: planName-username.pdf
    const sanitizedPlanName = (plan.name || 'Workout_Plan')
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .trim()
      .replace(/\s+/g, '_');

    const sanitizedUserName = (userName || 'Athlete')
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .trim()
      .replace(/\s+/g, '_');

    const pdfFileName = `${sanitizedPlanName}-${sanitizedUserName}.pdf`;

    if (printModule && printModule.printToFileAsync) {
      const { uri } = await printModule.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      let targetUri = uri;

      // Rename file to planName-username.pdf if fileSystem is available
      if (fileSystemModule && fileSystemModule.cacheDirectory && fileSystemModule.moveAsync) {
        try {
          const namedUri = `${fileSystemModule.cacheDirectory}${pdfFileName}`;
          await fileSystemModule.moveAsync({
            from: uri,
            to: namedUri,
          });
          targetUri = namedUri;
        } catch (fsErr) {
          console.log('Could not rename PDF file, using default URI:', fsErr);
        }
      }

      if (sharingModule && (await sharingModule.isAvailableAsync())) {
        await sharingModule.shareAsync(targetUri, {
          UTI: 'com.adobe.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `${pdfFileName}`,
        });
      } else {
        Alert.alert('PDF Exported', `"${pdfFileName}" saved to device.`);
      }
    } else {
      // Fallback native plain text share if print unavailable
      const plainText = generatePlainTextPlan(plan);
      await Share.share({
        title: `${plan.name} Workout Plan`,
        message: plainText,
      });
    }
  } catch (error) {
    console.error('PDF Export Error:', error);
    Alert.alert('Export Failed', error.message || 'Could not export workout plan.');
  }
};

const generatePlanHTML = (plan, userName) => {
  const daysHTML = (plan.days || [])
    .map((day) => {
      if (day.isRestDay) {
        return `
          <div class="day-card rest-day">
            <div class="day-header">
              <div class="day-title-wrap">
                <span class="day-number-badge">Day ${day.dayNumber}</span>
                <h3 class="day-name">${day.title}</h3>
              </div>
            </div>
            <p class="rest-msg">😴 Active Recovery & Rest Day — Hydrate, stretch, and rebuild.</p>
          </div>
        `;
      }

      const exercisesRows = (day.exercises || [])
        .map(
          (ex, idx) => `
        <tr>
          <td>
            <div class="ex-name">${idx + 1}. ${ex.name}</div>
            <div class="ex-sub">${ex.bodyPart || ex.targetMuscle || 'General'}</div>
          </td>
          <td class="center badge-cell">${ex.sets} sets</td>
          <td class="center">${ex.reps} reps</td>
          <td class="center">${ex.restTime || 60}s</td>
          <td>${ex.notes || '-'}</td>
        </tr>
      `
        )
        .join('');

      const muscleTags = (day.targetMuscles || [])
        .map((m) => `<span class="muscle-tag">${m}</span>`)
        .join(' ');

      return `
        <div class="day-card">
          <div class="day-header">
            <div class="day-title-wrap">
              <span class="day-number-badge">Day ${day.dayNumber}</span>
              <h3 class="day-name">${day.title}</h3>
            </div>
            ${muscleTags ? `<div class="muscles-wrap">${muscleTags}</div>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 35%;">Exercise</th>
                <th class="center" style="width: 15%;">Sets</th>
                <th class="center" style="width: 15%;">Reps</th>
                <th class="center" style="width: 15%;">Rest</th>
                <th style="width: 20%;">Form Notes</th>
              </tr>
            </thead>
            <tbody>
              ${exercisesRows}
            </tbody>
          </table>
        </div>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${plan.name} - ${userName}</title>
        <style>
          @page {
            size: A4;
            margin: 12mm 14mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #EBF7F4;
            color: #014041;
            padding: 0;
            margin: 0;
            font-size: 12px;
            line-height: 1.4;
          }
          .header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #017374;
            padding-bottom: 10px;
            margin-bottom: 14px;
          }
          .brand-title {
            font-size: 22px;
            font-weight: 900;
            color: #017374;
            letter-spacing: 1.5px;
          }
          .user-badge {
            background: #FFFFFF;
            border: 1px solid rgba(1, 115, 116, 0.2);
            color: #025C5D;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 11px;
            font-weight: 600;
          }
          .user-badge strong {
            color: #014041;
          }
          .plan-header {
            margin-bottom: 14px;
          }
          .plan-title {
            font-size: 22px;
            font-weight: 800;
            color: #014041;
            margin: 0 0 4px 0;
          }
          .plan-desc {
            font-size: 12px;
            color: #025C5D;
            margin: 0 0 10px 0;
          }
          .meta-bar {
            display: flex;
            gap: 8px;
            align-items: center;
          }
          .meta-pill {
            background: rgba(1, 115, 116, 0.15);
            border: 1px solid rgba(1, 115, 116, 0.3);
            color: #017374;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 700;
          }
          .meta-pill.cyan {
            background: #D8F3EB;
            border: 1px solid rgba(1, 115, 116, 0.3);
            color: #017374;
          }
          
          .days-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          
          .day-card {
            background-color: #FFFFFF;
            border: 1px solid rgba(1, 115, 116, 0.18);
            border-radius: 12px;
            padding: 12px 14px;
            page-break-inside: avoid;
          }
          
          .day-card.rest-day {
            background: #EBF7F4;
            border: 1px dashed rgba(1, 115, 116, 0.3);
            padding: 8px 12px;
          }
          
          .day-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
          }
          
          .day-title-wrap {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .day-number-badge {
            background: #017374;
            color: #FFFFFF;
            font-weight: 900;
            font-size: 10px;
            padding: 2px 7px;
            border-radius: 6px;
          }
          
          .day-name {
            font-size: 14px;
            font-weight: 800;
            color: #014041;
          }
          
          .exercise-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
          }
          
          th {
            background-color: #EBF7F4;
            color: #3A7574;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            text-align: left;
            padding: 5px 8px;
            border-bottom: 1px solid rgba(1, 115, 116, 0.18);
          }
          
          td {
            padding: 6px 8px;
            font-size: 11px;
            border-bottom: 1px solid rgba(1, 115, 116, 0.1);
            color: #014041;
            vertical-align: middle;
          }
          
          tr:last-child td {
            border-bottom: none;
          }
          
          .ex-name {
            font-weight: 700;
            color: #014041;
          }
          .ex-sub {
            font-size: 10px;
            color: #3A7574;
          }
          
          .badge-cell {
            font-weight: 700;
            color: #017374;
          }
          .center {
            text-align: center;
          }
          
          .footer {
            margin-top: 16px;
            text-align: center;
            font-size: 10px;
            color: #3A7574;
            border-top: 1px solid rgba(1, 115, 116, 0.15);
            padding-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="header-container">
          <div class="brand-title">⚡ FITNOVA</div>
          <div class="user-badge">Athlete: <strong>${userName}</strong></div>
        </div>

        <div class="plan-header">
          <h1 class="plan-title">${plan.name}</h1>
          ${plan.description ? `<p class="plan-desc">${plan.description}</p>` : ''}
          <div class="meta-bar">
            <span class="meta-pill">🎯 ${plan.goal || 'Build Muscle'}</span>
            <span class="meta-pill cyan">🗓️ ${plan.splitDays || plan.days?.length || 6}-Day Program</span>
          </div>
        </div>

        <div class="days-grid">
          ${daysHTML}
        </div>

        <div class="footer">
          Generated with FitNova Workout Engine • Train Smarter, Live Better ⚡
        </div>
      </body>
    </html>
  `;
};

const generatePlainTextPlan = (plan) => {
  let text = `⚡ FITNOVA WORKOUT PLAN: ${plan.name}\n`;
  text += `Goal: ${plan.goal || 'Build Muscle'} | Split: ${plan.splitDays || plan.days?.length} Days\n\n`;

  (plan.days || []).forEach((day) => {
    text += `--- Day ${day.dayNumber}: ${day.title} ---\n`;
    if (day.isRestDay) {
      text += `Rest & Recovery Day\n\n`;
    } else {
      (day.exercises || []).forEach((ex, idx) => {
        text += `${idx + 1}. ${ex.name} - ${ex.sets} sets x ${ex.reps} reps (${ex.restTime || 60}s rest)\n`;
      });
      text += `\n`;
    }
  });

  return text;
};

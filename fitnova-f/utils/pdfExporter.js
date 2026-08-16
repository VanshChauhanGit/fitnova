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

    // Create clean file name from Plan Name
    const sanitizedPlanName = (plan.name || 'FitNova_Workout_Plan')
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .trim()
      .replace(/\s+/g, '_');

    const pdfFileName = `${sanitizedPlanName}.pdf`;

    if (printModule && printModule.printToFileAsync) {
      const { uri } = await printModule.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      let targetUri = uri;

      // Rename file to plan name if fileSystem is available
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
          dialogTitle: `${plan.name} - FitNova PDF`,
        });
      } else {
        Alert.alert('PDF Exported', `"${plan.name}" PDF saved to device.`);
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
  const daysHTML = plan.days
    .map((day) => {
      if (day.isRestDay) {
        return `
          <div class="day-card rest-day">
            <div class="day-header">
              <span class="day-badge">Day ${day.dayNumber}</span>
              <h2>${day.title}</h2>
            </div>
            <p class="rest-text">😴 Active Recovery & Rest Day - Take time to stretch, hydrate, and recover.</p>
          </div>
        `;
      }

      const exercisesRows = day.exercises
        .map(
          (ex, idx) => `
        <tr>
          <td><strong>${idx + 1}. ${ex.name}</strong><br/><span class="subtext">${ex.bodyPart || 'General'}</span></td>
          <td class="text-center">${ex.sets} sets</td>
          <td class="text-center">${ex.reps} reps</td>
          <td class="text-center">${ex.restTime || 60}s</td>
          <td>${ex.notes || '-'}</td>
        </tr>
      `
        )
        .join('');

      const muscleTags = (day.targetMuscles || [])
        .map((m) => `<span class="tag">${m}</span>`)
        .join(' ');

      return `
        <div class="day-card">
          <div class="day-header">
            <span class="day-badge">Day ${day.dayNumber}</span>
            <h2>${day.title}</h2>
          </div>
          ${muscleTags ? `<div class="tags-container">${muscleTags}</div>` : ''}
          <table>
            <thead>
              <tr>
                <th>Exercise</th>
                <th class="text-center">Sets</th>
                <th class="text-center">Reps</th>
                <th class="text-center">Rest</th>
                <th>Notes / Form Cues</th>
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
        <title>${plan.name} - FitNova Workout Plan</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #0B0E14;
            color: #F8FAFC;
            padding: 32px;
            margin: 0;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #10B981;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .brand {
            font-size: 28px;
            font-weight: 900;
            color: #10B981;
            letter-spacing: 1px;
          }
          .user-info {
            font-size: 14px;
            color: #94A3B8;
          }
          .plan-title {
            font-size: 32px;
            font-weight: 800;
            margin: 0 0 8px 0;
            color: #FFFFFF;
          }
          .plan-desc {
            font-size: 15px;
            color: #94A3B8;
            margin-bottom: 20px;
          }
          .meta-pill {
            display: inline-block;
            background: rgba(16, 185, 129, 0.15);
            border: 1px solid rgba(16, 185, 129, 0.4);
            color: #10B981;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 700;
            margin-right: 10px;
          }
          .day-card {
            background-color: #151B26;
            border: 1px solid #1E293B;
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 24px;
            page-break-inside: avoid;
          }
          .day-card.rest-day {
            border-style: dashed;
            background-color: #0F172A;
          }
          .day-header {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
          }
          .day-badge {
            background: #10B981;
            color: #0B0E14;
            font-weight: 800;
            font-size: 12px;
            padding: 4px 10px;
            border-radius: 12px;
            margin-right: 12px;
            text-transform: uppercase;
          }
          .day-header h2 {
            font-size: 20px;
            margin: 0;
            color: #F8FAFC;
          }
          .tags-container {
            margin-bottom: 14px;
          }
          .tag {
            background: #1E293B;
            color: #38BDF8;
            font-size: 12px;
            padding: 3px 8px;
            border-radius: 6px;
            margin-right: 6px;
          }
          .rest-text {
            color: #94A3B8;
            font-style: italic;
            margin: 8px 0 0 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
          }
          th {
            background-color: #0B0E14;
            color: #94A3B8;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #334155;
          }
          td {
            padding: 10px;
            font-size: 14px;
            border-bottom: 1px solid #1E293B;
            color: #E2E8F0;
          }
          .subtext {
            font-size: 11px;
            color: #64748B;
          }
          .text-center {
            text-align: center;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #64748B;
            border-top: 1px solid #1E293B;
            padding-top: 16px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">⚡ FITNOVA</div>
          <div class="user-info">Prepared for: <strong>${userName}</strong></div>
        </div>
        <h1 class="plan-title">${plan.name}</h1>
        <p class="plan-desc">${plan.description || 'Custom hypertrophy & strength routine built with FitNova.'}</p>
        <div style="margin-bottom: 24px;">
          <span class="meta-pill">🎯 ${plan.goal || 'Build Muscle'}</span>
          <span class="meta-pill">🗓️ ${plan.splitDays || plan.days.length}-Day Program</span>
        </div>

        ${daysHTML}

        <div class="footer">
          Generated with FitNova Workout Engine • Stay consistent, push hard, build muscle! 🔥
        </div>
      </body>
    </html>
  `;
};

const generatePlainTextPlan = (plan) => {
  let text = `⚡ FITNOVA WORKOUT PLAN: ${plan.name}\n`;
  text += `Goal: ${plan.goal || 'Build Muscle'} | Split: ${plan.splitDays || plan.days.length} Days\n\n`;

  plan.days.forEach((day) => {
    text += `--- Day ${day.dayNumber}: ${day.title} ---\n`;
    if (day.isRestDay) {
      text += `Rest & Recovery Day\n\n`;
    } else {
      day.exercises.forEach((ex, idx) => {
        text += `${idx + 1}. ${ex.name} - ${ex.sets} sets x ${ex.reps} reps (${ex.restTime || 60}s rest)\n`;
      });
      text += `\n`;
    }
  });

  return text;
};

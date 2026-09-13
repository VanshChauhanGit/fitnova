const fs = require('fs');
const file = '/Users/vanshchauhan/projects/fitnova/fitnova-f/screens/workout/WorkoutLoggingSessionScreen.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. SwipeableSetRow props
content = content.replace(
  /stepReps,\n\s*setPickerState,\n\s*removeSetFromExercise,/g,
  `stepReps,
  setPickerState,
  setPickerValue,
  removeSetFromExercise,`
);

// 2. SwipeableSetRow triggers
content = content.replace(
  /onPress=\{\(\) => setPickerState\(\{ exIndex: exIdx, setIndex: setIdx, field: 'weight' \}\)\}/g,
  `onPress={() => {
              setPickerState({ exIndex: exIdx, setIndex: setIdx, field: 'weight' });
              setPickerValue(String(setObj?.weight ?? '0'));
            }}`
);
content = content.replace(
  /onPress=\{\(\) => setPickerState\(\{ exIndex: exIdx, setIndex: setIdx, field: 'reps' \}\)\}/g,
  `onPress={() => {
              setPickerState({ exIndex: exIdx, setIndex: setIdx, field: 'reps' });
              setPickerValue(String(setObj?.reps ?? '10'));
            }}`
);

// 3. State definition
content = content.replace(
  /const \[pickerState, setPickerState\] = useState\(null\);/g,
  `const [pickerState, setPickerState] = useState(null);
  const [pickerValue, setPickerValue] = useState('');`
);

// 4. SwipeableSetRow usage
content = content.replace(
  /setPickerState=\{setPickerState\}\n\s*removeSetFromExercise=\{removeSetFromExercise\}/g,
  `setPickerState={setPickerState}
                setPickerValue={setPickerValue}
                removeSetFromExercise={removeSetFromExercise}`
);

// 5. Main Stepper Display
content = content.replace(
  /onPress=\{\(\) => \{\n\s*if \(pickerState\?\.exIndex == null \|\| pickerState\?\.setIndex == null\) return;\n\s*if \(pickerState\.field === 'weight'\) stepWeight\(pickerState\.exIndex, pickerState\.setIndex, -2\.5\);\n\s*else stepReps\(pickerState\.exIndex, pickerState\.setIndex, -1\);\n\s*\}\}/g,
  `onPress={() => {
                  if (pickerState?.field === 'weight') {
                    const cur = parseFloat(pickerValue) || 0;
                    setPickerValue(String(Math.max(0, Math.round((cur - 2.5) * 10) / 10)));
                  } else {
                    const cur = parseInt(pickerValue, 10) || 0;
                    setPickerValue(String(Math.max(1, cur - 1)));
                  }
                }}`
);
content = content.replace(
  /\{pickerState\?\.field === 'weight'\n\s*\? \`\$\{activeSetObj\?\.weight \?\? 0\}\`\n\s*\: \`\$\{activeSetObj\?\.reps \?\? 0\}\`\}/g,
  `{pickerValue || '0'}`
);
content = content.replace(
  /onPress=\{\(\) => \{\n\s*if \(pickerState\?\.exIndex == null \|\| pickerState\?\.setIndex == null\) return;\n\s*if \(pickerState\.field === 'weight'\) stepWeight\(pickerState\.exIndex, pickerState\.setIndex, 2\.5\);\n\s*else stepReps\(pickerState\.exIndex, pickerState\.setIndex, 1\);\n\s*\}\}/g,
  `onPress={() => {
                  if (pickerState?.field === 'weight') {
                    const cur = parseFloat(pickerValue) || 0;
                    setPickerValue(String(Math.round((cur + 2.5) * 10) / 10));
                  } else {
                    const cur = parseInt(pickerValue, 10) || 0;
                    setPickerValue(String(cur + 1));
                  }
                }}`
);

// 6. Text Input
content = content.replace(
  /value=\{String\(\n\s*pickerState\?\.field === 'weight'\n\s*\? activeSetObj\?\.weight \?\? ''\n\s*\: activeSetObj\?\.reps \?\? ''\n\s*\)\}\n\s*onChangeText=\{\(val\) => \{\n\s*if \(pickerState\?\.exIndex != null && pickerState\?\.setIndex != null && pickerState\?\.field\) \{\n\s*setSetValue\(pickerState\.exIndex, pickerState\.setIndex, pickerState\.field, val\);\n\s*\}\n\s*\}\}/g,
  `value={pickerValue}
                  onChangeText={setPickerValue}`
);

// 7. Fast Adjustments Weight
content = content.replace(
  /if \(pickerState\?\.exIndex != null && pickerState\?\.setIndex != null\) \{\n\s*stepWeight\(pickerState\.exIndex, pickerState\.setIndex, -5\);\n\s*\}/g,
  `const cur = parseFloat(pickerValue) || 0;
                      setPickerValue(String(Math.max(0, Math.round((cur - 5) * 10) / 10)));`
);
content = content.replace(
  /if \(pickerState\?\.exIndex != null && pickerState\?\.setIndex != null\) \{\n\s*stepWeight\(pickerState\.exIndex, pickerState\.setIndex, -2\.5\);\n\s*\}/g,
  `const cur = parseFloat(pickerValue) || 0;
                      setPickerValue(String(Math.max(0, Math.round((cur - 2.5) * 10) / 10)));`
);
content = content.replace(
  /if \(pickerState\?\.exIndex != null && pickerState\?\.setIndex != null\) \{\n\s*stepWeight\(pickerState\.exIndex, pickerState\.setIndex, 2\.5\);\n\s*\}/g,
  `const cur = parseFloat(pickerValue) || 0;
                      setPickerValue(String(Math.round((cur + 2.5) * 10) / 10));`
);
content = content.replace(
  /if \(pickerState\?\.exIndex != null && pickerState\?\.setIndex != null\) \{\n\s*stepWeight\(pickerState\.exIndex, pickerState\.setIndex, 5\);\n\s*\}/g,
  `const cur = parseFloat(pickerValue) || 0;
                      setPickerValue(String(Math.round((cur + 5) * 10) / 10));`
);

// 8. Fast Adjustments Reps
content = content.replace(
  /if \(pickerState\?\.exIndex != null && pickerState\?\.setIndex != null\) \{\n\s*stepReps\(pickerState\.exIndex, pickerState\.setIndex, -2\);\n\s*\}/g,
  `const cur = parseInt(pickerValue, 10) || 0;
                      setPickerValue(String(Math.max(1, cur - 2)));`
);
content = content.replace(
  /if \(pickerState\?\.exIndex != null && pickerState\?\.setIndex != null\) \{\n\s*stepReps\(pickerState\.exIndex, pickerState\.setIndex, -1\);\n\s*\}/g,
  `const cur = parseInt(pickerValue, 10) || 0;
                      setPickerValue(String(Math.max(1, cur - 1)));`
);
content = content.replace(
  /if \(pickerState\?\.exIndex != null && pickerState\?\.setIndex != null\) \{\n\s*stepReps\(pickerState\.exIndex, pickerState\.setIndex, 1\);\n\s*\}/g,
  `const cur = parseInt(pickerValue, 10) || 0;
                      setPickerValue(String(cur + 1));`
);
content = content.replace(
  /if \(pickerState\?\.exIndex != null && pickerState\?\.setIndex != null\) \{\n\s*stepReps\(pickerState\.exIndex, pickerState\.setIndex, 2\);\n\s*\}/g,
  `const cur = parseInt(pickerValue, 10) || 0;
                      setPickerValue(String(cur + 2));`
);

// 9. Preset Pills
content = content.replace(
  /pickerState\?\.field === 'weight'\n\s*\? parseFloat\(activeSetObj\?\.weight\) === val\n\s*\: parseInt\(activeSetObj\?\.reps, 10\) === val/g,
  `pickerState?.field === 'weight'
                    ? parseFloat(pickerValue) === val
                    : parseInt(pickerValue, 10) === val`
);
content = content.replace(
  /if \(pickerState\?\.exIndex != null && pickerState\?\.setIndex != null && pickerState\?\.field\) \{\n\s*setSetValue\(pickerState\.exIndex, pickerState\.setIndex, pickerState\.field, val\);\n\s*\}/g,
  `setPickerValue(String(val))`
);

// 10. Confirm Button
content = content.replace(
  /onPress=\{\(\) => setPickerState\(null\)\}\n\s*className="rounded-full bg-\[\#017374\] py-4 items-center shadow-lg shadow-\[\#017374\]\/40 active:opacity-80">/g,
  `onPress={() => {
                if (pickerState?.exIndex != null && pickerState?.setIndex != null && pickerState?.field) {
                  setSetValue(pickerState.exIndex, pickerState.setIndex, pickerState.field, pickerValue);
                }
                setPickerState(null);
              }}
              className="rounded-full bg-[#017374] py-4 items-center shadow-lg shadow-[#017374]/40 active:opacity-80">`
);

fs.writeFileSync(file, content);
console.log('Patch complete.');

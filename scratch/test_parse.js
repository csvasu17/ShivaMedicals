const parseDoctorName = (fullName) => {
  if (!fullName) return { name: '', qualifications: '', translation: '' };
  
  // 1. Extract Tamil text in parentheses
  const tamilRegex = /\(([\u0B80-\u0BFF\s,().\-\u200B-\u200D]+)\)/;
  const tamilMatch = fullName.match(tamilRegex);
  let translation = '';
  let cleanName = fullName;
  
  if (tamilMatch) {
    translation = tamilMatch[1].trim();
    cleanName = fullName.replace(tamilRegex, '').trim();
  }
  
  // 2. Separate name from degrees (MBBS, MD, DCH, DLO, D.DIAB, etc.)
  const degreeRegex = /\b(MBBS|MD|DCH|DLO|D\.DIAB)\b/i;
  const degreeMatch = cleanName.match(degreeRegex);
  
  let name = cleanName;
  let qualifications = '';
  
  if (degreeMatch) {
    const index = degreeMatch.index;
    name = cleanName.substring(0, index).trim();
    qualifications = cleanName.substring(index).trim();
    
    // Clean trailing/leading commas/spaces from name and qualifications
    name = name.replace(/^[,\s]+|[,\s]+$/g, '');
    qualifications = qualifications.replace(/^[,\s]+|[,\s]+$/g, '');
  }
  
  return { name, qualifications, translation };
};

const names = [
  'Dr. R. Anand MD.,DCH.,(குழந்தைகள் சிறப்பு நிபுணர்)',
  'Dr. D. Venkatesh MD., DLO., D.DIAB.,(காது மூக்கு தொண்டை மற்றும் சக்கரை நோய் நிபுணர்)'
];

names.forEach(n => {
  console.log(`Original: "${n}"`);
  console.log('Parsed:', parseDoctorName(n));
  console.log('---');
});

const escapePdfText = (value) => String(value ?? '')
  .replace(/\\/g, '\\\\')
  .replace(/\(/g, '\\(')
  .replace(/\)/g, '\\)');

const buildSimplePdf = (title, data) => {
  const contentLines = [
    'BT',
    // --- Header ---
    '/F1 28 Tf',
    '72 750 Td',
    `0.0 0.35 0.20 rg`, // Dark Green Color (#005a32 equivalent)
    `(${escapePdfText(title)}) Tj`,
    
    // --- Subheader / Meta ---
    '/F1 10 Tf',
    '0 -25 Td',
    `0.4 0.4 0.4 rg`, // Gray Color
    `(Generated on: ${escapePdfText(data.generatedAt)}) Tj`,
    
    // --- Filters Section ---
    '/F1 12 Tf',
    '0 -40 Td',
    `0.2 0.2 0.2 rg`, // Dark Gray
    `(ACTIVE FILTERS) Tj`,
    '/F1 10 Tf',
    '0 -20 Td',
    `(Region: ${escapePdfText(data.filters.region)}) Tj`,
    '0 -15 Td',
    `(School: ${escapePdfText(data.filters.school)}) Tj`,
    '0 -15 Td',
    `(Language: ${escapePdfText(data.filters.language)}) Tj`,
    
    // --- Stats Grid ---
    '/F1 14 Tf',
    '0 -45 Td',
    `0.0 0.35 0.20 rg`,
    `(KEY ANALYTICS) Tj`,
    
    '/F1 11 Tf',
    '0 -25 Td',
    `0.1 0.1 0.1 rg`,
    `(Total Books Recorded: ${escapePdfText(data.stats.totalBooks)}) Tj`,
    '0 -20 Td',
    `(Total Registered Users: ${escapePdfText(data.stats.totalUsers)}) Tj`,
    '0 -20 Td',
    `(Active Readers: ${escapePdfText(data.stats.activeReaders)}) Tj`,
    '0 -20 Td',
    `(Campaign Progress: ${escapePdfText(data.stats.progress)}%) Tj`,
    
    // --- Leaderboard Section ---
    '/F1 14 Tf',
    '0 -45 Td',
    `0.0 0.35 0.20 rg`,
    `(TOP PERFORMING SCHOOLS) Tj`,
    
    '/F1 10 Tf',
    '0 -25 Td',
    `0.4 0.4 0.4 rg`,
    `(RANK    SCHOOL NAME                                BOOKS    READERS) Tj`,
    '0 -5 Td',
    `(______________________________________________________________________) Tj`,
    
    ...data.topSchools.flatMap((school) => {
      const rank = String(school.rank).padEnd(8);
      const name = String(school.name).substring(0, 35).padEnd(42);
      const books = String(school.books).padEnd(8);
      const readers = String(school.readers);
      return [
        '0 -20 Td',
        `0.1 0.1 0.1 rg`,
        `(${escapePdfText(rank + name + books + readers)}) Tj`
      ];
    }),
    
    // --- Footer ---
    '/F1 9 Tf',
    '0 -80 Td',
    `0.6 0.6 0.6 rg`,
    `(* This is an automated system generated report for the Gift of Reading Initiative.) Tj`,
    'ET'
  ];

  const stream = contentLines.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf);
};

module.exports = { buildSimplePdf };

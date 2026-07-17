const encode = (value) => new TextEncoder().encode(value);

const joinBytes = (parts) => {
  const length = parts.reduce((total, part) => total + part.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  parts.forEach((part) => {
    result.set(part, offset);
    offset += part.length;
  });
  return result;
};

const buildPdfFromJpeg = (jpegBytes, width, height) => {
  const pageWidth = 842;
  const pageHeight = 595;
  const objects = [
    encode('<< /Type /Catalog /Pages 2 0 R >>'),
    encode('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
    encode(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`),
    joinBytes([
      encode(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`),
      jpegBytes,
      encode('\nendstream')
    ]),
    (() => {
      const stream = `q ${pageWidth} 0 0 ${pageHeight} 0 0 cm /Im0 Do Q`;
      return encode(`<< /Length ${encode(stream).length} >>\nstream\n${stream}\nendstream`);
    })()
  ];

  const chunks = [encode('%PDF-1.4\n')];
  const offsets = [0];
  let cursor = chunks[0].length;
  objects.forEach((object, index) => {
    offsets.push(cursor);
    const objectBytes = joinBytes([encode(`${index + 1} 0 obj\n`), object, encode('\nendobj\n')]);
    chunks.push(objectBytes);
    cursor += objectBytes.length;
  });
  const xrefOffset = cursor;
  const xref = [`xref\n0 ${objects.length + 1}\n`, '0000000000 65535 f \n'];
  offsets.slice(1).forEach((offset) => xref.push(`${String(offset).padStart(10, '0')} 00000 n \n`));
  chunks.push(encode(xref.join('')));
  chunks.push(encode(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`));
  return joinBytes(chunks);
};

export const downloadCertificatePdf = ({ username, courseTitle, score }) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1131;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#050914');
  gradient.addColorStop(0.55, '#0b1224');
  gradient.addColorStop(1, '#13091f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#00e6ff';
  ctx.lineWidth = 5;
  ctx.strokeRect(55, 55, canvas.width - 110, canvas.height - 110);
  ctx.strokeStyle = 'rgba(157,78,221,0.72)';
  ctx.lineWidth = 2;
  ctx.strokeRect(78, 78, canvas.width - 156, canvas.height - 156);

  ctx.textAlign = 'center';
  ctx.direction = 'ltr';
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 74px Arial';
  ctx.fillText('Shield', 760, 205);
  ctx.fillStyle = '#00e6ff';
  ctx.fillText('X', 910, 205);
  ctx.font = '700 25px Arial';
  ctx.fillStyle = '#8a96ab';
  ctx.fillText('CYBERSECURITY LEARNING CERTIFICATE', 800, 250);

  ctx.direction = 'rtl';
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 56px Arial';
  ctx.fillText('תעודת הסמכה', 800, 370);
  ctx.font = '500 28px Arial';
  ctx.fillStyle = '#aeb8c9';
  ctx.fillText('מוענקת בזאת ל־', 800, 430);
  ctx.font = '900 58px Arial';
  ctx.fillStyle = '#00e6ff';
  ctx.fillText(username, 800, 510);

  ctx.font = '500 27px Arial';
  ctx.fillStyle = '#aeb8c9';
  ctx.fillText('על השלמה מוצלחת של הקורס', 800, 585);
  ctx.font = '800 38px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(courseTitle, 800, 650);

  ctx.fillStyle = 'rgba(0,230,255,0.08)';
  ctx.strokeStyle = 'rgba(0,230,255,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(610, 710, 380, 105, 24);
  ctx.fill();
  ctx.stroke();
  ctx.font = '900 42px Arial';
  ctx.fillStyle = '#7ff6ff';
  ctx.fillText(`ציון: ${score}%`, 800, 777);

  const date = new Intl.DateTimeFormat('he-IL', { dateStyle: 'long' }).format(new Date());
  const certificateId = `SX-${Date.now().toString(36).toUpperCase()}`;
  ctx.font = '600 22px Arial';
  ctx.fillStyle = '#8490a5';
  ctx.fillText(`תאריך הנפקה: ${date}`, 800, 895);
  ctx.direction = 'ltr';
  ctx.font = '600 19px Arial';
  ctx.fillText(`Certificate ID: ${certificateId}`, 800, 935);
  ctx.font = '700 20px Arial';
  ctx.fillStyle = '#9d4edd';
  ctx.fillText('Developed by Yaniv & Lev', 800, 1015);

  const jpegBase64 = canvas.toDataURL('image/jpeg', 0.94).split(',')[1];
  const binary = atob(jpegBase64);
  const jpegBytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const pdfBytes = buildPdfFromJpeg(jpegBytes, canvas.width, canvas.height);
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ShieldX-${courseTitle.replace(/[^\p{L}\p{N}]+/gu, '-')}-${username}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
};

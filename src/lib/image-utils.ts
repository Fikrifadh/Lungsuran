export function parseImages(imagesStr: string | null | undefined): string[] {
  if (!imagesStr) return [];
  
  // Jika sudah pakai pemisah baru (|)
  if (imagesStr.includes('|')) {
    return imagesStr.split('|').map(s => s.trim()).filter(Boolean);
  }
  
  // Fallback untuk yang lama pakai koma,
  // Perbaiki masalah base64 yang terpotong karena split koma
  const chunks = imagesStr.split(',');
  const result: string[] = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i].trim();
    if (chunk.startsWith('data:image/') && chunk.includes('base64')) {
      // Gabungkan kembali dengan chunk berikutnya karena terpotong
      if (i + 1 < chunks.length) {
        result.push(chunk + ',' + chunks[i + 1].trim());
        i++; 
      } else {
        result.push(chunk);
      }
    } else {
      if (chunk) result.push(chunk);
    }
  }
  return result;
}

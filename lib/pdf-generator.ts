import { renderToFile, renderToStream, Document, DocumentProps } from '@react-pdf/renderer';
import { createWriteStream } from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import React from 'react';

// Daha genel ReactElement tipi için
type AnyReactElement = React.ReactElement<any, any>;

// PDF dosyası oluşturma
export const generatePDF = async (
  component: AnyReactElement,
  outputPath?: string
): Promise<{ filePath: string }> => {
  try {
    // Belirtilen bir çıktı yolu yoksa, geçici bir dosya oluştur
    if (!outputPath) {
      const tempDir = os.tmpdir();
      const fileName = `program-${uuidv4()}.pdf`;
      outputPath = path.join(tempDir, fileName);
    }
    
    // PDF bileşenini dosyaya render et
    await renderToFile(component, outputPath);
    
    return { filePath: outputPath };
  } catch (error) {
    console.error('PDF oluşturma hatası:', error);
    throw new Error('PDF dosyası oluşturulamadı');
  }
};

// PDF'i stream olarak döndür (HTTP yanıtında doğrudan kullanmak için)
export const streamPDF = async (
  component: AnyReactElement
): Promise<NodeJS.ReadableStream> => {
  try {
    return await renderToStream(component);
  } catch (error) {
    console.error('PDF stream oluşturma hatası:', error);
    throw new Error('PDF stream oluşturulamadı');
  }
};

// PDF'i buffer olarak döndür
export const bufferPDF = async (
  component: AnyReactElement
): Promise<Buffer> => {
  try {
    const stream = await renderToStream(component);
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  } catch (error) {
    console.error('PDF buffer oluşturma hatası:', error);
    throw new Error('PDF buffer oluşturulamadı');
  }
}; 
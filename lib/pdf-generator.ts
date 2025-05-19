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
    console.log('PDF oluşturma başladı...');
    
    // Belirtilen bir çıktı yolu yoksa, geçici bir dosya oluştur
    if (!outputPath) {
      const tempDir = os.tmpdir();
      const fileName = `program-${uuidv4()}.pdf`;
      outputPath = path.join(tempDir, fileName);
      console.log(`Geçici dosya yolu: ${outputPath}`);
    } else {
      console.log(`Belirtilen dosya yolu: ${outputPath}`);
    }
    
    // PDF bileşenini dosyaya render et
    console.log('PDF render işlemi başlatılıyor...');
    await renderToFile(component, outputPath);
    console.log('PDF render işlemi tamamlandı.');
    
    return { filePath: outputPath };
  } catch (error) {
    console.error('PDF oluşturma hatası:', error);
    if (error instanceof Error) {
      console.error('Hata detayı:', error.message);
      console.error('Stack trace:', error.stack);
    }
    throw new Error(`PDF dosyası oluşturulamadı: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// PDF'i stream olarak döndür (HTTP yanıtında doğrudan kullanmak için)
export const streamPDF = async (
  component: AnyReactElement
): Promise<NodeJS.ReadableStream> => {
  try {
    console.log('PDF stream oluşturuluyor...');
    const stream = await renderToStream(component);
    console.log('PDF stream oluşturuldu.');
    return stream;
  } catch (error) {
    console.error('PDF stream oluşturma hatası:', error);
    if (error instanceof Error) {
      console.error('Hata detayı:', error.message);
      console.error('Stack trace:', error.stack);
    }
    throw new Error(`PDF stream oluşturulamadı: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// PDF'i buffer olarak döndür
export const bufferPDF = async (
  component: AnyReactElement
): Promise<Buffer> => {
  try {
    console.log('PDF buffer için stream oluşturuluyor...');
    const stream = await renderToStream(component);
    console.log('Stream oluşturuldu, buffer toplanıyor...');
    
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      let size = 0;
      
      stream.on('data', (chunk) => {
        chunks.push(chunk);
        size += chunk.length;
        console.log(`Chunk alındı: ${chunk.length} bytes (Toplam: ${size} bytes)`);
      });
      
      stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        console.log(`PDF buffer oluşturuldu. Toplam boyut: ${buffer.length} bytes`);
        resolve(buffer);
      });
      
      stream.on('error', (err) => {
        console.error('Stream hatası:', err);
        reject(err);
      });
    });
  } catch (error) {
    console.error('PDF buffer oluşturma hatası:', error);
    if (error instanceof Error) {
      console.error('Hata detayı:', error.message);
      console.error('Stack trace:', error.stack);
    }
    throw new Error(`PDF buffer oluşturulamadı: ${error instanceof Error ? error.message : String(error)}`);
  }
}; 
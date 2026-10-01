import mammoth from 'mammoth';

export interface ParsedFileInfo {
  name: string;
  size: number;
  type: string;
  extension: string;
  previewUrl?: string;
  extractedText?: string;
  inlineData?: {
    mimeType: string;
    data: string; // base64 without prefix
  };
}

// Convert File to base64 string
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove data:mime/type;base64,
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

// Parse uploaded file (pdf, docx, img, txt)
export async function processUploadedFile(file: File): Promise<ParsedFileInfo> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const fileInfo: ParsedFileInfo = {
    name: file.name,
    size: file.size,
    type: file.type,
    extension,
  };

  // 1. Text files (.txt, .md, etc.)
  if (extension === 'txt' || file.type.includes('text') || extension === 'md') {
    const text = await file.text();
    fileInfo.extractedText = text;
    return fileInfo;
  }

  // 2. DOCX files (.docx)
  if (extension === 'docx' || file.type.includes('wordprocessingml')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      fileInfo.extractedText = result.value;
    } catch (err) {
      console.warn('DOCX text extraction failed, sending as fallback binary info', err);
      fileInfo.extractedText = `[DOCX 문서: ${file.name}]`;
    }
    return fileInfo;
  }

  // 3. PDF files (.pdf)
  if (extension === 'pdf' || file.type === 'application/pdf') {
    const base64 = await fileToBase64(file);
    fileInfo.inlineData = {
      mimeType: 'application/pdf',
      data: base64,
    };
    return fileInfo;
  }

  // 4. Image files (.png, .jpg, .jpeg, .webp, .bmp, .gif)
  if (file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(extension)) {
    const base64 = await fileToBase64(file);
    fileInfo.previewUrl = `data:${file.type || 'image/png'};base64,${base64}`;
    fileInfo.inlineData = {
      mimeType: file.type || 'image/png',
      data: base64,
    };
    return fileInfo;
  }

  // Fallback as text
  try {
    const text = await file.text();
    fileInfo.extractedText = text;
  } catch {
    const base64 = await fileToBase64(file);
    fileInfo.inlineData = {
      mimeType: file.type || 'application/octet-stream',
      data: base64,
    };
  }

  return fileInfo;
}

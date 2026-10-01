declare module 'mammoth' {
  export function extractRawText(input: { arrayBuffer: ArrayBuffer } | { path: string } | { buffer: Buffer }): Promise<{ value: string; messages: any[] }>;
  export function convertToHtml(input: any): Promise<{ value: string; messages: any[] }>;
}

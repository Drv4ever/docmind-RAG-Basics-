import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

export async function parsePdf(buffer) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str).join(" ");
    pages.push({ page: i, text: text.replace(/\s+/g, " ").trim() });
  }
  return pages;
}

import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({ providedIn: 'root' })
export class PdfService {
  constructor() {}

  generateSimplePdf(title: string, sections: {heading: string, body: string}[]) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 14, 20);
    doc.setFontSize(12);
    let y = 30;
    sections.forEach(sec => {
      doc.setFontSize(14);
      doc.text(sec.heading, 14, y);
      y += 6;
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(sec.body, 180);
      doc.text(lines, 14, y);
      y += lines.length * 6 + 8;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    return doc;
  }
}

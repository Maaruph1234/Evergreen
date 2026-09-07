import * as XLSX from 'xlsx';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  ImageRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  HeadingLevel,
  PageOrientation,
} from 'docx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { OutreachRecord } from './donor-auth';

const ORG_NAME = 'EVERGREEN LIFECARE SUPPORT FOUNDATION';
const ORG_TITLE = 'OUTREACH GENERAL ATTENDANCE REGISTER';
const ORG_PHONE = '09129797010, 07030599812';
const ORG_EMAIL = 'info@evergreenlifecare.ng';
const ORG_WEB = 'www.evergreenlifecare.org';
const ORG_ADDRESS = 'No. 10, Fadila Estate Road, Gesse Phase 2, Birnin Kebbi Kebbi State';
const LOGO_PATH = '/assets/EVERGREEN%20LOGO%201.png';

const COLUMNS = [
  'S/NO',
  'DATE',
  'OUTREACH NO.',
  'SURNAME',
  'OTHER NAMES',
  'DATE OF BIRTH',
  'SEX',
  'AGE',
  'PHONE NO.',
  'OCCUPATION',
  'ADDRESS',
  'NEXT OF KIN',
  'NEXT OF KIN ADDRESS',
];

function safeFilenamePart(s: string): string {
  return s.replace(/[^a-z0-9-]+/gi, '-').replace(/^-+|-+$/g, '') || 'register';
}

function toRow(record: OutreachRecord, index: number): (string | number)[] {
  return [
    index + 1,
    record.entry_date || '',
    record.outreach_no,
    record.surname,
    record.other_names || '',
    record.date_of_birth || '',
    record.sex || '',
    record.age ?? '',
    record.phone || '',
    record.occupation || '',
    record.address || '',
    record.next_of_kin || '',
    record.next_of_kin_address || '',
  ];
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function fetchLogoArrayBuffer(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(LOGO_PATH);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

/** Builds and downloads an editable .xlsx copy of the register for one outreach batch. */
export function exportOutreachExcel(records: OutreachRecord[], outreachNo: string): void {
  const rows = records.map((r, i) => toRow(r, i));

  const sheetData: (string | number)[][] = [
    [ORG_NAME],
    [ORG_TITLE],
    [`Outreach No: ${outreachNo}`],
    [`${ORG_ADDRESS}  |  ${ORG_PHONE}  |  ${ORG_EMAIL}  |  ${ORG_WEB}`],
    [],
    COLUMNS,
    ...rows,
  ];

  const sheet = XLSX.utils.aoa_to_sheet(sheetData);
  sheet['!cols'] = COLUMNS.map((c) => ({ wch: Math.max(12, c.length + 2) }));
  sheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: COLUMNS.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: COLUMNS.length - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: COLUMNS.length - 1 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: COLUMNS.length - 1 } },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Attendance Register');
  XLSX.writeFile(workbook, `Outreach-${safeFilenamePart(outreachNo)}-Register.xlsx`);
}

/** Builds and downloads a Word (.docx) copy of the register for one outreach batch. */
export async function exportOutreachWord(records: OutreachRecord[], outreachNo: string): Promise<void> {
  const logoBuffer = await fetchLogoArrayBuffer();

  const headerChildren: Paragraph[] = [];
  headerChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: ORG_NAME, bold: true, size: 36 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: ORG_TITLE, bold: true, size: 26 })],
      spacing: { after: 120 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Outreach No: ${outreachNo}`, bold: true, size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: `${ORG_ADDRESS}  |  ${ORG_PHONE}  |  ${ORG_EMAIL}  |  ${ORG_WEB}`, size: 18 }),
      ],
      spacing: { after: 200 },
    })
  );

  if (logoBuffer) {
    headerChildren.unshift(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: { width: 70, height: 70 },
            type: 'png',
          }),
        ],
        spacing: { after: 100 },
      })
    );
  }

  const headerCellStyle = { fill: 'CCCCCC' };
  const borders = {
    top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
  };

  const headerRow = new TableRow({
    tableHeader: true,
    children: COLUMNS.map(
      (c) =>
        new TableCell({
          shading: headerCellStyle,
          borders,
          children: [new Paragraph({ children: [new TextRun({ text: c, bold: true, size: 16 })] })],
        })
    ),
  });

  const dataRows = records.map(
    (r, i) =>
      new TableRow({
        children: toRow(r, i).map(
          (val) =>
            new TableCell({
              borders,
              children: [new Paragraph({ children: [new TextRun({ text: String(val), size: 16 })] })],
            })
        ),
      })
  );

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
          },
        },
        children: [...headerChildren, table],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `Outreach-${safeFilenamePart(outreachNo)}-Register.docx`);
}

/** Builds and downloads a PDF copy of the register for one outreach batch. */
export async function exportOutreachPdf(records: OutreachRecord[], outreachNo: string): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  const logoBuffer = await fetchLogoArrayBuffer();
  let textStartX = 14;
  if (logoBuffer) {
    try {
      const base64 = arrayBufferToBase64(logoBuffer);
      doc.addImage(`data:image/png;base64,${base64}`, 'PNG', 10, 8, 20, 20);
      textStartX = 34;
    } catch {
      /* ignore image failures, still render the rest of the document */
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(ORG_NAME, pageWidth / 2, 14, { align: 'center' });
  doc.setFontSize(12);
  doc.text(ORG_TITLE, pageWidth / 2, 21, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Outreach No: ${outreachNo}`, pageWidth / 2, 27, { align: 'center' });
  doc.text(`${ORG_ADDRESS}  |  ${ORG_PHONE}  |  ${ORG_EMAIL}  |  ${ORG_WEB}`, pageWidth / 2, 32, {
    align: 'center',
  });
  void textStartX;

  autoTable(doc, {
    startY: 38,
    head: [COLUMNS],
    body: records.map((r, i) => toRow(r, i)),
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`Outreach-${safeFilenamePart(outreachNo)}-Register.pdf`);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

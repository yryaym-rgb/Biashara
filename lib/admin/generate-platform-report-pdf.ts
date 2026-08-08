import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { PlatformReportSummary } from '@/lib/admin/reports-queries';

export interface PlatformReportPdfLabels {
  title: string;
  generatedAt: string;
  totalUsers: string;
  totalListings: string;
  totalOrders: string;
  totalVolume: string;
  disputeRate: string;
  kycFunnel: string;
  listingFunnel: string;
  mineralDistribution: string;
  footer: string;
  statusLabels: Record<string, string>;
  mineralLabels: Record<string, string>;
}

export async function generatePlatformReportPdf(
  summary: PlatformReportSummary,
  labels: PlatformReportPdfLabels,
  formattedVolume: string,
  formattedDisputeRate: string,
  generatedTimestamp: string,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 48;
  let y = 780;
  const ink = rgb(0.055, 0.165, 0.278);
  const body = rgb(0.357, 0.42, 0.486);
  const muted = rgb(0.541, 0.592, 0.651);

  function drawLine(text: string, size: number, color = ink, bold = false) {
    page.drawText(text, {
      x: margin,
      y,
      size,
      font: bold ? fontBold : font,
      color,
    });
    y -= size + 10;
  }

  drawLine(labels.title, 18, ink, true);
  y -= 4;
  drawLine(`${labels.generatedAt} : ${generatedTimestamp}`, 11, muted);
  y -= 12;

  drawLine(labels.totalUsers, 12, body);
  drawLine(String(summary.totalUsers), 14, ink, true);
  drawLine(labels.totalListings, 12, body);
  drawLine(String(summary.totalListings), 14, ink, true);
  drawLine(labels.totalOrders, 12, body);
  drawLine(String(summary.totalOrders), 14, ink, true);
  drawLine(labels.totalVolume, 12, body);
  drawLine(formattedVolume, 14, ink, true);
  drawLine(labels.disputeRate, 12, body);
  drawLine(formattedDisputeRate, 14, ink, true);
  y -= 8;

  drawLine(labels.kycFunnel, 12, muted, true);
  for (const segment of summary.kycFunnel) {
    const label = labels.statusLabels[segment.status] ?? segment.status;
    drawLine(`  ${label}: ${segment.count}`, 11, body);
  }
  y -= 4;

  drawLine(labels.listingFunnel, 12, muted, true);
  for (const segment of summary.listingFunnel) {
    const label = labels.statusLabels[segment.status] ?? segment.status;
    drawLine(`  ${label}: ${segment.count}`, 11, body);
  }
  y -= 4;

  drawLine(labels.mineralDistribution, 12, muted, true);
  for (const segment of summary.mineralDistribution) {
    const label = labels.mineralLabels[segment.mineral] ?? segment.mineral;
    drawLine(`  ${label}: ${segment.count}`, 11, body);
  }
  y -= 12;

  drawLine(labels.footer, 10, muted);

  return pdfDoc.save();
}

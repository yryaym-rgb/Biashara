import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { formatOrderReference } from '@/lib/platform/order-status';

export interface OrderSummaryPdfData {
  orderId: string;
  orderDate: string;
  mineralLabel: string;
  listingTitle: string;
  quantity: number;
  unitLabel: string;
  priceAmount: number;
  currency: string;
  totalAmount: number;
  buyerCompanyName: string;
  sellerCompanyName: string;
  formattedPricePerUnit: string;
  formattedTotal: string;
}

export async function generateOrderSummaryPdf(data: OrderSummaryPdfData): Promise<Uint8Array> {
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

  drawLine('BIASHARA — Récapitulatif de commande', 18, ink, true);
  y -= 8;
  drawLine(`Référence : ${formatOrderReference(data.orderId)}`, 12, body);
  drawLine(`Date de commande : ${data.orderDate}`, 12, body);
  y -= 12;

  drawLine('Minéral', 11, muted, true);
  drawLine(data.mineralLabel, 14, ink, true);
  drawLine(data.listingTitle, 12, body);
  y -= 8;

  drawLine('Quantité et prix (figés à l\'acceptation)', 11, muted, true);
  drawLine(`${data.quantity} ${data.unitLabel}`, 12, body);
  drawLine(data.formattedPricePerUnit, 12, body);
  drawLine(`Total : ${data.formattedTotal}`, 14, ink, true);
  y -= 12;

  drawLine('Parties', 11, muted, true);
  drawLine(`Acheteur : ${data.buyerCompanyName}`, 12, body);
  drawLine(`Vendeur : ${data.sellerCompanyName}`, 12, body);
  y -= 16;

  drawLine(
    'Document généré automatiquement à partir des données de la commande.',
    10,
    muted,
  );
  drawLine(
    'La confirmation numérique des termes sur la plateforme ne constitue pas une signature électronique qualifiée.',
    10,
    muted,
  );

  return pdfDoc.save();
}

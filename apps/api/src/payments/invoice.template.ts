export interface InvoiceTemplateData {
  invoiceNo: string;
  schoolName: string;
  studentName: string;
  admissionNo: string;
  className: string;
  amount: number;
  paymentMode: string;
  referenceNo: string | null;
  paymentDate: string;
  currency: string;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function renderInvoiceHtml(data: InvoiceTemplateData): string {
  const money = `${data.currency} ${data.amount.toLocaleString('en-IN')}`;
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #111; padding: 40px; }
  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 16px; }
  .school { font-size: 22px; font-weight: 700; color: #2563eb; }
  .title { font-size: 18px; font-weight: 600; text-align: right; }
  .meta { margin-top: 24px; font-size: 14px; line-height: 1.8; }
  table { width: 100%; border-collapse: collapse; margin-top: 24px; }
  th, td { border: 1px solid #e5e7eb; padding: 10px 12px; text-align: left; font-size: 14px; }
  th { background: #f3f4f6; }
  .total { text-align: right; font-size: 18px; font-weight: 700; margin-top: 24px; }
  .footer { margin-top: 40px; font-size: 12px; color: #6b7280; text-align: center; }
</style>
</head>
<body>
  <div class="header">
    <div class="school">${escapeHtml(data.schoolName)}</div>
    <div class="title">Fee Receipt<br/><span style="font-size:13px;color:#6b7280">${escapeHtml(
      data.invoiceNo,
    )}</span></div>
  </div>
  <div class="meta">
    <strong>Student:</strong> ${escapeHtml(data.studentName)}<br/>
    <strong>Admission No:</strong> ${escapeHtml(data.admissionNo)}<br/>
    <strong>Class:</strong> ${escapeHtml(data.className)}<br/>
    <strong>Date:</strong> ${escapeHtml(data.paymentDate)}
  </div>
  <table>
    <thead><tr><th>Description</th><th>Mode</th><th>Reference</th><th>Amount</th></tr></thead>
    <tbody>
      <tr>
        <td>Fee Payment</td>
        <td>${escapeHtml(data.paymentMode)}</td>
        <td>${escapeHtml(data.referenceNo ?? '-')}</td>
        <td>${money}</td>
      </tr>
    </tbody>
  </table>
  <div class="total">Total Paid: ${money}</div>
  <div class="footer">This is a system-generated receipt from EduFees Pro.</div>
</body>
</html>`;
}

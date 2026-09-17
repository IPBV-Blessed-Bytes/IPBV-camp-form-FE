const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const toNumber = (value) => {
  const cleaned = String(value ?? '')
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  const n = Number(cleaned);
  return Number.isNaN(n) ? 0 : n;
};

const formatBRL = (value) =>
  Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PAYMENT_LABELS = {
  creditCard: 'Cartão de Crédito',
  pix: 'PIX',
  ticket: 'Boleto Bancário',
  boleto: 'Boleto Bancário',
};

export const buildReceiptHtml = (group, accountEmail) => {
  const regs = group.registrations || [];
  const total = regs.reduce((acc, r) => acc + toNumber(r.totalPrice), 0);
  const method = PAYMENT_LABELS[regs.find((r) => r.paymentMethod)?.paymentMethod] || 'Não Pagante';
  const issuedAt = new Date().toLocaleString('pt-BR');

  const rows = regs
    .map(
      (r) => `
        <tr>
          <td>${escapeHtml(r.name || '—')}</td>
          <td>${escapeHtml(r.cpf || '—')}</td>
          <td>${escapeHtml(r.accomodation || '—')}</td>
          <td>${escapeHtml(r.transportation || '—')}</td>
          <td class="right">${r.totalPrice ? `R$ ${escapeHtml(r.totalPrice)}` : '—'}</td>
        </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Recibo - Pedido ${escapeHtml(group.orderNumber || '')}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #1d2939; margin: 0; padding: 32px; }
    .receipt { max-width: 720px; margin: 0 auto; }
    .header { border-bottom: 3px solid #007185; padding-bottom: 12px; margin-bottom: 20px; }
    .header h1 { color: #007185; margin: 0 0 2px; font-size: 22px; }
    .header p { margin: 0; color: #667085; font-size: 13px; }
    .meta { display: flex; flex-wrap: wrap; gap: 6px 32px; margin-bottom: 20px; font-size: 14px; }
    .meta div span { color: #667085; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
    th { text-align: left; background: #f1f6f8; padding: 8px 10px; border-bottom: 2px solid #d0d5dd; }
    td { padding: 8px 10px; border-bottom: 1px solid #eaecf0; }
    .right { text-align: right; white-space: nowrap; }
    .total { text-align: right; font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .status { font-size: 14px; margin-bottom: 24px; }
    .note { color: #667085; font-size: 12px; border-top: 1px solid #eaecf0; padding-top: 12px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>ACAMPAMENTO IPBV</h1>
      <p>Recibo de Inscrição</p>
    </div>
    <div class="meta">
      <div><span>Pedido nº:</span> <b>${escapeHtml(group.orderNumber || '—')}</b></div>
      <div><span>Emitido em:</span> <b>${escapeHtml(issuedAt)}</b></div>
      <div><span>Conta:</span> <b>${escapeHtml(accountEmail || '—')}</b></div>
      <div><span>Forma de pagamento:</span> <b>${escapeHtml(method)}</b></div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Campista</th>
          <th>CPF</th>
          <th>Hospedagem</th>
          <th>Transporte</th>
          <th class="right">Valor</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="total">Total: ${formatBRL(total)}</div>
    <div class="note">
      Comprovante interno de inscrição do Acampamento IPBV. Este documento NÃO é uma nota fiscal.
    </div>
  </div>
</body>
</html>`;
};

export const printReceipt = (group, accountEmail) => {
  const html = buildReceiptHtml(group, accountEmail);
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 250);
};

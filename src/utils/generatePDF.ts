import puppeteer from 'puppeteer-core';
import chrome from '@sparticuz/chromium';
import path from "path";
import fs from "fs";
import dotenv from 'dotenv'

dotenv.config();

interface Product {
  name: string;
  qty: number;
  rate: number;
}

interface InvoiceData {
  customerName: string;
  email: string;
  date: string;
  products: Product[];
  total: number;
  gst: number;
  grandTotal: number;
}

export const generatePDF = async (data: InvoiceData): Promise<string> => {
  const executablePath =
    process.env.NODE_ENV === "production"
      ? await chrome.executablePath()
      : puppeteer.executablePath();

  const browser = await puppeteer.launch({
    args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
    executablePath,
    headless: true,
  });
  const page = await browser.newPage();
  const logoPath = path.resolve(__dirname, "../../public/Logo.jpg");
  const logoBase64 = fs.readFileSync(logoPath).toString("base64");
  const logoSrc = `data:image/jpeg;base64,${logoBase64}`;

  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background:#f9fafb; padding:40px; }
          .card { background:white; max-width:750px; margin:auto; padding:40px; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.1); }
          
          .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid #eee; padding-bottom:12px; }
          .logo { display:flex; align-items:center; gap:10px; }
          .logo-icon { width:40px; height:40px; background:black; border-radius:6px; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; }
          .company h2 { margin:0; font-size:18px; }
          .company p { margin:0; font-size:12px; color:#666; }
          .title { text-align:right; }
          .title h1 { font-size:16px; margin:0; }
          .title p { font-size:11px; color:#999; margin:0; }

          .userinfo { display:flex; justify-content:space-between; align-items:center; margin-top:20px; background:linear-gradient(135deg, #0f172a 0%, #111827 55%, #193121 100%); padding:20px; border-radius:12px; color:white; }
          .userinfo .name { font-size:14px; }
          .userinfo .person { font-weight:bold; color:#a3e635; margin-top:4px; }
          .userinfo .date { font-size:12px; }
          .userinfo .email { background:#111827; padding:5px 10px; border-radius:12px; font-size:11px; display:inline-block; margin-top:6px; }

          table { width:100%; border-collapse:separate; border-spacing:0; margin-top:25px; font-size:14px; }
          thead{
            background:linear-gradient(to right, #1e1b4b, #14532d);
            text-align:left;
          }
          thead th {
            color:white;
            padding:14px 10px;
            font-weight:600;
            font-size:14px;
            border:none;
          }
          thead th:first-child {
            border-top-left-radius:18px;
            border-bottom-left-radius:18px;
          }
          thead th:last-child {
            border-top-right-radius:18px;
            border-bottom-right-radius:18px;
          }
          tbody tr {
            background:transparent;
          }
          tbody tr:nth-child(even) td {
            background:#f9fafb;
          }
          tbody tr:nth-child(odd) td {
            background:#ffffff;
          }
          tbody td {
            padding:14px 10px;
            border:none;
            font-size:14px;
          }
          tbody tr td:first-child {
            border-bottom-left-radius:18px;
          }
          tbody tr td:last-child {
            border-bottom-right-radius:18px;
          }

          .totals { display:flex; justify-content:flex-end; margin-top:25px; }
          .totals-box { border:1px solid #ddd; border-radius:8px; padding:15px 20px; width:220px; }
          .totals-box p { margin:6px 0; display:flex; justify-content:space-between; font-size:14px; color:#444; }
          .totals-box .grand { font-weight:bold; font-size:16px; border-top:1px solid #ddd; padding-top:10px; margin-top:10px; color:#2563eb; }

          .footer { margin-top:40px; text-align:center; font-size:12px; background:#111827; color:white; padding:12px 20px; border-radius:20px; }
        </style>
      </head>
      <body>
        <div class="card">
          <!-- Header -->
          <div class="header">
            <div class="logo">
              <div class="logo-icon">
                <img src="${logoSrc}" alt="Logo" style="width:40px; height:40px; border-radius:6px;" />
              </div>
              <div class="company">
                <h2>Levitation</h2>
                <p>Infotech</p>
              </div>
            </div>
            <div class="title">
              <h1>INVOICE GENERATOR</h1>
            </div>
          </div>

          <div class="userinfo">
            <div>
              <div class="name">Name</div>
              <div class="person">${data.customerName}</div>
            </div>
            <div style="text-align:right">
              <div class="date">Date: ${data.date}</div>
              <div class="email">${data.email}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${data.products
                .map(
                  (p) => `
                <tr>
                  <td>${p.name}</td>
                  <td>${p.qty}</td>
                  <td>${p.rate}</td>
                  <td>INR ${(p.qty * p.rate).toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-box">
              <p><span>Total Charges</span><span>₹ ${data.total.toFixed(
                2
              )}</span></p>
              <p><span>GST (18%)</span><span>₹ ${data.gst.toFixed(2)}</span></p>
              <p class="grand"><span>Total Amount</span><span>₹ ${data.grandTotal.toFixed(
                2
              )}</span></p>
            </div>
          </div>

          <div class="footer">
            We are pleased to provide any further information you may require and look forward to assisting 
            with your next order. Rest assured, it will receive our prompt and dedicated attention.
          </div>
        </div>
      </body>
    </html>
  `;

  await page.setContent(html);

  const invoicesDir = path.join(__dirname, "../../public/invoices");
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const fileName = `invoice_${Date.now()}.pdf`;
  const filePath = path.join(invoicesDir, fileName);

  await page.pdf({ path: filePath, format: "A4", printBackground: true });
  await browser.close();

  return fileName;
};

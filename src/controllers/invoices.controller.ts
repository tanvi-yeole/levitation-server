import { Response } from "express";
import path from "path";
import Invoice from "../models/invoice.model";
import { AuthRequest } from "../middleware/auth.middleware";
import { generatePDF } from "../utils/generatePDF";
import dotenv from "dotenv"

dotenv.config();

interface Product {
  name: string;
  qty: number;
  rate: number;
}

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { products } = req.body as { products: Product[] };

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products are required' });
    }

    const enrichedProducts = products.map((p) => {
      const total = p.qty * p.rate;
      const gst = total * 0.18;
      return {
        ...p,
        total,
        gst
      };
    });

    const grandTotal = enrichedProducts.reduce(
      (sum, p) => sum + p.total + p.gst,
      0
    );

    const pdfBase64 = await generatePDF({
      customerName: req.user.name,
      email: req.user.email,
      date: new Date().toISOString(),
      products: enrichedProducts,
      total: grandTotal - grandTotal * 0.18,
      gst: grandTotal * 0.18,
      grandTotal
    });

    const fileName = `invoice_${Date.now()}.pdf`;

    const invoice = new Invoice({
      userId: req.user.id,
      products: enrichedProducts,
      grandTotal,
      pdfPath: fileName 
    });
    await invoice.save();

    res.json({
      message: 'Invoice created successfully',
      pdfData: pdfBase64,
      fileName: fileName,
      downloadLink: `data:application/pdf;base64,${pdfBase64}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getUserInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

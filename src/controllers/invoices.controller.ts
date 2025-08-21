import { Response } from "express";
import path from "path";
import Invoice from "../models/invoice.model";
import { AuthRequest } from "../middleware/auth.middleware";
import { generatePDF } from "../utils/generatePDF";

interface Product {
  name: string;
  qty: number;
  rate: number;
}

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { products } = req.body as { products: Product[] };

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Products are required" });
    }

    const enrichedProducts = products.map((p) => {
      const total = p.qty * p.rate;
      const gst = total * 0.18;
      return {
        ...p,
        total,
        gst,
      };
    });

    const grandTotal = enrichedProducts.reduce(
      (sum, p) => sum + p.total + p.gst,
      0
    );

    const pdfPath = await generatePDF({
      customerName: req.user.name,
      email: req.user.email, // <-- add email
      date: new Date().toLocaleDateString("en-GB"),
      products: enrichedProducts.map((p: any) => ({
        name: p.name,
        qty: p.qty,
        rate: p.rate,
        total: p.total,
        gst: p.gst,
      })),
      total: enrichedProducts.reduce((sum, p) => sum + p.total, 0),
      gst: enrichedProducts.reduce((sum, p) => sum + p.gst, 0),
      grandTotal,
    });

    const invoice = new Invoice({
      userId: req.user.id,
      products: enrichedProducts,
      grandTotal,
      pdfPath: `/invoices/${path.basename(pdfPath)}`,
    });
    await invoice.save();

    const fileName = path.basename(pdfPath);
    res.json({
      message: "Invoice created successfully",
      downloadLink: `/invoices/${fileName}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err });
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

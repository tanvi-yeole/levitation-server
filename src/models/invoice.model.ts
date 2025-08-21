import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct {
  name: string;
  qty: number;
  rate: number;
  total: number;
  gst: number;
}

export interface IInvoice extends Document {
  userId: mongoose.Types.ObjectId;
  products: IProduct[];
  grandTotal: number;
  pdfPath: string;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    qty: { type: Number, required: true },
    rate: { type: Number, required: true },
    total: { type: Number, required: true },
    gst: { type: Number, required: true },
  },
  { _id: false }
);

const InvoiceSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    products: { type: [ProductSchema], required: true },
    grandTotal: { type: Number, required: true },
    pdfPath: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);

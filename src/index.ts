import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

import authRoutes from './routes/user.route';
import invoiceRoutes from './routes/invoices.route';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/', express.static(path.join(process.cwd(), 'public')));

app.use('/api/user', authRoutes);
app.use('/api/invoice', invoiceRoutes);

mongoose.connect(process.env.MONGODB_URI!)
  .catch(err => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});

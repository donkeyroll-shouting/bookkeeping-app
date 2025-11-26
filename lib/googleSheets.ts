import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Config
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: SCOPES,
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);

export interface Transaction {
  id: string;
  date: string;
  type: 'Income' | 'Expense';
  amount: number;
  category: string;
  description: string;
}

// Helper to load doc
async function loadDoc() {
  await doc.loadInfo();
  return doc.sheetsByIndex[0];
}

export const googleSheetsService = {
  async getTransactions(): Promise<Transaction[]> {
    const sheet = await loadDoc();
    const rows = await sheet.getRows();
    return rows.map((row) => ({
      id: row.get('id'),
      date: row.get('date'),
      type: row.get('type') as 'Income' | 'Expense',
      amount: parseFloat(row.get('amount')),
      category: row.get('category'),
      description: row.get('description'),
    }));
  },

  async addTransaction(data: Omit<Transaction, 'id'>) {
    const sheet = await loadDoc();
    const newRow = {
        id: crypto.randomUUID(),
        ...data
    };
    await sheet.addRow(newRow);
    return newRow;
  },

  async deleteTransaction(id: string) {
    const sheet = await loadDoc();
    const rows = await sheet.getRows();
    const row = rows.find((r) => r.get('id') === id);
    if (row) {
      await row.delete();
      return true;
    }
    return false;
  },

  async updateTransaction(id: string, data: Partial<Omit<Transaction, 'id'>>) {
    const sheet = await loadDoc();
    const rows = await sheet.getRows();
    const row = rows.find((r) => r.get('id') === id);
    if (row) {
      if (data.date) row.assign({ date: data.date });
      if (data.type) row.assign({ type: data.type });
      if (data.amount) row.assign({ amount: data.amount });
      if (data.category) row.assign({ category: data.category });
      if (data.description) row.assign({ description: data.description });
      await row.save();
      return true;
    }
    return false;
  }
};

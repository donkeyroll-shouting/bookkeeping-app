import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { randomUUID } from 'crypto';

export interface Transaction {
  id: string;
  date: string;
  type: 'Income' | 'Expense';
  amount: number;
  category: string;
  description: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'transactions.csv');

// Helper to ensure directory and file exist, pre-populating with mock data if needed
function ensureCsvFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    // Start with a clean database - headers only
    const csvContent = "id,date,type,amount,category,description\n";
    fs.writeFileSync(FILE_PATH, csvContent, 'utf-8');
  }
}

// Service implementation
export const csvService = {
  async getTransactions(): Promise<Transaction[]> {
    ensureCsvFile();
    const csvData = fs.readFileSync(FILE_PATH, 'utf-8');
    const parsed = Papa.parse<Transaction>(csvData, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });
    
    return (parsed.data || []).map((row) => ({
      id: String(row.id),
      date: String(row.date),
      type: row.type as 'Income' | 'Expense',
      amount: Number(row.amount),
      category: String(row.category),
      description: String(row.description || ''),
    }));
  },

  async addTransaction(data: Omit<Transaction, 'id'>) {
    const transactions = await this.getTransactions();
    const newTransaction: Transaction = {
      id: randomUUID(),
      ...data
    };
    transactions.push(newTransaction);
    const csvContent = Papa.unparse(transactions);
    fs.writeFileSync(FILE_PATH, csvContent, 'utf-8');
    return newTransaction;
  },

  async deleteTransaction(id: string) {
    const transactions = await this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions.splice(index, 1);
      const csvContent = Papa.unparse(transactions);
      fs.writeFileSync(FILE_PATH, csvContent, 'utf-8');
      return true;
    }
    return false;
  },

  async updateTransaction(id: string, data: Partial<Omit<Transaction, 'id'>>) {
    const transactions = await this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = {
        ...transactions[index],
        ...data
      };
      const csvContent = Papa.unparse(transactions);
      fs.writeFileSync(FILE_PATH, csvContent, 'utf-8');
      return true;
    }
    return false;
  },

  async addBatchTransactions(newTransactions: (Omit<Transaction, 'id'> & { id?: string })[]) {
    const transactions = await this.getTransactions();
    const added: Transaction[] = newTransactions.map(t => ({
      id: t.id || randomUUID(),
      date: t.date,
      type: t.type as 'Income' | 'Expense',
      amount: Number(t.amount),
      category: t.category,
      description: t.description || ''
    }));
    transactions.push(...added);
    const csvContent = Papa.unparse(transactions);
    fs.writeFileSync(FILE_PATH, csvContent, 'utf-8');
    return added;
  },

  async deleteBatchTransactions(ids: string[]) {
    const transactions = await this.getTransactions();
    const filtered = transactions.filter(t => !ids.includes(t.id));
    const csvContent = Papa.unparse(filtered);
    fs.writeFileSync(FILE_PATH, csvContent, 'utf-8');
    return true;
  }
};

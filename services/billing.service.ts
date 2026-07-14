/**
 * Billing Service - Firebase has been removed
 * This service now returns empty arrays as no backend is available
 */

import {
  Bill,
  BillCreateInput,
  BillUpdateInput,
  BillItem,
  BillPayment,
  BillStatus,
  PaymentStatus,
} from "@/types/billing";

const COLLECTION = "bills";

function generateInvoiceNumber(prefix: string, number: number): string {
  return `${prefix}${String(number).padStart(5, "0")}`;
}

function calculateBillTotals(items: BillItem[], discountAmount: number): {
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
} {
  let subtotal = 0;
  let taxAmount = 0;

  items.forEach((item) => {
    const itemTotal = item.quantity * item.rate;
    subtotal += itemTotal;
    if (item.taxRate && item.taxAmount) {
      taxAmount += item.taxAmount;
    }
  });

  const totalAmount = subtotal + taxAmount - discountAmount;

  return {
    subtotal,
    taxAmount,
    totalAmount,
  };
}

class BillingService {
  async getBills(): Promise<Bill[]> {
    console.log("[BillingService] Firebase removed - returning empty array");
    return [];
  }

  async getBill(id: string): Promise<Bill | null> {
    return null;
  }

  async getBillsByStatus(status: BillStatus): Promise<Bill[]> {
    return [];
  }

  async getBillsByCustomer(customerName: string): Promise<Bill[]> {
    return [];
  }

  async getOverdueBills(): Promise<Bill[]> {
    return [];
  }

  async createBill(
    input: BillCreateInput,
    invoicePrefix: string = "INV",
    invoiceNumber: number = 1
  ): Promise<string> {
    throw new Error("Bill creation is not available - backend services have been removed");
  }

  async updateBill(id: string, input: BillUpdateInput): Promise<void> {
    throw new Error("Bill update is not available - backend services have been removed");
  }

  async deleteBill(id: string): Promise<void> {
    throw new Error("Bill deletion is not available - backend services have been removed");
  }

  async updateBillStatus(id: string, status: BillStatus): Promise<void> {
    throw new Error("Bill status update is not available - backend services have been removed");
  }

  async addPayment(
    billId: string,
    payment: Omit<BillPayment, "id">
  ): Promise<void> {
    throw new Error("Payment addition is not available - backend services have been removed");
  }

  async recordPayment(
    billId: string,
    amount: number,
    method: BillPayment["method"],
    reference?: string,
    notes?: string
  ): Promise<void> {
    throw new Error("Payment recording is not available - backend services have been removed");
  }
}

export const billingService = new BillingService();

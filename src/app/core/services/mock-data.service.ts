import { Injectable } from '@angular/core';
import { Member, MedicalRecord, StatusHistoryEntry, RankHistoryEntry } from '../models/member.model';
import { Item, StockTransactionRequest } from '../models/item.model';
import { Budget, Expense, Income, LedgerEntry } from '../models/finance.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  // Mock Members Data
  private mockMembers: Member[] = [
    {
      id: 1,
      militaryId: 'MIL001',
      firstName: 'John',
      lastName: 'Doe',
      nationalId: 'ID123456',
      phone: '+1234567890',
      email: 'john.doe@military.gov',
      dateOfBirth: '1990-01-15',
      dateJoined: '2015-06-20',
      rank: 'CAPTAIN',
      unit: 'Alpha Company',
      status: 'ACTIVE',
      notes: 'Senior officer',
      createdAt: '2015-06-20T10:00:00',
      updatedAt: '2024-06-09T10:00:00'
    },
    {
      id: 2,
      militaryId: 'MIL002',
      firstName: 'Jane',
      lastName: 'Smith',
      nationalId: 'ID123457',
      phone: '+1234567891',
      email: 'jane.smith@military.gov',
      dateOfBirth: '1992-03-25',
      dateJoined: '2018-09-10',
      rank: 'SERGEANT',
      unit: 'Bravo Company',
      status: 'ACTIVE',
      notes: 'Team lead',
      createdAt: '2018-09-10T10:00:00',
      updatedAt: '2024-06-09T10:00:00'
    },
    {
      id: 3,
      militaryId: 'MIL003',
      firstName: 'Michael',
      lastName: 'Johnson',
      nationalId: 'ID123458',
      phone: '+1234567892',
      email: 'michael.johnson@military.gov',
      dateOfBirth: '1995-07-30',
      dateJoined: '2020-01-15',
      rank: 'PRIVATE',
      unit: 'Bravo Company',
      status: 'ACTIVE',
      createdAt: '2020-01-15T10:00:00',
      updatedAt: '2024-06-09T10:00:00'
    }
  ];

  private mockItems: Item[] = [
    {
      id: 1,
      name: 'Rifle M16',
      description: 'Standard issue rifle',
      sku: 'RIFLE-M16-001',
      quantity: 150,
      unitPrice: 1500,
      category: 'Firearms',
      warehouse: { id: 1, name: 'Main Warehouse' },
      createdAt: '2024-01-10T10:00:00',
      updatedAt: '2024-06-09T10:00:00'
    },
    {
      id: 2,
      name: 'Ammunition 5.56mm',
      description: 'Standard ammunition rounds',
      sku: 'AMMO-5.56-001',
      quantity: 5000,
      unitPrice: 0.75,
      category: 'Ammunition',
      warehouse: { id: 1, name: 'Main Warehouse' },
      createdAt: '2024-01-10T10:00:00',
      updatedAt: '2024-06-09T10:00:00'
    },
    {
      id: 3,
      name: 'Combat Boots',
      description: 'Field combat boots',
      sku: 'BOOTS-CB-001',
      quantity: 200,
      unitPrice: 250,
      category: 'Uniforms',
      warehouse: { id: 1, name: 'Main Warehouse' },
      createdAt: '2024-02-15T10:00:00',
      updatedAt: '2024-06-09T10:00:00'
    },
    {
      id: 4,
      name: 'Tactical Vest',
      description: 'Body armor vest',
      sku: 'VEST-TV-001',
      quantity: 5,
      unitPrice: 2000,
      category: 'Protective Gear',
      warehouse: { id: 2, name: 'Secondary Warehouse' },
      createdAt: '2024-03-20T10:00:00',
      updatedAt: '2024-06-09T10:00:00'
    }
  ];

  private mockBudgets: Budget[] = [
    {
      id: 1,
      name: 'Operations Budget Q1',
      fiscalYear: 2024,
      totalAmount: 500000,
      allocatedAmount: 350000,
      remainingAmount: 225000,
      department: 'Operations',
      description: 'Q1 operational expenses',
      status: 'ACTIVE',
      createdBy: 'admin',
      approvedBy: 'finance_director',
      approvedAt: '2024-01-05T10:00:00',
      notes: 'Active budget for Q1 operations',
      createdAt: '2023-12-20T10:00:00',
      updatedAt: '2024-06-09T10:00:00'
    },
    {
      id: 2,
      name: 'Equipment Budget Q2',
      fiscalYear: 2024,
      totalAmount: 250000,
      allocatedAmount: 200000,
      remainingAmount: 80000,
      department: 'Procurement',
      description: 'Q2 equipment acquisition',
      status: 'ACTIVE',
      createdBy: 'admin',
      approvedBy: 'finance_director',
      approvedAt: '2024-04-01T10:00:00',
      notes: 'Active equipment budget for Q2',
      createdAt: '2024-03-15T10:00:00',
      updatedAt: '2024-06-09T10:00:00'
    }
  ];

  private mockExpenses: Expense[] = [
    {
      id: 1,
      title: 'Fuel supplies',
      description: 'Monthly fuel supplies for operations',
      amount: 50000,
      category: 'Operations',
      budget: { id: 1, name: 'Operations Budget Q1' },
      status: 'APPROVED',
      submittedBy: 'user1',
      approvedBy: 'finance_manager',
      approvedAt: '2024-05-10T10:00:00',
      reference: 'FUEL-2024-05',
      notes: 'Approved for Q2',
      createdAt: '2024-05-08T10:00:00'
    },
    {
      id: 2,
      title: 'Maintenance costs',
      description: 'Equipment maintenance and repairs',
      amount: 30000,
      category: 'Maintenance',
      budget: { id: 1, name: 'Operations Budget Q1' },
      status: 'PENDING',
      submittedBy: 'user2',
      reference: 'MAINT-2024-06',
      notes: 'Awaiting approval',
      createdAt: '2024-06-01T10:00:00'
    }
  ];

  private mockIncomes: Income[] = [
    {
      id: 1,
      title: 'Government allocation',
      amount: 1000000,
      source: 'Government',
      category: 'Budget',
      receivedDate: '2024-01-01',
      reference: 'GOV-2024-001',
      recordedBy: 'admin',
      notes: 'Annual government budget allocation',
      createdAt: '2024-01-01T10:00:00'
    },
    {
      id: 2,
      title: 'Training fees',
      amount: 50000,
      source: 'Training Program',
      category: 'Revenue',
      receivedDate: '2024-03-15',
      reference: 'TRAIN-2024-002',
      recordedBy: 'admin',
      notes: 'External training program fees',
      createdAt: '2024-03-15T10:00:00'
    }
  ];

  private mockLedger: LedgerEntry[] = [
    {
      id: 1,
      type: 'INCOME_RECEIVED',
      description: 'Government allocation',
      amount: 1000000,
      relatedEntityType: 'INCOME',
      relatedEntityId: 1,
      createdBy: 'admin',
      createdAt: '2024-01-01T10:00:00'
    },
    {
      id: 2,
      type: 'EXPENSE_APPROVED',
      description: 'Fuel supplies',
      amount: 50000,
      relatedEntityType: 'EXPENSE',
      relatedEntityId: 1,
      createdBy: 'finance_manager',
      createdAt: '2024-05-10T10:00:00'
    },
    {
      id: 3,
      type: 'BUDGET_ACTIVATED',
      description: 'Operations Budget Q1 Activated',
      amount: 500000,
      relatedEntityType: 'BUDGET',
      relatedEntityId: 1,
      createdBy: 'admin',
      createdAt: '2024-01-05T10:00:00'
    }
  ];

  private mockStatusHistory: StatusHistoryEntry[] = [
    {
      id: 1,
      previousStatus: 'NEW_JOINER',
      newStatus: 'ACTIVE',
      changedAt: '2015-07-20T10:00:00',
      changedBy: 'admin',
      notes: 'Training completed'
    }
  ];

  private mockRankHistory: RankHistoryEntry[] = [
    {
      id: 1,
      previousRank: 'SERGEANT',
      newRank: 'CAPTAIN',
      promotedAt: '2022-06-15T10:00:00',
      promotedBy: 'admin',
      notes: 'Merit promotion'
    }
  ];

  private mockMedicalRecords: MedicalRecord[] = [
    {
      id: 1,
      recordDate: '2024-06-01',
      diagnosis: 'Routine checkup',
      treatment: 'None required',
      physician: 'Dr. Smith',
      confidential: false,
      notes: 'Passed physical examination',
      createdAt: '2024-06-01T14:30:00'
    }
  ];

  /**
   * Get response by URL pattern
   */
  getResponseByUrl(url: string, method: string, body?: any): any {
    // Auth endpoints
    if (url.includes('/auth/login') && method === 'POST') {
      if (body?.username && body?.password) {
        return {
          status: 'SUCCESS',
          data: {
            token: this.generateMockToken(),
            username: body.username,
            role: 'ADMIN'
          }
        };
      }
    }

    // Personnel - Members
    if (url.includes('personnel/members')) {
      return this.handleMembersEndpoint(url, method, body);
    }

    // Inventory - Items
    if (url.includes('inventory/items') || url.includes('inventory/stock')) {
      return this.handleItemsEndpoint(url, method, body);
    }

    // Finance - Budgets
    if (url.includes('finance/budgets')) {
      return this.handleBudgetsEndpoint(url, method, body);
    }

    // Finance - Expenses
    if (url.includes('finance/expenses')) {
      return this.handleExpensesEndpoint(url, method, body);
    }

    // Finance - Incomes
    if (url.includes('finance/incomes')) {
      return this.handleIncomesEndpoint(url, method, body);
    }

    // Finance - Ledger
    if (url.includes('finance/ledger')) {
      return {
        status: 'SUCCESS',
        data: this.mockLedger
      };
    }

    // Default response
    return {
      status: 'SUCCESS',
      data: null
    };
  }

  private handleMembersEndpoint(url: string, method: string, body?: any): any {
    const idMatch = url.match(/\/(\d+)/);
    const id = idMatch ? parseInt(idMatch[1]) : null;

    if (method === 'GET') {
      if (url.includes('status-history') && id) {
        return { status: 'SUCCESS', data: this.mockStatusHistory };
      }
      if (url.includes('rank-history') && id) {
        return { status: 'SUCCESS', data: this.mockRankHistory };
      }
      if (url.includes('medical-records') && id) {
        return { status: 'SUCCESS', data: this.mockMedicalRecords };
      }
      if (id) {
        return {
          status: 'SUCCESS',
          data: this.mockMembers.find(m => m.id === id) || this.mockMembers[0]
        };
      }
      return { status: 'SUCCESS', data: this.mockMembers };
    }

    if (method === 'POST') {
      const newMember: Member = {
        id: Math.max(...this.mockMembers.map(m => m.id || 0)) + 1,
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.mockMembers.push(newMember);
      return { status: 'SUCCESS', data: newMember };
    }

    if (method === 'PUT' && id) {
      const index = this.mockMembers.findIndex(m => m.id === id);
      if (index !== -1) {
        this.mockMembers[index] = {
          ...this.mockMembers[index],
          ...body,
          updatedAt: new Date().toISOString()
        };
        return { status: 'SUCCESS', data: this.mockMembers[index] };
      }
    }

    if (method === 'PATCH' && id) {
      const index = this.mockMembers.findIndex(m => m.id === id);
      if (index !== -1) {
        this.mockMembers[index] = {
          ...this.mockMembers[index],
          ...body,
          updatedAt: new Date().toISOString()
        };
        return { status: 'SUCCESS', data: this.mockMembers[index] };
      }
    }

    if (method === 'DELETE' && id) {
      this.mockMembers = this.mockMembers.filter(m => m.id !== id);
      return { status: 'SUCCESS', data: null };
    }

    return { status: 'SUCCESS', data: null };
  }

  private handleItemsEndpoint(url: string, method: string, body?: any): any {
    const idMatch = url.match(/\/(\d+)/);
    const id = idMatch ? parseInt(idMatch[1]) : null;

    if (method === 'GET') {
      if (url.includes('low-stock')) {
        const lowStockItems = this.mockItems.filter(
          item => item.quantity < 50
        );
        return { status: 'SUCCESS', data: lowStockItems };
      }
      if (url.includes('history')) {
        return {
          status: 'SUCCESS',
          data: [
            { date: '2024-06-01', quantity: 10, type: 'IN' },
            { date: '2024-05-28', quantity: -5, type: 'OUT' }
          ]
        };
      }
      if (id && url.includes('inventory/items')) {
        return {
          status: 'SUCCESS',
          data: this.mockItems.find(i => i.id === id) || this.mockItems[0]
        };
      }
      return { status: 'SUCCESS', data: this.mockItems };
    }

    if (method === 'POST') {
      if (url.includes('stock')) {
        return { status: 'SUCCESS', data: { success: true, message: 'Stock transaction recorded' } };
      }
      const newItem: Item = {
        id: Math.max(...this.mockItems.map(i => i.id || 0)) + 1,
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.mockItems.push(newItem);
      return { status: 'SUCCESS', data: newItem };
    }

    if (method === 'PUT' && id) {
      const index = this.mockItems.findIndex(i => i.id === id);
      if (index !== -1) {
        this.mockItems[index] = {
          ...this.mockItems[index],
          ...body,
          updatedAt: new Date().toISOString()
        };
        return { status: 'SUCCESS', data: this.mockItems[index] };
      }
    }

    if (method === 'DELETE' && id) {
      this.mockItems = this.mockItems.filter(i => i.id !== id);
      return { status: 'SUCCESS', data: null };
    }

    return { status: 'SUCCESS', data: null };
  }

  private handleBudgetsEndpoint(url: string, method: string, body?: any): any {
    const idMatch = url.match(/\/(\d+)/);
    const id = idMatch ? parseInt(idMatch[1]) : null;

    if (method === 'GET') {
      if (id) {
        return {
          status: 'SUCCESS',
          data: this.mockBudgets.find(b => b.id === id) || this.mockBudgets[0]
        };
      }
      return { status: 'SUCCESS', data: this.mockBudgets };
    }

    if (method === 'POST') {
      const newBudget: Budget = {
        id: Math.max(...this.mockBudgets.map(b => b.id || 0)) + 1,
        ...body,
        createdAt: new Date().toISOString()
      };
      this.mockBudgets.push(newBudget);
      return { status: 'SUCCESS', data: newBudget };
    }

    if (method === 'PUT' && id) {
      const index = this.mockBudgets.findIndex(b => b.id === id);
      if (index !== -1) {
        this.mockBudgets[index] = { ...this.mockBudgets[index], ...body };
        return { status: 'SUCCESS', data: this.mockBudgets[index] };
      }
    }

    if (method === 'PATCH' && id) {
      const index = this.mockBudgets.findIndex(b => b.id === id);
      if (index !== -1) {
        this.mockBudgets[index] = { ...this.mockBudgets[index], ...body };
        return { status: 'SUCCESS', data: this.mockBudgets[index] };
      }
    }

    if (method === 'DELETE' && id) {
      this.mockBudgets = this.mockBudgets.filter(b => b.id !== id);
      return { status: 'SUCCESS', data: null };
    }

    return { status: 'SUCCESS', data: null };
  }

  private handleExpensesEndpoint(url: string, method: string, body?: any): any {
    const idMatch = url.match(/\/(\d+)/);
    const id = idMatch ? parseInt(idMatch[1]) : null;

    if (method === 'GET') {
      if (id) {
        return {
          status: 'SUCCESS',
          data: this.mockExpenses.find(e => e.id === id) || this.mockExpenses[0]
        };
      }
      return { status: 'SUCCESS', data: this.mockExpenses };
    }

    if (method === 'POST') {
      const newExpense: Expense = {
        id: Math.max(...this.mockExpenses.map(e => e.id || 0)) + 1,
        ...body,
        createdAt: new Date().toISOString()
      };
      this.mockExpenses.push(newExpense);
      return { status: 'SUCCESS', data: newExpense };
    }

    if (method === 'PATCH' && id) {
      const index = this.mockExpenses.findIndex(e => e.id === id);
      if (index !== -1) {
        this.mockExpenses[index] = {
          ...this.mockExpenses[index],
          ...body,
          approvedAt: new Date().toISOString()
        };
        return { status: 'SUCCESS', data: this.mockExpenses[index] };
      }
    }

    return { status: 'SUCCESS', data: null };
  }

  private handleIncomesEndpoint(url: string, method: string, body?: any): any {
    const idMatch = url.match(/\/(\d+)/);
    const id = idMatch ? parseInt(idMatch[1]) : null;

    if (method === 'GET') {
      return { status: 'SUCCESS', data: this.mockIncomes };
    }

    if (method === 'POST') {
      const newIncome: Income = {
        id: Math.max(...this.mockIncomes.map(i => i.id || 0)) + 1,
        ...body,
        createdAt: new Date().toISOString()
      };
      this.mockIncomes.push(newIncome);
      return { status: 'SUCCESS', data: newIncome };
    }

    if (method === 'DELETE' && id) {
      this.mockIncomes = this.mockIncomes.filter(i => i.id !== id);
      return { status: 'SUCCESS', data: null };
    }

    return { status: 'SUCCESS', data: null };
  }

  private generateMockToken(): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      })
    );
    const signature = btoa('mock-signature');
    return `${header}.${payload}.${signature}`;
  }
}






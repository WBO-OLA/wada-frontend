import { Injectable } from '@angular/core';
import { Member, MedicalRecord, StatusHistoryEntry, RankHistoryEntry } from '../models/member.model';
import { Item } from '../models/item.model';
import { Budget, Expense, Income, LedgerEntry } from '../models/finance.model';

@Injectable({ providedIn: 'root' })
export class MockDataService {
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
      joinDate: '2015-06-20',
      rank: 'CAPTAIN',
      command: { id: 1, name: 'Alpha Company', type: 'UNIT' },
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
      joinDate: '2018-09-10',
      rank: 'SERGEANT',
      command: { id: 2, name: 'Bravo Company', type: 'UNIT' },
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
      joinDate: '2020-01-15',
      rank: 'PRIVATE',
      command: { id: 2, name: 'Bravo Company', type: 'UNIT' },
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

  private mockIncomes: Income[] = [
    {
      id: 1,
      title: 'Italy Group Q1 Contribution',
      amount: 500000,
      currency: 'EUR',
      communityGroup: 'Italy Group',
      country: 'Italy',
      source: 'Community Donation',
      category: 'Community Income',
      receivedDate: '2024-01-15',
      reference: 'IT-2024-Q1-001',
      recordedBy: 'admin',
      notes: 'Q1 contribution from Italy community group',
      createdAt: '2024-01-15T10:00:00'
    },
    {
      id: 2,
      title: 'USA Group Annual Fund',
      amount: 750000,
      currency: 'USD',
      communityGroup: 'USA Group',
      country: 'USA',
      source: 'Community Donation',
      category: 'Community Income',
      receivedDate: '2024-03-10',
      reference: 'US-2024-001',
      recordedBy: 'admin',
      notes: 'Annual fundraising from USA chapter',
      createdAt: '2024-03-10T10:00:00'
    },
    {
      id: 3,
      title: 'Egypt Group Contribution',
      amount: 200000,
      currency: 'EGP',
      communityGroup: 'Egypt Group',
      country: 'Egypt',
      source: 'Community Donation',
      category: 'Community Income',
      receivedDate: '2024-04-20',
      reference: 'EG-2024-001',
      recordedBy: 'admin',
      createdAt: '2024-04-20T10:00:00'
    }
  ];

  private mockBudgets: Budget[] = [
    {
      id: 1,
      name: 'Operations FY2024',
      fiscalYear: 2024,
      totalAmount: 800000,
      allocatedAmount: 320000,
      remainingAmount: 480000,
      department: 'Operations',
      status: 'ACTIVE',
      createdBy: 'admin',
      approvedBy: 'chief.commander',
      createdAt: '2024-01-01T10:00:00',
      updatedAt: '2024-06-09T10:00:00'
    },
    {
      id: 2,
      name: 'Logistics FY2024',
      fiscalYear: 2024,
      totalAmount: 300000,
      allocatedAmount: 0,
      remainingAmount: 300000,
      department: 'Logistics',
      status: 'DRAFT',
      createdBy: 'admin',
      createdAt: '2024-03-01T10:00:00',
      updatedAt: '2024-03-01T10:00:00'
    }
  ];

  private mockExpenses: Expense[] = [
    {
      id: 1,
      title: 'Vehicle Fuel Allocation',
      description: 'Monthly fuel allocation for field vehicles',
      amount: 15000,
      category: 'Transport',
      budget: { id: 1, name: 'Operations FY2024' },
      status: 'APPROVED',
      submittedBy: 'commander.alpha',
      approvedBy: 'chief.commander',
      createdAt: '2024-02-15T10:00:00',
      updatedAt: '2024-02-20T10:00:00'
    },
    {
      id: 2,
      title: 'Training Equipment Purchase',
      description: 'New training equipment for Alpha Company',
      amount: 45000,
      category: 'Equipment',
      budget: { id: 1, name: 'Operations FY2024' },
      status: 'PENDING',
      submittedBy: 'commander.alpha',
      createdAt: '2024-06-01T10:00:00',
      updatedAt: '2024-06-01T10:00:00'
    },
    {
      id: 3,
      title: 'Medical Supplies',
      description: 'Quarterly medical supply restock',
      amount: 8000,
      category: 'Medical',
      status: 'REJECTED',
      submittedBy: 'commander.bravo',
      approvedBy: 'chief.commander',
      rejectionReason: 'Exceeds category limit for Q2',
      createdAt: '2024-05-10T10:00:00',
      updatedAt: '2024-05-15T10:00:00'
    }
  ];

  private mockLedger: LedgerEntry[] = [
    {
      id: 1,
      type: 'INCOME_RECEIVED',
      description: 'Income received: Italy Group Q1 Contribution [Italy Group, Italy]',
      amount: 500000,
      relatedEntityType: 'Income',
      relatedEntityId: 1,
      createdBy: 'admin',
      createdAt: '2024-01-15T10:00:00'
    },
    {
      id: 2,
      type: 'INCOME_RECEIVED',
      description: 'Income received: USA Group Annual Fund [USA Group, USA]',
      amount: 750000,
      relatedEntityType: 'Income',
      relatedEntityId: 2,
      createdBy: 'admin',
      createdAt: '2024-03-10T10:00:00'
    },
    {
      id: 3,
      type: 'BUDGET_CREATED',
      description: 'Budget created: Operations FY2024 (FY 2024)',
      amount: 800000,
      relatedEntityType: 'Budget',
      relatedEntityId: 1,
      createdBy: 'admin',
      createdAt: '2024-01-01T10:00:00'
    },
    {
      id: 4,
      type: 'BUDGET_ACTIVATED',
      description: 'Budget activated: Operations FY2024',
      amount: 800000,
      relatedEntityType: 'Budget',
      relatedEntityId: 1,
      createdBy: 'chief.commander',
      createdAt: '2024-01-02T10:00:00'
    },
    {
      id: 5,
      type: 'EXPENSE_SUBMITTED',
      description: 'Expense submitted: Vehicle Fuel Allocation',
      amount: 15000,
      relatedEntityType: 'Expense',
      relatedEntityId: 1,
      createdBy: 'commander.alpha',
      createdAt: '2024-02-15T10:00:00'
    },
    {
      id: 6,
      type: 'EXPENSE_APPROVED',
      description: 'Expense approved: Vehicle Fuel Allocation',
      amount: 15000,
      relatedEntityType: 'Expense',
      relatedEntityId: 1,
      createdBy: 'chief.commander',
      createdAt: '2024-02-20T10:00:00'
    }
  ];

  private mockStatusHistory: StatusHistoryEntry[] = [
    {
      id: 1,
      previousStatus: 'ACTIVE',
      newStatus: 'INJURED',
      changedAt: '2023-05-10T10:00:00',
      changedBy: 'admin',
      notes: 'Field injury'
    },
    {
      id: 2,
      previousStatus: 'INJURED',
      newStatus: 'ACTIVE',
      changedAt: '2023-07-01T10:00:00',
      changedBy: 'admin',
      notes: 'Returned to active duty'
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

  getResponseByUrl(url: string, method: string, body?: any): any {
    if (url.includes('/auth/login') && method === 'POST') {
      if (body?.username && body?.password) {
        return {
          status: 'SUCCESS',
          data: { token: this.generateMockToken(), username: body.username, role: 'ADMIN' }
        };
      }
    }

    if (url.includes('personnel/members')) {
      return this.handleMembersEndpoint(url, method, body);
    }

    if (url.includes('inventory/items') || url.includes('inventory/stock')) {
      return this.handleItemsEndpoint(url, method, body);
    }

    if (url.includes('finance/incomes')) {
      return this.handleIncomesEndpoint(url, method, body);
    }

    if (url.includes('finance/budgets')) {
      return this.handleBudgetsEndpoint(url, method, body);
    }

    if (url.includes('finance/expenses')) {
      return this.handleExpensesEndpoint(url, method, body);
    }

    if (url.includes('finance/ledger')) {
      return { status: 'SUCCESS', data: this.mockLedger };
    }

    return { status: 'SUCCESS', data: null };
  }

  private handleMembersEndpoint(url: string, method: string, body?: any): any {
    const idMatch = url.match(/members\/(\d+)/);
    const id = idMatch ? parseInt(idMatch[1]) : null;

    if (method === 'GET') {
      if (url.includes('status-history')) return { status: 'SUCCESS', data: this.mockStatusHistory };
      if (url.includes('rank-history')) return { status: 'SUCCESS', data: this.mockRankHistory };
      if (url.includes('medical-records')) return { status: 'SUCCESS', data: this.mockMedicalRecords };
      if (url.includes('activities')) return { status: 'SUCCESS', data: [] };
      if (id) return { status: 'SUCCESS', data: this.mockMembers.find(m => m.id === id) || this.mockMembers[0] };
      return { status: 'SUCCESS', data: this.mockMembers };
    }

    if (method === 'POST') {
      const newMember: Member = { id: Math.max(...this.mockMembers.map(m => m.id || 0)) + 1, ...body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      this.mockMembers.push(newMember);
      return { status: 'SUCCESS', data: newMember };
    }

    if ((method === 'PUT' || method === 'PATCH') && id) {
      const index = this.mockMembers.findIndex(m => m.id === id);
      if (index !== -1) {
        this.mockMembers[index] = { ...this.mockMembers[index], ...body, updatedAt: new Date().toISOString() };
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
      if (url.includes('low-stock')) return { status: 'SUCCESS', data: this.mockItems.filter(i => i.quantity < 50) };
      if (url.includes('history')) return { status: 'SUCCESS', data: [] };
      if (id && url.includes('inventory/items')) return { status: 'SUCCESS', data: this.mockItems.find(i => i.id === id) || this.mockItems[0] };
      return { status: 'SUCCESS', data: this.mockItems };
    }

    if (method === 'POST') {
      if (url.includes('stock')) return { status: 'SUCCESS', data: { success: true } };
      const newItem: Item = { id: Math.max(...this.mockItems.map(i => i.id || 0)) + 1, ...body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      this.mockItems.push(newItem);
      return { status: 'SUCCESS', data: newItem };
    }

    if (method === 'PUT' && id) {
      const index = this.mockItems.findIndex(i => i.id === id);
      if (index !== -1) { this.mockItems[index] = { ...this.mockItems[index], ...body, updatedAt: new Date().toISOString() }; return { status: 'SUCCESS', data: this.mockItems[index] }; }
    }

    if (method === 'DELETE' && id) {
      this.mockItems = this.mockItems.filter(i => i.id !== id);
      return { status: 'SUCCESS', data: null };
    }

    return { status: 'SUCCESS', data: null };
  }

  private handleIncomesEndpoint(url: string, method: string, body?: any): any {
    const idMatch = url.match(/\/(\d+)/);
    const id = idMatch ? parseInt(idMatch[1]) : null;

    if (method === 'GET') {
      if (url.includes('aggregate')) {
        const byGroup: Record<string, number> = {};
        const byCountry: Record<string, number> = {};
        let globalTotal = 0;
        for (const i of this.mockIncomes) {
          const g = i.communityGroup ?? 'Unknown';
          const c = i.country ?? 'Unknown';
          byGroup[g] = (byGroup[g] ?? 0) + i.amount;
          byCountry[c] = (byCountry[c] ?? 0) + i.amount;
          globalTotal += i.amount;
        }
        return { byGroup, byCountry, globalTotal };
      }
      return { status: 'SUCCESS', data: this.mockIncomes };
    }

    if (method === 'POST') {
      const newIncome: Income = { id: Math.max(...this.mockIncomes.map(i => i.id || 0)) + 1, ...body, createdAt: new Date().toISOString() };
      this.mockIncomes.push(newIncome);
      return { status: 'SUCCESS', data: newIncome };
    }

    if (method === 'DELETE' && id) {
      this.mockIncomes = this.mockIncomes.filter(i => i.id !== id);
      return { status: 'SUCCESS', data: null };
    }

    return { status: 'SUCCESS', data: null };
  }

  private handleBudgetsEndpoint(url: string, method: string, body?: any): any {
    const idMatch = url.match(/budgets\/(\d+)/);
    const id = idMatch ? parseInt(idMatch[1]) : null;

    if (method === 'GET') {
      if (id) return this.mockBudgets.find(b => b.id === id) ?? this.mockBudgets[0];
      return this.mockBudgets;
    }

    if (method === 'POST') {
      const newBudget: Budget = {
        id: Math.max(...this.mockBudgets.map(b => b.id || 0)) + 1,
        ...body,
        allocatedAmount: 0,
        remainingAmount: body.totalAmount,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.mockBudgets.push(newBudget);
      return newBudget;
    }

    if (method === 'PATCH' && id) {
      const index = this.mockBudgets.findIndex(b => b.id === id);
      if (index !== -1) {
        if (url.includes('activate')) {
          this.mockBudgets[index] = { ...this.mockBudgets[index], status: 'ACTIVE', approvedBy: body?.approvedBy, updatedAt: new Date().toISOString() };
        } else if (url.includes('close')) {
          this.mockBudgets[index] = { ...this.mockBudgets[index], status: 'CLOSED', updatedAt: new Date().toISOString() };
        }
        return this.mockBudgets[index];
      }
    }

    if (method === 'DELETE' && id) {
      this.mockBudgets = this.mockBudgets.filter(b => b.id !== id);
      return null;
    }

    return null;
  }

  private handleExpensesEndpoint(url: string, method: string, body?: any): any {
    const idMatch = url.match(/expenses\/(\d+)/);
    const id = idMatch ? parseInt(idMatch[1]) : null;

    if (method === 'GET') {
      if (id) return this.mockExpenses.find(e => e.id === id) ?? this.mockExpenses[0];
      return this.mockExpenses;
    }

    if (method === 'POST') {
      const newExpense: Expense = {
        id: Math.max(...this.mockExpenses.map(e => e.id || 0)) + 1,
        ...body,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.mockExpenses.push(newExpense);
      return newExpense;
    }

    if (method === 'PATCH' && id) {
      const index = this.mockExpenses.findIndex(e => e.id === id);
      if (index !== -1) {
        if (url.includes('approve')) {
          this.mockExpenses[index] = { ...this.mockExpenses[index], status: 'APPROVED', approvedBy: body?.approvedBy, updatedAt: new Date().toISOString() };
        } else if (url.includes('reject')) {
          this.mockExpenses[index] = { ...this.mockExpenses[index], status: 'REJECTED', approvedBy: body?.approvedBy, rejectionReason: body?.rejectionReason, updatedAt: new Date().toISOString() };
        } else if (url.includes('cancel')) {
          this.mockExpenses[index] = { ...this.mockExpenses[index], status: 'CANCELLED', updatedAt: new Date().toISOString() };
        }
        return this.mockExpenses[index];
      }
    }

    return null;
  }

  private generateMockToken(): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ sub: 'admin', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 }));
    return `${header}.${payload}.${btoa('mock-signature')}`;
  }
}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BudgetPage } from './pages/budget/budget';
import { Expenses } from './pages/expenses/expenses';
import { IncomePage } from './pages/income/income';
import { LedgerPage } from './pages/ledger/ledger';

const routes: Routes = [
  { path: '', redirectTo: 'budget', pathMatch: 'full' },
  { path: 'budget', component: BudgetPage },
  { path: 'expenses', component: Expenses },
  { path: 'income', component: IncomePage },
  { path: 'ledger', component: LedgerPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanceRoutingModule {}

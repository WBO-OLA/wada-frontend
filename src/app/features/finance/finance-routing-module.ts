import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IncomePage } from './pages/income/income';
import { BudgetPage } from './pages/budget/budget';
import { Expenses } from './pages/expenses/expenses';
import { LedgerPage } from './pages/ledger/ledger';

const routes: Routes = [
  { path: '', redirectTo: 'income', pathMatch: 'full' },
  { path: 'income', component: IncomePage },
  { path: 'budget', component: BudgetPage },
  { path: 'expenses', component: Expenses },
  { path: 'ledger', component: LedgerPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanceRoutingModule {}

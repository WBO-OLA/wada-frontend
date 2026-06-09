import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemList } from './pages/item-list/item-list';
import { StockManagement } from './pages/stock-management/stock-management';
import { PurchaseOrdersPage } from './pages/purchase-orders/purchase-orders';
import { AssignmentsPage } from './pages/assignments/assignments';

const routes: Routes = [
  { path: '', component: ItemList },
  { path: 'stock', component: StockManagement },
  { path: 'purchase-orders', component: PurchaseOrdersPage },
  { path: 'assignments', component: AssignmentsPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryRoutingModule {}

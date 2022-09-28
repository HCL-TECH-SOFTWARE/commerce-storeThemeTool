/*
 *-----------------------------------------------------------------
	=================================================================
	Copyright [2021] [HCL America, Inc.]
	=================================================================
 *-----------------------------------------------------------------
 */
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CreateStoreThemeComponent } from "./components/create-store-theme/create-store-theme.component";


const routes: Routes = [
	{
		path: "create-store-theme", component: CreateStoreThemeComponent
	},
	// {
	// 	path: "create-tax-code", component: CreateTaxCodeComponent
	// },
	// {
	// 	path: "edit-tax-code/:id", component: EditTaxCodeComponent
	// },
	{
		path: "", redirectTo: "create-store-theme", pathMatch: "full"
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes)
	],
	exports: [RouterModule]
})
export class StoreThemeRoutingModule { }

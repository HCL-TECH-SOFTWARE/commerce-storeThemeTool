/*
*==================================================
Copyright [2022] [HCL America, Inc.]
 
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
 
    http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*==================================================
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

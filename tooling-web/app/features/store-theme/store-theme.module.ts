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
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { CdkTableModule } from "@angular/cdk/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule } from "@angular/material/select";
import { MatStepperModule } from "@angular/material/stepper";
import { CdkStepperModule } from "@angular/cdk/stepper";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatMenuModule } from "@angular/material/menu";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatListModule } from "@angular/material/list";
import { MatChipsModule } from "@angular/material/chips";
import { MatTooltipModule } from "@angular/material/tooltip";
import { StoreThemeRoutingModule } from "./store-theme-routing.module";
import { CreateStoreThemeComponent} from "./components/create-store-theme/create-store-theme.component";
import { DirectivesModule } from "../../directives/directives.module";
import { CurrencyService } from "../../services/currency.service";
import { MAT_COLOR_FORMATS, NgxMatColorPickerModule, NGX_MAT_COLOR_FORMATS } from '@angular-material-components/color-picker';
import {MatCardModule} from '@angular/material/card';
@NgModule({
	imports: [
		CommonModule,
		NgxMatColorPickerModule,
		FormsModule,
		ReactiveFormsModule,
		StoreThemeRoutingModule,
		TranslateModule,
		CdkTableModule,
		MatPaginatorModule,
		MatSortModule,
		MatTableModule,
		MatIconModule,
		MatInputModule,
		MatButtonToggleModule,
		MatGridListModule,
		MatAutocompleteModule,
		DirectivesModule,
		MatDialogModule,
		MatButtonModule,
		MatStepperModule,
		CdkStepperModule,
		MatCheckboxModule,
		MatSelectModule,
		MatMenuModule,
		MatSlideToggleModule,
		MatListModule,
		MatChipsModule,
		MatTooltipModule,
		MatCardModule
	],
	declarations: [
		CreateStoreThemeComponent,
		
	],
	providers: [
		{ provide: MAT_COLOR_FORMATS, useValue: NGX_MAT_COLOR_FORMATS }
	  ],
})
export class StoreThemeModule {}

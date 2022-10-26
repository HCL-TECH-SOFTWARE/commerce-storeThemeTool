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

import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, Subscription, Observable } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { FormGroup, FormControl, AbstractControl } from "@angular/forms";

import { OnlineStoresService } from "../../../../rest/services/online-stores.service";
import { CurrentUserService } from "../../../../services/current-user.service";

import { AlertService } from "../../../../services/alert.service";
import { TranslateService } from "@ngx-translate/core";
import { StoreConfigurationService } from "../../../../rest/services/store-configuration.service";

import { Color } from "@angular-material-components/color-picker";
import { RegistriesService } from "../../../../rest/services/registries.service";


@Component({
	templateUrl: "./create-store-theme.component.html",
	styleUrls: ["./create-store-theme.component.scss"]
})
export class CreateStoreThemeComponent implements OnInit, OnDestroy, AfterViewInit {
	listSearchFrom1: FormGroup;
	searchText: FormControl;
	store: FormControl;
	storeList: Array<any> = [];
	selectedStore = null;
	themes = [];
	mainColorCtr: AbstractControl;
	darkColorCtr: AbstractControl;

	private storeSearchString: Subject<string> = new Subject<string>();
	private getStoresSubscription: Subscription = null;
	private getStoreNameSubscription: Subscription = null;
	MAIN_COLOR = "store.theme.main.color";
	DARK_COLOR = "store.theme.dark.color";
	saveBtn = "Save";

	constructor(private router: Router,
		private route: ActivatedRoute,
		private onlineStoresService: OnlineStoresService,
		private currentUserService: CurrentUserService,
		private alertService: AlertService,
		private translateService: TranslateService,
		private registriesService: RegistriesService,
		private storeConfigurationService: StoreConfigurationService) { }

	ngOnInit() {
		this.createFormControls();
		this.createForm();

		this.storeSearchString.pipe(debounceTime(250)).subscribe(searchString => {
			this.getStores(searchString);
		});
	}
	/**Method to refresh the Stores and theme cards */
	refresh() {
		this.getStores("");
		this.getStoreThemeCards();
	}
	/**Life cycle method to get the store informatiion */
	ngAfterViewInit() {
		const storeId = this.route.snapshot.params.storeId;
		if (storeId !== null && storeId !== undefined) {
			this.onlineStoresService.getOnlineStore({ id: Number(storeId) }).subscribe(store => {
				this.selectStore(store);
			});
		} else {
			this.getStoreNameSubscription = this.currentUserService.getStoreName().subscribe((storeName: string) => {
				if (storeName) {
					this.onlineStoresService.getOnlineStoresByIdentifier({
						identifier: storeName,
						usage: "HCL_TaxTool",
						limit: 1
					}).subscribe(onlineStoreResponse => {
						if (this.getStoreNameSubscription) {
							this.getStoreNameSubscription.unsubscribe();
							this.getStoreNameSubscription = null;
						}
						const storeArray = onlineStoreResponse.items;
						for (let i = 0; i < storeArray.length; i++) {
							const store = storeArray[i];
							if (storeName === store.identifier) {
								this.selectStore(store);
								break;
							}
						}
						if (this.selectedStore === null) {
							this.getFirstStore();
						}
					});
				} else {
					this.getFirstStore();
				}
			});
		}
	}


	ngOnDestroy() {
		this.storeSearchString.unsubscribe();
	}

	/**Method to validate the theme Form before saving */

	validateForm() {
		if (this.selectedStore.id && this.mainColorCtr.value && this.darkColorCtr.value && this.mainColorCtr.value.hex && this.darkColorCtr.value.hex) {
			return true;
		} else {
			return false;
		}
	}

	/**Method to chec whether to save the theme  or update the theme for store */
	checkThemeForStoreId() {
		this.storeConfigurationService.getStoreConfByIdAndName({
			storeId: this.selectedStore.id,
			name: `name=${this.MAIN_COLOR}&name=${this.DARK_COLOR}`
		}).subscribe(resp => {
			if (resp.items.length === 0) {
				this.saveConfiguration();
			} else {
				this.updateConfiguration();
			}
		});

	}

	/**Method to update the theme for selected Store */
	updateConfiguration() {
		var conf1 = { storeId: this.selectedStore.id, name: this.MAIN_COLOR, value: "#" + this.mainColorCtr.value.hex };
		var conf2 = { storeId: this.selectedStore.id, name: this.DARK_COLOR, value: "#" + this.darkColorCtr.value.hex };

		this.storeConfigurationService.updateStoreConfByIdAndName({ storeId: this.selectedStore.id, name: this.MAIN_COLOR }, conf1).subscribe(resp => {
			console.log(resp);
			this.storeConfigurationService.updateStoreConfByIdAndName({ storeId: this.selectedStore.id, name: this.DARK_COLOR }, conf2).subscribe(resp1 => {
				console.log(resp1);
				this.updateStoreRegistry();
				this.alertService.success({ message: "Store Configuration updated Successfully" });
				this.getStoreThemeCards();
			})
		})
	}

	/**Method to Save the theme configuration for selected Store */
	saveConfiguration() {
		var conf1 = { storeId: this.selectedStore.id, name: this.MAIN_COLOR, value: "#" + this.mainColorCtr.value.hex };
		var conf2 = { storeId: this.selectedStore.id, name: this.DARK_COLOR, value: "#" + this.darkColorCtr.value.hex };

		this.storeConfigurationService.saveStoreConfiguration(conf1).subscribe(resp => {
			console.log(resp);
			this.storeConfigurationService.saveStoreConfiguration(conf2).subscribe(resp1 => {
				console.log(resp1);
				this.updateStoreRegistry();
				this.alertService.success({ message: "Store Configuration added Successfully" });
				this.getStoreThemeCards();
			})
		})
	}

	/**Method to update store registry */
	updateStoreRegistry() {
		this.registriesService.updateRegistryResponse("StoreRegistry").subscribe(response => { console.log("Store registry updated", response) });
	}

	/**Method to save the theme */
	saveTheme() {
		//console.log(this.store,this.mainColorCtr,this.darkColorCtr);
		if (this.validateForm()) {
			this.checkThemeForStoreId();
		} else {
			this.alertService.error({ message: "Please fill all the details" });
		}

	}


	groupBy(objectArray, property) {
		return objectArray.reduce(function (acc, obj) {
			let { storeId, name, value } = obj;
			let key = obj[property];
			if (!acc[key]) {
				acc[key] = []
			}
			acc[key].push({ storeId, name, value });
			return acc
		}, {})
	}

	/**Method to get all the theme cards */
	getStoreThemeCards() {
		let arr = [];
		let name = `name=${this.MAIN_COLOR}&name=${this.DARK_COLOR}`;
		this.storeConfigurationService.getStoreConfByName(name).subscribe(resp => {
			var items = resp.items;
			if (items.length > 0) {

				let groupStoreIds = this.groupBy(items, 'storeId');
				var arr = Object.keys(groupStoreIds) || [];
				this.themes = arr.map(item => {
					return {
						storeId: item,
						storeName: this.storeList.find(str => str.id === parseInt(item))?.identifier,
						values: groupStoreIds[item]
					}
				});
				this.selectTheCard();
			} else {
				this.themes = [];
				this.clearValues();
			}
		})
	}

	/**Method to clear the values of the color fields */
	clearValues() {
		//this.store.setValue("");
		this.mainColorCtr.setValue(null);
		this.darkColorCtr.setValue(null);
		this.saveBtn = "Save";
	}

	/**Method to search for Store */
	searchStores(searchString: string) {
		this.storeSearchString.next(searchString);
	}

	/**Method to get all the stores */
	getStores(searchString: string) {
		if (this.getStoresSubscription != null) {
			this.getStoresSubscription.unsubscribe();
			this.getStoresSubscription = null;
		}
		this.getStoresSubscription = this.onlineStoresService.getOnlineStoresByIdentifier({
			usage: "HCL_TaxTool",
			identifier: "*" + searchString + "*",
			limit: 10
		}).subscribe(response => {
			this.getStoresSubscription = null;
			if (response.items.length === 1 && response.items[0].identifier === this.store.value) {
				this.selectStore(response.items[0]);
			} else {
				this.storeList = response.items;
			}
			this.getStoreThemeCards();
		},
			error => {
				this.getStoresSubscription = null;
			});
	}

	/**Method to select the store */
	selectStore(store: any) {
		if (this.getStoreNameSubscription) {
			this.getStoreNameSubscription.unsubscribe();
			this.getStoreNameSubscription = null;
		}
		const currentStoreId = this.selectedStore ? this.selectedStore.id : null;
		this.currentUserService.setPreferredStore(store.identifier);
		this.selectedStore = store;
		this.store.setValue(store.identifier);
		if (currentStoreId !== store.id) {
			this.storeList = [];
			this.searchStores("");
		}
		this.selectTheCard();
	}

	/**Method to select the theme Card */
	selectTheCard() {
		var obj = this.themes.find(them => them.storeName === this.store.value);
		if (obj !== undefined) {
			var mainrgb = this.hexToRgb(obj.values.find(cl => cl.name === this.MAIN_COLOR).value);
			var darkrgb = this.hexToRgb(obj.values.find(cl => cl.name === this.DARK_COLOR).value);
			this.mainColorCtr.setValue(new Color(mainrgb.r, mainrgb.g, mainrgb.b));
			this.darkColorCtr.setValue(new Color(darkrgb.r, darkrgb.g, darkrgb.b));
			this.saveBtn = "Update";
		} else {
			this.mainColorCtr.setValue(null);
			this.darkColorCtr.setValue(null);
			this.saveBtn = "Save";
		}
		console.log("slected store===", obj);
	}

	/**Method to edit the selected theme for selected store*/
	editTheme(storename: any) {
		console.log(storename);
		this.store.setValue(storename);
		this.selectTheCard();

	}

	/**Method to delete the theme  */
	deleteTheme(storeId) {

		this.storeConfigurationService.deleteStoreConfByIdAndName({ storeId: storeId, name: this.MAIN_COLOR }).subscribe(resp => {
			console.log(resp);
			this.storeConfigurationService.deleteStoreConfByIdAndName({ storeId: storeId, name: this.DARK_COLOR }).subscribe(resp1 => {
				console.log(resp1);
				this.updateStoreRegistry();
				this.alertService.success({ message: "Theme deleted Successfully" });
				this.getStoreThemeCards();
			})
		})
	}
	/**Method to reset the Stores */
	resetSelectedStore() {
		if (this.selectedStore) {
			this.store.setValue(this.selectedStore.identifier);
		}
	}

	/**Method to convert the hex value to rgb value */
	hexToRgb(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (result) {
			var r = parseInt(result[1], 16);
			var g = parseInt(result[2], 16);
			var b = parseInt(result[3], 16);
			return { r, g, b }
		}
		return null;
	}

	/**Method to initiate the fOrm Elements */
	private createFormControls() {
		this.store = new FormControl("");
		this.mainColorCtr = new FormControl(null);
		this.darkColorCtr = new FormControl(null);
	}
	/**Method to initialise the value of form elements */
	private createForm() {
		this.listSearchFrom1 = new FormGroup({
			store: this.store,
			mainColorCtr: this.mainColorCtr,
			darkColorCtr: this.darkColorCtr

		});
	}


	private getFirstStore() {
		this.onlineStoresService.getOnlineStores({
			usage: "HCL_TaxTool",
			limit: 1
		}).subscribe(onlineStoreResponse => {
			const storeArray = onlineStoreResponse.items;
			for (let index = 0; index < storeArray.length; index++) {
				const store = storeArray[index];
				this.selectStore(store);
				break;
			}
		});
	}
}



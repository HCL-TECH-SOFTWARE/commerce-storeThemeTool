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

//Standard libraries
import Axios, { AxiosRequestConfig } from "axios";
//Foundation libraries
import {
  sessionStorageUtil,
  localStorageUtil,
  storageSessionHandler,
  windowRegistryHandler,
  storageStoreIdHandler,
} from "../../../_foundation/utils/storageUtil";
import {
  WC_PREVIEW_TOKEN,
  NEW_PREVIEW_SESSION,
  LANGID,
  LOCALE,
  SHOW_API_FLOW,
} from "../../../_foundation/constants/common";
import {
  GTM_ID,
  GTM_AUTH,
  GTM_PREVIEW,
  GA_VERSIONS,
  GA_VERSION_UA,
  GA_VERSION_GA4,
} from "../../../_foundation/constants/gtm";
//custom library
import { SiteInfo } from "../../../redux/reducers/reducerStateInterface";
import { CommerceEnvironment } from "../../../constants/common";
import { PERMANENT_STORE_DAYS } from "../../../configs/common";
//Redux
import { INIT_SITE_SUCCESS_ACTION } from "../../../redux/actions/site";
import { dark } from "@material-ui/core/styles/createPalette";

declare var HCL_STORE_ID;
export interface SiteInfoArgs {
  storeName?: string;
  searchContext: string;
  transactionContext?: string;
  storeID?: string;
  [extraPros: string]: any;
}

export class SiteInfoService {
  private static mySiteInfo: SiteInfoService = new SiteInfoService();
  private readonly B2B = "B2B";
  private readonly BMH = "BMH";
  private siteInfo: SiteInfo | null = null;

  public static getSiteInfo(): SiteInfoService {
    return SiteInfoService.mySiteInfo;
  }

  public getSiteValue(): SiteInfo | null {
    return this.siteInfo;
  }

  public setSite(s: SiteInfoArgs, dispatch: any) {
    if (!this.siteInfo) {
      this.initializeSite(s).then((site: SiteInfo) => {
        this.siteInfo = site;
        dispatch(INIT_SITE_SUCCESS_ACTION(site));
      });
    }
  }

  private initStorage(site: SiteInfo) {
    sessionStorageUtil.setStoreName(site.storeName);
    localStorageUtil.setStoreName(site.storeName);
    storageStoreIdHandler.setStoreId(site.storeID);
    windowRegistryHandler.registerWindow();
    window.addEventListener("unload", function (event) {
      windowRegistryHandler.unRegisterWindow();
    });
    window.addEventListener("contextmenu", function (this, event) {
      storageStoreIdHandler.verifyActiveStoreId();
    });
    //preview token
    const storeviewURL = new URL(window.location.href);
    const wcPreviewToken = {};
    const previewtoken = storeviewURL.searchParams.get(WC_PREVIEW_TOKEN);
    if (previewtoken !== null) {
      wcPreviewToken[WC_PREVIEW_TOKEN] = previewtoken;
      storageSessionHandler.savePreviewToken(wcPreviewToken);
      const newPreviewSession = storeviewURL.searchParams.get(
        NEW_PREVIEW_SESSION
      );
      if ("true" === newPreviewSession) {
        storageSessionHandler.removeCurrentUser();
      }
    }
    const langId = storeviewURL.searchParams.get(LANGID);
    const locale = storeviewURL.searchParams.get(LOCALE);
    const showAPIFlow = storeviewURL.searchParams.get(SHOW_API_FLOW);

    if (langId !== null) {
      //check if it is part supported language.
      if (site.supportedLanguages.includes(langId)) {
        localStorageUtil.set(
          LOCALE,
          CommerceEnvironment.languageMap[langId],
          30
        );
      } else {
        console.warn(
          `${langId} is not supported language of store ${site.storeName}`
        );
      }
    } else if (locale != null) {
      //
      const langId = CommerceEnvironment.reverseLanguageMap[locale];
      if (site.supportedLanguages.includes(langId)) {
        localStorageUtil.set(LOCALE, locale, PERMANENT_STORE_DAYS);
      } else {
        console.warn(
          `${locale} is not supported language of store ${site.storeName}`
        );
      }
    } else {
      //verify if locale is one of supported language, remove it if is not supported.
      const locale = localStorageUtil.get(LOCALE);
      const langId = CommerceEnvironment.reverseLanguageMap[locale];
      if (!site.supportedLanguages.includes(langId)) {
        localStorageUtil.remove(LOCALE);
      }
    }

    if (showAPIFlow !== null) {
      localStorageUtil.set(SHOW_API_FLOW, showAPIFlow, PERMANENT_STORE_DAYS);
    }
  }

  private initializeSite(s: SiteInfoArgs): Promise<SiteInfo> {
    const _site: SiteInfoArgs = Object.assign({}, s);
    //GA360
    let gtmID: string, gtmAuth: string, gtmPreview: string, gaVersions: string;
   let mainColor:string,darkColor:string;
    let storeId = typeof HCL_STORE_ID === undefined ? undefined : HCL_STORE_ID;
    if (!storeId) {
      storeId = storageStoreIdHandler.getStoreId4Initialization();
    }
    if (!storeId) {
      //no store ID, lookup default name first.
      return this.getStoreData({ ..._site })
        .then((cfg: any) => {
          _site.storeID = cfg.storeId;
          _site.inventorySystem = cfg.inventorySystem;
          return this.getOnlineStoreData({
            ..._site,
          });
        })
        .then((storeCfg: any) => {
          const caStore = storeCfg.relatedStores.find(
            (s: any) =>
              s.relationshipType === "-4" && s.relatedStoreId !== _site.storeID
          ); // -4 is catalog-asset-store
          /* Store theme */
          mainColor=storeCfg.userData["store.theme.main.color"];
          darkColor=storeCfg.userData["store.theme.dark.color"];
		  /* Store theme */
          //GA360
          gtmID = storeCfg.userData[GTM_ID]; 
          gtmAuth = storeCfg.userData[GTM_AUTH];
          gtmPreview = storeCfg.userData[GTM_PREVIEW];
          gaVersions = storeCfg.userData[GA_VERSIONS];
          if (gtmID && gtmAuth && gtmPreview) {
            _site.enableGA = true;
            if (gaVersions) {
              _site.enableUA = gaVersions.includes(GA_VERSION_UA);
              _site.enableGA4 = gaVersions.includes(GA_VERSION_GA4);
            } else {
              _site.enableUA = false;
              _site.enableGA4 = false;
            }
            _site.gtmID = gtmID;
            _site.gtmAuth = gtmAuth;
            _site.gtmPreview = gtmPreview;
          }
		  /* Store theme */
          _site.mainColor = mainColor;
          _site.darkColor = darkColor;
		  /* Store theme */
          _site.storeName = storeCfg.identifier;
          _site.storeID = storeCfg.storeId;
          _site.catalogStoreID = caStore.relatedStoreId;
          _site.catalogID =
            storeCfg.defaultCatalog[0].catalogIdentifier?.uniqueID;
          _site.defaultCurrencyID =
            storeCfg.supportedCurrencies.defaultCurrency;
          _site.defaultLanguageID =
            storeCfg.supportedLanguages.defaultLanguageId;
          _site.storeType = storeCfg.storeType;
          _site.isB2B =
            _site.storeType === this.B2B || _site.storeType === this.BMH;
          _site.storeCfg = storeCfg;
          _site.supportedLanguages =
            storeCfg.supportedLanguages.supportedLanguages;
          _site.supportedCurrencies =
            storeCfg.supportedCurrencies.supportedCurrencies;

          this.initStorage(_site as SiteInfo);
          return _site as SiteInfo;
        });
    } else {
      //has storeId, use StoreId.
      _site.storeID = storeId;
      return this.getOnlineStoreData({
        ..._site,
      }).then((storeCfg: any) => {
        const caStore = storeCfg.relatedStores.find(
          (s: any) =>
            s.relationshipType === "-4" && s.relatedStoreId !== _site.storeID
        ); // -4 is catalog-asset-store
        /* Store theme */
        _site.mainColor=storeCfg.userData["store.theme.main.color"];
        _site.darkColor=storeCfg.userData["store.theme.dark.color"];
       /* Store theme */
        //GA360
        gtmID = storeCfg.userData[GTM_ID];
        gtmAuth = storeCfg.userData[GTM_AUTH];
        gtmPreview = storeCfg.userData[GTM_PREVIEW];
        gaVersions = storeCfg.userData[GA_VERSIONS];
        if (gtmID && gtmAuth && gtmPreview) {
          _site.enableGA = true;
          if (gaVersions) {
            _site.enableUA = gaVersions.includes(GA_VERSION_UA);
            _site.enableGA4 = gaVersions.includes(GA_VERSION_GA4);
          } else {
            _site.enableUA = false;
            _site.enableGA4 = false;
          }
          _site.gtmID = gtmID;
          _site.gtmAuth = gtmAuth;
          _site.gtmPreview = gtmPreview;
        }
        _site.storeName = storeCfg.identifier;
        _site.storeID = storeCfg.storeId;
        _site.catalogStoreID = caStore.relatedStoreId;
        _site.catalogID =
          storeCfg.defaultCatalog[0].catalogIdentifier?.uniqueID;
        _site.defaultCurrencyID = storeCfg.supportedCurrencies.defaultCurrency;
        _site.defaultLanguageID = storeCfg.supportedLanguages.defaultLanguageId;
        _site.storeType = storeCfg.storeType;
        _site.isB2B =
          _site.storeType === this.B2B || _site.storeType === this.BMH;
        _site.storeCfg = storeCfg;
        _site.supportedLanguages =
          storeCfg.supportedLanguages.supportedLanguages;
        _site.supportedCurrencies =
          storeCfg.supportedCurrencies.supportedCurrencies;
        return this.getStoreData({ ..._site }).then((cfg: any) => {
          _site.inventorySystem = cfg.inventorySystem;
          this.initStorage(_site as SiteInfo);
          return _site as SiteInfo;
        });
      });
    }
  }

  private getStoreData(s: any | SiteInfo) {
    const config: AxiosRequestConfig = {
      params: {
        q: "findByStoreIdentifier",
        storeIdentifier: s.storeName,
      },
    };
    return Axios.get(
      `${s.transactionContext}/store/0/adminLookup`,
      config
    ).then((r) => r.data.resultList[0]);
  }

  private getOnlineStoreData(s: any | SiteInfo) {
    return Axios.get(
      `${s.transactionContext}/store/${s.storeID}/online_store`
    ).then((r) => {
      return r.data.resultList[0];
    });
  }
}

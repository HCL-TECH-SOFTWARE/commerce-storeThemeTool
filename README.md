## Management-Center Asset for Store-Theme

## WARRANTY & SUPPORT 
HCL Software provides HCL Commerce open source assets “as-is” without obligation to support them nor warranties or any kind, either express or implied, including the warranty of title, non-infringement or non-interference, and the implied warranties and conditions of merchantability and fitness for a particular purpose. HCL Commerce open source assets are not covered under the HCL Commerce master license nor Support contracts.

If you have questions or encounter problems with an HCL Commerce open source asset, please open an issue in the asset's GitHub repository. For more information about [GitHub issues](https://docs.github.com/en/issues), including creating an issue, please refer to [GitHub Docs](https://docs.github.com/en). The HCL Commerce Innovation Factory Team, who develops HCL Commerce open source assets, monitors GitHub issues and will do their best to address them. 

## HCL CMC Tooling Asset for Store-Theme Management

**This POC is used to manage store-theme in CMC for React store and it is tested on HCLC 9.1.1.0**

**The implementation includes below components**

- Development of a new Angular Tool for Management Center (tooling-web)
- Customization to React Storefront (store-web)
- Customization to Application Menu XML for New Menu  (ts-app)

**Functional Actions:**

- Retrieval of available stores (store filter)
- Primary / Secondary Color Pickers
- Update/Save Button (saves values to STORECONF table for storeId)
- Edit mode enables you to edit an existing theme
- Delete mode deletes the theme and the entries in STORECONF (back to OOTB)
- Upon and Update/Save action, Invoking a StoreRegistry update in the background


### Follow the below steps for the implementation

**1. Menu "Store Theme" in Management Center(ts-app/lobtool)**

  1. Add the Below line in the ApplicationMenuItems.xml file
      
           <ApplicationMenuItem actionName="openBusinessObjectEditor" displayName="Store Theme" id="StoreThemeManagement" package="cmc/shell"   toolDefinition="cmc/theme/StoreThemeManagement"></ApplicationMenuItem>	
    
 2. Add the `theme` folder inside `LOBTools\WebContent\WEB-INF\src\xml\commerce` folder



**2. React Storefront changes (store-web)**
Please reference the provided [**index.tsx**](https://github.com/HCL-Commerce-Asset-Repository-Bullpen/POC-StoreThemeTool/blob/main/store-web/index.tsx) file for placement of the necessary code snippets.

First at the top of the **index.tsx** file under the //UI section, you need to include these two imports:
```
import { palette } from "./themes/color-palette";
import { sharedOverrides, merge, responsiveFontSizes } from "./themes/shared-theme";
```

The two import files can be found in the store-web SDK under /node_modules/@hcl-commerce-store-sdk/react-component/src/themes.  You need to copy them from that folder to src/themes.

-**color-palette.ts**

-**shared-theme.ts**

Second, around line 34 just under const rootElement = document.getElementById("root"); we need to add the following code snippet:
 

```const IndexApp=(props: any) => {
  const { mySite } = useSite();
 const [theme,setTheme]=React.useState<any>(CurrentTheme);
  React.useEffect(() => {
    if (mySite) {
       console.log(mySite.mainColor,"color");
       if(mySite.mainColor !== undefined && mySite.darkColor !== undefined){
        renderTheme(mySite.mainColor,mySite.darkColor);
       }
       
    }
  },[mySite]);

  const renderTheme=(main,dark)=>{

    const {  light } = palette.emerald;

     const emeraldOverrides = {
      name: "Emerald",
      palette: {
        primary: {
          light: light,
          main: main,
          dark: dark,
          contrastText: "#fff",
        },
        secondary: {
          light: light,
          main: main,
          dark: dark,
          contrastText: "#fff",
        },
      },
      button: {
        backgroundColor: main,
        "&:hover": {
          backgroundColor: main,
        },
      },
      child: {
        backgroundColor: main,
      },
      rippleVisible: {
        opacity: 0.5,
      },
    };
    
    const combinedOverides = merge(sharedOverrides, emeraldOverrides);
   setTheme(responsiveFontSizes(createMuiTheme(combinedOverides)));
  }

  return (
     <StyledThemeProvider theme={theme}>
          <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <App />
          </MuiThemeProvider>
        </StyledThemeProvider>
      
  )
}
	
render(
  <Provider store={store}>
  <Suspense
    fallback={<StyledCircularProgress className="horizontal-padding-5" />}>
    <StylesProvider injectFirst>
      <IndexApp/>
    </StylesProvider>
  </Suspense>
</Provider>,
  rootElement
);
```

   3. Add the below entries in `initializeSite` method of **/_foundation/hooks/useSite/** `storeInfoservice.ts` file 
      ![image](https://user-images.githubusercontent.com/70706074/137130488-439f6738-343c-4738-92af-7a7ee386cb0d.png)
      

**3. Angular Tooling in CMC**

   1. Add the `store-theme` folder inside `src/app/features/` folder.
    
   2. Add the `store-configuration.service.js` file inside `src/app/rest/services/` folder
    
   3. Add the below entry in routes constant variable in the `src/app/app-routing.module.ts` file
    
	       {
		  path: "theme",
		  loadChildren: () => import("./features/store-theme/store-theme.module").then(m => m.StoreThemeModule)}
		  
   4. Under the dependencies section of package.json, add to the top of the list:
  		"@angular-material-components/color-picker": "^6.0.0",

   5. Run **npm install**
   
   6. Run **npm start**
        
    

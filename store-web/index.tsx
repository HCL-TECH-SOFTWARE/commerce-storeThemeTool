/*
 *==================================================
 * Licensed Materials - Property of HCL Technologies
 *
 * HCL Commerce
 *
 * (C) Copyright HCL Technologies Limited 2020
 *
 *==================================================
 */
//Standard libraries
import React, { Suspense } from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
//Custom libraries
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import "./i18n";
//Redux
import store from "./redux/store/index";
//UI
import CssBaseline from "@material-ui/core/CssBaseline";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { StylesProvider } from "@material-ui/styles";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { StyledCircularProgress } from "@hcl-commerce-store-sdk/react-component";
import { CurrentTheme } from "./themes";
import "./index.scss";
import { useSite } from "./_foundation/hooks/useSite";
/*Start Store Theme*/
import { palette } from "./themes/color-palette";
/*End Store Theme*/
import { createMuiTheme } from "@material-ui/core/styles";
/*Start Store Theme*/
import { sharedOverrides, merge, responsiveFontSizes } from "./themes/shared-theme";
/*End Store Theme*/
const rootElement = document.getElementById("root");

/* Start Store Theme */
const IndexApp=(props: any) => {
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
/*End Store Theme*/
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
                         

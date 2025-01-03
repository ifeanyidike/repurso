import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./utils/routes";
import { AppState, Auth0Provider, User } from "@auth0/auth0-react";
import { createBrowserHistory } from "history";
import App from "./App";
export const history = createBrowserHistory();

const onRedirectCallback = (appState?: AppState, user?: User) => {
  console.log("app state", appState);
  console.log("user", user);
  history.push(
    appState && appState.targetUrl
      ? appState.targetUrl
      : window.location.pathname
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain={(import.meta as any).env.VITE_AUTH0_DOMAIN}
      clientId={(import.meta as any).env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
      onRedirectCallback={onRedirectCallback}
      cacheLocation="localstorage"
      // useRefreshTokens={true}
      // useRefreshTokensFallback={false}
    >
      <RouterProvider router={router}></RouterProvider>
      <App />
    </Auth0Provider>
    ,
  </StrictMode>
);

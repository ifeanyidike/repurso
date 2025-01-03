import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { onRedirectCallback, router } from "./utils/routes";
import { RouterProvider } from "react-router-dom";
import { userImpl } from "./service/User";

function App() {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    console.log("isAuthenticated", isAuthenticated, user);
    (async () => {
      const token = await getAccessTokenSilently();
      console.log("token", token);
      if (user && isAuthenticated) {
        userImpl.registerUser(user, token);
      }
    })();
  }, [isAuthenticated, user]);
  return <></>;
}

export default App;

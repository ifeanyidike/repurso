import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { userImpl } from "./service/User";

function App() {
  // const { isAuthenticated, user, getAccessTokenSilently, getIdTokenClaims } =
  //   useAuth0();
  // useEffect(() => {
  //   console.log("isAuthenticated", isAuthenticated, user);
  //   (async () => {
  //     const token = await getAccessTokenSilently();
  //     const tk = await getIdTokenClaims();
  //     console.log("access token", token);
  //     console.log("id token claims", tk);
  //     if (user && isAuthenticated) {
  //       userImpl.registerUser(user, tk?.__raw as string);
  //     }
  //   })();
  // }, [isAuthenticated, user]);
  return <></>;
}

export default App;

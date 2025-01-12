import { withAuthenticationRequired } from "@auth0/auth0-react";
import React from "react";

const AuthenticationGuard = ({ component }: { component: any }) => {
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => <div>Loading...</div>,
  });

  return <Component />;
};

export default AuthenticationGuard;

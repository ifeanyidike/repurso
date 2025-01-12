import { createBrowserRouter } from "react-router-dom";
import Welcome from "../Pages/welcome";
import ConfirmationScreen from "../Pages/confirmation";
import EditorView from "../Pages/EditorView";
import { AppState, User } from "@auth0/auth0-react";
import { createBrowserHistory } from "history";
import Upload from "../Pages/upload";
import Projects from "../Pages/Projects";
import AuthenticationGuard from "@/Pages/components/AuthenticationGuard";
export const history = createBrowserHistory();

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Welcome />,
  },
  {
    path: "/confirmation",
    element: <ConfirmationScreen />,
  },
  {
    path: "/editor",
    element: <EditorView />,
  },
  {
    path: "/upload",
    element: <Upload />,
  },
  {
    path: "/projects",
    element: <AuthenticationGuard component={Projects} />,
  },
]);

export const onRedirectCallback = async (appState?: AppState, user?: User) => {
  history.push(
    appState && appState.targetUrl
      ? appState.targetUrl
      : window.location.pathname
  );
};

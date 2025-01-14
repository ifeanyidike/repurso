import { createBrowserRouter } from "react-router-dom";
import Welcome from "../pages/welcome";
import ConfirmationScreen from "../pages/confirmation";
import EditorView from "../pages/EditorView";
import { AppState, User } from "@auth0/auth0-react";
import { createBrowserHistory } from "history";
import Upload from "../pages/upload";
import Projects from "../pages/projects";
import AuthenticationGuard from "@/pages/components/AuthenticationGuard";
import Videos from "../pages/videos";
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
  {
    path: "/videos/:id",
    element: <AuthenticationGuard component={Videos} />,
  },
]);

export const onRedirectCallback = async (appState?: AppState, user?: User) => {
  history.push(
    appState && appState.targetUrl
      ? appState.targetUrl
      : window.location.pathname
  );
};

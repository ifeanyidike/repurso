import { projectStore } from "@/store/ProjectStore";
import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import ProjectContentView from "./components/ProjectContentView";
import { observer } from "mobx-react-lite";

const ProjectContent = observer(() => {
  const { user, getIdTokenClaims, getAccessTokenSilently } = useAuth0();
  const params = useParams();
  console.log("params: ", params);
  useEffect(() => {
    if (user) {
      getAccessTokenSilently().then((token) => {
        console.log("In here", token);
        projectStore.getProjects(user.sub!, token);
      });
    }
    // (async () => {
    //   if (user) {
    //     const token = await getAccessTokenSilently();
    //     projectStore.getProjects(user.sub!, token);
    //   }
    // })();
  }, [user?.sub, projectStore.projects.length]);

  useEffect(() => {
    console.log("projectStore.projects", projectStore.projects);
    if (params.id && projectStore.projects.length) {
      projectStore.getProject(params.id);
    }
  }, [params.id, projectStore.projects]);

  console.log("projectStore", projectStore.projects, projectStore.project);

  if (!projectStore.project) return;
  return <ProjectContentView project={projectStore.project} />;
});

export default ProjectContent;

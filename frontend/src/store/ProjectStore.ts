import { ProjectType } from "@/types/project";
import axios from "axios";
import { makeAutoObservable, flow } from "mobx";

export class ProjectStore {
  private SERVER: string;
  public projects: ProjectType[] = [];
  public project: ProjectType | undefined = undefined;

  constructor() {
    const env = (import.meta as any).env as any;
    this.SERVER = env.VITE_SERVER_ADDRESS;

    makeAutoObservable(this);
  }

  public getProject(id: string) {
    console.log("projects", this.projects);
    this.project = this.projects.find((p) => p.id === id);
  }

  public getProjects(userID: string, token: string) {
    const self = this;
    const fetchProjects = flow(function* () {
      try {
        const response = yield axios.get(
          `${self.SERVER}/v1/projects/${userID}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data; // Return the fetched data
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        throw error; // Handle the error or propagate it
      }
    });
    flow(function* () {
      try {
        const data = yield fetchProjects();
        self.projects = data?.projects?.map((p: any) => ({
          ...p,
          collaborators: 4,
          dueDate: p.due_date,
          status: "active",
          progress: 0,
        }));
      } catch (error) {
        self.projects = [];
      }
    })();
  }

  public addProject = flow(function* (
    userID: string,
    token: string,
    project: ProjectType
  ) {
    const server = projectStore.SERVER;

    try {
      console.log("Sending request to create project...");
      const response = yield axios.post(
        `${server}/v1/projects/create/${userID}`,
        project,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Response received:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error while creating project:", error);
      throw error; // Rethrow the error for the caller to handle
    }
  });
}

export const projectStore = new ProjectStore();

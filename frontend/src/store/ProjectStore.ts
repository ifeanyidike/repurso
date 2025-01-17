import { ProjectType } from "@/types/project";
import axios from "axios";
import { makeAutoObservable, flow } from "mobx";

export class ProjectStore {
  private SERVER: string;
  public projects: ProjectType[] = [];
  public project: ProjectType | undefined = undefined;
  public videos: any[] = [];

  constructor() {
    const env = (import.meta as any).env as any;
    this.SERVER = env.VITE_SERVER_ADDRESS;

    makeAutoObservable(this);
  }

  public async getProject(id: string, auth0_id: string, token: string) {
    // this.project = this.projects.find((p) => p.id === id);
    if (!this.projects?.length) {
      await this.getProjects(auth0_id, token);
    }
    this.project = this.projects.find((p) => p.id === id);
    console.log("project: ", this.project, this.projects);
    const self = this;
    const fetchVideos = flow(function* () {
      try {
        const response = yield axios.get(
          `${self.SERVER}/v1/projects/videos/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data; // Return the fetched data
      } catch (error) {
        console.error("Failed to fetch videos:", error);
        throw error; // Handle the error or propagate it
      }
    });
    flow(function* () {
      try {
        const data = yield fetchVideos();
        self.videos = data?.videos ?? [];
      } catch (error) {
        self.videos = [];
      }
    })();
  }

  public async getProjects(userID: string, token: string) {
    try {
      const response = await axios.get(`${this.SERVER}/v1/projects/${userID}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Projects fetched:", response.data);

      this.projects =
        response.data?.projects?.map((p: any) => ({
          ...p,
          collaborators: 4,
          dueDate: p.due_date,
          status: "active",
          progress: 0,
        })) || [];
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      this.projects = [];
    }
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

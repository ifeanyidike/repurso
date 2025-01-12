import axios from "axios";
import { makeAutoObservable, flow } from "mobx";

export class ProjectStore {
  private SERVER: string;
  public projects: any[] = [];

  constructor() {
    const env = (import.meta as any).env as any;
    this.SERVER = env.VITE_SERVER_ADDRESS;

    makeAutoObservable(this);
  }

  public getProjects(userID: string, token: string) {
    const server = this.SERVER;
    return flow(function* () {
      const response = yield axios.get(`${server}/v1/projects/${userID}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;

      //   fetch(`${server}/v1/projects/${userID}`, {
      //     method: "GET",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${token}`,
      //     },
      //   });
      //   return response.json();
    });
  }
}

export const projectStore = new ProjectStore();

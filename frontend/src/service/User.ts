let env = (import.meta as any).env;
import { User as Auth0User } from "@auth0/auth0-react";
class User {
  private SERVER = env.VITE_SERVER_ADDRESS;

  public async registerUser(user: Auth0User, token: string) {
    try {
      const response = await fetch(`${this.SERVER}/v1/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          auth0_id: user.sub,
          name: user.name,
          email: user.email,
          picture: user.picture,
          email_verified: user.email_verified,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register user");
      }

      const data = await response.json();
      console.log("User registered successfully:", data);
    } catch (error: any) {
      console.error("Error registering user:", error.message);
    }
  }
}

export const userImpl = new User();

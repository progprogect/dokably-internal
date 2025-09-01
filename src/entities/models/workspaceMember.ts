import { Role } from "./role";

export type WorkspaceMember = {
  user: {
    deleted: boolean,
    email: string,
    id: string,
    name: string | null  
  },
  role: Role;
}

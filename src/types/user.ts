import { User } from "next-auth";

type ExtendedUserType = User & { setupCompleted: boolean; description: string };

export default ExtendedUserType;

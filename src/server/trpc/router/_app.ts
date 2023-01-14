import { router } from "../trpc";
import { userRouter } from "./user";
import { searchRouter } from "./search";

export const appRouter = router({
  user: userRouter,
  search: searchRouter,
});

export type AppRouter = typeof appRouter;

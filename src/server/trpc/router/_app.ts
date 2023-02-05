import { router } from "../trpc";
import { userRouter } from "./user";
import { searchRouter } from "./search";
import { listRouter } from "./list";

export const appRouter = router({
  user: userRouter,
  search: searchRouter,
  list: listRouter,
});

export type AppRouter = typeof appRouter;

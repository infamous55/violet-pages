import { router } from "../trpc";
import { userRouter } from "./user";
import { searchRouter } from "./search";
import { listRouter } from "./list";
import { bookRouter } from "./book";

export const appRouter = router({
  user: userRouter,
  search: searchRouter,
  list: listRouter,
  book: bookRouter,
});

export type AppRouter = typeof appRouter;

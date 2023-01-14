import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { TRPCError } from "@trpc/server";

export const searchRouter = router({
  getResultsPage: protectedProcedure
    .input(z.object({ query: z.string(), page: z.number().positive().int() }))
    .query(async ({ input }) => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
            input.query
          )}&startIndex=${(input.page - 1) * 10}&key=${env.GOOGLE_API_KEY}`
        );
        const data = await response.json();
        if (!data.totalItems || !data.items)
          throw new TRPCError({ code: "NOT_FOUND" });
        return data;
      } catch (error) {
        console.error(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
    }),
});

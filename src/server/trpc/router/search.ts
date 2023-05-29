import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { env } from "~/env/server.mjs";
import { TRPCError } from "@trpc/server";
import { prisma } from "~/server/db/client";

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
  addToHistory: protectedProcedure
    .input(z.object({ query: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const search = await prisma.search.findUnique({
          where: {
            userId_query: { userId: ctx.session.user.id, query: input.query },
          },
        });
        if (search) {
          const updatedSearch = await prisma.search.update({
            where: {
              userId_query: { userId: ctx.session.user.id, query: input.query },
            },
            data: { updatedAt: new Date() },
          });
          return updatedSearch;
        }
        const searchCount = await prisma.search.count({
          where: {
            userId: ctx.session.user.id,
            query: input.query,
          },
        });
        if (searchCount >= 5) {
          const oldestSearch = await prisma.search.findFirst({
            where: { userId: ctx.session.user.id },
            orderBy: { updatedAt: "asc" },
          });
          await prisma.search.delete({
            where: {
              userId_query: {
                userId: ctx.session.user.id,
                query: oldestSearch!.query,
              },
            },
          });
        }
        const newSearch = await prisma.search.create({
          data: {
            userId: ctx.session.user.id,
            query: input.query,
          },
        });
        return newSearch;
      } catch (error) {
        console.error(error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const history = await prisma.search.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { updatedAt: "desc" },
      });
      return history;
    } catch (error) {
      console.error(error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});

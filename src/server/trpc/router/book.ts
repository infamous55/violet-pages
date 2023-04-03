import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import redis from "../../../utils/redis";
import openai from "../../../utils/openai";
import { prisma } from "../../db/client";
import type ListSelectItem from "../../../types/list-select-item";

export const bookRouter = router({
  getDescription: protectedProcedure
    .input(z.object({ id: z.string(), description: z.string() }))
    .query(async ({ input }) => {
      try {
        const cachedDescription = await redis.get(input.id);
        if (!cachedDescription) {
          const openaiResponse = await openai.createEdit({
            model: "text-davinci-edit-001",
            instruction:
              "Edit the following text such that it follows standard grammar. Remove extra characters, remove markdown tags, remove unnecessary hyphens, use proper capitalization, and fix the punctuation. Make sure it follows a clean and correct writing style.",
            input: input.description,
          });

          await redis.set(input.id, openaiResponse.data.choices[0]?.text);
          return openaiResponse.data.choices[0]?.text;
        }
        return cachedDescription as string;
      } catch (error) {
        console.error(error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getLists: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const book = await prisma.book.findUnique({
          where: { googleId: input.id },
        });
        const allLists = await prisma.list.findMany({
          select: { id: true, name: true },
          where: { authorId: ctx.session.user.id },
        });
        if (!book) {
          return allLists.map((list) => {
            return { ...list, hasBook: false };
          });
        }

        const listsWithBook = await prisma.list.findMany({
          select: { id: true, name: true },
          where: { authorId: ctx.session.user.id, books: { some: book } },
        });
        return allLists.map((list) => {
          if (listsWithBook.some((otherList) => otherList.id === list.id))
            return { ...list, hasBook: true };
          else return { ...list, hasBook: false };
        });
      } catch (error) {
        console.error(error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  addToLists: protectedProcedure
    .input(z.object({ id: z.string(), selectedLists: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      try {
        let currentList;
        input.selectedLists.forEach(async (listId) => {
          currentList = await prisma.list.findUnique({
            where: { id: listId },
            include: { books: true },
          });

          if (!currentList) throw new TRPCError({ code: "BAD_REQUEST" });
          if (currentList.authorId !== ctx.session.user.id)
            throw new TRPCError({ code: "FORBIDDEN" });
        });

        const result: ListSelectItem[] = [];
        const book = { googleId: input.id };
        const allLists = await prisma.list.findMany({
          select: { id: true, name: true },
          where: { authorId: ctx.session.user.id },
        });

        for (const list of allLists) {
          if (input.selectedLists.includes(list.id)) {
            await prisma.list.update({
              where: { id: list.id },
              data: {
                books: {
                  connectOrCreate: {
                    create: book,
                    where: book,
                  },
                },
              },
            });
            result.push({ ...list, hasBook: true });
          } else {
            await prisma.list.update({
              where: { id: list.id },
              data: {
                books: {
                  disconnect: book,
                },
              },
            });
            result.push({ ...list, hasBook: false });
          }
        }

        return result;
      } catch (error) {
        console.error(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});

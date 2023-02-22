import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "../../db/client";
import { TRPCError } from "@trpc/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const listSchema = z.object({
  name: z.string().min(1).max(25),
  description: z.string(),
  public: z.boolean(),
});

export const listRouter = router({
  create: protectedProcedure
    .input(listSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const list = await prisma.list.create({
          data: { ...input, authorId: ctx.session.user.id },
        });
        return list;
      } catch (error) {
        console.error(error);
        let message = undefined;
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === "P2002"
        )
          message = "List name already taken!";
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
      }
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const lists = await prisma.list.findMany({
        where: { authorId: ctx.session.user.id },
        orderBy: {
          createdAt: "desc",
        },
      });
      return lists;
    } catch (error) {
      console.error(error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const list = await prisma.list.findUnique({ where: { id: input.id } });
        if (!list) throw new TRPCError({ code: "NOT_FOUND" });
        if (list.authorId !== ctx.session.user.id)
          throw new TRPCError({ code: "FORBIDDEN" });

        await prisma.list.delete({ where: { id: input.id } });
        return;
      } catch (error) {
        console.error(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  update: protectedProcedure
    .input(listSchema.extend({ id: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const list = await prisma.list.findUnique({ where: { id: input.id } });
        if (!list) throw new TRPCError({ code: "NOT_FOUND" });
        if (list.authorId !== ctx.session.user.id)
          throw new TRPCError({ code: "FORBIDDEN" });

        const updatedList = prisma.list.update({
          where: { id: input.id },
          data: input,
        });
        return updatedList;
      } catch (error) {
        console.error(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});

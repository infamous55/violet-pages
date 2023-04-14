import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "~/server/db/client";
import { env } from "~/env/server.mjs";
import { v4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import type User from "~/types/user";

const userSchema = z.object({
  name: z.string().min(1).max(13),
  image: z.string(),
  description: z.string(),
  setupCompleted: z.boolean(),
});

export const userRouter = router({
  update: protectedProcedure
    .input(userSchema.partial())
    .mutation(async ({ input, ctx }) => {
      try {
        const updatedUser: User = await prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: input,
        });
        return updatedUser;
      } catch (error) {
        console.error(error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  get: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      try {
        const user = await prisma.user.findUnique({ where: { id: input.id } });
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        return user;
      } catch (error) {
        console.error(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getPresignedUrl: protectedProcedure.mutation(async () => {
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
    const key = v4();
    const command = new PutObjectCommand({ Bucket: "book-app", Key: key });
    try {
      const url = await getSignedUrl(client, command, { expiresIn: 3600 });
      return { url, key };
    } catch (error) {
      console.error(error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  getProfile: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: input.id },
          select: { description: true, name: true, image: true },
        });
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        const lists = await prisma.list.findMany({
          where: { authorId: input.id, public: true },
        });
        return {
          user: { id: input.id, ...user },
          lists,
        };
      } catch (error) {
        console.error(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await prisma.user.findUnique({ where: { id: input.id } });
        if (!user) throw new TRPCError({ code: "BAD_REQUEST" });
        if (user.id !== ctx.session.user.id)
          throw new TRPCError({ code: "FORBIDDEN" });
        await prisma.user.delete({ where: { id: input.id } });
        return;
      } catch (error) {
        console.error(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getListInfo: protectedProcedure.query(async ({ ctx }) => {
    try {
      const totalLists = await prisma.list.count({
        where: { authorId: ctx.session.user.id },
      });
      if (!totalLists)
        return {
          totalLists,
          publicLists: 0,
          privateLists: 0,
        };
      const publicLists = await prisma.list.count({
        where: { authorId: ctx.session.user.id, public: true },
      });
      return {
        totalLists,
        publicLists,
        privateLists: totalLists - publicLists,
      };
    } catch (error) {
      console.error(error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});

import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import redis from "../../../utils/redis";
import openai from "../../../utils/openai";

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
});

import type { NextApiRequest, NextApiResponse, PageConfig } from "next";
import getServerAuthSession from "~/utils/getServerAuthSession";
import multer, { MulterError } from "multer";
import { createRouter } from "next-connect";
import { v4 } from "uuid";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "~/env/server.mjs";
import { prisma } from "~/server/db/client";

interface NextConnectApiRequest extends NextApiRequest {
  file?: Express.Multer.File;
}
const router = createRouter<NextConnectApiRequest, NextApiResponse>();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 5 },
});

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

router.post(
  // @ts-ignore
  upload.single("file"),
  async (req, res, next) => {
    const session = await getServerAuthSession({ req, res });

    if (!session || !session?.user)
      return res.status(401).json({ error: "You must be logged in" });

    await next();
  },
  (req, res, next) => {
    if (!req.file) return res.status(400).json({ error: "File is missing" });

    if (!req.file.size) return res.status(400).json({ error: "File is empty" });

    if (!req.file.mimetype.startsWith("image/"))
      return res.status(415).json({ error: "File is not an image" });

    return next();
  },
  async (req, res) => {
    const key = v4();
    await s3.send(
      new PutObjectCommand({
        Bucket: "book-app",
        Key: key,
        Body: req.file!.buffer,
        ContentType: req.file!.mimetype,
      })
    );

    const session = await getServerAuthSession({ req, res });
    const oldURL = session!.user.image;
    const oldKey = oldURL.substring(oldURL.lastIndexOf("/") + 1);

    const newURL = `${env.NEXT_PUBLIC_BUCKET_URL}/${key}`;
    await prisma.user.update({
      where: { id: session!.user.id },
      data: { image: newURL },
    });

    await s3.send(
      new DeleteObjectCommand({
        Bucket: "book-app",
        Key: oldKey,
      })
    );

    res.status(204).send("");
  }
);

export default router.handler({
  onError: (error, _req, res) => {
    if (error instanceof MulterError) {
      if (error.message === "Unexpected end of form")
        return res.status(400).json({ error: "File is missing" });

      if (error.message === "File too large")
        return res.status(413).json({ error: "File is too large" });
    }
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  },
  onNoMatch: (_req, res) => {
    res.status(405).json({ error: `Method Not Allowed` });
  },
});

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

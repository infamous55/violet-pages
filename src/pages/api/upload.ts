import type { NextApiRequest, NextApiResponse, PageConfig } from "next";
import getServerAuthSession from "../../utils/getServerAuthSession";
import multer from "multer";
import nextConnect from "next-connect";
import { v4 } from "uuid";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../../env/server.mjs";

interface NextConnectApiRequest extends NextApiRequest {
  file?: Express.Multer.File;
}

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 1024 * 1024 * 5 } });
const uploadMiddleware = upload.single("file");

const client = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

const handler = nextConnect({
  onError(error: Error, _req: NextConnectApiRequest, res: NextApiResponse) {
    console.error(error);

    if (error.message === "Unexpected end of form")
      return res.status(400).json({ error: "File is missing" });

    if (error.message === "File too large")
      return res.status(413).json({ error: "File is too large" });

    res.status(500).json({ error: "Internal Server Error" });
  },
  onNoMatch(_req: NextConnectApiRequest, res: NextApiResponse) {
    res.status(405).json({ error: `Method Not Allowed` });
  },
})
  .use(uploadMiddleware)
  .post(async (req, res) => {
    const session = await getServerAuthSession({ req, res });
    if (!session || !session?.user)
      return res.status(401).json({ error: "You must be logged in" });

    if (!req.file) return res.status(400).json({ error: "File is missing" });

    if (!req.file.size) return res.status(400).json({ error: "File is empty" });

    if (!req.file.mimetype.startsWith("image/"))
      return res.status(415).json({ error: "File is not an image" });

    const key = v4();
    const command = new PutObjectCommand({
      Bucket: "book-app",
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });
    await client.send(command);

    res.status(201).json({ key, url: `${env.NEXT_PUBLIC_BUCKET_URL}/${key}` });
  });

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

export default handler;

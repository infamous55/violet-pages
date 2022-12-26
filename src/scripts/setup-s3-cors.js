const {
  GetBucketCorsCommand,
  PutBucketCorsCommand,
  S3Client,
} = require("@aws-sdk/client-s3");
require("dotenv").config();
(async () => {
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
  try {
    await client.send(
      new PutBucketCorsCommand({
        Bucket: "book-app",
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ["Content-Type"],
              AllowedMethods: ["PUT", "HEAD"],
              AllowedOrigins: ["*"],
              ExposeHeaders: ["Access-Control-Allow-Origin"],
              MaxAgeSeconds: 3600,
            },
          ],
        },
      })
    );
    const data = await client.send(
      new GetBucketCorsCommand({ Bucket: "book-app" })
    );
    console.log("✅ Success\n", JSON.stringify(data.CORSRules));
  } catch (error) {
    console.error("❌ Error\n", error);
  }
})();

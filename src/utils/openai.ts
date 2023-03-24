import { env } from "../env/server.mjs";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: env.OPEN_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default openai;

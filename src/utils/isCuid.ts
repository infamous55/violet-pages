import { z } from "zod";

const isCUID = (data: any): data is string => {
  if (z.string().cuid().safeParse(data).success) return true;
  return false;
};

export default isCUID;

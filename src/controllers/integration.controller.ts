import { Request, Response } from "express";
import { generateAuthUrl } from "../services/providers/google/google.auth";

export const connectGoogle = async (req: Request, res: Response) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "userId required" });
  }

  const url = generateAuthUrl(userId as string);

  res.json({ url });
};
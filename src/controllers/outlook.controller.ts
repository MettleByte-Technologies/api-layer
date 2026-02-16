import { Request, Response } from "express";

export class OutlookController {
    static connect(req: Request, res: Response) {
        res.status(501).json({ error: "Not implemented" });
    }

    static async getAccessToken(req: Request, res: Response) {
        res.status(501).json({ error: "Not implemented" });
    }

    static async getCalendars(req: Request, res: Response) {
        res.status(501).json({ error: "Not implemented" });
    }

    static async getEvents(req: Request, res: Response) {
        res.status(501).json({ error: "Not implemented" });
    }

    static async createEvent(req: Request, res: Response) {
        res.status(501).json({ error: "Not implemented" });
    }

    static async refreshToken(req: Request, res: Response) {
        res.status(501).json({ error: "Not implemented" });
    }
}
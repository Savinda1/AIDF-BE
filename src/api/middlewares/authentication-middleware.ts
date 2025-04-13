import { Request, Response, NextFunction } from "express"
import UnauthorizedError from "../../domin/errors/unauthorized-error";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (!req?.auth.userId) {
        throw new UnauthorizedError("Unauthorized");
    }
    next();
};
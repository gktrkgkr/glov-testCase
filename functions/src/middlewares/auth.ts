import { Request, Response, NextFunction } from 'express';
const auth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');
    
    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }
    if (!token.startsWith('Bearer ')) {
        return res.status(401).send('Access denied. No bearer.');
    }
    const userID = token.split('Bearer ')[1];
    
    if (!userID) {
        return res.status(401).send('Access denied. No user ID.');
    }
    if (!userID.startsWith('USER')) {
        return res.status(401).send('Access denied. Invalid token.');
    }
    const numericUserID = userID.split('USER')[1];

    //check if userID is an integer with 3 digits
    if (!numericUserID.match(/^\d{3}$/)) {
        return res.status(401).send('Access denied. Invalid token.');
    }

    res.locals.numericUserID = numericUserID;
    res.locals.userID = userID;
    console.log("Stream in Auth: " + req.query.stream);
    next();
    return;
};

module.exports = auth;
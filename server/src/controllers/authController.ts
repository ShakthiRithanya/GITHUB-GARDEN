import { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { findOrCreateUser } from '../services/userService';

export const login = (req: Request, res: Response) => {
    const redirectUri = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=read:user user:email`;
    res.redirect(redirectUri);
};

export const callback = async (req: Request, res: Response) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('No code provided');
    }

    try {
        // 1. Exchange code for access token
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            },
            {
                headers: { Accept: 'application/json' },
            }
        );

        const accessToken = tokenResponse.data.access_token;

        if (!accessToken) {
            return res.status(401).send('Failed to obtain access token from GitHub');
        }

        // 2. Fetch User Profile
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` },
        });

        const githubProfile = userResponse.data;

        // 3. Save/Update user in DB
        const user = await findOrCreateUser(githubProfile, accessToken);

        // 4. Create JWT
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        );

        // 5. Redirect to frontend with token
        res.redirect(`http://localhost:5173?token=${token}`);

    } catch (error) {
        console.error('GitHub Auth Error:', error);
        res.status(500).send('Authentication failed');
    }
};

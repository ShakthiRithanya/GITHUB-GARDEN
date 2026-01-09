import { pool } from '../config/db';

export interface User {
    id: number;
    github_id: string;
    username: string;
    avatar_url: string;
    access_token: string;
}

export const findOrCreateUser = async (profile: any, accessToken: string): Promise<User> => {
    const client = await pool.connect();
    try {
        // Check if user exists
        const checkRes = await client.query('SELECT * FROM users WHERE github_id = $1', [profile.id.toString()]);

        if (checkRes.rows.length > 0) {
            // Update token if user exists
            const userId = checkRes.rows[0].id;
            const updateRes = await client.query(
                'UPDATE users SET access_token = $1, avatar_url = $2 WHERE id = $3 RETURNING *',
                [accessToken, profile.avatar_url, userId]
            );
            return updateRes.rows[0];
        } else {
            // Create new user
            const insertRes = await client.query(
                'INSERT INTO users (github_id, username, avatar_url, access_token) VALUES ($1, $2, $3, $4) RETURNING *',
                [profile.id.toString(), profile.login, profile.avatar_url, accessToken]
            );

            // Allow initial Mood Garden setup? (e.g. create default plant)
            const newUser = insertRes.rows[0];
            await client.query(
                "INSERT INTO plants (user_id, type, stage, health) VALUES ($1, 'sunflower', 'seedling', 100)",
                [newUser.id]
            );

            return newUser;
        }
    } finally {
        client.release();
    }
};

export const getUserById = async (id: number): Promise<User | null> => {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0] || null;
};

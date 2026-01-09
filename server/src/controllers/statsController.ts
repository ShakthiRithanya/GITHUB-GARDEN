import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getUserById } from '../services/userService';
import { fetchUserContributions, calculateStreak } from '../services/githubService';
import { pool } from '../config/db';

export const getMyStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const user = await getUserById(userId);

        if (!user) return res.status(404).send('User not found');

        // 1. Fetch live data from GitHub
        // Note: Realistically we might cache this or do it via a job, but for MVP we fetch live.
        const contributions = await fetchUserContributions(user.access_token);

        // 2. Calculate Stats
        const currentStreak = calculateStreak(contributions);

        // 3. Update Plant & Stats in DB (simplified)
        // Determine plant stage based on streak
        let stage = 'seedling';
        let health = 100;

        if (currentStreak === 0) {
            stage = 'wilted';
            health = 30;
        } else if (currentStreak < 4) {
            stage = 'seedling';
            health = Math.min(100, 50 + currentStreak * 10);
        } else if (currentStreak < 8) {
            stage = 'growing';
        } else if (currentStreak < 15) {
            stage = 'blooming';
        } else {
            stage = 'legendary';
        }

        // Update Plant
        await pool.query(
            'UPDATE plants SET stage = $1, health = $2 WHERE user_id = $3',
            [stage, health, userId]
        );

        // Get Plant
        const plantRes = await pool.query('SELECT * FROM plants WHERE user_id = $1', [userId]);

        res.json({
            user: { username: user.username, avatar_url: user.avatar_url },
            stats: {
                streak: currentStreak,
                totalContributions: contributions.reduce((acc, day) => acc + day.contributionCount, 0)
            },
            plant: plantRes.rows[0],
            contributionHistory: contributions.slice(0, 30) // Return last 30 days for graph
        });

    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).send('Failed to fetch stats');
    }
};

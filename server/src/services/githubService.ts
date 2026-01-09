import axios from 'axios';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

interface ContributionDay {
    contributionCount: number;
    date: string;
}

export const fetchUserContributions = async (accessToken: string) => {
    const query = `
    query { 
      viewer { 
        login
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

    try {
        const response = await axios.post(
            GITHUB_GRAPHQL_URL,
            { query },
            {
                headers: {
                    Authorization: `bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response.data.errors) {
            throw new Error(JSON.stringify(response.data.errors));
        }

        const calendar = response.data.data.viewer.contributionsCollection.contributionCalendar;
        return transformCalendarData(calendar);

    } catch (error) {
        console.error('Error fetching GitHub contributions:', error);
        throw error;
    }
};

const transformCalendarData = (calendar: any) => {
    // Flatten weeks into a single array of days
    const days: ContributionDay[] = [];
    calendar.weeks.forEach((week: any) => {
        week.contributionDays.forEach((day: any) => {
            days.push({
                date: day.date,
                contributionCount: day.contributionCount,
            });
        });
    });

    // Sort by date descending (newest first)
    days.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return days;
};

export const calculateStreak = (days: ContributionDay[]) => {
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];

    // Check if we have data for today
    const hasToday = days.find(d => d.date === today);

    // Iterate through days, handling logic for "today" vs "yesterday" start
    // If today has contributions, we start counting from today.
    // If today is 0, but yesterday had contributions, streak is still alive, count from yesterday.
    // If neither, streak is 0.

    let startIndex = 0;
    if (hasToday && hasToday.contributionCount === 0) {
        // If no contribs today, check yesterday to decide if streak is broken or just pending for today
        // Actually, simple logic: just count backwards from most recent active day, 
        // allowing TODAY to be 0 without breaking streak if yesterday was active.

        // Simplification: Look for the first break.
        // But we need to know if the streak is "alive".

        // Let's iterate from yesterday backwards?
        // If today is 0, we start checking from yesterday (index 1 hopefully, or finding date).
    }

    // Robust Streak Logic
    let streak = 0;
    let isStreakAlive = true;

    // We expect days to be sorted newest to oldest
    for (const day of days) {
        if (day.date > today) continue; // Skip future days if any (timezone issues)

        if (day.contributionCount > 0) {
            streak++;
        } else {
            // It's a 0 contribution day

            // If it is TODAY, the streak is not broken yet (user can still code).
            if (day.date === today) {
                continue;
            }

            // If it's a day in the past with 0 contributions, streak ends.
            break;
        }
    }

    return streak;
};

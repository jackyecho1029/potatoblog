// XP rewards. Shared by server pages (to show "最多可得") and the client progress store.
// Doing (completing an action) is worth the most, so the game rewards applying lessons.
export const XP = {
    read: 10,
    answer: 10,
    addAction: 5,
    learned: 15,
    completeAction: 30,
    dailyQuest: 50,
} as const;

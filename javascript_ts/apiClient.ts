/**
 * Sample TypeScript Test File: Exported API Interface
 */

export interface UserConfig {
    theme: string;
    notifications: boolean;
}

// 🚨 BREAKING CHANGE: Changed parameters from (id: string) to (id: string, apiKey: string)
export function calculateAnalytics(userId: string, apiKey: string): number {
    if (!apiKey) {
        throw new Error("API Key required");
    }
    return userId.length * 42;
}

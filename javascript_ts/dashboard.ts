/**
 * Sample TypeScript Test File: Consumer / Importer Call Site
 */

import { calculateAnalytics } from "./apiClient";

export function renderDashboard(userId: string) {
    // 🚨 BROKEN CALL SITE: Only passes 1 argument (userId), missing required 'apiKey'
    const score = calculateAnalytics(userId);
    console.log("Analytics score:", score);
    return score;
}

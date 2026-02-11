/**
 * LoadingDots - Animated thinking indicator
 */

import { memo } from "react";

export const LoadingDots = memo(function LoadingDots() {
    return (
        <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-dots-1" />
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-dots-2" />
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-dots-3" />
        </span>
    );
});

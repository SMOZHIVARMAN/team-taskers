import React from 'react';
import { formatDistanceToNow } from 'date-fns';

/* =========================
   Activity Types
========================= */
export type ActivityType =
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'task_completed'
  | 'member_added'
  | 'workspace_created';

/* =========================
   Props
========================= */
export interface ActivityItemProps {
  id: number;
  type: ActivityType;
  description: string;
  timestamp?: string;   // optional → prevents crashes
  user: string;
  workspaceName?: string;
}

/* =========================
   Component
========================= */
export const ActivityItem: React.FC<ActivityItemProps> = ({
  description,
  timestamp,
  workspaceName,
}) => {
  let timeAgo = 'just now';

  // ✅ Defensive date handling
  if (timestamp) {
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      timeAgo = formatDistanceToNow(date, { addSuffix: true });
    }
  }

  return (
    <div className="flex items-start gap-4 p-4">
      <div className="flex-1">
        <p className="text-sm text-foreground">
          {description}
        </p>

        <div className="mt-1 text-xs text-muted-foreground flex gap-2">
          <span>{timeAgo}</span>
          {workspaceName && <span>• {workspaceName}</span>}
        </div>
      </div>
    </div>
  );
};

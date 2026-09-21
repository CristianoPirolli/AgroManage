import { api } from './api';
import type { Activity, ActivityInput } from '@/types/activity';

export function listActivities() {
  return api<Activity[]>('/activities');
}

export function createActivity(data: ActivityInput) {
  return api<Activity>('/activities', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateActivity(id: number, data: Partial<ActivityInput>) {
  return api<Activity>(`/activities/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteActivity(id: number) {
  return api<{ id: number }>(`/activities/${id}`, { method: 'DELETE' });
}

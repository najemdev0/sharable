import { supabase } from './client'
import type { Database } from '@/lib/database.types'

type Notification = Database['public']['Tables']['notifications']['Row']
type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

// Get notifications for user
export async function getUserNotifications(profileId: string, limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', profileId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data as Notification[]
}

// Get unread notifications count
export async function getUnreadNotificationCount(profileId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profileId)
    .eq('is_read', false)

  if (error) throw error
  return count || 0
}

// Get unread notifications
export async function getUnreadNotifications(profileId: string, limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', profileId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data as Notification[]
}

// Create notification
export async function createNotification(notification: NotificationInsert) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([notification])
    .select()
    .single()

  if (error) throw error
  return data as Notification
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) throw error
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(profileId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', profileId)
    .eq('is_read', false)

  if (error) throw error
}

// Delete notification
export async function deleteNotification(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  if (error) throw error
}

// Delete all notifications for user
export async function deleteAllNotifications(profileId: string) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', profileId)

  if (error) throw error
}

// Notify on like
export async function notifyLike(
  userId: string,
  triggeredBy: string,
  postId: string,
  commentId?: string
) {
  return createNotification({
    user_id: userId,
    triggered_by: triggeredBy,
    type: commentId ? 'like' : 'like',
    post_id: postId,
    comment_id: commentId,
    message: commentId ? 'liked your comment' : 'liked your post'
  })
}

// Notify on comment
export async function notifyComment(
  userId: string,
  triggeredBy: string,
  postId: string,
  commentId: string
) {
  return createNotification({
    user_id: userId,
    triggered_by: triggeredBy,
    type: 'comment',
    post_id: postId,
    comment_id: commentId,
    message: 'commented on your post'
  })
}

// Notify on follow
export async function notifyFollow(userId: string, triggeredBy: string) {
  return createNotification({
    user_id: userId,
    triggered_by: triggeredBy,
    type: 'follow',
    message: 'started following you'
  })
}

// Notify on share
export async function notifyShare(
  userId: string,
  triggeredBy: string,
  postId: string
) {
  return createNotification({
    user_id: userId,
    triggered_by: triggeredBy,
    type: 'share',
    post_id: postId,
    message: 'shared your post'
  })
}

// Notify on mention
export async function notifyMention(
  userId: string,
  triggeredBy: string,
  postId: string | null,
  commentId: string | null,
  message: string
) {
  return createNotification({
    user_id: userId,
    triggered_by: triggeredBy,
    type: 'mention',
    post_id: postId,
    comment_id: commentId,
    message
  })
}

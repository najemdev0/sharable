import { supabase } from './client'
import type { Database } from '@/lib/database.types'

type Message = Database['public']['Tables']['messages']['Row']
type MessageInsert = Database['public']['Tables']['messages']['Insert']

// Get conversation between two users
export async function getConversation(userId1: string, userId2: string, limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return (data as Message[]).reverse()
}

// Get user conversations (latest message from each)
export async function getUserConversations(profileId: string, limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${profileId},recipient_id.eq.${profileId}`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error

  // Group by conversation partner
  const conversations = new Map()
  ;(data as Message[]).forEach(msg => {
    const partnerId = msg.sender_id === profileId ? msg.recipient_id : msg.sender_id
    if (!conversations.has(partnerId)) {
      conversations.set(partnerId, msg)
    }
  })

  return Array.from(conversations.values()) as Message[]
}

// Send message
export async function sendMessage(message: MessageInsert) {
  const { data, error } = await supabase
    .from('messages')
    .insert([message])
    .select()
    .single()

  if (error) throw error
  return data as Message
}

// Get message by ID
export async function getMessage(messageId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .single()

  if (error) throw error
  return data as Message
}

// Update message
export async function updateMessage(messageId: string, content: string) {
  const { data, error } = await supabase
    .from('messages')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', messageId)
    .select()
    .single()

  if (error) throw error
  return data as Message
}

// Delete message
export async function deleteMessage(messageId: string) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)

  if (error) throw error
}

// Mark message as read
export async function markMessageAsRead(messageId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', messageId)

  if (error) throw error
}

// Mark all messages as read in conversation
export async function markConversationAsRead(senderId: string, recipientId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('sender_id', senderId)
    .eq('recipient_id', recipientId)
    .eq('is_read', false)

  if (error) throw error
}

// Get unread message count
export async function getUnreadMessageCount(profileId: string) {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', profileId)
    .eq('is_read', false)

  if (error) throw error
  return count || 0
}

// Get unread count from specific user
export async function getUnreadCountFromUser(recipientId: string, senderId: string) {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('sender_id', senderId)
    .eq('recipient_id', recipientId)
    .eq('is_read', false)

  if (error) throw error
  return count || 0
}

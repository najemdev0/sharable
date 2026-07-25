import { supabase } from './client'
import type { Database } from '@/lib/database.types'

type Comment = Database['public']['Tables']['comments']['Row']
type CommentInsert = Database['public']['Tables']['comments']['Insert']
type CommentUpdate = Database['public']['Tables']['comments']['Update']

// Get comment by ID
export async function getComment(commentId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('id', commentId)
    .single()

  if (error) throw error
  return data as Comment
}

// Get comments on a post
export async function getPostComments(postId: string, limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .eq('parent_comment_id', null)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data as Comment[]
}

// Get replies to a comment
export async function getCommentReplies(commentId: string, limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('parent_comment_id', commentId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data as Comment[]
}

// Get all replies to a comment (recursively)
export async function getAllCommentReplies(commentId: string): Promise<Comment[]> {
  const directReplies = await getCommentReplies(commentId, 999)
  const allReplies: Comment[] = [...directReplies]

  for (const reply of directReplies) {
    const nested = await getAllCommentReplies(reply.id)
    allReplies.push(...nested)
  }

  return allReplies
}

// Create comment
export async function createComment(comment: CommentInsert) {
  const { data, error } = await supabase
    .from('comments')
    .insert([comment])
    .select()
    .single()

  if (error) throw error

  // Increment post comments count
  if (comment.parent_comment_id === null) {
    const post = await supabase
      .from('posts')
      .select('comments_count')
      .eq('id', comment.post_id)
      .single()

    if (!post.error) {
      await supabase
        .from('posts')
        .update({ comments_count: (post.data?.comments_count || 0) + 1 })
        .eq('id', comment.post_id)
    }
  }

  return data as Comment
}

// Update comment
export async function updateComment(commentId: string, updates: CommentUpdate) {
  const { data, error } = await supabase
    .from('comments')
    .update({ ...updates, is_edited: true })
    .eq('id', commentId)
    .select()
    .single()

  if (error) throw error
  return data as Comment
}

// Delete comment (soft delete)
export async function deleteComment(commentId: string) {
  const { error } = await supabase
    .from('comments')
    .update({ is_deleted: true })
    .eq('id', commentId)

  if (error) throw error
}

// Like comment
export async function likeComment(profileId: string, commentId: string) {
  const { error: insertError } = await supabase
    .from('likes')
    .insert([{ profile_id: profileId, comment_id: commentId }])

  if (insertError) throw insertError

  // Increment likes count
  const comment = await getComment(commentId)
  await supabase
    .from('comments')
    .update({ likes_count: comment.likes_count + 1 })
    .eq('id', commentId)
}

// Unlike comment
export async function unlikeComment(profileId: string, commentId: string) {
  const { error: deleteError } = await supabase
    .from('likes')
    .delete()
    .eq('profile_id', profileId)
    .eq('comment_id', commentId)

  if (deleteError) throw deleteError

  // Decrement likes count
  const comment = await getComment(commentId)
  await supabase
    .from('comments')
    .update({ likes_count: Math.max(0, comment.likes_count - 1) })
    .eq('id', commentId)
}

// Check if user liked comment
export async function hasUserLikedComment(profileId: string, commentId: string) {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('profile_id', profileId)
    .eq('comment_id', commentId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

// Get comments count
export async function getCommentCount(postId: string) {
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)
    .eq('is_deleted', false)

  if (error) throw error
  return count || 0
}

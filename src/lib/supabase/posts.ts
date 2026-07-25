import { supabase } from './client'
import type { Database } from '@/lib/database.types'

type Post = Database['public']['Tables']['posts']['Row']
type PostInsert = Database['public']['Tables']['posts']['Insert']
type PostUpdate = Database['public']['Tables']['posts']['Update']

// Get post by ID
export async function getPost(postId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single()

  if (error) throw error
  return data as Post
}

// Get posts by author
export async function getPostsByAuthor(authorId: string, limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', authorId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data as Post[]
}

// Get posts from a community
export async function getPostsByCommunity(communityId: string, limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('community_id', communityId)
    .eq('is_archived', false)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data as Post[]
}

// Get feed (posts from followed users)
export async function getFeed(profileId: string, limit = 20, offset = 0) {
  // Get IDs of users being followed
  const { data: followingData, error: followError } = await supabase
    .from('followers')
    .select('following_id')
    .eq('follower_id', profileId)

  if (followError) throw followError

  const followingIds = [profileId, ...followingData.map(f => f.following_id)]

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .in('author_id', followingIds)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data as Post[]
}

// Create post
export async function createPost(post: PostInsert) {
  const { data, error } = await supabase
    .from('posts')
    .insert([post])
    .select()
    .single()

  if (error) throw error
  return data as Post
}

// Update post
export async function updatePost(postId: string, updates: PostUpdate) {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single()

  if (error) throw error
  return data as Post
}

// Delete post (soft delete via archive)
export async function deletePost(postId: string) {
  const { error } = await supabase
    .from('posts')
    .update({ is_archived: true })
    .eq('id', postId)

  if (error) throw error
}

// Like post
export async function likePost(profileId: string, postId: string) {
  const { error: insertError } = await supabase
    .from('likes')
    .insert([{ profile_id: profileId, post_id: postId }])

  if (insertError) throw insertError

  // Increment likes count
  const post = await getPost(postId)
  await supabase
    .from('posts')
    .update({ likes_count: post.likes_count + 1 })
    .eq('id', postId)
}

// Unlike post
export async function unlikePost(profileId: string, postId: string) {
  const { error: deleteError } = await supabase
    .from('likes')
    .delete()
    .eq('profile_id', profileId)
    .eq('post_id', postId)

  if (deleteError) throw deleteError

  // Decrement likes count
  const post = await getPost(postId)
  await supabase
    .from('posts')
    .update({ likes_count: Math.max(0, post.likes_count - 1) })
    .eq('id', postId)
}

// Check if user liked post
export async function hasUserLikedPost(profileId: string, postId: string) {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('profile_id', profileId)
    .eq('post_id', postId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

// Get likes count for post
export async function getPostLikes(postId: string) {
  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)

  if (error) throw error
  return count || 0
}

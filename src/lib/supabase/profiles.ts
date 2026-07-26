import { supabase } from './client'
import type { Database } from '@/lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// Get profile by username
export async function getProfileByUsername(username: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error) throw error
  return data as Profile | null
}

// Get profile by user ID
export async function getProfileByUserId(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as Profile | null
}

// Get profile by profile ID
export async function getProfile(profileId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (error) throw error
  return data as Profile
}

// Create profile
export async function createProfile(profile: ProfileInsert) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profile])
    .select()
    .single()

  if (error) throw error
  return data as Profile
}

// Update profile
export async function updateProfile(profileId: string, updates: ProfileUpdate) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single()

  if (error) throw error
  return data as Profile
}

// Get follower count
export async function getFollowerCount(profileId: string) {
  const { count, error } = await supabase
    .from('followers')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profileId)

  if (error) throw error
  return count || 0
}

// Get following count
export async function getFollowingCount(profileId: string) {
  const { count, error } = await supabase
    .from('followers')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profileId)

  if (error) throw error
  return count || 0
}

// Check if user follows another user
export async function isFollowing(followerId: string, followingId: string) {
  const { data, error } = await supabase
    .from('followers')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

// Follow user
export async function followUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('followers')
    .insert([{ follower_id: followerId, following_id: followingId }])

  if (error) throw error
}

// Unfollow user
export async function unfollowUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('followers')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)

  if (error) throw error
}

import { supabase } from './client'
import type { Database } from '@/lib/database.types'

type Community = Database['public']['Tables']['communities']['Row']
type CommunityInsert = Database['public']['Tables']['communities']['Insert']
type CommunityUpdate = Database['public']['Tables']['communities']['Update']
type CommunityMember = Database['public']['Tables']['community_members']['Row']

// Get community by ID
export async function getCommunity(communityId: string) {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('id', communityId)
    .single()

  if (error) throw error
  return data as Community
}

// Get community by slug
export async function getCommunityBySlug(slug: string) {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data as Community
}

// Get all communities (paginated)
export async function getAllCommunities(limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('is_private', false)
    .order('members_count', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data as Community[]
}

// Get communities for a user
export async function getUserCommunities(profileId: string, limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('community_members')
    .select('communities(*)')
    .eq('profile_id', profileId)
    .order('joined_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data.map(item => item.communities) as Community[]
}

// Create community
export async function createCommunity(community: CommunityInsert) {
  const { data, error } = await supabase
    .from('communities')
    .insert([community])
    .select()
    .single()

  if (error) throw error

  // Add creator as admin member
  if (data) {
    await supabase
      .from('community_members')
      .insert([{
        community_id: data.id,
        profile_id: community.created_by,
        role: 'admin'
      }])
  }

  return data as Community
}

// Update community
export async function updateCommunity(communityId: string, updates: CommunityUpdate) {
  const { data, error } = await supabase
    .from('communities')
    .update(updates)
    .eq('id', communityId)
    .select()
    .single()

  if (error) throw error
  return data as Community
}

// Delete community
export async function deleteCommunity(communityId: string) {
  const { error } = await supabase
    .from('communities')
    .delete()
    .eq('id', communityId)

  if (error) throw error
}

// Join community
export async function joinCommunity(communityId: string, profileId: string) {
  const { error: insertError } = await supabase
    .from('community_members')
    .insert([{ community_id: communityId, profile_id: profileId, role: 'member' }])

  if (insertError) throw insertError

  // Increment members count
  const community = await getCommunity(communityId)
  await supabase
    .from('communities')
    .update({ members_count: community.members_count + 1 })
    .eq('id', communityId)
}

// Leave community
export async function leaveCommunity(communityId: string, profileId: string) {
  const { error: deleteError } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('profile_id', profileId)

  if (deleteError) throw deleteError

  // Decrement members count
  const community = await getCommunity(communityId)
  await supabase
    .from('communities')
    .update({ members_count: Math.max(0, community.members_count - 1) })
    .eq('id', communityId)
}

// Check if user is member of community
export async function isCommunityMember(communityId: string, profileId: string) {
  const { data, error } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', communityId)
    .eq('profile_id', profileId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

// Get community members
export async function getCommunityMembers(communityId: string, limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from('community_members')
    .select('profiles(*)')
    .eq('community_id', communityId)
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data.map(item => item.profiles) as any[]
}

// Get member count
export async function getMemberCount(communityId: string) {
  const { count, error } = await supabase
    .from('community_members')
    .select('*', { count: 'exact', head: true })
    .eq('community_id', communityId)

  if (error) throw error
  return count || 0
}

// Get user role in community
export async function getUserCommunityRole(communityId: string, profileId: string) {
  const { data, error } = await supabase
    .from('community_members')
    .select('role')
    .eq('community_id', communityId)
    .eq('profile_id', profileId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data?.role || null
}

// Update member role
export async function updateMemberRole(communityId: string, profileId: string, role: string) {
  const { error } = await supabase
    .from('community_members')
    .update({ role })
    .eq('community_id', communityId)
    .eq('profile_id', profileId)

  if (error) throw error
}

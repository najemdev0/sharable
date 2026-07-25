-- RLS Policies for secure data access

-- PROFILES TABLE POLICIES
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- COMMUNITIES TABLE POLICIES
CREATE POLICY "Communities are viewable by everyone" ON communities
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create communities" ON communities
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    created_by = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Community creators can update their community" ON communities
  FOR UPDATE USING (
    created_by = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Community creators can delete their community" ON communities
  FOR DELETE USING (
    created_by = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- COMMUNITY MEMBERS TABLE POLICIES
CREATE POLICY "Community members are viewable" ON community_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join communities" ON community_members
  FOR INSERT WITH CHECK (
    profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can leave communities" ON community_members
  FOR DELETE USING (
    profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage community members" ON community_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id
      AND cm.profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
      AND cm.role IN ('admin', 'moderator')
    )
  );

-- POSTS TABLE POLICIES
CREATE POLICY "Posts are viewable by everyone" ON posts
  FOR SELECT USING (
    NOT is_archived OR
    author_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    author_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (
    author_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (
    author_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- COMMENTS TABLE POLICIES
CREATE POLICY "Comments are viewable" ON comments
  FOR SELECT USING (
    NOT is_deleted OR
    author_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    author_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (
    author_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (
    author_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- LIKES TABLE POLICIES
CREATE POLICY "Likes are viewable" ON likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like" ON likes
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can unlike" ON likes
  FOR DELETE USING (
    profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- FOLLOWERS TABLE POLICIES
CREATE POLICY "Followers are viewable" ON followers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can follow" ON followers
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    follower_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can unfollow" ON followers
  FOR DELETE USING (
    follower_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- SHARES TABLE POLICIES
CREATE POLICY "Shares are viewable" ON shares
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can share" ON shares
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    shared_by = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- NOTIFICATIONS TABLE POLICIES
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (
    user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (
    user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (
    user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- MESSAGES TABLE POLICIES
CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT USING (
    sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    recipient_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their sent messages" ON messages
  FOR UPDATE USING (
    sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their messages" ON messages
  FOR DELETE USING (
    sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    recipient_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

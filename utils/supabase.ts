import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { storage } from './storage';

const supabaseUrl = 'https://gukuagtoniaqquvwruzm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1a3VhZ3RvbmlhcXF1dndydXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTA0NDYsImV4cCI6MjA1ODE4NjQ0Nn0.23TDskg5YMRbNB55W4kWAZvbnmqqefDxlXuDGcJwRWY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Custom plain text login/registration
export const createOrLoginUser = async (email: string, password: string) => {
  try {
    // Check if user exists
    const { data: existingUsers, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);
      
    if (findError) throw findError;
    
    // If user exists, check password
    if (existingUsers && existingUsers.length > 0) {
      const user = existingUsers[0];
      
      if (user.password === password) {
        // Create a mock session
        return {
          data: {
            session: {
              user: {
                id: user.id,
                email: user.email
              }
            }
          },
          error: null
        };
      } else {
        throw new Error('Incorrect password');
      }
    }
    
    // If user doesn't exist, create one
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({ email, password })
      .select()
      .single();
      
    if (createError) throw createError;
    
    // Create default settings for new user
    await supabase
      .from('user_settings')
      .insert({
        user_id: newUser.id,
        tinnitus_level: 0,
        dark_mode: true,
        notifications_enabled: true
      });
      
    // Return mock session
    return {
      data: {
        session: {
          user: {
            id: newUser.id,
            email: newUser.email
          }
        }
      },
      error: null
    };
  } catch (error) {
    console.error('Auth error:', error);
    return { data: null, error };
  }
};

// Create a user profile in our custom table
export const createUserProfile = async (userId: string, displayName: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      user_id: userId,
      display_name: displayName
    })
    .select()
    .single();
    
  if (error) console.error('Error creating profile:', error);
  return data;
};

// Helper function to initialize user settings
const ensureUserSettingsExist = async (userId: string) => {
  try {
    // Check if settings exist first
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    // If no settings exist, create default ones
    if (!existingSettings) {
      await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          tinnitus_level: 0,
          dark_mode: true,
          notifications_enabled: true,
        });
    }
  } catch (error) {
    console.error('Error ensuring user settings exist:', error);
  }
};

export const updateUserSettings = async (userId: string, settings: {
  tinnitus_level?: number,  // Changed from tinnitusLevel to match DB column name
  dark_mode?: boolean,      // Changed from darkMode to match DB column name
  notifications_enabled?: boolean  // Changed from notificationsEnabled to match DB column name
}) => {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert({ 
      user_id: userId,
      ...settings,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get user settings with basic error handling
export const getUserSettings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If settings don't exist yet, create them
      if (error.code === 'PGRST116') {
        return createDefaultSettings(userId);
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting settings:', error);
    return null;
  }
};

// Create default settings
const createDefaultSettings = async (userId: string) => {
  const settings = {
    user_id: userId,
    tinnitus_level: 0,
    dark_mode: true,
    notifications_enabled: true
  };
  
  const { data, error } = await supabase
    .from('user_settings')
    .insert(settings)
    .select()
    .single();
    
  if (error) console.error('Error creating settings:', error);
  return data || settings;
};

// Updated Post-related functions
export const getAllPosts = async (sortBy = 'newest') => {
  try {
    let query = supabase
      .from('posts')
      .select(`
        id, 
        title,
        content, 
        category,
        upvotes,
        downvotes,
        image_url,
        created_at,
        users:user_id (id, email)
      `);
    
    // Apply sorting
    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else if (sortBy === 'most_votes') {
      query = query.order('upvotes', { ascending: false });
    } else if (sortBy === 'controversial') {
      // Sort by posts with closest upvote/downvote ratio to 1 (but with significant votes)
      query = query.order('upvotes', { ascending: false }).order('downvotes', { ascending: false });
    }
    
    const { data, error } = await query;
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const createPost = async (userId: number, postData: {
  title: string;
  content: string;
  category: string;
  image_url?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        title: postData.title,
        content: postData.content,
        category: postData.category,
        image_url: postData.image_url || null,
        upvotes: 0,
        downvotes: 0
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Simplify the votePost function to make it more reliable
export const votePost = async (userId: number, postId: number, voteType: 'up' | 'down') => {
  try {
    // Check if user already voted on this post
    const { data: existingVote, error: checkError } = await supabase
      .from('post_votes')
      .select('id, vote_type')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    // Get current vote counts
    const { data: currentPost, error: postError } = await supabase
      .from('posts')
      .select('upvotes, downvotes')
      .eq('id', postId)
      .single();
    
    if (postError) throw postError;
    
    let newUpvotes = currentPost.upvotes || 0;
    let newDownvotes = currentPost.downvotes || 0;
    let resultVoteType: 'up' | 'down' | null = voteType;
    
    // If no previous vote, add new vote
    if (!existingVote) {
      // Insert vote record
      await supabase
        .from('post_votes')
        .insert({ user_id: userId, post_id: postId, vote_type: voteType });
      
      // Update counts
      if (voteType === 'up') {
        newUpvotes += 1;
      } else {
        newDownvotes += 1;
      }
    }
    // If same vote type, remove vote
    else if (existingVote.vote_type === voteType) {
      // Delete vote record
      await supabase
        .from('post_votes')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);
      
      // Update counts
      if (voteType === 'up') {
        newUpvotes = Math.max(newUpvotes - 1, 0);
      } else {
        newDownvotes = Math.max(newDownvotes - 1, 0);
      }
      resultVoteType = null;
    }
    // If different vote type, change vote
    else if (existingVote.vote_type !== voteType) {
      // Update vote record
      await supabase
        .from('post_votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id);
      
      // Update counts
      if (voteType === 'up') {
        newUpvotes += 1;
        newDownvotes = Math.max(newDownvotes - 1, 0);
      } else {
        newDownvotes += 1;
        newUpvotes = Math.max(newUpvotes - 1, 0);
      }
    }
    
    // Update post with new vote counts
    await supabase
      .from('posts')
      .update({ 
        upvotes: newUpvotes, 
        downvotes: newDownvotes 
      })
      .eq('id', postId);
    
    return { 
      voted: resultVoteType !== null, 
      voteType: resultVoteType,
      upvotes: newUpvotes,
      downvotes: newDownvotes
    };
  } catch (error) {
    console.error('Error voting on post:', error);
    throw error;
  }
};

// Function to check if a user has liked a post
export const hasUserLikedPost = async (userId: number, postId: number) => {
  try {
    const { data } = await supabase
      .from('post_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId);
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking if user liked post:', error);
    return false;
  }
};

// Function to check user's vote on a post
export const getUserVote = async (userId: number, postId: number) => {
  try {
    const { data } = await supabase
      .from('post_votes')
      .select('vote_type')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();
    
    return data ? data.vote_type : null;
  } catch (error) {
    console.error('Error checking user vote:', error);
    return null;
  }
};

// Function to populate example posts if none exist
export const populateExamplePosts = async () => {
  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });
    
  if (count === 0) {
    // Create a system user if it doesn't exist
    let systemUserId;
    const { data: existingSystemUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'system@tinnitus-app.com')
      .single();
      
    if (existingSystemUser) {
      systemUserId = existingSystemUser.id;
    } else {
      const { data: newSystemUser } = await supabase
        .from('users')
        .insert({ email: 'system@tinnitus-app.com', password: 'system123' })
        .select()
        .single();
        
      systemUserId = newSystemUser.id;
    }
    
    // Updated example posts with upvotes and downvotes
    const examplePosts = [
      {
        user_id: systemUserId,
        title: "White Noise Machines for Tinnitus",
        content: "I've found that white noise machines help mask my tinnitus at night. Anyone else tried this? I've been using one for about 3 months now and it's made a huge difference in my sleep quality.",
        category: "Tips",
        upvotes: 15,
        downvotes: 2,
        image_url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop"
      },
      {
        user_id: systemUserId,
        title: "Audiologist Recommended Hearing Aids",
        content: "Just had my first appointment with an audiologist. They recommended hearing aids with tinnitus masking features. Has anyone had success with these? They're quite expensive so I want to make sure they're worth it.",
        category: "Questions",
        upvotes: 8,
        downvotes: 1,
        image_url: null
      },
      {
        user_id: systemUserId,
        title: "Meditation for Tinnitus Relief",
        content: "Been practicing meditation for tinnitus relief. After 3 weeks, I'm noticing I focus less on the ringing. Highly recommend trying mindfulness techniques! I do a 15-minute session every morning and evening.",
        category: "Experiences",
        upvotes: 23,
        downvotes: 3,
        image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2070&auto=format&fit=crop"
      },
      {
        user_id: systemUserId,
        title: "Dietary Triggers for Tinnitus",
        content: "Question for the community: Does anyone notice their tinnitus gets worse with certain foods or drinks? Coffee seems to make mine louder. I've also noticed alcohol and high sodium foods can trigger spikes.",
        category: "Questions",
        upvotes: 19,
        downvotes: 4,
        image_url: null
      },
      {
        user_id: systemUserId,
        title: "Notch Therapy Research",
        content: "Just discovered the 'notch therapy' where you listen to music with the frequency of your tinnitus removed. Anyone tried this treatment approach? The research seems promising but I'm curious about real-world results.",
        category: "Research",
        upvotes: 12,
        downvotes: 1,
        image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop"
      }
    ];
    
    await supabase.from('posts').insert(examplePosts);
  }
};

// Create these functions in your Supabase SQL editor
// Function to increment votes
/*
CREATE OR REPLACE FUNCTION increment_votes(post_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  current_votes INTEGER;
BEGIN
  SELECT COALESCE(upvotes, 0) INTO current_votes FROM posts WHERE id = post_id;
  RETURN current_votes + 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_votes(post_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  current_votes INTEGER;
BEGIN
  SELECT COALESCE(upvotes, 0) INTO current_votes FROM posts WHERE id = post_id;
  RETURN GREATEST(current_votes - 1, 0);
END;
$$ LANGUAGE plpgsql;
*/

// Scientific articles functions
export const getAllScientificArticles = async (sortBy = 'newest') => {
  try {
    let query = supabase
      .from('scientific_articles')
      .select(`
        id, 
        title,
        content, 
        category,
        upvotes,
        downvotes,
        source_url,
        image_url,
        created_at,
        authors
      `);
    
    // Apply sorting
    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else if (sortBy === 'most_votes') {
      query = query.order('upvotes', { ascending: false });
    } else if (sortBy === 'controversial') {
      query = query.order('upvotes', { ascending: false }).order('downvotes', { ascending: false });
    }
    
    const { data, error } = await query;
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching scientific articles:', error);
    return [];
  }
};

// Vote on scientific article
export const voteOnArticle = async (userId: number, articleId: number, voteType: 'up' | 'down') => {
  try {
    // Check if user already voted on this article
    const { data: existingVote, error: checkError } = await supabase
      .from('article_votes')
      .select('id, vote_type')
      .eq('user_id', userId)
      .eq('article_id', articleId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    // Get current vote counts
    const { data: currentArticle, error: articleError } = await supabase
      .from('scientific_articles')
      .select('upvotes, downvotes')
      .eq('id', articleId)
      .single();
    
    if (articleError) throw articleError;
    
    let newUpvotes = currentArticle.upvotes || 0;
    let newDownvotes = currentArticle.downvotes || 0;
    let resultVoteType: 'up' | 'down' | null = voteType;
    
    // If no previous vote, add new vote
    if (!existingVote) {
      // Insert vote record
      await supabase
        .from('article_votes')
        .insert({ user_id: userId, article_id: articleId, vote_type: voteType });
      
      // Update counts
      if (voteType === 'up') {
        newUpvotes += 1;
      } else {
        newDownvotes += 1;
      }
    }
    // If same vote type, remove vote
    else if (existingVote.vote_type === voteType) {
      // Delete vote record
      await supabase
        .from('article_votes')
        .delete()
        .eq('user_id', userId)
        .eq('article_id', articleId);
      
      // Update counts
      if (voteType === 'up') {
        newUpvotes = Math.max(newUpvotes - 1, 0);
      } else {
        newDownvotes = Math.max(newDownvotes - 1, 0);
      }
      resultVoteType = null;
    }
    // If different vote type, change vote
    else if (existingVote.vote_type !== voteType) {
      // Update vote record
      await supabase
        .from('article_votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id);
      
      // Update counts
      if (voteType === 'up') {
        newUpvotes += 1;
        newDownvotes = Math.max(newDownvotes - 1, 0);
      } else {
        newDownvotes += 1;
        newUpvotes = Math.max(newUpvotes - 1, 0);
      }
    }
    
    // Update article with new vote counts
    await supabase
      .from('scientific_articles')
      .update({ 
        upvotes: newUpvotes, 
        downvotes: newDownvotes 
      })
      .eq('id', articleId);
    
    return { 
      voted: resultVoteType !== null, 
      voteType: resultVoteType,
      upvotes: newUpvotes,
      downvotes: newDownvotes
    };
  } catch (error) {
    console.error('Error voting on article:', error);
    throw error;
  }
};

// Get user's vote on an article
export const getUserArticleVote = async (userId: number, articleId: number) => {
  try {
    const { data } = await supabase
      .from('article_votes')
      .select('vote_type')
      .eq('user_id', userId)
      .eq('article_id', articleId)
      .single();
    
    return data ? data.vote_type : null;
  } catch (error) {
    console.error('Error checking user article vote:', error);
    return null;
  }
};

// Populate scientific articles
export const populateScientificArticles = async () => {
  const { count } = await supabase
    .from('scientific_articles')
    .select('*', { count: 'exact', head: true });
    
  if (count === 0) {
    const exampleArticles = [
      {
        title: "Cognitive Behavioral Therapy for Tinnitus: A Comprehensive Review",
        content: "This review examines the efficacy of Cognitive Behavioral Therapy (CBT) in treating tinnitus symptoms. Multiple randomized controlled trials have demonstrated that CBT can significantly reduce tinnitus distress and improve quality of life, even when the actual perception of tinnitus remains unchanged. The review covers various CBT delivery methods including face-to-face therapy, group therapy, and internet-based CBT interventions.",
        category: "Treatment",
        upvotes: 32,
        downvotes: 3,
        source_url: "https://doi.org/10.1001/jamaoto.2019.1728",
        image_url: "https://images.unsplash.com/photo-1573166953836-09aade4f6f68?q=80&w=2069&auto=format&fit=crop",
        created_at: "2023-06-15T08:23:15Z",
        authors: "Schmidt JF, Kamalski DM, Prescott CA"
      },
      {
        title: "Neural Mechanisms of Tinnitus: Insights from Neuroimaging Studies",
        content: "This article reviews the latest neuroimaging findings on tinnitus pathophysiology. Evidence from functional MRI (fMRI) and Positron Emission Tomography (PET) studies suggests tinnitus involves maladaptive neural plasticity across multiple brain regions including the auditory cortex, limbic system, and prefrontal areas. The review highlights how abnormal connectivity between these regions may explain both auditory and non-auditory symptoms of tinnitus.",
        category: "Neuroscience",
        upvotes: 45,
        downvotes: 2,
        source_url: "https://doi.org/10.1016/j.heares.2020.107881",
        image_url: "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=2069&auto=format&fit=crop",
        created_at: "2023-04-22T15:40:02Z",
        authors: "Roberts LE, Eggermont JJ, Caspary DM, Shore SE"
      },
      {
        title: "Bimodal Neuromodulation for Tinnitus Treatment: Clinical Trial Results",
        content: "This article presents results from a large-scale clinical trial testing a novel bimodal neuromodulation approach for tinnitus. The treatment combines auditory stimulation with stimulation of the trigeminal nerve via the tongue. After 12 weeks of treatment, 86.2% of participants reported improvement in tinnitus symptoms, with therapeutic effects persisting up to 12 months post-treatment. The researchers suggest this approach may address tinnitus by targeting neural plasticity mechanisms.",
        category: "Clinical Trial",
        upvotes: 67,
        downvotes: 5,
        source_url: "https://doi.org/10.1126/scitranslmed.abb2830",
        image_url: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=2070&auto=format&fit=crop",
        created_at: "2023-09-08T11:15:30Z",
        authors: "Conlon B, Hamilton C, Hughes S, Meade E, Hall DA, Vanneste S"
      },
      {
        title: "Noise-Induced Hidden Hearing Loss and Tinnitus: Molecular Mechanisms",
        content: "This paper explores the molecular mechanisms underlying noise-induced hidden hearing loss and its relationship to tinnitus. The researchers identified specific glutamate receptor pathways that contribute to cochlear synaptopathy following noise exposure. Animal models suggest that this synaptopathy, which can occur without permanent threshold shifts, may be a key precursor to tinnitus development. The paper discusses potential pharmacological interventions targeting these mechanisms.",
        category: "Molecular Biology",
        upvotes: 29,
        downvotes: 1,
        source_url: "https://doi.org/10.1523/JNEUROSCI.2845-19.2020",
        image_url: null,
        created_at: "2023-02-17T09:30:45Z",
        authors: "Kujawa SG, Liberman MC, Wan G"
      },
      {
        title: "Sound Therapy for Tinnitus: A Systematic Review and Meta-Analysis",
        content: "This systematic review evaluated the effectiveness of various sound therapy approaches for tinnitus management. The meta-analysis included 21 randomized controlled trials comprising 1,969 participants. Results indicate moderate evidence supporting the use of sound therapy, with the greatest effects observed for combination approaches that pair sound enrichment with counseling or education. Masking, notched music, and amplification all showed some effectiveness, though methodological quality varied across studies.",
        category: "Treatment",
        upvotes: 51,
        downvotes: 4,
        source_url: "https://doi.org/10.1177/0003489419836226",
        image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop",
        created_at: "2023-07-25T14:12:38Z",
        authors: "Sereda M, Xia J, El Refaie A, Hall DA, Hoare DJ"
      }
    ];
    
    await supabase.from('scientific_articles').insert(exampleArticles);
  }
};

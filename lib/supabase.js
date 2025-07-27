import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database operations for users
export const supabaseStorage = {
  // User operations
  async getUser(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error getting user:', error);
      return null;
    }
    
    return data;
  },

  async saveUser(userId, userData) {
    const { data, error } = await supabase
      .from('users')
      .upsert({ 
        id: userId, 
        ...userData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving user:', error);
      throw error;
    }
    
    return data;
  },

  // Case operations
  async getCase(caseId) {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error getting case:', error);
      return null;
    }
    
    return data;
  },

  async saveCase(caseId, caseData) {
    const { data, error } = await supabase
      .from('cases')
      .upsert({ 
        id: caseId, 
        ...caseData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving case:', error);
      throw error;
    }
    
    return data;
  },

  async getUserCases(userId) {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting user cases:', error);
      return [];
    }
    
    return data || [];
  },

  async deleteCase(caseId) {
    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', caseId);
    
    if (error) {
      console.error('Error deleting case:', error);
      throw error;
    }
    
    return true;
  }
};

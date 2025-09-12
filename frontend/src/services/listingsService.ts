import { supabaseBrowser } from '@/utils/supabase/client';

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  soldFor?: number;
  status: 'active' | 'sold' | 'draft';
  images: string[];
  created_at: string;
  updated_at: string;
  // Additional fields
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
  condition?: string;
  location?: string;
}

export class ListingsService {
  private supabase = supabaseBrowser();

  /**
   * Get all listings for the current user
   */
  async getUserListings(): Promise<Listing[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await this.supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching listings:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch user listings:', error);
      return [];
    }
  }

  /**
   * Create a new listing
   */
  async createListing(listingData: Omit<Listing, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Listing | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await this.supabase
        .from('listings')
        .insert({
          ...listingData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating listing:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to create listing:', error);
      return null;
    }
  }

  /**
   * Update an existing listing
   */
  async updateListing(id: string, updates: Partial<Listing>): Promise<Listing | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await this.supabase
        .from('listings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user can only update their own listings
        .select()
        .single();

      if (error) {
        console.error('Error updating listing:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to update listing:', error);
      return null;
    }
  }

  /**
   * Delete a listing
   */
  async deleteListing(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await this.supabase
        .from('listings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user can only delete their own listings

      if (error) {
        console.error('Error deleting listing:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete listing:', error);
      return false;
    }
  }

  /**
   * Get a single listing by ID
   */
  async getListing(id: string): Promise<Listing | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await this.supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching listing:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch listing:', error);
      return null;
    }
  }

  /**
   * Get listing statistics for the user
   */
  async getListingStats(): Promise<{
    totalListings: number;
    activeListings: number;
    soldListings: number;
    totalRevenue: number;
  }> {
    try {
      const listings = await this.getUserListings();
      
      const stats = listings.reduce((acc, listing) => {
        acc.totalListings++;
        
        if (listing.status === 'active') {
          acc.activeListings++;
        } else if (listing.status === 'sold') {
          acc.soldListings++;
          acc.totalRevenue += listing.soldFor || 0;
        }
        
        return acc;
      }, {
        totalListings: 0,
        activeListings: 0,
        soldListings: 0,
        totalRevenue: 0
      });

      return stats;
    } catch (error) {
      console.error('Failed to get listing stats:', error);
      return {
        totalListings: 0,
        activeListings: 0,
        soldListings: 0,
        totalRevenue: 0
      };
    }
  }

  /**
   * Migrate localStorage data to Supabase (one-time migration)
   */
  async migrateLocalStorageData(): Promise<boolean> {
    try {
      const localData = localStorage.getItem('testListings');
      if (!localData) {
        return true; // No data to migrate
      }

      const localListings = JSON.parse(localData);
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if we already have listings in the database
      const existingListings = await this.getUserListings();
      if (existingListings.length > 0) {
        console.log('Listings already exist in database, skipping migration');
        return true;
      }

      // Migrate each listing
      for (const listing of localListings) {
        await this.createListing({
          title: listing.title || 'Migrated Listing',
          description: listing.description || '',
          price: listing.price || 0,
          soldFor: listing.soldFor,
          status: listing.soldFor ? 'sold' : 'active',
          images: listing.images || [],
          make: listing.make,
          model: listing.model,
          year: listing.year,
          mileage: listing.mileage,
          condition: listing.condition,
          location: listing.location
        });
      }

      // Clear localStorage after successful migration
      localStorage.removeItem('testListings');
      console.log('Successfully migrated localStorage data to Supabase');
      
      return true;
    } catch (error) {
      console.error('Failed to migrate localStorage data:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const listingsService = new ListingsService();

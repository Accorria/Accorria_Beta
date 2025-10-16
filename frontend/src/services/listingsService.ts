import { supabaseBrowser } from '../../lib/supabaseBrowser';

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
  mileage: string; // Required field to match component
  condition?: string;
  location?: string;
  // Fields expected by DashboardListing component
  titleStatus: string;
  postedAt: string;
  platforms?: string[];
  messages?: number;
  clicks?: number;
  soldAt?: string;
  soldTo?: string;
  detectedFeatures?: string[];
  aiAnalysis?: string;
  finalDescription?: string;
}

export class ListingsService {
  private supabase = supabaseBrowser();

  /**
   * Get empty listings array - ready for real car data
   */
  private getMockListings(): Listing[] {
    try {
      const stored = localStorage.getItem('demoListings');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading mock listings:', error);
      return [];
    }
  }

  private createMockListing(listingData: Omit<Listing, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Listing {
    const newListing: Listing = {
      id: Date.now().toString(),
      user_id: '00000000-0000-0000-0000-000000000123',
      title: listingData.title,
      description: listingData.description,
      price: listingData.price,
      platforms: listingData.platforms || ['accorria'],
      status: listingData.status || 'active',
      images: listingData.images || [],
      make: listingData.make,
      model: listingData.model,
      year: listingData.year,
      mileage: listingData.mileage,
      condition: listingData.condition,
      location: listingData.location,
      postedAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      titleStatus: 'Clean',
      messages: 0,
      clicks: 0,
      detectedFeatures: [],
      aiAnalysis: undefined,
      finalDescription: listingData.description
    };

    // Store in localStorage - use consistent key for demo data
    const existingListings = this.getMockListings();
    existingListings.unshift(newListing);
    localStorage.setItem('demoListings', JSON.stringify(existingListings));
    
    // Also store in testListings for backward compatibility
    const existingTestListings = JSON.parse(localStorage.getItem('testListings') || '[]');
    existingTestListings.unshift(newListing);
    localStorage.setItem('testListings', JSON.stringify(existingTestListings));

    return newListing;
  }

  /**
   * Get all listings for the current user
   */
  async getUserListings(): Promise<Listing[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      // For development, return mock data if no Supabase user or if it's the demo user
      if (!user || user.id === '00000000-0000-0000-0000-000000000123') {
        console.log('Demo user detected, returning mock data for development');
        return this.getMockListings();
      }

      const { data, error } = await this.supabase
        .from('car_listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching listings:', error);
        throw error;
      }

      // Map database fields to component-expected fields
      const mappedListings = (data || []).map(listing => ({
        ...listing,
        // Map created_at to postedAt for component compatibility
        postedAt: listing.created_at,
        // Map car_listings fields to component-expected names
        titleStatus: 'Clean', // Default since car_listings doesn't have title_status
        mileage: '0', // Default since car_listings doesn't have mileage
        platforms: listing.platform ? [listing.platform] : [],
        messages: 0, // Default since car_listings doesn't have messages
        clicks: 0, // Default since car_listings doesn't have clicks
        // Map sold status
        soldFor: listing.status === 'sold' ? listing.price : undefined,
        soldAt: listing.status === 'sold' ? listing.updated_at : undefined,
        soldTo: undefined, // Not available in car_listings
        detectedFeatures: [], // Not available in car_listings
        aiAnalysis: undefined, // Not available in car_listings
        finalDescription: listing.description
      }));

      return mappedListings;
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
      console.log('🚀 createListing called at:', new Date().toISOString());
      const { data: { user } } = await this.supabase.auth.getUser();
      
      console.log('Current user:', user?.id, user?.email);
      console.log('User check conditions:', {
        noUser: !user,
        isDemoId: user?.id === '00000000-0000-0000-0000-000000000123',
        isPrestonEmail: user?.email === 'preston@accorria.com'
      });
      
      // For demo user or any user without a profile, store in localStorage instead of database
      if (!user || user.id === '00000000-0000-0000-0000-000000000123' || user.email === 'preston@accorria.com') {
        console.log('✅ Demo user detected, storing listing in localStorage');
        return this.createMockListing(listingData);
      }
      
      console.log('❌ Proceeding to database insert for user:', user.email);

      const { data, error } = await this.supabase
        .from('car_listings')
        .insert({
          title: listingData.title,
          description: listingData.description,
          price: listingData.price,
          platform: listingData.platforms?.[0] || 'accorria',
          status: listingData.status,
          images: listingData.images,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating listing:', error);
        
        // If it's a foreign key constraint error, fall back to localStorage
        if (error.code === '23503') {
          console.log('🔄 Foreign key constraint error detected, falling back to localStorage');
          return this.createMockListing(listingData);
        }
        
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
        .from('car_listings')
        .update({
          title: updates.title,
          description: updates.description,
          price: updates.price,
          platform: updates.platforms?.[0] || 'accorria',
          status: updates.status,
          images: updates.images,
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
        .from('car_listings')
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
        .from('car_listings')
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
          mileage: listing.mileage?.toString() || '0',
          condition: listing.condition,
          location: listing.location,
          // Required fields for component compatibility
          postedAt: listing.postedAt || new Date().toISOString(),
          titleStatus: listing.titleStatus || 'Clean',
          platforms: listing.platforms || ['accorria'],
          messages: listing.messages || 0,
          clicks: listing.clicks || 0,
          soldAt: listing.soldAt,
          soldTo: listing.soldTo,
          detectedFeatures: listing.detectedFeatures || [],
          aiAnalysis: listing.aiAnalysis,
          finalDescription: listing.finalDescription
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

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function DELETE() {
  try {
    console.log('🗑️ Clearing all leads...');
    
    const supabase = getSupabaseClient();
    
    if (supabase) {
      // Clear from Supabase
      const { error } = await supabase
        .from('leads')
        .delete()
        .neq('id', 'dummy'); // Delete all records
      
      if (error) {
        console.error('Supabase clear error:', error);
        return NextResponse.json(
          { error: 'Failed to clear leads from database' },
          { status: 500 }
        );
      }
      
      console.log('✅ All leads cleared from Supabase');
    } else {
      // Fallback to local file storage
      const fs = require('fs');
      const path = require('path');
      
      const leadsFilePath = path.join(process.cwd(), 'leads.json');
      
      if (fs.existsSync(leadsFilePath)) {
        fs.writeFileSync(leadsFilePath, JSON.stringify({
          leads: [],
          count: 0,
          total: 0
        }, null, 2));
        
        console.log('✅ All leads cleared from local file');
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'All leads cleared successfully' 
    });
    
  } catch (error) {
    console.error('Error clearing leads:', error);
    return NextResponse.json(
      { error: 'Failed to clear leads' },
      { status: 500 }
    );
  }
}

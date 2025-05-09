import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://ppajfigrnplbpvdxqily.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwYWpmaWdybnBsYnB2ZHhxaWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTM1OTQsImV4cCI6MjA2MjI4OTU5NH0.pFJ6DB9ZuPBnNcC15AH2pE2KixBm-LOBxpGDN7W0IaU'
    );
  }

  get client() {
    return this.supabase;
  }
}
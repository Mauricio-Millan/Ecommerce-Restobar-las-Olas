import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  async uploadVoucher(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${new Date().getTime()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    // Si el bucket se llama 'Vouchers', lo subimos en la raíz del bucket
    const filePath = `${fileName}`; 

    const { error } = await this.supabase.storage
      .from('Vouchers')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = this.supabase.storage
      .from('Vouchers')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  async uploadPlatoImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${new Date().getTime()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`; 

    const { error } = await this.supabase.storage
      .from('Platos')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = this.supabase.storage
      .from('Platos')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }
}

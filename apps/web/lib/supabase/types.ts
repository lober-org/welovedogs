/**
 * Supabase Database Types
 *
 * This file defines the Database type structure for TypeScript.
 * For a complete type definition, generate types from your Supabase schema:
 *
 * cd apps/backend
 * npm run types
 *
 * Then copy the generated types here or import from the backend types.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      donors: {
        Row: {
          id: string;
          auth_user_id: string;
          first_name: string;
          last_name: string;
          email: string;
          country: string | null;
          phone: string | null;
          profile_picture: string | null;
          stellar_address: string | null;
          member_since: string | null;
          created_at: string;
          dogs_supported: number | null;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          first_name: string;
          last_name: string;
          email: string;
          country?: string | null;
          phone?: string | null;
          profile_picture?: string | null;
          stellar_address?: string | null;
          member_since?: string | null;
          created_at?: string;
          dogs_supported?: number | null;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          country?: string | null;
          phone?: string | null;
          profile_picture?: string | null;
          stellar_address?: string | null;
          member_since?: string | null;
          created_at?: string;
          dogs_supported?: number | null;
        };
      };
      transactions: {
        Row: {
          id: string;
          donor_id: string;
          type: string;
          usd_value: number | null;
          tx_hash: string | null;
          created_at: string;
          donation_type: string | null;
          escrow_contract_id: string | null;
          campaign_id: string | null;
          dog_id: string | null;
        };
        Insert: {
          id?: string;
          donor_id: string;
          type: string;
          usd_value?: number | null;
          tx_hash?: string | null;
          created_at?: string;
          donation_type?: string | null;
          escrow_contract_id?: string | null;
          campaign_id?: string | null;
          dog_id?: string | null;
        };
        Update: {
          id?: string;
          donor_id?: string;
          type?: string;
          usd_value?: number | null;
          tx_hash?: string | null;
          created_at?: string;
          donation_type?: string | null;
          escrow_contract_id?: string | null;
          campaign_id?: string | null;
          dog_id?: string | null;
        };
      };
      donor_achievements: {
        Row: {
          id: string;
          donor_id: string;
          nft_minted: boolean | string | null;
          nft_token_id: string | number | null;
          blockchain_tx_hash: string | null;
          metadata: Json | null;
          earned_at: string;
        };
        Insert: {
          id?: string;
          donor_id: string;
          nft_minted?: boolean | string | null;
          nft_token_id?: string | number | null;
          blockchain_tx_hash?: string | null;
          metadata?: Json | null;
          earned_at?: string;
        };
        Update: {
          id?: string;
          donor_id?: string;
          nft_minted?: boolean | string | null;
          nft_token_id?: string | number | null;
          blockchain_tx_hash?: string | null;
          metadata?: Json | null;
          earned_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

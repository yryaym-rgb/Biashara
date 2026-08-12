/**
 * AUTO-GENERATED STUB — matches supabase/migrations/ as of foundation phase.
 *
 * Regenerate after any migration change:
 *   npm run types:gen
 *
 * Requires local Supabase running: supabase start && supabase db reset
 * Do NOT hand-edit this file after regeneration — review the diff instead.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '12';
  };
  public: {
    Tables: {
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          diff: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity: string;
          entity_id?: string | null;
          diff?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity?: string;
          entity_id?: string | null;
          diff?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_log_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      contracts: {
        Row: {
          id: string;
          order_id: string;
          storage_path: string | null;
          buyer_signed: boolean;
          seller_signed: boolean;
          buyer_signed_at: string | null;
          seller_signed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          storage_path?: string | null;
          buyer_signed?: boolean;
          seller_signed?: boolean;
          buyer_signed_at?: string | null;
          seller_signed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          storage_path?: string | null;
          buyer_signed?: boolean;
          seller_signed?: boolean;
          buyer_signed_at?: string | null;
          seller_signed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'contracts_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: true;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      cooperative_sites: {
        Row: {
          id: string;
          cooperative_id: string;
          site_name: string;
          zea_reference: string;
          province: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cooperative_id: string;
          site_name: string;
          zea_reference: string;
          province: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cooperative_id?: string;
          site_name?: string;
          zea_reference?: string;
          province?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cooperative_sites_cooperative_id_fkey';
            columns: ['cooperative_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      conversations: {
        Row: {
          id: string;
          listing_id: string | null;
          rfp_id: string | null;
          buyer_id: string;
          seller_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id?: string | null;
          rfp_id?: string | null;
          buyer_id: string;
          seller_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string | null;
          rfp_id?: string | null;
          buyer_id?: string;
          seller_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'conversations_buyer_id_fkey';
            columns: ['buyer_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversations_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversations_rfp_id_fkey';
            columns: ['rfp_id'];
            isOneToOne: false;
            referencedRelation: 'rfps';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversations_seller_id_fkey';
            columns: ['seller_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      custody_events: {
        Row: {
          id: string;
          lot_id: string;
          event_type: string;
          actor_id: string | null;
          location: string | null;
          notes: string | null;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          lot_id: string;
          event_type: string;
          actor_id?: string | null;
          location?: string | null;
          notes?: string | null;
          occurred_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          lot_id?: string;
          event_type?: string;
          actor_id?: string | null;
          location?: string | null;
          notes?: string | null;
          occurred_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'custody_events_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'custody_events_lot_id_fkey';
            columns: ['lot_id'];
            isOneToOne: false;
            referencedRelation: 'lot_traceability';
            referencedColumns: ['id'];
          },
        ];
      };
      export_readiness_items: {
        Row: {
          id: string;
          user_id: string;
          item_key: Database['public']['Enums']['export_readiness_item_key'];
          is_complete: boolean;
          completed_at: string | null;
          notes: string | null;
          document_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_key: Database['public']['Enums']['export_readiness_item_key'];
          is_complete?: boolean;
          completed_at?: string | null;
          notes?: string | null;
          document_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_key?: Database['public']['Enums']['export_readiness_item_key'];
          is_complete?: boolean;
          completed_at?: string | null;
          notes?: string | null;
          document_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'export_readiness_items_document_id_fkey';
            columns: ['document_id'];
            isOneToOne: false;
            referencedRelation: 'kyc_documents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'export_readiness_items_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      kyc_documents: {
        Row: {
          id: string;
          user_id: string;
          type: Database['public']['Enums']['kyc_document_type'];
          storage_path: string;
          status: Database['public']['Enums']['kyc_document_status'];
          reviewer_id: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: Database['public']['Enums']['kyc_document_type'];
          storage_path: string;
          status?: Database['public']['Enums']['kyc_document_status'];
          reviewer_id?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: Database['public']['Enums']['kyc_document_type'];
          storage_path?: string;
          status?: Database['public']['Enums']['kyc_document_status'];
          reviewer_id?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'kyc_documents_reviewer_id_fkey';
            columns: ['reviewer_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'kyc_documents_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      listing_photos: {
        Row: {
          id: string;
          listing_id: string;
          storage_path: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          storage_path: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          storage_path?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'listing_photos_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
      listings: {
        Row: {
          id: string;
          seller_id: string;
          mineral: Database['public']['Enums']['mineral_type'];
          title: string;
          description: string;
          grade: string | null;
          purity: number | null;
          quantity: number;
          unit: Database['public']['Enums']['quantity_unit'];
          price_amount: number | null;
          price_currency: string;
          price_type: Database['public']['Enums']['price_type'];
          origin_province: string;
          certifications: string[];
          status: Database['public']['Enums']['listing_status'];
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          mineral: Database['public']['Enums']['mineral_type'];
          title: string;
          description: string;
          grade?: string | null;
          purity?: number | null;
          quantity: number;
          unit: Database['public']['Enums']['quantity_unit'];
          price_amount?: number | null;
          price_currency?: string;
          price_type?: Database['public']['Enums']['price_type'];
          origin_province: string;
          certifications?: string[];
          status?: Database['public']['Enums']['listing_status'];
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          mineral?: Database['public']['Enums']['mineral_type'];
          title?: string;
          description?: string;
          grade?: string | null;
          purity?: number | null;
          quantity?: number;
          unit?: Database['public']['Enums']['quantity_unit'];
          price_amount?: number | null;
          price_currency?: string;
          price_type?: Database['public']['Enums']['price_type'];
          origin_province?: string;
          certifications?: string[];
          status?: Database['public']['Enums']['listing_status'];
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'listings_seller_id_fkey';
            columns: ['seller_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      lot_traceability: {
        Row: {
          id: string;
          listing_id: string | null;
          cooperative_id: string | null;
          mineral: Database['public']['Enums']['mineral_type'] | null;
          initial_weight_kg: number | null;
          extraction_date: string | null;
          notes: string | null;
          site_id: string | null;
          lot_code: string;
          origin_mine: string | null;
          origin_province: string;
          origin_country: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id?: string | null;
          cooperative_id?: string | null;
          mineral?: Database['public']['Enums']['mineral_type'] | null;
          initial_weight_kg?: number | null;
          extraction_date?: string | null;
          notes?: string | null;
          site_id?: string | null;
          lot_code: string;
          origin_mine?: string | null;
          origin_province: string;
          origin_country?: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string | null;
          cooperative_id?: string | null;
          mineral?: Database['public']['Enums']['mineral_type'] | null;
          initial_weight_kg?: number | null;
          extraction_date?: string | null;
          notes?: string | null;
          site_id?: string | null;
          lot_code?: string;
          origin_mine?: string | null;
          origin_province?: string;
          origin_country?: string;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lot_traceability_cooperative_id_fkey';
            columns: ['cooperative_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lot_traceability_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lot_traceability_site_id_fkey';
            columns: ['site_id'];
            isOneToOne: false;
            referencedRelation: 'cooperative_sites';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          body?: string;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      mining_events: {
        Row: {
          id: string;
          title: string;
          description: string;
          event_date: string;
          category: Database['public']['Enums']['mining_event_category'];
          source_url: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          event_date: string;
          category: Database['public']['Enums']['mining_event_category'];
          source_url?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          event_date?: string;
          category?: Database['public']['Enums']['mining_event_category'];
          source_url?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'mining_events_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: Database['public']['Enums']['notification_type'];
          payload: Json;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: Database['public']['Enums']['notification_type'];
          payload?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: Database['public']['Enums']['notification_type'];
          payload?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      offers: {
        Row: {
          id: string;
          listing_id: string;
          buyer_id: string;
          offered_price: number;
          quantity: number;
          message: string | null;
          status: Database['public']['Enums']['offer_status'];
          parent_offer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          buyer_id: string;
          offered_price: number;
          quantity: number;
          message?: string | null;
          status?: Database['public']['Enums']['offer_status'];
          parent_offer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          buyer_id?: string;
          offered_price?: number;
          quantity?: number;
          message?: string | null;
          status?: Database['public']['Enums']['offer_status'];
          parent_offer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'offers_buyer_id_fkey';
            columns: ['buyer_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'offers_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'offers_parent_offer_id_fkey';
            columns: ['parent_offer_id'];
            isOneToOne: false;
            referencedRelation: 'offers';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          offer_id: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          price_amount: number;
          quantity: number;
          unit: Database['public']['Enums']['quantity_unit'];
          currency: string;
          status: Database['public']['Enums']['order_status'];
          dispute_reason: string | null;
          disputed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          offer_id: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          price_amount: number;
          quantity: number;
          unit: Database['public']['Enums']['quantity_unit'];
          currency?: string;
          status?: Database['public']['Enums']['order_status'];
          dispute_reason?: string | null;
          disputed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          offer_id?: string;
          listing_id?: string;
          buyer_id?: string;
          seller_id?: string;
          price_amount?: number;
          quantity?: number;
          unit?: Database['public']['Enums']['quantity_unit'];
          currency?: string;
          status?: Database['public']['Enums']['order_status'];
          dispute_reason?: string | null;
          disputed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_buyer_id_fkey';
            columns: ['buyer_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_offer_id_fkey';
            columns: ['offer_id'];
            isOneToOne: true;
            referencedRelation: 'offers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_seller_id_fkey';
            columns: ['seller_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      price_cache: {
        Row: {
          id: string;
          mineral: Database['public']['Enums']['mineral_type'];
          price: number | null;
          currency: string;
          unit: Database['public']['Enums']['quantity_unit'];
          price_type: Database['public']['Enums']['price_type'];
          source: string;
          fetched_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mineral: Database['public']['Enums']['mineral_type'];
          price?: number | null;
          currency?: string;
          unit: Database['public']['Enums']['quantity_unit'];
          price_type?: Database['public']['Enums']['price_type'];
          source: string;
          fetched_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mineral?: Database['public']['Enums']['mineral_type'];
          price?: number | null;
          currency?: string;
          unit?: Database['public']['Enums']['quantity_unit'];
          price_type?: Database['public']['Enums']['price_type'];
          source?: string;
          fetched_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      price_history: {
        Row: {
          id: string;
          mineral: Database['public']['Enums']['mineral_type'];
          price: number;
          currency: string;
          recorded_at: string;
          recorded_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          mineral: Database['public']['Enums']['mineral_type'];
          price: number;
          currency?: string;
          recorded_at?: string;
          recorded_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          mineral?: Database['public']['Enums']['mineral_type'];
          price?: number;
          currency?: string;
          recorded_at?: string;
          recorded_date?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          role: Database['public']['Enums']['user_role'];
          company_name: string | null;
          country: string;
          phone: string | null;
          locale: string;
          kyc_status: Database['public']['Enums']['kyc_status'];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: Database['public']['Enums']['user_role'];
          company_name?: string | null;
          country?: string;
          phone?: string | null;
          locale?: string;
          kyc_status?: Database['public']['Enums']['kyc_status'];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: Database['public']['Enums']['user_role'];
          company_name?: string | null;
          country?: string;
          phone?: string | null;
          locale?: string;
          kyc_status?: Database['public']['Enums']['kyc_status'];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rfp_bids: {
        Row: {
          id: string;
          rfp_id: string;
          seller_id: string;
          offered_price: number;
          quantity: number;
          delivery_terms: string | null;
          message: string | null;
          status: Database['public']['Enums']['rfp_bid_status'];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          rfp_id: string;
          seller_id: string;
          offered_price: number;
          quantity: number;
          delivery_terms?: string | null;
          message?: string | null;
          status?: Database['public']['Enums']['rfp_bid_status'];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          rfp_id?: string;
          seller_id?: string;
          offered_price?: number;
          quantity?: number;
          delivery_terms?: string | null;
          message?: string | null;
          status?: Database['public']['Enums']['rfp_bid_status'];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'rfp_bids_rfp_id_fkey';
            columns: ['rfp_id'];
            isOneToOne: false;
            referencedRelation: 'rfps';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'rfp_bids_seller_id_fkey';
            columns: ['seller_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      rfps: {
        Row: {
          id: string;
          buyer_id: string;
          mineral: Database['public']['Enums']['mineral_type'];
          quantity: number;
          unit: Database['public']['Enums']['quantity_unit'];
          target_price_min: number | null;
          target_price_max: number | null;
          delivery_terms: string | null;
          deadline: string;
          description: string;
          status: Database['public']['Enums']['rfp_status'];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          mineral: Database['public']['Enums']['mineral_type'];
          quantity: number;
          unit: Database['public']['Enums']['quantity_unit'];
          target_price_min?: number | null;
          target_price_max?: number | null;
          delivery_terms?: string | null;
          deadline: string;
          description: string;
          status?: Database['public']['Enums']['rfp_status'];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          buyer_id?: string;
          mineral?: Database['public']['Enums']['mineral_type'];
          quantity?: number;
          unit?: Database['public']['Enums']['quantity_unit'];
          target_price_min?: number | null;
          target_price_max?: number | null;
          delivery_terms?: string | null;
          deadline?: string;
          description?: string;
          status?: Database['public']['Enums']['rfp_status'];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'rfps_buyer_id_fkey';
            columns: ['buyer_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      shipments: {
        Row: {
          id: string;
          order_id: string;
          carrier: string | null;
          tracking_ref: string | null;
          status: Database['public']['Enums']['shipment_status'];
          checkpoints: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          carrier?: string | null;
          tracking_ref?: string | null;
          status?: Database['public']['Enums']['shipment_status'];
          checkpoints?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          carrier?: string | null;
          tracking_ref?: string | null;
          status?: Database['public']['Enums']['shipment_status'];
          checkpoints?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'shipments_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      rate_limit_buckets: {
        Row: {
          bucket_key: string;
          action: string;
          window_start: string;
          count: number;
        };
        Insert: {
          bucket_key: string;
          action: string;
          window_start: string;
          count?: number;
        };
        Update: {
          bucket_key?: string;
          action?: string;
          window_start?: string;
          count?: number;
        };
        Relationships: [];
      };
      waitlist_signups: {
        Row: {
          id: string;
          email: string;
          country_interest: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          country_interest?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          country_interest?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      check_rate_limit: {
        Args: {
          p_bucket_key: string;
          p_action: string;
          p_limit: number;
          p_window_seconds: number;
        };
        Returns: Json;
      };
      create_order_from_offer: {
        Args: { p_offer_id: string };
        Returns: string;
      };
      generate_lot_code: {
        Args: { p_mineral: Database['public']['Enums']['mineral_type'] };
        Returns: string;
      };
      can_view_lot: { Args: { p_lot_id: string }; Returns: boolean };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_cooperative_owner: { Args: Record<string, never>; Returns: boolean };
      is_kyc_approved: { Args: Record<string, never>; Returns: boolean };
      owns_lot: { Args: { p_lot_id: string }; Returns: boolean };
      current_user_role: {
        Args: Record<string, never>;
        Returns: Database['public']['Enums']['user_role'];
      };
    };
    Enums: {
      export_readiness_item_key:
        | 'ceec_certification'
        | 'export_permit'
        | 'taxes_paid'
        | 'customs_forms'
        | 'quality_certificates';
      kyc_document_status: 'pending' | 'approved' | 'rejected';
      kyc_document_type:
        | 'id_card'
        | 'business_registration'
        | 'mining_permit'
        | 'export_license';
      kyc_status: 'none' | 'pending' | 'approved' | 'rejected';
      listing_status:
        | 'draft'
        | 'pending_review'
        | 'active'
        | 'paused'
        | 'sold'
        | 'rejected';
      mining_event_category: 'auction' | 'government' | 'conference' | 'other';
      mineral_type:
        | 'cobalt'
        | 'copper'
        | 'gold'
        | 'coltan'
        | 'lithium'
        | 'diamond';
      notification_type: 'kyc' | 'offer' | 'order' | 'message' | 'system' | 'listing' | 'rfp';
      offer_status:
        | 'pending'
        | 'countered'
        | 'accepted'
        | 'declined'
        | 'expired';
      order_status:
        | 'confirmed'
        | 'processing'
        | 'in_transit'
        | 'delivered'
        | 'cancelled'
        | 'disputed';
      price_type: 'fixed' | 'negotiable' | 'indicative';
      quantity_unit: 'MT' | 'oz' | 'kg' | 'carat';
      rfp_bid_status: 'pending' | 'selected' | 'rejected';
      rfp_status: 'open' | 'awarded' | 'cancelled';
      shipment_status:
        | 'pending'
        | 'picked_up'
        | 'in_transit'
        | 'customs'
        | 'delivered'
        | 'exception';
      user_role:
        | 'buyer'
        | 'seller'
        | 'cooperative'
        | 'admin'
        | 'institution';
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

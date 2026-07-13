export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      species: {
        Row: {
          id: string;
          common_name: string;
          scientific_name: string | null;
          first_seen_at: string | null;
          total_sightings: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          common_name: string;
          scientific_name?: string | null;
          first_seen_at?: string | null;
          total_sightings?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          common_name?: string;
          scientific_name?: string | null;
          first_seen_at?: string | null;
          total_sightings?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      observations: {
        Row: {
          id: string;
          species_id: string | null;
          detected_label: string;
          confidence: number;
          image_url: string;
          bbox: Json | null;
          verified: boolean;
          observed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          species_id?: string | null;
          detected_label: string;
          confidence: number;
          image_url: string;
          bbox?: Json | null;
          verified?: boolean;
          observed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          species_id?: string | null;
          detected_label?: string;
          confidence?: number;
          image_url?: string;
          bbox?: Json | null;
          verified?: boolean;
          observed_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "observations_species_id_fkey";
            columns: ["species_id"];
            isOneToOne: false;
            referencedRelation: "species";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type SpeciesRow = Database["public"]["Tables"]["species"]["Row"];
export type ObservationRow = Database["public"]["Tables"]["observations"]["Row"];

export type ObservationWithSpecies = ObservationRow & {
  species: Pick<
    SpeciesRow,
    "id" | "common_name" | "scientific_name" | "total_sightings" | "first_seen_at"
  > | null;
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      elements: {
        Row: {
          assists: number | null
          bonus: number | null
          bps: number | null
          chance_of_playing_next_round: number | null
          chance_of_playing_this_round: number | null
          clean_sheets: number | null
          clean_sheets_per_90: number | null
          code: number
          corners_and_indirect_freekicks_order: number | null
          corners_and_indirect_freekicks_text: string | null
          cost_change_event: number | null
          cost_change_event_fall: number | null
          cost_change_start: number | null
          cost_change_start_fall: number | null
          creativity: number | null
          creativity_rank: number | null
          creativity_rank_type: string | null
          direct_freekicks_order: number | null
          direct_freekicks_text: string | null
          dreamteam_count: number | null
          element_type: number | null
          ep_next: number | null
          ep_this: number | null
          event_points: number | null
          expected_assists: number | null
          expected_assists_per_90: number | null
          expected_goal_involvements: number | null
          expected_goal_involvements_per_90: number | null
          expected_goals: number | null
          expected_goals_conceded: number | null
          expected_goals_conceded_per_90: number | null
          expected_goals_per_90: number | null
          first_name: string | null
          form: number | null
          form_rank: number | null
          form_rank_type: string | null
          goals_conceded: number | null
          goals_conceded_per_90: number | null
          goals_scored: number | null
          ict_index: number | null
          ict_index_rank: number | null
          ict_index_rank_type: string | null
          id: number | null
          in_dreamteam: boolean | null
          influence: number | null
          influence_rank: number | null
          influence_rank_type: string | null
          minutes: number | null
          news: string | null
          news_added: string | null
          now_cost: number | null
          now_cost_rank: number | null
          now_cost_rank_type: string | null
          own_goals: number | null
          penalties_missed: number | null
          penalties_order: number | null
          penalties_saved: number | null
          penalties_text: string | null
          photo: string | null
          points_per_game: number | null
          points_per_game_rank: number | null
          points_per_game_rank_type: string | null
          red_cards: number | null
          saves: number | null
          saves_per_90: number | null
          second_name: string | null
          selected_by_percent: number | null
          selected_rank: number | null
          selected_rank_type: string | null
          special: boolean | null
          squad_number: number | null
          starts: number | null
          starts_per_90: number | null
          status: string | null
          team: number | null
          team_code: number | null
          threat: number | null
          threat_rank: number | null
          threat_rank_type: string | null
          total_points: number | null
          transfers_in: number | null
          transfers_in_event: number | null
          transfers_out: number | null
          transfers_out_event: number | null
          value_form: number | null
          value_season: number | null
          web_name: string | null
          yellow_cards: number | null
        }
        Insert: {
          assists?: number | null
          bonus?: number | null
          bps?: number | null
          chance_of_playing_next_round?: number | null
          chance_of_playing_this_round?: number | null
          clean_sheets?: number | null
          clean_sheets_per_90?: number | null
          code: number
          corners_and_indirect_freekicks_order?: number | null
          corners_and_indirect_freekicks_text?: string | null
          cost_change_event?: number | null
          cost_change_event_fall?: number | null
          cost_change_start?: number | null
          cost_change_start_fall?: number | null
          creativity?: number | null
          creativity_rank?: number | null
          creativity_rank_type?: string | null
          direct_freekicks_order?: number | null
          direct_freekicks_text?: string | null
          dreamteam_count?: number | null
          element_type?: number | null
          ep_next?: number | null
          ep_this?: number | null
          event_points?: number | null
          expected_assists?: number | null
          expected_assists_per_90?: number | null
          expected_goal_involvements?: number | null
          expected_goal_involvements_per_90?: number | null
          expected_goals?: number | null
          expected_goals_conceded?: number | null
          expected_goals_conceded_per_90?: number | null
          expected_goals_per_90?: number | null
          first_name?: string | null
          form?: number | null
          form_rank?: number | null
          form_rank_type?: string | null
          goals_conceded?: number | null
          goals_conceded_per_90?: number | null
          goals_scored?: number | null
          ict_index?: number | null
          ict_index_rank?: number | null
          ict_index_rank_type?: string | null
          id?: number | null
          in_dreamteam?: boolean | null
          influence?: number | null
          influence_rank?: number | null
          influence_rank_type?: string | null
          minutes?: number | null
          news?: string | null
          news_added?: string | null
          now_cost?: number | null
          now_cost_rank?: number | null
          now_cost_rank_type?: string | null
          own_goals?: number | null
          penalties_missed?: number | null
          penalties_order?: number | null
          penalties_saved?: number | null
          penalties_text?: string | null
          photo?: string | null
          points_per_game?: number | null
          points_per_game_rank?: number | null
          points_per_game_rank_type?: string | null
          red_cards?: number | null
          saves?: number | null
          saves_per_90?: number | null
          second_name?: string | null
          selected_by_percent?: number | null
          selected_rank?: number | null
          selected_rank_type?: string | null
          special?: boolean | null
          squad_number?: number | null
          starts?: number | null
          starts_per_90?: number | null
          status?: string | null
          team?: number | null
          team_code?: number | null
          threat?: number | null
          threat_rank?: number | null
          threat_rank_type?: string | null
          total_points?: number | null
          transfers_in?: number | null
          transfers_in_event?: number | null
          transfers_out?: number | null
          transfers_out_event?: number | null
          value_form?: number | null
          value_season?: number | null
          web_name?: string | null
          yellow_cards?: number | null
        }
        Update: {
          assists?: number | null
          bonus?: number | null
          bps?: number | null
          chance_of_playing_next_round?: number | null
          chance_of_playing_this_round?: number | null
          clean_sheets?: number | null
          clean_sheets_per_90?: number | null
          code?: number
          corners_and_indirect_freekicks_order?: number | null
          corners_and_indirect_freekicks_text?: string | null
          cost_change_event?: number | null
          cost_change_event_fall?: number | null
          cost_change_start?: number | null
          cost_change_start_fall?: number | null
          creativity?: number | null
          creativity_rank?: number | null
          creativity_rank_type?: string | null
          direct_freekicks_order?: number | null
          direct_freekicks_text?: string | null
          dreamteam_count?: number | null
          element_type?: number | null
          ep_next?: number | null
          ep_this?: number | null
          event_points?: number | null
          expected_assists?: number | null
          expected_assists_per_90?: number | null
          expected_goal_involvements?: number | null
          expected_goal_involvements_per_90?: number | null
          expected_goals?: number | null
          expected_goals_conceded?: number | null
          expected_goals_conceded_per_90?: number | null
          expected_goals_per_90?: number | null
          first_name?: string | null
          form?: number | null
          form_rank?: number | null
          form_rank_type?: string | null
          goals_conceded?: number | null
          goals_conceded_per_90?: number | null
          goals_scored?: number | null
          ict_index?: number | null
          ict_index_rank?: number | null
          ict_index_rank_type?: string | null
          id?: number | null
          in_dreamteam?: boolean | null
          influence?: number | null
          influence_rank?: number | null
          influence_rank_type?: string | null
          minutes?: number | null
          news?: string | null
          news_added?: string | null
          now_cost?: number | null
          now_cost_rank?: number | null
          now_cost_rank_type?: string | null
          own_goals?: number | null
          penalties_missed?: number | null
          penalties_order?: number | null
          penalties_saved?: number | null
          penalties_text?: string | null
          photo?: string | null
          points_per_game?: number | null
          points_per_game_rank?: number | null
          points_per_game_rank_type?: string | null
          red_cards?: number | null
          saves?: number | null
          saves_per_90?: number | null
          second_name?: string | null
          selected_by_percent?: number | null
          selected_rank?: number | null
          selected_rank_type?: string | null
          special?: boolean | null
          squad_number?: number | null
          starts?: number | null
          starts_per_90?: number | null
          status?: string | null
          team?: number | null
          team_code?: number | null
          threat?: number | null
          threat_rank?: number | null
          threat_rank_type?: string | null
          total_points?: number | null
          transfers_in?: number | null
          transfers_in_event?: number | null
          transfers_out?: number | null
          transfers_out_event?: number | null
          value_form?: number | null
          value_season?: number | null
          web_name?: string | null
          yellow_cards?: number | null
        }
        Relationships: []
      }
      picks: {
        Row: {
          active_chip: string | null
          bank: number | null
          element: number
          entry_id: number
          event: number | null
          event_transfers: number | null
          event_transfers_cost: number | null
          game_week: number
          is_captain: boolean | null
          is_vice_captain: boolean | null
          multiplier: number | null
          overall_rank: number | null
          percentile_rank: number | null
          points: number | null
          points_on_bench: number | null
          position: number | null
          rank: number | null
          rank_sort: number | null
          total_points: number | null
          value: number | null
        }
        Insert: {
          active_chip?: string | null
          bank?: number | null
          element: number
          entry_id: number
          event?: number | null
          event_transfers?: number | null
          event_transfers_cost?: number | null
          game_week: number
          is_captain?: boolean | null
          is_vice_captain?: boolean | null
          multiplier?: number | null
          overall_rank?: number | null
          percentile_rank?: number | null
          points?: number | null
          points_on_bench?: number | null
          position?: number | null
          rank?: number | null
          rank_sort?: number | null
          total_points?: number | null
          value?: number | null
        }
        Update: {
          active_chip?: string | null
          bank?: number | null
          element?: number
          entry_id?: number
          event?: number | null
          event_transfers?: number | null
          event_transfers_cost?: number | null
          game_week?: number
          is_captain?: boolean | null
          is_vice_captain?: boolean | null
          multiplier?: number | null
          overall_rank?: number | null
          percentile_rank?: number | null
          points?: number | null
          points_on_bench?: number | null
          position?: number | null
          rank?: number | null
          rank_sort?: number | null
          total_points?: number | null
          value?: number | null
        }
        Relationships: []
      }
      standings: {
        Row: {
          entry: number | null
          entry_name: string | null
          event_total: number | null
          fav_team: number | null
          first_name: string | null
          fname: string | null
          id: number
          last_name: string | null
          last_rank: number | null
          pfp: string | null
          player_name: string | null
          rank: number | null
          rank_sort: number | null
          total: number | null
        }
        Insert: {
          entry?: number | null
          entry_name?: string | null
          event_total?: number | null
          first_name?: string | null
          fav_team?: number | null
          fname?: string | null
          id: number
          last_name?: string | null
          last_rank?: number | null
          pfp?: string | null
          player_name?: string | null
          rank?: number | null
          rank_sort?: number | null
          total?: number | null
        }
        Update: {
          entry?: number | null
          entry_name?: string | null
          event_total?: number | null
          fav_team?: number | null
          first_name?: string | null
          fname?: string | null
          id?: number
          last_name?: string | null
          last_rank?: number | null
          pfp?: string | null
          player_name?: string | null
          rank?: number | null
          rank_sort?: number | null
          total?: number | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          code: number;
          draw: number;
          form: string | null;
          id: number;
          loss: number;
          name: string | null;
          played: number;
          points: number;
          position: number;
          short_name: string | null;
          strength: number;
          team_division: string | null;
          unavailable: boolean;
          win: number;
          strength_overall_home: number;
          strength_overall_away: number;
          strength_attack_home: number;
          strength_attack_away: number;
          strength_defence_home: number;
          strength_defence_away: number;
          pulse_id: number;
          logo: string | null;
        };
        Insert: {
          code: number;
          draw: number;
          form?: string | null;
          id: number;
          loss: number;
          name?: string | null;
          played: number;
          points: number;
          position: number;
          short_name?: string | null;
          strength: number;
          team_division?: string | null;
          unavailable: boolean;
          win: number;
          strength_overall_home: number;
          strength_overall_away: number;
          strength_attack_home: number;
          strength_attack_away: number;
          strength_defence_home: number;
          strength_defence_away: number;
          pulse_id: number;
          logo?: string | null;
        };
        Update: {
          code?: number;
          draw?: number;
          form?: string | null;
          id?: number;
          loss?: number;
          name?: string | null;
          played?: number;
          points?: number;
          position?: number;
          short_name?: string | null;
          strength?: number;
          team_division?: string | null;
          unavailable?: boolean;
          win?: number;
          strength_overall_home?: number;
          strength_overall_away?: number;
          strength_attack_home?: number;
          strength_attack_away?: number;
          strength_defence_home?: number;
          strength_defence_away?: number;
          pulse_id?: number;
          logo?: string | null;
        };
        Relationships: [];
      }      
    }
    Views: {
      all_view: {
        Row: {
          active_chip: string | null
          bank: number | null
          element_id: number | null
          element_name: string | null
          element_team: number | null
          element_type: number | null
          entry_id: number | null
          fname: string | null
          game_week: number | null
          is_captain: boolean | null
          is_vice_captain: boolean | null
          manager_image_url: string | null
          multiplier: number | null
          overall_rank: number | null
          percentile_rank: number | null
          player_code: number | null
          player_image_url: string | null
          points: number | null
          position: number | null
          rank: number | null
          rank_sort: number | null
          total_points: number | null
          value: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

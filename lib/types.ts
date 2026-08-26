export interface ColorTheme {
  primary: string;
  secondary?: string;
  accent?: string;
}

export interface PhraseItem {
  text?: string;
  context?: string;
  meaning?: string;
  pronunciation?: string;
}

export interface LiteraryQuote {
  text: string;
  attribution?: string;   // "— Paul Bowles, The Sheltering Sky"
  context?: string;       // optional editorial framing sentence
}

export interface PhotoSpot {
  location: string;       // e.g. "Bab Bou Jeloud, Fez Medina"
  timing?: string;        // e.g. "Golden hour, 6:00–6:45 pm"
  angle?: string;         // e.g. "Face east, keep the gate right of frame"
  hashtags?: string[];    // e.g. ["#VisitMorocco", "#FezMedina"]
  instagram_caption?: string;
}

export interface ThreadContent {
  title?: string;
  content?: string;
}

export interface ItineraryNarrativeSegment {
  time_label?: string;
  headline?: string;
  prose?: string;
  logistics?: string;
}

export interface CulturalNote {
  term: string;
  explanation: string;
}

export interface MustBuyItem {
  item: string;
  why?: string;
  where?: string;
  price_range?: string;
  amazon_url?: string;
}

export interface WineFoodPick {
  name: string;
  type?: string;       // e.g. "wine", "cheese", "spice", "pastry"
  note?: string;
  when_to_get?: string; // e.g. "This afternoon at the souk"
}

export interface BriefingCard {
  title?: string;
  content?: string;
  type?: string;
}

export interface Trip {
  id: string;
  title: string;
  subtitle?: string;
  dedication?: string;
  epigraph?: string;
  epigraph_translation?: string;
  epigraph_transliteration?: string;
  start_date: string;
  end_date: string;
  home_base?: string;
  hunt_tiebreaker_rule?: string;
  web_slug: string;
  web_password?: string;
  color_theme?: ColorTheme;
  has_phrases?: boolean;
  has_ef?: boolean;
  has_thread_boxes?: boolean;
  trip_narrative?: string;
  hero_image_url?: string;
  hero_image_url_2?: string;
  hero_image_url_3?: string;
  hero_image_url_4?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TripDay {
  id: string;
  trip_id: string;
  day_number: number;
  date: string;
  title: string;
  region: string;
  location?: string;
  phrase?: PhraseItem;
  wow_moment?: string;
  thread_content?: string | ThreadContent;
  thread_title?: string;
  local_insider_tip?: string;
  morning_brief?: string;
  itinerary_narrative?: ItineraryNarrativeSegment[];
  unsplash_query?: string;
  hero_image_url?: string;
  hero_image_url_2?: string;
  hero_image_url_3?: string;
  hero_image_url_4?: string;
  footer_image_url?: string;
  meal_breakfast?: string;
  meal_lunch?: string;
  meal_dinner?: string;
  literary_quote?: LiteraryQuote;
  photo_spot?: PhotoSpot;
  must_buy?: MustBuyItem[];
  wine_food_picks?: WineFoodPick[];
  pace_morning?: string;
  pace_afternoon?: string;
  pace_note?: string;
  cultural_notes?: CulturalNote[];
  location_lat?: number;
  location_lng?: number;
  map_stop_label?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TripTravelInfo {
  id: string;
  trip_id: string;
  country_name: string;
  currency_code?: string;
  currency_name?: string;
  currency_symbol?: string;
  fallback_rate_to_usd?: number;
  exchange_note?: string;
  tipping_notes?: { service: string; local_note: string }[];
  connectivity_notes?: { title: string; note: string }[];
  vaccination_notes?: { label: string; note: string }[];
  food_water_notes?: { label: string; note: string }[];
  sun_safety_note?: string;
  embassy_name?: string;
  embassy_url?: string;
  advisory_url?: string;
  sort_order?: number;
}

export interface Event {
  id: string;
  day_id: string;
  trip_id: string;
  type: string;
  title: string;
  time_start?: string;
  address?: string;
  phone?: string;
  confirmation?: string;
  notes?: string;
  booking_status?: string;
  booking_url?: string;
  callout_type?: string;
  briefing_card?: BriefingCard;
  traveler_ids?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ReferenceItem {
  id: string;
  trip_id: string;
  type: 'hotel' | 'flight' | 'other';
  name: string;
  check_in?: string;
  check_out?: string;
  address?: string;
  phone?: string;
  website?: string;
  confirmation?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// GPX walking/driving route assigned to a specific day.
// Stored in the day_routes table — used by web and iOS/iPad app.
export interface DayRoute {
  id: string;
  trip_id: string;
  day_id: string;
  name?: string;
  gpx_url: string;
  traveler_keys?: string[] | null; // null / empty = all travelers
  sort_order: number;
  created_at?: string;
}

export interface TripWithDays extends Trip {
  trip_days?: TripDay[];
}

export interface TripDayWithEvents extends TripDay {
  events?: Event[];
}

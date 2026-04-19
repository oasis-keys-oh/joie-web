export interface ColorTheme {
  primary: string;
  secondary?: string;
  accent?: string;
}

export interface PhraseItem {
  title?: string;
  content?: string;
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
  start_date: string;
  end_date: string;
  web_slug: string;
  color_theme?: ColorTheme;
  has_phrases?: boolean;
  has_ef?: boolean;
  has_thread_boxes?: boolean;
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
  thread_content?: ThreadContent;
  thread_title?: string;
  local_insider_tip?: string;
  morning_brief?: string;
  itinerary_narrative?: ItineraryNarrativeSegment[];
  unsplash_query?: string;
  meal_breakfast?: string;
  meal_lunch?: string;
  meal_dinner?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  day_id: string;
  trip_id: string;
  type: string;
  title: string;
  time_start?: string;
  address?: string;
  confirmation?: string;
  notes?: string;
  booking_status?: string;
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
  confirmation?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TripWithDays extends Trip {
  trip_days?: TripDay[];
}

export interface TripDayWithEvents extends TripDay {
  events?: Event[];
}

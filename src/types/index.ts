// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string;
}

// Room Rate Type
export interface RoomRate {
  title: string;
  rate_per_month: number;
}

// Prime Location Perk Type
export interface PrimeLocationPerk {
  title: string;
  distance: string;
  time_to_reach: string;
}

// Branch Type
export interface Branch {
  id: number;
  name: string;
  thumbnail?: string;
  contact_no: string[];
  email?: string;
  address: string;
  room_rate: RoomRate[];
  reg_fee: number;
  is_mess_available: boolean;
  mess_price?: number;
  prime_location_perks?: PrimeLocationPerk[];
  amenities?: string[];
  created_at?: string;
  updated_at?: string;
}

// Gallery Type
export interface Gallery {
  id: number;
  branch_id: number;
  image_url: string;
  title?: string;
  tags?: string[];
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

// User Enquiry Type
export interface UserEnquiry {
  id: number;
  name: string;
  email?: string;
  phone: string;
  message?: string;
  branch_id?: number;
  source?: string;
  status?: 'pending' | 'contacted' | 'converted' | 'closed';
  created_at?: string;
  updated_at?: string;
}

// Form Input Types (for creating/updating)
export type BranchInput = Omit<Branch, 'id' | 'created_at' | 'updated_at'>;
export type GalleryInput = Omit<Gallery, 'id' | 'created_at' | 'updated_at'>;
export type UserEnquiryInput = Omit<UserEnquiry, 'id' | 'created_at' | 'updated_at'>;

// ImageHippo Types
export interface ImageHippoUploadResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    title: string;
    url: string;
    view_url: string;
    extension: string;
    size: number;
    created_at: string;
  };
}

export interface ImageHippoDeleteResponse {
  status: number;
  message: string;
  deleted_url: string;
}

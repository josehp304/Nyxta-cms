import axios from 'axios';
import type {
  ApiResponse,
  Branch,
  BranchInput,
  Gallery,
  GalleryInput,
  UserEnquiry,
  UserEnquiryInput,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Create axios instance for backend API
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============= Image upload / host deletion via backend =============

/**
 * Uploads an image file to the backend which will forward/store it and
 * create a gallery entry. The backend expects multipart/form-data and
 * returns the created Gallery entry in the usual ApiResponse.data.
 */
export const imageService = {
  async uploadImage(
    file: File,
    options?: {
      branch_id?: number;
      branch_name?: string;
      title?: string;
      description?: string;
      tags?: string | string[];
      display_order?: number;
    }
  ) {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.branch_id) formData.append('branch_id', String(options.branch_id));
    if (options?.branch_name) formData.append('branch_name', options.branch_name);
    if (options?.title) formData.append('title', options.title);
    if (options?.description) formData.append('description', options.description);
    if (options?.tags) {
      if (Array.isArray(options.tags)) formData.append('tags', options.tags.join(','));
      else formData.append('tags', String(options.tags));
    }
    if (typeof options?.display_order !== 'undefined') formData.append('display_order', String(options.display_order));

    const response = await api.post<ApiResponse<any>>('/api/gallery/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data || !response.data.data) {
      throw new Error(response.data?.error || 'Failed to upload image');
    }

    // Backend returns the created gallery entry in data
    return response.data.data;
  },

  /**
   * Ask backend to delete the hosted image from the image host (ImageHippo)
   */
  async deleteImageFromHost(imageUrl: string) {
    const response = await api.delete<ApiResponse<any>>('/api/gallery/delete-from-host', {
      data: { image_url: imageUrl },
    });

    if (!response.data) {
      throw new Error('Failed to delete image from host');
    }

    return response.data;
  },
};

// ============= Branch API =============

export const branchService = {
  /**
   * Get all branches
   */
  async getAll(): Promise<Branch[]> {
    const response = await api.get<ApiResponse<Branch[]>>('/api/branches');
    return response.data.data || [];
  },

  /**
   * Get single branch by ID
   */
  async getById(id: number): Promise<Branch> {
    const response = await api.get<ApiResponse<Branch>>(`/api/branches/${id}`);
    if (!response.data.data) {
      throw new Error('Branch not found');
    }
    return response.data.data;
  },

  /**
   * Create new branch (supports multipart/form-data for thumbnail upload)
   */
  async create(data: BranchInput, thumbnailFile?: File): Promise<Branch> {
    if (thumbnailFile) {
      // Send as multipart/form-data with thumbnail
      const formData = new FormData();
      formData.append('thumbnail', thumbnailFile);
      
      // Append all other fields as JSON strings
      formData.append('name', data.name);
      formData.append('contact_no', JSON.stringify(data.contact_no));
      formData.append('address', data.address);
      formData.append('room_rate', JSON.stringify(data.room_rate));
      formData.append('reg_fee', String(data.reg_fee));
      formData.append('is_mess_available', String(data.is_mess_available));
      
      if (data.email) formData.append('email', data.email);
      if (data.mess_price) formData.append('mess_price', String(data.mess_price));
      if (data.prime_location_perk) formData.append('prime_location_perk', data.prime_location_perk);
      if (data.amenities) formData.append('amenities', JSON.stringify(data.amenities));
      if (data.landmark) formData.append('landmark', data.landmark);
      if (data.latitude) formData.append('latitude', String(data.latitude));
      if (data.longitude) formData.append('longitude', String(data.longitude));

      const response = await api.post<ApiResponse<Branch>>('/api/branches', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (!response.data.data) {
        throw new Error('Failed to create branch');
      }
      return response.data.data;
    } else {
      // Send as JSON without thumbnail
      const response = await api.post<ApiResponse<Branch>>('/api/branches', data);
      if (!response.data.data) {
        throw new Error('Failed to create branch');
      }
      return response.data.data;
    }
  },

  /**
   * Update existing branch (supports multipart/form-data for thumbnail upload)
   */
  async update(id: number, data: Partial<BranchInput>, thumbnailFile?: File): Promise<Branch> {
    if (thumbnailFile) {
      // Send as multipart/form-data with thumbnail
      const formData = new FormData();
      formData.append('thumbnail', thumbnailFile);
      
      // Append all provided fields as JSON strings
      if (data.name) formData.append('name', data.name);
      if (data.contact_no) formData.append('contact_no', JSON.stringify(data.contact_no));
      if (data.address) formData.append('address', data.address);
      if (data.room_rate) formData.append('room_rate', JSON.stringify(data.room_rate));
      if (data.reg_fee !== undefined) formData.append('reg_fee', String(data.reg_fee));
      if (data.is_mess_available !== undefined) formData.append('is_mess_available', String(data.is_mess_available));
      if (data.email) formData.append('email', data.email);
      if (data.mess_price) formData.append('mess_price', String(data.mess_price));
      if (data.prime_location_perk) formData.append('prime_location_perk', data.prime_location_perk);
      if (data.amenities) formData.append('amenities', JSON.stringify(data.amenities));
      if (data.landmark) formData.append('landmark', data.landmark);
      if (data.latitude) formData.append('latitude', String(data.latitude));
      if (data.longitude) formData.append('longitude', String(data.longitude));

      const response = await api.put<ApiResponse<Branch>>(`/api/branches/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (!response.data.data) {
        throw new Error('Failed to update branch');
      }
      return response.data.data;
    } else {
      // Send as JSON without thumbnail
      const response = await api.put<ApiResponse<Branch>>(`/api/branches/${id}`, data);
      if (!response.data.data) {
        throw new Error('Failed to update branch');
      }
      return response.data.data;
    }
  },

  /**
   * Delete branch
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/api/branches/${id}`);
  },
};

// ============= Gallery API =============

export const galleryService = {
  /**
   * Get all gallery images (optionally filter by branch_id)
   */
  async getAll(branchId?: number): Promise<Gallery[]> {
    const url = branchId ? `/api/gallery?branch_id=${branchId}` : '/api/gallery';
    const response = await api.get<ApiResponse<Gallery[]>>(url);
    return response.data.data || [];
  },

  /**
   * Get single gallery image by ID
   */
  async getById(id: number): Promise<Gallery> {
    const response = await api.get<ApiResponse<Gallery>>(`/api/gallery/${id}`);
    if (!response.data.data) {
      throw new Error('Gallery image not found');
    }
    return response.data.data;
  },

  /**
   * Create new gallery image
   */
  async create(data: GalleryInput): Promise<Gallery> {
    const response = await api.post<ApiResponse<Gallery>>('/api/gallery', data);
    if (!response.data.data) {
      throw new Error('Failed to create gallery image');
    }
    return response.data.data;
  },

  /**
   * Update existing gallery image
   */
  async update(id: number, data: Partial<GalleryInput>): Promise<Gallery> {
    const response = await api.put<ApiResponse<Gallery>>(`/api/gallery/${id}`, data);
    if (!response.data.data) {
      throw new Error('Failed to update gallery image');
    }
    return response.data.data;
  },

  /**
   * Delete gallery image
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/api/gallery/${id}`);
  },

  /**
   * Upload image to ImageHippo and create gallery entry
   */
  async uploadAndCreate(
    file: File,
    branchId: number,
    title?: string,
    tags?: string[],
    displayOrder?: number
  ): Promise<Gallery> {
    // Send file to backend upload endpoint. Backend will upload/store and
    // create the gallery entry and return it in the response.
    const galleryEntry = await imageService.uploadImage(file, {
      branch_id: branchId,
      title,
      tags,
      display_order: displayOrder,
    });

    // If backend returned the gallery entry directly, return it.
    // If it returned an intermediate structure, try to normalize.
    return galleryEntry as Gallery;
  },
};

// ============= User Enquiries API =============

export const enquiryService = {
  /**
   * Get all enquiries (optionally filter by branch_id)
   */
  async getAll(branchId?: number): Promise<UserEnquiry[]> {
    const url = branchId ? `/api/enquiries?branch_id=${branchId}` : '/api/enquiries';
    const response = await api.get<ApiResponse<UserEnquiry[]>>(url);
    return response.data.data || [];
  },

  /**
   * Get single enquiry by ID
   */
  async getById(id: number): Promise<UserEnquiry> {
    const response = await api.get<ApiResponse<UserEnquiry>>(`/api/enquiries/${id}`);
    if (!response.data.data) {
      throw new Error('Enquiry not found');
    }
    return response.data.data;
  },

  /**
   * Create new enquiry
   */
  async create(data: UserEnquiryInput): Promise<UserEnquiry> {
    const response = await api.post<ApiResponse<UserEnquiry>>('/api/enquiries', data);
    if (!response.data.data) {
      throw new Error('Failed to create enquiry');
    }
    return response.data.data;
  },

  /**
   * Update existing enquiry
   */
  async update(id: number, data: Partial<UserEnquiryInput>): Promise<UserEnquiry> {
    const response = await api.put<ApiResponse<UserEnquiry>>(`/api/enquiries/${id}`, data);
    if (!response.data.data) {
      throw new Error('Failed to update enquiry');
    }
    return response.data.data;
  },

  /**
   * Delete enquiry
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/api/enquiries/${id}`);
  },
};

export default api;

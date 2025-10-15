import axios from 'axios';
import type {
  ApiResponse,
  Branch,
  BranchInput,
  Gallery,
  GalleryInput,
  UserEnquiry,
  UserEnquiryInput,
  ImageHippoUploadResponse,
  ImageHippoDeleteResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const IMGHIPPO_API_KEY = import.meta.env.VITE_IMGHIPPO_API;

// Create axios instance for backend API
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for ImageHippo
const imageApi = axios.create({
  baseURL: 'https://api.imghippo.com/v1',
  headers: {
    Authorization: `Bearer ${IMGHIPPO_API_KEY}`,
  },
});

// ============= ImageHippo API =============

export const imageService = {
  /**
   * Upload image to ImageHippo
   */
  async uploadImage(file: File): Promise<ImageHippoUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await imageApi.post<ImageHippoUploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Delete image from ImageHippo
   */
  async deleteImage(imageUrl: string): Promise<ImageHippoDeleteResponse> {
    const response = await imageApi.post<ImageHippoDeleteResponse>('/delete', {
      url: imageUrl,
    });

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
   * Create new branch
   */
  async create(data: BranchInput): Promise<Branch> {
    const response = await api.post<ApiResponse<Branch>>('/api/branches', data);
    if (!response.data.data) {
      throw new Error('Failed to create branch');
    }
    return response.data.data;
  },

  /**
   * Update existing branch
   */
  async update(id: number, data: Partial<BranchInput>): Promise<Branch> {
    const response = await api.put<ApiResponse<Branch>>(`/api/branches/${id}`, data);
    if (!response.data.data) {
      throw new Error('Failed to update branch');
    }
    return response.data.data;
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
    // Upload to ImageHippo first
    const uploadResponse = await imageService.uploadImage(file);

    // Create gallery entry with the returned URL
    return this.create({
      branch_id: branchId,
      image_url: uploadResponse.data.url,
      title: title || uploadResponse.data.title,
      tags,
      display_order: displayOrder,
    });
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

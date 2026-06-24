// Base URL for the API endpoints - using proxy
import { apiClient } from "../../../api/axiosInstance";

/**
 * ApiService class provides methods to interact with the backend API.
 * It handles fetching, creating, and deleting records for various tables.
 */
class ApiService {
  /**
   * Fetches data from a specified table.
   * @param tableName - The name of the table to fetch data from.
   * @returns A promise that resolves to an array of records.
   */
 async fetchTableData(tableName: string, bypassCache = false): Promise<any[]> {
  const CACHE_KEY = `csa_cache_${tableName}`;

  // Attempt local cache first if not bypassing
  if (!bypassCache) {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) return JSON.parse(cached);
  }

  try {
    const response = await apiClient.get(`/${tableName}`);
    const rawData = response.data;

    // Case 1: API already returns array
    if (Array.isArray(rawData)) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(rawData));
      return rawData;
    }

    // Case 2: API returns { data: [...] }
    if (Array.isArray(rawData?.data)) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(rawData.data));
      return rawData.data;
    }

    // fallback safe return
    return [];
  } catch (error) {
    console.warn(`Error fetching ${tableName}:`, error);

    // ONLY fallback for gallery
    if (tableName === "gallery") {
      return [
        {
          id: 101,
          name: "Sacred Choir",
          image_url:
            "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1200",
          description: "Lead through music.",
        },
        {
          id: 102,
          name: "Youth Ministry",
          image_url:
            "https://images.unsplash.com/photo-1523050853063-bd80e2904760?auto=format&fit=crop&w=1200",
          description: "The future of our faith.",
        },
      ];
    }

    return [];
  }
}

  /**
   * Creates a new record in the specified table.
   * @param tableName - The name of the table to create the record in.
   * @param data - The data for the new record.
   * @returns A promise that resolves to the created record.
   */
  async createRecord(tableName: string, data: Record<string, any>): Promise<any> {
    try {
      const response = await apiClient.post(`/${tableName}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error creating record in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Deletes a record from the specified table by ID.
   * @param tableName - The name of the table to delete the record from.
   * @param id - The ID of the record to delete.
   * @returns A promise that resolves to the response from the server.
   */
  async deleteRecord(tableName: string, id: string | number): Promise<any> {
    try {
      const response = await apiClient.delete(`/${tableName}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting record from ${tableName}:`, error);
      throw error;
    }
  }

  async updateRecord(tableName: string, id: string | number, data: Record<string, any>): Promise<any> {
    try {
      const response = await apiClient.patch(`/${tableName}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating record in ${tableName}:`, error);
      throw error;
    }
  }

  // Specific methods for different tables

  /**
   * Fetches all members.
   */
  async getMembers(): Promise<any[]> {
    return this.fetchTableData('members');
  }

  /**
   * Fetches all events.
   */
  async getEvents(): Promise<any[]> {
    return this.fetchTableData('events');
  }

  /**
   * Fetches all contributions.
   */
  async getContributions(): Promise<any[]> {
    return this.fetchTableData('contributions');
  }

  /**
   * Fetches all roles.
   */
  async getRoles(): Promise<any[]> {
    return this.fetchTableData('roles');
  }

  /**
   * Fetches all sub-groups.
   */
  async getSubGroups(): Promise<any[]> {
    return this.fetchTableData('sub_groups');
  }
  
  /**
   * Fetches all members (admin only)
   */
  async getAdminMembers(): Promise<any[]> {
    const response = await apiClient.get('/authentication/list-all-memebrs');
    return response.data;
  }

  /**
   * Fetches roles and permissions (admin only)
   */
  async getAdminRoles(): Promise<any> {
    const response = await apiClient.get('/authentication/list-roles-permissions');
    return response.data;
  }

  /**
   * Updates a member's roles
   */
  async updateMemberRoles(memberId: string, roleNames: string[]): Promise<any> {
    const response = await apiClient.post('/authentication/update-user-roles', {
      member_id: memberId,
      role_names: roleNames
    });
    return response.data;
  }

  /**
   * Fetches all member roles.
   */
  async getMemberRoles(): Promise<any[]> {
    return this.fetchTableData('member_roles');
  }

  /**
   * Fetches all event attendance records.
   */
  async getEventAttendance(): Promise<any[]> {
    return this.fetchTableData('event_subgroup_attendance');
  }

  /**
   * Fetches all officials from the correct /officials/list endpoint.
   * Always bypasses cache to ensure fresh data (images, updates) are reflected.
   */
  async getOfficials(bypassCache = false): Promise<any[]> {
    const CACHE_KEY = 'csa_cache_officials';

    if (!bypassCache) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try { return JSON.parse(cached); } catch { /* ignore */ }
      }
    }

    try {
      const response = await apiClient.get('/officials/list');
      const data = response.data?.data || response.data || [];
      if (Array.isArray(data)) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('Error fetching officials:', error);
      return [];
    }
  }

  /**
   * Fetches all projects.
   */
  async getProjects(): Promise<any[]> {
    return this.fetchTableData('projects');
  }

  /**
   * Fetches all activities.
   */
  async getActivities(): Promise<any[]> {
    return this.fetchTableData('activities');
  }

  async getWeeklyActivities(): Promise<any[]> {
    return this.fetchTableData('activities/weekly');
  }

  async getSemesterActivities(): Promise<any[]> {
    return this.fetchTableData('activities/semester');
  }

  /**
   * Fetches all gallery items.
   */
  async getGallery(): Promise<any[]> {
    return this.fetchTableData('gallery');
  }

  async getSacramentalsSliderImages(section: string = 'sacramentals'): Promise<any[]> {
    try {
      const response = await apiClient.get(`/slider-images?section=${encodeURIComponent(section)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sacramentals slider images:', error);
      return [];
    }
  }

  async createSacramentalsSliderImage(payload: Record<string, any>): Promise<any> {
    const response = await apiClient.post('/slider-images', payload);
    return response.data;
  }

  async updateSacramentalsSliderImage(id: string | number, payload: Record<string, any>): Promise<any> {
    const response = await apiClient.patch(`/slider-images/${id}`, payload);
    return response.data;
  }

  async deleteSacramentalsSliderImage(id: string | number): Promise<any> {
    const response = await apiClient.delete(`/slider-images/${id}`);
    return response.data;
  }

  /**
   * Fetches a single official by their ID.
   * @param id - The ID of the official.
   */
  async getOfficialById(id: string | number): Promise<any> {
    try {
      const response = await apiClient.get(`/officials/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching official ${id}:`, error);
      throw error;
    }
  }

  /**
   * Fetches the election history of officials.
   */
  async getOfficialHistory(): Promise<any[]> {
    try {
      const response = await apiClient.get('/officials/history');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching officials history:', error);
      return [];
    }
  }

  /**
   * Creates a new gallery item.
   * @param galleryData - The data for the new gallery item.
   */
  async addGalleryItem(galleryData: Record<string, any>): Promise<any> {
    return this.createRecord('gallery', galleryData);
  }

  /**
   * Fetches all jumuiya groups.
   */
  async getJumuiya(): Promise<any[]> {
    return this.fetchTableData('jumuiya');
  }

  /**
   * Pools all data from all tables in the database.
   */
  async poolAllData(): Promise<Record<string, any[]>> {
    try {
      const response = await apiClient.get('/all');
      return response.data;
    } catch (error) {
      console.error('Error pooling all data:', error);
      throw error;
    }
  }

  // Create methods

  /**
   * Creates a new member.
   */
  async createMember(memberData: Record<string, any>): Promise<any> {
    return this.createRecord('members', memberData);
  }

  /**
   * Creates a new event.
   */
  async createEvent(eventData: Record<string, any>): Promise<any> {
    return this.createRecord('events', eventData);
  }

  /**
   * Creates a new contribution.
   */
  async createContribution(contributionData: Record<string, any>): Promise<any> {
    return this.createRecord('contributions', contributionData);
  }

  // Delete methods

  /**
   * Deletes a member by ID.
   */
  async deleteMember(memberId: string | number): Promise<any> {
    return this.deleteRecord('members', memberId);
  }

  /**
   * Deletes an event by ID.
   */
  async deleteEvent(eventId: string | number): Promise<any> {
    return this.deleteRecord('events', eventId);
  }

  /**
   * Deletes a contribution by ID.
   */
  async deleteContribution(contributionId: string | number): Promise<any> {
    return this.deleteRecord('contributions', contributionId);
  }
  /**
   * Clears the local cache for a specific table.
   */
  clearCache(tableName: string): void {
    const CACHE_KEY = `csa_cache_${tableName}`;
    localStorage.removeItem(CACHE_KEY);
  }

  /**
   * Clears all CSA related caches.
   */
  clearAllCache(): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('csa_cache_')) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Clears only officials-related caches.
   */
  clearOfficialsCache(): void {
    localStorage.removeItem('csa_cache_officials');
    localStorage.removeItem('csa_cache_jumuiya_officials');
    localStorage.removeItem('csa_cache_jumuiya-officials');
    Object.keys(localStorage).forEach(key => {
      if (
        key.startsWith('csa_cache_official_') ||
        key.startsWith('csa_cache_jumuiya_official_')
      ) {
        localStorage.removeItem(key);
      }
    });
  }
}

export default new ApiService();

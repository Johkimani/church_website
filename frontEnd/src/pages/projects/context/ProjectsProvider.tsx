import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import apiService from '../../Landing/services/api';

interface ProjectsContextType {
  testimonials: any[];
  categoryCards: any[];
  sliderImages: any[];
  loading: boolean;
  refreshTestimonials: () => void;
  refreshCategoryCards: () => void;
  refreshSliderImages: () => void;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

const LS_KEYS = {
  testimonials: 'csa_cache_projects_testimonials',
  categoryCards: 'csa_cache_projects_category_cards',
  sliderImages: 'csa_cache_projects_slider',
};

export const ProjectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [testimonials, setTestimonials] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.testimonials) || '[]'); } catch { return []; }
  });
  const [categoryCards, setCategoryCards] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.categoryCards) || '[]'); } catch { return []; }
  });
  const [sliderImages, setSliderImages] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.sliderImages) || '[]'); } catch { return []; }
  });
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [testData, cardData, sliderData] = await Promise.all([
        apiService.getTestimonials(true),
        apiService.getCategoryCards(),
        apiService.getSacramentalsSliderImages(),
      ]);
      if (Array.isArray(testData)) { setTestimonials(testData); localStorage.setItem(LS_KEYS.testimonials, JSON.stringify(testData)); }
      if (Array.isArray(cardData)) { setCategoryCards(cardData); localStorage.setItem(LS_KEYS.categoryCards, JSON.stringify(cardData)); }
      if (Array.isArray(sliderData)) { setSliderImages(sliderData); localStorage.setItem(LS_KEYS.sliderImages, JSON.stringify(sliderData)); }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const refreshTestimonials = useCallback(async () => {
    const data = await apiService.getTestimonials(true);
    if (Array.isArray(data)) { setTestimonials(data); localStorage.setItem(LS_KEYS.testimonials, JSON.stringify(data)); }
  }, []);

  const refreshCategoryCards = useCallback(async () => {
    const data = await apiService.getCategoryCards();
    if (Array.isArray(data)) { setCategoryCards(data); localStorage.setItem(LS_KEYS.categoryCards, JSON.stringify(data)); }
  }, []);

  const refreshSliderImages = useCallback(async () => {
    const data = await apiService.getSacramentalsSliderImages();
    if (Array.isArray(data)) { setSliderImages(data); localStorage.setItem(LS_KEYS.sliderImages, JSON.stringify(data)); }
  }, []);

  return (
    <ProjectsContext.Provider value={{ testimonials, categoryCards, sliderImages, loading, refreshTestimonials, refreshCategoryCards, refreshSliderImages }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjectsData = () => {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjectsData must be used within ProjectsProvider');
  return ctx;
};

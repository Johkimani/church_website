import { useState, useMemo } from 'react';
import type { Prayer } from '../data/prayerCategories';

export interface PrayerFilters {
  searchQuery: string;
  selectedCategory: Prayer['category'] | 'all';
  selectedIntention?: string;
}

export function usePrayerFilter(items: Prayer[]) {
  const [filters, setFilters] = useState<PrayerFilters>({
    searchQuery: '',
    selectedCategory: 'all',
    selectedIntention: undefined,
  });

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        if (
          !item.title.toLowerCase().includes(q) &&
          !item.text.toLowerCase().includes(q) &&
          !(item.intention && item.intention.toLowerCase().includes(q))
        ) {
          return false;
        }
      }
      if (filters.selectedCategory !== 'all' && item.category !== filters.selectedCategory) {
        return false;
      }
      if (filters.selectedIntention && item.intention !== filters.selectedIntention) {
        return false;
      }
      return true;
    });
  }, [items, filters]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    for (const item of items) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [items]);

  const uniqueIntentions = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      if (item.intention) set.add(item.intention);
    }
    return Array.from(set).sort();
  }, [items]);

  const updateFilter = (key: keyof PrayerFilters, value: PrayerFilters[keyof PrayerFilters]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ searchQuery: '', selectedCategory: 'all', selectedIntention: undefined });
  };

  const hasActiveFilters = filters.searchQuery !== '' || filters.selectedCategory !== 'all' || !!filters.selectedIntention;

  return {
    filters,
    updateFilter,
    clearFilters,
    filteredItems,
    categoryCounts,
    uniqueIntentions,
    hasActiveFilters,
  };
}

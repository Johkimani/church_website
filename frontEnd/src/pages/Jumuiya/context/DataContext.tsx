import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import type { JumuiyaData, GalleryImage, Official, MeetingSchedule, TshirtOrder } from '../data/jumuiyaData';
import PageLoader from '../../../assets/Layouts/PageLoader';
// Note: DATA_VERSION and initialJumuiyaList static imports are removed.

interface DataContextType {
    jumuiyaList: JumuiyaData[];
    getJumuiyaById: (id: string) => JumuiyaData | undefined;
    updateJumuiya: (id: string, updates: Partial<JumuiyaData>) => void;
    updateAbout: (id: string, about: JumuiyaData['about']) => void;
    updateOfficials: (id: string, officials: Official[]) => void;
    updateMeetingSchedule: (id: string, schedule: MeetingSchedule) => void;
    updateGallery: (id: string, gallery: GalleryImage[]) => void;
    addTshirtOrder: (jumuiyaId: string, order: TshirtOrder) => void;
    resetData: () => void;
    refetchData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [jumuiyaList, setJumuiyaList] = useState<JumuiyaData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const baseUrl = import.meta.env.VITE_SERVER_URI || 'http://localhost:3000';
                const res = await fetch(`${baseUrl}/api/jumuiya-data/all`);
                
                if (!res.ok) {
                    throw new Error(`Failed to fetch: ${res.statusText}`);
                }
                
                const json = await res.json();
                if (json.success && Array.isArray(json.data) && json.data.length > 0) {
                    setJumuiyaList(json.data);
                } else {
                    console.error("No jumuiya data returned from backend:", json);
                    setJumuiyaList([]);
                }
            } catch (e) {
                console.error('Failed to load Jumuiya data from backend API', e);
                setJumuiyaList([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const getJumuiyaById = (id: string) => {
        return jumuiyaList.find(j => j.id === id || j.group_id === id);
    };

    const updateJumuiya = (id: string, updates: Partial<JumuiyaData>) => {
        setJumuiyaList(prev => prev.map(j => (j.id === id || j.group_id === id) ? { ...j, ...updates } : j));
    };

    const updateAbout = (id: string, about: JumuiyaData['about']) => {
        setJumuiyaList(prev => prev.map(j => (j.id === id || j.group_id === id) ? { ...j, about } : j));
    };

    const updateOfficials = (id: string, officials: Official[]) => {
        setJumuiyaList(prev => prev.map(j => (j.id === id || j.group_id === id) ? { ...j, officials } : j));
    };

    const updateMeetingSchedule = (id: string, schedule: MeetingSchedule) => {
        setJumuiyaList(prev => prev.map(j => (j.id === id || j.group_id === id) ? { ...j, meetingSchedule: schedule } : j));
    };

    const updateGallery = (id: string, gallery: GalleryImage[]) => {
        setJumuiyaList(prev => prev.map(j => (j.id === id || j.group_id === id) ? { ...j, gallery } : j));
    };

    const addTshirtOrder = (jumuiyaId: string, order: TshirtOrder) => {
        setJumuiyaList(prev => prev.map(j =>
            (j.id === jumuiyaId || j.group_id === jumuiyaId)
                ? { ...j, tshirtOrders: [...(j.tshirtOrders || []), order] }
                : j
        ));
    };

    const refetchData = async () => {
        try {
            const baseUrl = import.meta.env.VITE_SERVER_URI || 'http://localhost:3000';
            const res = await fetch(`${baseUrl}/api/jumuiya-data/all`);
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                setJumuiyaList(json.data);
            }
        } catch (e) {
            console.error('Failed to refetch Jumuiya data', e);
        }
    };

    const resetData = () => {
        // Obsolete in production; re-fetches for now
        setJumuiyaList([]);
        setIsLoading(true);
        const baseUrl = import.meta.env.VITE_SERVER_URI || 'http://localhost:3000';
        fetch(`${baseUrl}/api/jumuiya-data/all`)
            .then(res => res.json())
            .then(json => setJumuiyaList(json.data || []))
            .finally(() => setIsLoading(false));
    };

    if (isLoading) {
        return <PageLoader fullScreen message="Loading Communities..." />;
    }

    return (
        <DataContext.Provider value={{
            jumuiyaList,
            getJumuiyaById,
            updateJumuiya,
            updateAbout,
            updateOfficials,
            updateMeetingSchedule,
            updateGallery,
            addTshirtOrder,
            resetData,
            refetchData
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

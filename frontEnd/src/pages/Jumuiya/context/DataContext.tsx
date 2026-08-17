import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import type { JumuiyaData, GalleryImage, Official, MeetingSchedule, TshirtOrder } from '../data/jumuiyaData';
import { jumuiyaList as initialJumuiyaList } from '../data/jumuiyaData';
import { apiClient } from '../../../api/axiosInstance';

// Increment this whenever the data structure changes to force a localStorage reset
const DATA_VERSION = '7';

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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [jumuiyaList, setJumuiyaList] = useState<JumuiyaData[]>(() => {
        const storedVersion = localStorage.getItem('jumuiya_data_version');
        const storedData = localStorage.getItem('jumuiya_data');
        if (storedVersion === DATA_VERSION && storedData) {
            try {
                return JSON.parse(storedData);
            } catch (e) {
                console.error('Failed to parse stored data', e);
            }
        }
        return initialJumuiyaList;
    });

    const [isLoading, setIsLoading] = useState(() => {
        const storedVersion = localStorage.getItem('jumuiya_data_version');
        const storedData = localStorage.getItem('jumuiya_data');
        return storedVersion !== DATA_VERSION || !storedData;
    });

    useEffect(() => {
        if (isLoading) {
            console.log('Resetting to initial data.');
            setJumuiyaList(initialJumuiyaList);
            localStorage.setItem('jumuiya_data', JSON.stringify(initialJumuiyaList));
            localStorage.setItem('jumuiya_data_version', DATA_VERSION);
            setIsLoading(false);
        }
    }, [isLoading]);

    useEffect(() => {
        const fetchBackendData = async () => {
            try {
                const response = await apiClient.get('/jumuiya-data/all');
                if (response.data && response.data.success) {
                    const backendList = response.data.data;
                    setJumuiyaList(prevList => {
                        return prevList.map(item => {
                            const found = backendList.find((b: any) => b.id === item.id);
                            if (found) {
                                return {
                                    ...item,
                                    group_id: found.group_id || item.group_id,
                                    fullName: found.fullName || item.fullName,
                                    description: found.description || item.description,
                                    about: found.about || item.about,
                                    color: found.color || item.color,
                                    saintImage: found.saintImage || item.saintImage,
                                    historyPdf: found.historyPdf || item.historyPdf,
                                    meetingSchedule: found.meetingSchedule || item.meetingSchedule,
                                    officials: found.officials && found.officials.length > 0 ? found.officials : item.officials,
                                    formerOfficials: found.formerOfficials && found.formerOfficials.length > 0 ? found.formerOfficials : item.formerOfficials,
                                    termOfOffice: found.termOfOffice || item.termOfOffice,
                                    socialMedia: found.socialMedia && found.socialMedia.length > 0 ? found.socialMedia : item.socialMedia,
                                    tshirtOrders: found.tshirtOrders && found.tshirtOrders.length > 0 ? found.tshirtOrders : item.tshirtOrders,
                                };
                            }
                            return item;
                        });
                    });
                }
            } catch (error) {
                console.error('Failed to fetch jumuiya data from backend:', error);
            }
        };

        fetchBackendData();
    }, []);


    useEffect(() => {
        if (!isLoading && jumuiyaList.length > 0) {
            localStorage.setItem('jumuiya_data', JSON.stringify(jumuiyaList));
        }
    }, [jumuiyaList, isLoading]);

    const getJumuiyaById = (id: string) => {
        return jumuiyaList.find(j => j.id === id);
    };

    const updateJumuiya = (id: string, updates: Partial<JumuiyaData>) => {
        setJumuiyaList(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j));
    };

    const updateAbout = (id: string, about: JumuiyaData['about']) => {
        setJumuiyaList(prev => prev.map(j => j.id === id ? { ...j, about } : j));
    };

    const updateOfficials = (id: string, officials: Official[]) => {
        setJumuiyaList(prev => prev.map(j => j.id === id ? { ...j, officials } : j));
    };

    const updateMeetingSchedule = (id: string, schedule: MeetingSchedule) => {
        setJumuiyaList(prev => prev.map(j => j.id === id ? { ...j, meetingSchedule: schedule } : j));
    };

    const updateGallery = (id: string, gallery: GalleryImage[]) => {
        setJumuiyaList(prev => prev.map(j => j.id === id ? { ...j, gallery } : j));
    };

    const addTshirtOrder = (jumuiyaId: string, order: TshirtOrder) => {
        setJumuiyaList(prev => prev.map(j =>
            j.id === jumuiyaId
                ? { ...j, tshirtOrders: [...(j.tshirtOrders || []), order] }
                : j
        ));
    };

    const resetData = () => {
        setJumuiyaList(initialJumuiyaList);
        localStorage.setItem('jumuiya_data', JSON.stringify(initialJumuiyaList));
        localStorage.setItem('jumuiya_data_version', DATA_VERSION);
    };

    if (isLoading) {
        return <div>Loading data...</div>;
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
            resetData
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

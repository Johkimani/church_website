import React, { useState } from 'react';
import { FaInfoCircle, FaUserTie, FaUsers, FaCalendarAlt, FaBell, FaChild, FaUserGraduate } from 'react-icons/fa';
import type { JumuiyaData } from '../data/jumuiyaData';
import AdminNotifications from './AdminNotifications';
import AdminAbout from './AdminAbout';
import AdminOfficials from './AdminOfficials';
import AdminMembers from './AdminMembers';
import AdminActivities from './AdminActivities';
import AdminRegisteredMembers from './AdminRegisteredMembers';
import ChoirAdminPanel from '../choir/ChoirAdminPanel';
import DancersAdminPanel from '../choir/DancersAdminPanel';
import CharismaticAdminPanel from '../charismatic/CharismaticAdminPanel';

interface AdminPanelEmbedProps {
    jumuiya: JumuiyaData;
}

type AdminTab = 'notifications' | 'about' | 'officials' | 'members' | 'registered' | 'activities' | 'choir' | 'dancers' | 'charismatic';

const AdminPanelEmbed: React.FC<AdminPanelEmbedProps> = ({ jumuiya }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('notifications');

    const tabs = [
        { id: 'notifications' as AdminTab, label: 'Notifications', icon: <FaBell /> },
        { id: 'about' as AdminTab, label: 'About', icon: <FaInfoCircle /> },
        { id: 'officials' as AdminTab, label: 'Officials', icon: <FaUserTie /> },
        { id: 'members' as AdminTab, label: 'Members', icon: <FaUsers /> },
        { id: 'registered' as AdminTab, label: 'Registered', icon: <FaUserGraduate /> },
        { id: 'activities' as AdminTab, label: 'Activities', icon: <FaCalendarAlt /> },
    ];

    if (jumuiya.id === 'choir') {
        (tabs as any).push({ id: 'choir' as AdminTab, label: 'Choir Admin', icon: <FaUserTie /> });
    }
    if (jumuiya.id === 'dancers') {
        (tabs as any).push({ id: 'dancers' as AdminTab, label: 'Dancer Admin', icon: <FaChild /> });
    }
    if (jumuiya.id === 'charismatic') {
        (tabs as any).push({ id: 'charismatic' as AdminTab, label: 'Charismatic Admin', icon: <FaUserTie /> });
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'notifications':
                return <AdminNotifications selectedId={jumuiya.id} />;
            case 'about':
                return <AdminAbout selectedId={jumuiya.id} />;
            case 'officials':
                return <AdminOfficials selectedId={jumuiya.id} />;
            case 'members':
                return <AdminMembers jumuiyaId={jumuiya.id} />;
            case 'activities':
                return <AdminActivities selectedId={jumuiya.id} />;
            case 'registered':
                return <AdminRegisteredMembers jumuiyaId={jumuiya.group_id || jumuiya.id} jumuiyaName={jumuiya.name} jumuiyaColor={jumuiya.color || '#6366f1'} />;
            case 'choir':
                return <ChoirAdminPanel />;
            case 'dancers':
                return <DancersAdminPanel />;
            case 'charismatic':
                return <CharismaticAdminPanel />;
            default:
                return <AdminAbout selectedId={jumuiya.id} />;
        }
    };

    return (
        <div className="admin-panel-embed">
            <nav className="admin-embed-tabs" style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '24px', 
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '12px',
                overflowX: 'auto',
                scrollbarWidth: 'none'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeTab === tab.id ? 'var(--jumuiya-color)' : 'transparent',
                            color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </nav>

            <div className="admin-embed-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminPanelEmbed;

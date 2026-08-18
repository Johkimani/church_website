import React, { useState } from 'react';
import { Outlet, NavLink, useParams, useNavigate } from 'react-router-dom';
import { FaBell, FaInfoCircle, FaUserTie, FaUsers, FaDatabase, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import '../../Jumuiya/admin/Admin.css';

interface Props {
  color: string;
  moduleName: string;
}

const CommunityAdminLayout: React.FC<Props> = ({ color, moduleName }) => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const tabs = [
    { id: 'about', label: 'About', icon: <FaInfoCircle /> },
    { id: 'officials', label: 'Officials', icon: <FaUserTie /> },
    { id: 'members', label: 'Members', icon: <FaUsers /> },
    { id: 'activities', label: 'Activities', icon: <FaCalendarAlt /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
  ];

  return (
    <div className="admin-layout" style={{ '--admin-color': color } as React.CSSProperties}>
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="admin-sidebar-header">
          {!collapsed && <h3>{moduleName} Admin</h3>}
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '»' : '«'}
          </button>
        </div>
        <nav className="admin-sidebar-nav">
          {tabs.map(tab => (
            <NavLink
              key={tab.id}
              to={`/admin/community-management/${moduleId}/${tab.id}`}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="admin-nav-icon">{tab.icon}</span>
              {!collapsed && <span className="admin-nav-label">{tab.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button onClick={() => navigate('/admin/community-management')} className="admin-back-btn">
            <FaArrowLeft /> {!collapsed && 'Back'}
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default CommunityAdminLayout;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCommunityData } from './context/CommunityDataContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/axiosInstance';
import CommunityDetail from './CommunityDetail';
import CommunityAboutTab from './components/tabs/CommunityAboutTab';
import { FaUserTie, FaUsers, FaCalendarAlt, FaShareAlt, FaTshirt, FaCommentDots } from 'react-icons/fa';
import { FaBars } from 'react-icons/fa';
import '../../../Jumuiya/components/TabsSystem.css';

const MINISTRY_COLORS: Record<string, string> = {
  choir: '#1e3a5f',
  dancers: '#db2777',
  charismatic: '#7c3aed',
  'st-francis': '#047857',
  youth: '#8e44ad',
  mentorship: '#6d28d9',
};

const COMMUNITY_IMAGES: Record<string, string> = {
  choir: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
  dancers: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800',
  charismatic: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=800',
  'st-francis': 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=800',
  youth: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800',
  mentorship: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800',
};

const DEFAULT_COMMUNITY_IMAGE = 'https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&q=80&w=800';

const TAB_ICONS: Record<string, React.ReactNode> = {
  choir: <FaUserTie />,
  dancers: <FaUsers />,
  charismatic: <FaShareAlt />,
  'st-francis': <FaBars />,
  mentorship: <FaUsers />,
};

const TAB_LABELS: Record<string, string> = {
  choir: 'Choir',
  dancers: 'Dancers',
  charismatic: 'Charismatic',
  'st-francis': 'St. Francis',
  mentorship: 'Mentorship',
};

const GROUP_ROLES_BY_MODULE: Record<string, string[]> = {
  choir: ['choir_chairperson', 'choir_secretary', 'choir_project_coordinator'],
  dancers: ['dance_chair'],
  charismatic: ['charismatic_chair'],
  'st-francis': ['st_francis_chair'],
  mentorship: ['mentorship_chair'],
};

const Community: React.FC = () => {
  const navigate = useNavigate();
  const { modules } = useCommunityData();
  const { user } = useAuth();

  // Determine which modules the user can access based on their role
  let activeModules = modules || [];

  if (user?.role) {
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];
    const userRoleUpper = userRoles.map((r) => String(r).toUpperCase().trim());

    // If user is global admin (CSA chair), show all modules
    const isGlobalAdmin = userRoleUpper.includes('CSA_CHAIR') || userRoleUpper.includes('OS') || userRoleUpper.includes('JUMUIYA_COORDINATOR');

    if (isGlobalAdmin) {
      // Show all modules
      activeModules = modules || [];
    } else {
      // Filter modules based on user's group role
      const userModule = userRoles.find((r) => GROUP_ROLES_BY_MODULE[r]);
      if (userModule) {
        const allowed = GROUP_ROLES_BY_MODULE[userModule];
        activeModules = (modules || []).filter((mod) =>
          allowed.some((role) => userRoles.includes(role))
        );
      } else {
        // No matching group role; show no modules or fallback
        activeModules = [];
      }
    }
  } else {
    // No user data; show all modules as default
    activeModules = modules || [];
  }

  const handleCardClick = (moduleId: string) => {
    navigate(`/community/${moduleId}`);
  };

  return (
    <div className="landing-page">
      <div className="container">
        {/* Hero Section */}
        <header className="hero animate-fade-in">
          <h1 className="hero-title">Communities & Ministries</h1>
          <p className="hero-subtitle">Parish Groups & Vocations</p>
          <p className="hero-description">
            Join one of our vibrant parish ministries and grow in faith, fellowship, and service.
            Each community is a family where we pray together, support one another, and live out the Gospel.
          </p>
        </header>

        {/* Jumuiya Style Cards Grid */}
        <div className="jumuiya-grid">
          {activeModules.map((community) => {
            const image = community.saint_image_url || community.image_url || COMMUNITY_IMAGES[community.id] || DEFAULT_COMMUNITY_IMAGE;
            const color = MINISTRY_COLORS[community.id] || community.color || '#7c2d12';

            return (
              <button
                key={community.id}
                type="button"
                aria-label={`View ${community.title}`}
                className="jumuiya-card card card-clickable animate-fade-in"
                style={{
                  ['--jumuiya-color' as any]: color,
                }}
                onClick={() => handleCardClick(community.id)}
              >
                {/* Background Image with Color Overlay */}
                <div
                  className="card-background"
                  style={{ backgroundImage: `url(${image})` }}
                >
                  <div className="card-overlay" />
                </div>

                {/* Card Content */}
                <div className="card-content">
                  <div className="card-header">
                    <h2 className="card-title">{community.title}</h2>
                  </div>
                  <p className="card-description">{community.description}</p>
                  <div className="card-footer">
                    <span className="card-link">Explore Ministry →</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="landing-footer">
          <p>
            Interested in joining a ministry or starting a new group? Contact the Parish Coordinator at{' '}
            <a href="mailto:info@jumuiya.co.ke">info@jumuiya.co.ke</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Community;
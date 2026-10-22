import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaChurch, FaUserTie } from "react-icons/fa";
import "../Jumuiya/JumuiyaLanding.css";

export const ConstitutionPage: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: "csa",
      title: "CSA Constitution",
      description: "The governing instrument establishing our vision, sacred liturgical orders, rights, and executive leadership.",
      icon: FaBook,
      color: "#2563eb",
      path: "/constitution?tab=csa",
    },
    {
      id: "jumuiya",
      title: "Jumuiya Constitution",
      description: "Constitutions and guidelines for each Small Christian Community.",
      icon: FaChurch,
      color: "#d97706",
      path: "/constitution?tab=jumuiya",
    },
    {
      id: "coordinators",
      title: "Jumuiya Coordinators",
      description: "Guidelines and procedures for Jumuiya Coordinators.",
      icon: FaUserTie,
      color: "#059669",
      path: "/constitution?tab=coordinators",
    },
  ];

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="landing-page">
      <div className="container">
        <header className="hero animate-fade-in">
          <h1 className="hero-title">Constitution</h1>
          <p className="hero-subtitle">Kirinyaga University CSA</p>
          <p className="hero-description">
            The official governing documents of Kirinyaga University St. Thomas Aquinas Catholic Students' Association.
          </p>
        </header>

        <div className="jumuiya-grid">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                type="button"
                aria-label={`View ${section.title}`}
                className="jumuiya-card card card-clickable animate-fade-in"
                style={{
                  ['--jumuiya-color' as any]: section.color,
                }}
                onClick={() => handleCardClick(section.path)}
              >
                <div className="card-background">
                  <div className="card-overlay"></div>
                </div>

                <div className="card-content">
                  <div className="card-header">
                    <div className="flex items-center gap-2">
                      <Icon className="text-lg" style={{ color: section.color }} />
                      <h2 className="card-title">{section.title}</h2>
                    </div>
                  </div>
                  <p className="card-description">{section.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConstitutionPage;

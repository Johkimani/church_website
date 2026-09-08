import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from './context/DataContext';
import { apiClient } from '../../../api/axiosInstance';
import './JumuiyaLanding.css';

interface Coordinator {
    name: string | null;
    phone: string;
}

/** Normalises a phone number to E.164 format (digits only, country code 254 for Kenya).
 *  Examples accepted: 0712345678 → 254712345678, +254712345678 → 254712345678 */
const toWaPhone = (raw: string): string => {
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 10) {
        digits = '254' + digits.slice(1);
    }
    if (digits.startsWith('254') && digits.length === 12) return digits;
    if (digits.startsWith('7') && digits.length === 9) return '254' + digits;
    return digits; // Return as-is if unknown format — still attempts a wa.me link
};

const JumuiyaLanding: React.FC = () => {
    const navigate = useNavigate();
    const { jumuiyaList } = useData();
    const [coordinator, setCoordinator] = useState<Coordinator | null | undefined>(undefined);

    useEffect(() => {
        apiClient
            .get('/officials/coordinator')
            .then(({ data }) => setCoordinator(data?.coordinator ?? null))
            .catch(() => setCoordinator(null));
    }, []);

    const handleCardClick = (jumuiyaId: string) => {
        navigate(`/jumuiya/${jumuiyaId}`);
    };

    const waLink = coordinator?.phone
        ? `https://wa.me/${toWaPhone(coordinator.phone)}`
        : null;

    return (
        <div className="landing-page">
            <div className="container">
                {/* Hero Section */}
                <header className="hero animate-fade-in">
                    <h1 className="hero-title">Jumuiya</h1>
                    <p className="hero-subtitle">Small Christian Communities</p>
                    <p className="hero-description">
                        Join one of our vibrant Jumuiya communities and grow in faith, fellowship, and service.
                        Each community is a family where we pray together, support one another, and live out the Gospel.
                    </p>
                </header>

                {/* Jumuiya Cards Grid */}
                <div className="jumuiya-grid">
                    {jumuiyaList.map((jumuiya) => (
                        <button
                            key={jumuiya.id}
                            type="button"
                            aria-label={`View ${jumuiya.name}`}
                            className="jumuiya-card card card-clickable animate-fade-in"
                            style={{
                                ['--jumuiya-color' as any]: jumuiya.color
                            }}
                            onClick={() => handleCardClick(jumuiya.id)}
                        >
                            {/* Background Image with Color Overlay */}
                            <div
                                className="card-background"
                                style={{ backgroundImage: `url(${jumuiya.saintImage})` }}
                            >
                                <div className="card-overlay"></div>
                            </div>

                            {/* Card Content */}
                            <div className="card-content">
                                <div className="card-header">
                                    <h2 className="card-title">{jumuiya.name}</h2>
                                </div>
                                <p className="card-description">{jumuiya.description}</p>
                                <div className="card-footer">
                                    {/* <span className="card-link">Learn More →</span> */}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Footer Info — only rendered when an active coordinator with a phone exists */}
                {coordinator !== undefined && waLink && (
                    <div className="landing-footer">
                        <p>
                            Don't have a Jumuiya? Contact the Jumuiya Coordinator on WhatsApp:{' '}
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Chat with ${coordinator.name ?? 'the Jumuiya Coordinator'} on WhatsApp`}
                            >
                                {coordinator.name ?? 'Chat on WhatsApp'}
                            </a>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JumuiyaLanding;

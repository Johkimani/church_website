import React from 'react';
import { FaGraduationCap, FaCheckCircle, FaRegCircle, FaCalendarCheck } from 'react-icons/fa';
import './SemesterCard.css';

interface MemberProgressCardProps {
    member: {
        name: string;
        id: string;
        year?: string;
        sem_1_reg: boolean;
        sem_2_reg: boolean;
        sem_3_reg: boolean;
        sem_4_reg: boolean;
        sem_5_reg: boolean;
        sem_6_reg: boolean;
        sem_7_reg: boolean;
        sem_8_reg: boolean;
    };
}

const MemberProgressCard: React.FC<MemberProgressCardProps> = ({ member }) => {
    const semesters = [
        { id: 1, label: 'Yr 1, Sem 1', status: member.sem_1_reg },
        { id: 2, label: 'Yr 1, Sem 2', status: member.sem_2_reg },
        { id: 3, label: 'Yr 2, Sem 1', status: member.sem_3_reg },
        { id: 4, label: 'Yr 2, Sem 2', status: member.sem_4_reg },
        { id: 5, label: 'Yr 3, Sem 1', status: member.sem_5_reg },
        { id: 6, label: 'Yr 3, Sem 2', status: member.sem_6_reg },
        { id: 7, label: 'Yr 4, Sem 1', status: member.sem_7_reg },
        { id: 8, label: 'Yr 4, Sem 2', status: member.sem_8_reg },
    ];

    const completed = semesters.filter(s => s.status).length;
    const progress = (completed / 8) * 100;

    return (
        <div className="semester-progress-card animate-fade">
            <div className="card-header-premium">
                <div className="header-icon-wrap">
                    <FaGraduationCap />
                </div>
                <div className="header-text-wrap">
                    <h3>Academic Registration Journey</h3>
                    <p>Tracking your status across 8 semesters</p>
                </div>
                <div className="progress-badge-premium">
                    {completed}/8 Records Confirmed
                </div>
            </div>

            <div className="progress-bar-container-premium">
                <div className="progress-bar-fill-premium" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="semester-grid-premium">
                {semesters.map((sem) => (
                    <div key={sem.id} className={`semester-item-premium ${sem.status ? 'completed' : 'pending'}`}>
                        <div className="status-indicator-premium">
                            {sem.status ? <FaCheckCircle className="icon-success" /> : <FaRegCircle className="icon-pending" />}
                        </div>
                        <div className="semester-info-premium">
                            <span className="label-premium">{sem.label}</span>
                            <span className="status-text-premium">{sem.status ? 'Registered' : 'Not Yet'}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card-footer-premium">
                <FaCalendarCheck style={{ marginRight: '8px', opacity: 0.7 }} />
                <span>Stay updated with the latest semester registration to maintain your profile.</span>
            </div>
        </div>
    );
};

export default MemberProgressCard;

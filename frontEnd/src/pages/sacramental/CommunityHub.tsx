import React from 'react';
import { UPLOAD_BASE } from '../../api/config';

const CommunityHub: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height: '80vh' }}>
          <iframe 
            src={`${UPLOAD_BASE}/community-hub`} 
            className="w-full h-full border-none"
            title="Community Hub"
          />
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;

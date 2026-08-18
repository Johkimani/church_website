/**
 * Projects Section Component
 * 
 * This component displays information about ongoing and past church projects
 */

import React, { useState, useEffect } from 'react';
import apiService from '../../../../services/api';
import { getSafeImageUrl } from '../../../../../api/config';

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  budget: number;
  image?: string;
  image_url?: string;
}

const ProjectsSection: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      console.log('Fetching projects...');
      const data = await apiService.getProjects();
      console.log('Projects data:', data);
      setProjects(data);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div id="projects" className="py-8 md:py-16 bg-white">
        <div className="container mx-auto px-3 md:px-4 text-center">
          <p className="text-gray-500">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="projects" className="py-8 md:py-16 bg-white">
        <div className="container mx-auto px-3 md:px-4 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div id="projects" className="py-8 md:py-16 bg-white">
      <div className="container mx-auto px-3 md:px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 md:mb-4">Our Projects</h2>
        <p className="text-center text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
          Supporting our community through various initiatives
        </p>
        
        {projects.length === 0 ? (
          <p className="text-center text-gray-500">No projects found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {projects.map((project) => {
              const imageUrl = project.image_url || project.image || '';
              return (
                <div key={project.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md">
                  {imageUrl ? (
                    <div className="h-44 overflow-hidden bg-slate-100">
                      <img
                        src={getSafeImageUrl(imageUrl)}
                        alt={project.title}
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex h-44 items-center justify-center bg-slate-100 text-slate-400">
                      No preview image available
                    </div>
                  )}
                  <div className="p-4 md:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <h3 className="text-lg md:text-xl font-bold text-slate-900">{project.title}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${project.status === 'completed' ? 'bg-green-100 text-green-800' : project.status === 'ongoing' ? 'bg-blue-100 text-blue-800' : project.status === 'planned' ? 'bg-violet-100 text-violet-800' : 'bg-slate-100 text-slate-700'}`}>
                        {project.status}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-gray-700 mb-3 text-sm md:text-base">{project.description}</p>
                    )}
                    <div className="grid gap-2 sm:grid-cols-2 text-sm text-slate-600">
                      {project.start_date && (
                        <p>Started: {new Date(project.start_date).toLocaleDateString()}</p>
                      )}
                      {project.end_date && (
                        <p>Target: {new Date(project.end_date).toLocaleDateString()}</p>
                      )}
                      {project.budget && (
                        <p>Budget: KES {project.budget.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsSection;

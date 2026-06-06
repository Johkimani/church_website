import { useEffect, useMemo, useState } from "react";
import apiService from "../../../pages/Landing/services/api";
import { getSafeImageUrl } from "../../../api/config";

type Project = {
  id?: string | number;
  title: string;
  description?: string;
  category?: string;
  status?: string;
  budget?: number | string;
  image_url?: string;
  created_at?: string;
};

type ProjectForm = Omit<Project, 'id' | 'created_at'>;

const defaultForm: ProjectForm = {
  title: '',
  description: '',
  category: 'sacramentals',
  status: 'pending',
  budget: '0',
  image_url: '',
};

const ProjectsManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | number | null>(null);
  const [form, setForm] = useState<ProjectForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const categories = ['all', 'sacramentals', 'tshirts', 'chairs', 'instruments'];
  const statusOptions = ['pending', 'active', 'completed', 'cancelled'];

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') return projects;
    return projects.filter(
      (project) => project.category?.toLowerCase() === selectedCategory
    );
  }, [projects, selectedCategory]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await apiService.getProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openProjectForm = (project?: Project) => {
    if (project) {
      setIsEditing(true);
      setCurrentProjectId(project.id ?? null);
      setForm({
        title: project.title ?? '',
        description: project.description ?? '',
        category: project.category ?? 'sacramentals',
        status: project.status ?? 'pending',
        budget: project.budget?.toString() ?? '0',
        image_url: project.image_url ?? '',
      });
    } else {
      setIsEditing(false);
      setCurrentProjectId(null);
      setForm(defaultForm);
    }
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErrorMessage('');
    setForm(defaultForm);
    setCurrentProjectId(null);
    setIsEditing(false);
  };

  const handleFormChange = (field: keyof ProjectForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, image_url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProject = async () => {
    if (!form.title.trim()) {
      setErrorMessage('Project title is required.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description?.trim() || '',
        category: form.category?.toLowerCase() || 'sacramentals',
        status: form.status?.toLowerCase() || 'pending',
        budget: Number(form.budget) || 0,
        image_url: form.image_url || '',
      };

      if (isEditing && currentProjectId !== null) {
        const updated = await apiService.updateRecord('projects', currentProjectId, payload);
        setProjects((prev) => prev.map((item) => (item.id === currentProjectId ? updated : item)));
      } else {
        const created = await apiService.createRecord('projects', payload);
        setProjects((prev) => [created, ...prev]);
      }

      apiService.clearCache('projects');
      closeModal();
    } catch (err) {
      console.error('Failed to save project', err);
      setErrorMessage((err as any)?.message || 'Unable to save project at this time.');
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (id: string | number) => {
    if (!window.confirm('Delete this project?')) return;

    try {
      await apiService.deleteRecord('projects', id);
      apiService.clearCache('projects');
      setProjects((prev) => prev.filter((project) => project.id !== id));
    } catch (err) {
      console.error('Failed to delete project', err);
      setErrorMessage('Could not delete the project.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Management</h1>
          <p className="text-slate-500 mt-1">Create, edit, and remove sacramentals, tshirts, chairs, and instruments projects.</p>
        </div>
        <button
          onClick={() => openProjectForm()}
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Add New Project
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full border transition ${
              selectedCategory === category
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading projects...</div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-500 bg-white">
              No projects found for the selected category.
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div key={project.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold text-slate-900">{project.title}</h2>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-600">
                        {project.category ? project.category.toString() : 'General'}
                      </span>
                    </div>
                    <p className="text-slate-600">{project.description || 'No description available.'}</p>
                    <div className="grid gap-2 sm:grid-cols-2 text-sm text-slate-700">
                      <div>
                        <span className="font-semibold">Status:</span> {project.status || 'N/A'}
                      </div>
                      <div>
                        <span className="font-semibold">Budget:</span> KES {project.budget ?? '0'}
                      </div>
                    </div>
                  </div>

                  {project.image_url && (
                    <img
                      src={getSafeImageUrl(project.image_url)}
                      alt={project.title}
                      className="h-28 w-28 rounded-3xl object-cover border border-slate-200"
                    />
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => openProjectForm(project)}
                    className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProject(project.id as string | number)}
                    className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{isEditing ? 'Edit Project' : 'New Project'}</h2>
                <p className="text-sm text-slate-500">Save project details and optionally upload a preview image.</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-700">Close</button>
            </div>

            <div className="grid gap-4 py-6 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Title
                <input
                  value={form.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                  placeholder="Project title"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-700">
                Category
                <select
                  value={form.category}
                  onChange={(e) => handleFormChange('category', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                >
                  {categories.filter((item) => item !== 'all').map((category) => (
                    <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={4}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                  placeholder="Add a short project summary"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-700">
                Status
                <select
                  value={form.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm text-slate-700">
                Budget (KES)
                <input
                  type="number"
                  value={form.budget}
                  onChange={(e) => handleFormChange('budget', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                  placeholder="0"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
                Image Preview
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-slate-600"
                  />
                  {form.image_url ? (
                    <img
                      src={getSafeImageUrl(form.image_url)}
                      alt="Project preview"
                      className="h-40 w-full rounded-3xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="flex min-h-[160px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
                      No image selected yet.
                    </div>
                  )}
                </div>
              </label>
            </div>

            {errorMessage && (
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3 justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProject}
                disabled={saving}
                className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                {saving ? (isEditing ? 'Saving changes...' : 'Saving project...') : (isEditing ? 'Update project' : 'Create project')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsManager;

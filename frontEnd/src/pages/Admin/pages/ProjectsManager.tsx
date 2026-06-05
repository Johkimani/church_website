import { useEffect, useMemo, useState } from "react";
import { BASE_URL } from "../../../api/config";

const ProjectsManager = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const apiUrl = `${BASE_URL}/projects`;

  const filteredProjects = useMemo(() => {
    if (selectedCategory === "all") return projects;
    return projects.filter(
      (project) => project.category?.toLowerCase() === selectedCategory
    );
  }, [projects, selectedCategory]);

  const loadProjects = async () => {
    if (!BASE_URL) {
      console.error("ProjectsManager: BASE_URL is not configured.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(apiUrl);
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const deleteProject = async (id: number) => {
    if (!confirm("Delete this project?")) return;

    try {
      await fetch(`${apiUrl}/${id}`, {
        method: "DELETE",
      });

      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Project Management
      </h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {["all", "sacramentals", "tshirts", "chairs", "instruments"].map((category) => (
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
        <p>Loading projects...</p>
      ) : (
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500 bg-white">
              No projects found for the selected category.
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className="border rounded-lg p-4 shadow bg-white"
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold">{project.title}</h2>
                  <span className="text-xs uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                    {project.category ? project.category.toString() : 'General'}
                  </span>
                </div>

                <p className="text-gray-600 mt-2">
                  {project.description}
                </p>

                <div className="mt-2 space-y-2 text-sm text-slate-700">
                  <div>
                    <span className="font-semibold">Status:</span>{" "}{project.status || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Budget:</span>{" "}KES {project.budget ?? '0'}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteProject(project.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectsManager;
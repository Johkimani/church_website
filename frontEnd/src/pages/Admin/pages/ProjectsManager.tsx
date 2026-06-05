import { useEffect, useState } from "react";

const API_URL = "http://localhost:3001/api/projects";

const ProjectsManager = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    try {
      const res = await fetch(API_URL);
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
      await fetch(`${API_URL}/${id}`, {
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
        Projects Management
      </h1>

      {loading ? (
        <p>Loading projects...</p>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border rounded-lg p-4 shadow bg-white"
            >
              <h2 className="text-xl font-semibold">
                {project.title}
              </h2>

              <p className="text-gray-600 mt-2">
                {project.description}
              </p>

              <div className="mt-2">
                <span className="font-semibold">
                  Status:
                </span>{" "}
                {project.status}
              </div>

              <div>
                <span className="font-semibold">
                  Budget:
                </span>{" "}
                KES {project.budget}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsManager;
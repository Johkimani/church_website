import { useEffect, useState } from "react";
import apiService from "../services/api";
import { getSafeImageUrl } from "../../../api/config";

interface Project {
  id?: string | number;
  title: string;
  description?: string;
  category?: string;
  image_url?: string;
  budget?: number;
}

interface Props {
  category: string;
}

const ProjectList = ({ category }: Props) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await apiService.getProjects();

        const filtered = data.filter(
          (project: Project) =>
            project.category?.toLowerCase() === category.toLowerCase()
        );

        setProjects(filtered);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [category]);

  if (loading) {
    return <p>Loading Projects...</p>;
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          {project.image_url && (
            <img
              src={getSafeImageUrl(project.image_url)}
              alt={project.title}
              className="w-full h-56 object-cover"
            />
          )}

          <div className="p-4">
            <h3 className="text-lg font-bold">
              {project.title}
            </h3>

            <p className="text-gray-600">
              {project.description}
            </p>

            <p className="font-semibold text-blue-600 mt-2">
              KES {project.budget || 0}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
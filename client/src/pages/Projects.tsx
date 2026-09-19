import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Folder, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectService, clientService } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import { PageHeader, LoadingSpinner, NeuSelect } from '../components/ui/SharedComponents';
import { formatDistanceToNow } from 'date-fns';

interface Client {
  id: string;
  name: string;
  company: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  client: Client;
  createdBy: { name: string };
  _count: { tasks: number };
  createdAt: string;
}

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
  });

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAll();
      setProjects(data.projects || []);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const data = await clientService.getAll();
      setClients(data.clients || []);
    } catch (error) {
      console.error('Failed to fetch clients');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectService.create(formData);
      toast.success('Project created successfully');
      setFormData({ name: '', description: '', clientId: '' });
      setShowForm(false);
      fetchProjects();
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Projects" action={
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-neu flex items-center gap-2"
        >
          <Plus size={18} />
          New Project
        </button>
      } />

      {showForm && (
        <div className="neu-lg p-6 mb-8 rounded-2xl max-w-2xl">
          <h3 className="font-display text-xl mb-4 text-holst-navy-900">
            Create New Project
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-holst-navy-800/60 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input-neu w-full"
                placeholder="Enter project name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-holst-navy-800/60 mb-1">
                Client
              </label>
              <NeuSelect
                value={formData.clientId}
                onChange={(val) => setFormData({ ...formData, clientId: val })}
                placeholder="Select a client"
                options={clients.map((client) => ({
                  value: client.id,
                  label: `${client.name} (${client.company})`,
                }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-holst-navy-800/60 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="textarea-neu w-full"
                placeholder="Enter project description"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-sage">
                Create Project
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : projects.length === 0 ? (
        <div className="neu p-12 text-center rounded-2xl">
          <Folder size={48} className="mx-auto mb-4 text-holst-navy-800/20" />
          <h3 className="font-display text-xl text-holst-navy-800/40">
            {user?.role === 'PROJECT_MANAGER' ? 'No projects created yet' : 'No projects found'}
          </h3>
          <p className="text-sm text-holst-navy-800/40 mt-2">
            {user?.role === 'PROJECT_MANAGER'
              ? 'Create your first project to get started'
              : user?.role === 'DEVELOPER'
                ? 'No projects with assigned tasks yet'
                : 'No projects available'}
          </p>
          {user?.role === 'PROJECT_MANAGER' && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-sage mt-4"
            >
              <Plus size={16} className="inline mr-2" />
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="neu p-6 rounded-2xl transition-all duration-300 group hover:shadow-[8px_8px_16px_#d1ccc0] hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="neu-sm p-3 rounded-xl">
                  <Folder
                    size={20}
                    className="text-holst-blue group-hover:text-holst-sage transition-colors"
                  />
                </div>
                <span className="text-xs text-holst-navy-800/40">
                  {formatDistanceToNow(new Date(project.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <h3 className="font-display text-lg text-holst-navy-900 mb-1">
                {project.name}
              </h3>
              <p className="text-sm text-holst-navy-800/40 mb-4 line-clamp-2">
                {project.description || 'No description'}
              </p>
              <div className="border-t border-holst-navy-800/10 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-holst-navy-800/50">
                    {project.client?.name || 'No client'}
                  </span>
                  <span className="text-xs bg-holst-sage/10 text-holst-sage px-2 py-1 rounded-full">
                    {project._count?.tasks || 0} tasks
                  </span>
                </div>
                <p className="font-accent italic text-sm text-holst-navy-800/50 mt-2">
                  by {project.createdBy?.name || 'Unknown'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
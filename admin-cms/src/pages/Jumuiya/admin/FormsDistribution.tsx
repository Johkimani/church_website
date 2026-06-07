import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { FaWhatsapp, FaLink, FaTrash, FaPlus } from 'react-icons/fa';

interface Group {
  id: number;
  name: string;
  invite_link: string;
}

interface Form {
  id: number;
  title: string;
  form_link: string;
  group_id: number;
  group_name: string;
}

const FormsDistribution: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  
  const [newGroup, setNewGroup] = useState({ name: '', invite_link: '' });
  const [newForm, setNewForm] = useState({ title: '', form_link: '', group_id: '' });

  const fetchGroups = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/v1/distribution/groups', {
        headers: { Authorization: `Bearer ${user?.accessToken}` }
      });
      setGroups(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchForms = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/v1/distribution/forms', {
        headers: { Authorization: `Bearer ${user?.accessToken}` }
      });
      setForms(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchForms();
  }, [user]);

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/v1/distribution/groups', newGroup, {
        headers: { Authorization: `Bearer ${user?.accessToken}` }
      });
      setNewGroup({ name: '', invite_link: '' });
      fetchGroups();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/v1/distribution/forms', newForm, {
        headers: { Authorization: `Bearer ${user?.accessToken}` }
      });
      setNewForm({ title: '', form_link: '', group_id: '' });
      fetchForms();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGroup = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/v1/distribution/groups/${id}`, {
        headers: { Authorization: `Bearer ${user?.accessToken}` }
      });
      fetchGroups();
      fetchForms();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteForm = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/v1/distribution/forms/${id}`, {
        headers: { Authorization: `Bearer ${user?.accessToken}` }
      });
      fetchForms();
    } catch (err) {
      console.error(err);
    }
  };

  const openWhatsApp = (form: Form) => {
    const text = `Please fill out this form: *${form.title}* %0A%0A ${form.form_link}`;
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Forms Distribution</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* WhatsApp Groups Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaWhatsapp className="text-green-500" /> WhatsApp Groups
          </h3>
          <form onSubmit={handleAddGroup} className="mb-4 flex flex-col gap-3">
            <input 
              type="text" placeholder="Group Name" required 
              className="border p-2 rounded"
              value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})} 
            />
            <input 
              type="url" placeholder="Invite Link" required 
              className="border p-2 rounded"
              value={newGroup.invite_link} onChange={e => setNewGroup({...newGroup, invite_link: e.target.value})} 
            />
            <button type="submit" className="bg-green-500 text-white p-2 rounded flex items-center justify-center gap-2 hover:bg-green-600">
              <FaPlus /> Add Group
            </button>
          </form>
          
          <ul className="space-y-3">
            {groups.map(g => (
              <li key={g.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{g.name}</p>
                  <a href={g.invite_link} target="_blank" rel="noreferrer" className="text-xs text-blue-500">View Link</a>
                </div>
                <button onClick={() => handleDeleteGroup(g.id)} className="text-red-500 hover:text-red-700">
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Google Forms Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaLink className="text-blue-500" /> Google Forms
          </h3>
          <form onSubmit={handleAddForm} className="mb-4 flex flex-col gap-3">
            <input 
              type="text" placeholder="Form Title" required 
              className="border p-2 rounded"
              value={newForm.title} onChange={e => setNewForm({...newForm, title: e.target.value})} 
            />
            <input 
              type="url" placeholder="Google Form Link" required 
              className="border p-2 rounded"
              value={newForm.form_link} onChange={e => setNewForm({...newForm, form_link: e.target.value})} 
            />
            <select 
              className="border p-2 rounded" required
              value={newForm.group_id} onChange={e => setNewForm({...newForm, group_id: e.target.value})}
            >
              <option value="" disabled>Select Target Group</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded flex items-center justify-center gap-2 hover:bg-blue-600">
              <FaPlus /> Add Form
            </button>
          </form>

          <ul className="space-y-3">
            {forms.map(f => (
              <li key={f.id} className="flex flex-col border-b pb-3 gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{f.title}</p>
                    <p className="text-xs text-gray-500">Target: {f.group_name}</p>
                  </div>
                  <button onClick={() => handleDeleteForm(f.id)} className="text-red-500 hover:text-red-700">
                    <FaTrash />
                  </button>
                </div>
                <button 
                  onClick={() => openWhatsApp(f)}
                  className="bg-green-100 text-green-700 text-sm p-2 rounded hover:bg-green-200 transition"
                >
                  Send to WhatsApp Web
                </button>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default FormsDistribution;

import React, { useEffect, useState } from 'react';
import { fetchTable, createTableRecord, deleteTableRecord, uploadFile } from '../../../api/axiosInstance';

const moduleId = 'charismatic';

const CharismaticAdminPanel: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [officials, setOfficials] = useState<any[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [aRes, actRes, offRes] = await Promise.all([
        fetchTable('hub_announcements', { module_id: moduleId }),
        fetchTable('hub_activities', { module_id: moduleId }),
        fetchTable('hub_officials', { module_id: moduleId }),
      ]);
      setAnnouncements(aRes.data || []);
      setActivities(actRes.data || []);
      setOfficials(offRes.data || []);
    } catch (err) {
      console.error('Failed to load charismatic module data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleCreateAnnouncement = async () => {
    const title = prompt('Announcement title');
    if (!title) return;
    const content = prompt('Announcement details') || '';
    await createTableRecord('hub_announcements', { title, content, module_id: moduleId });
    loadAll();
  };

  const handleDeleteAnnouncement = async (id: any) => {
    if (!confirm('Delete announcement?')) return;
    await deleteTableRecord('hub_announcements', id);
    loadAll();
  };

  const handleCreateActivity = async () => {
    const title = prompt('Activity title');
    if (!title) return;
    const description = prompt('Activity description') || '';
    const date = prompt('Activity date or semester') || '';
    await createTableRecord('hub_activities', { title, description, module_id: moduleId, date, status: 'Upcoming' });
    loadAll();
  };

  const handleDeleteActivity = async (id: any) => {
    if (!confirm('Delete activity?')) return;
    await deleteTableRecord('hub_activities', id);
    loadAll();
  };

  const handleAddLeader = async () => {
    if (officials.length >= 7) { alert('Limit of 7 leaders reached.'); return; }
    const name = prompt('Leader name');
    if (!name) return;
    const role = prompt('Leader role') || 'Leader';
    await createTableRecord('hub_officials', { name, role, module_id: moduleId });
    loadAll();
  };

  const handleDeleteLeader = async (id: any) => {
    if (!confirm('Remove leader?')) return;
    await deleteTableRecord('hub_officials', id);
    loadAll();
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) return alert('Select files to upload.');
    try {
      const res = await uploadFile(Array.from(files) as any);
      const uploaded = res.data || [];
      for (const file of uploaded) {
        await createTableRecord('hub_gallery', {
          module_id: moduleId,
          image_url: file.url || file.secure_url || file.path,
          public_id: file.public_id || file.id,
          description: file.original_filename || 'Charismatic event photo',
        });
      }
      alert('Uploaded successfully.');
      setFiles(null);
      loadAll();
    } catch (error) {
      console.error('Upload failed', error);
      alert('Upload failed.');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0 }}>Announcements</h2>
            <p style={{ margin: 0, color: '#6b7280' }}>Authorized Charismatic admins can publish module announcements here.</p>
          </div>
          <button className="btn-primary" onClick={handleCreateAnnouncement}>New announcement</button>
        </div>
        {loading ? <p>Loading announcements...</p> : announcements.length === 0 ? <p>No announcements yet.</p> : announcements.map(a => (
          <div key={a.id} style={{ borderBottom: '1px solid #f3f4f6', padding: '12px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <strong>{a.title}</strong>
              <button onClick={() => handleDeleteAnnouncement(a.id)} style={{ color: '#b91c1c' }}>Delete</button>
            </div>
            <p style={{ margin: '8px 0 0', color: '#4b5563' }}>{a.content || a.description || 'No details provided.'}</p>
          </div>
        ))}
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0 }}>Semester Activities</h2>
            <p style={{ margin: 0, color: '#6b7280' }}>Create, update, and remove Charismatic semester activities here.</p>
          </div>
          <button className="btn-primary" onClick={handleCreateActivity}>Add activity</button>
        </div>
        {loading ? <p>Loading activities...</p> : activities.length === 0 ? <p>No activities yet.</p> : activities.map(act => (
          <div key={act.id} style={{ borderBottom: '1px solid #f3f4f6', padding: '12px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <strong>{act.title || act.name}</strong>
                <p style={{ margin: 4, color: '#6b7280' }}>{act.date || 'No date set'}</p>
              </div>
              <button onClick={() => handleDeleteActivity(act.id)} style={{ color: '#b91c1c' }}>Delete</button>
            </div>
            <p style={{ margin: '8px 0 0', color: '#4b5563' }}>{act.description || act.body || 'No description yet.'}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0 }}>Leaders</h2>
              <p style={{ margin: 0, color: '#6b7280' }}>Maintain up to 7 Charismatic leaders.</p>
            </div>
            <button className="btn-primary" onClick={handleAddLeader}>Add leader</button>
          </div>
          {loading ? <p>Loading leaders...</p> : officials.length === 0 ? <p>No leaders yet.</p> : officials.map(o => (
            <div key={o.id} style={{ borderBottom: '1px solid #f3f4f6', padding: '12px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <strong>{o.name}</strong>
                  <p style={{ margin: 4, color: '#6b7280' }}>{o.role || 'Leader'}</p>
                </div>
                <button onClick={() => handleDeleteLeader(o.id)} style={{ color: '#b91c1c' }}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, background: '#fff' }}>
          <h2 style={{ marginBottom: 16 }}>Gallery uploads</h2>
          <p style={{ margin: '0 0 16px', color: '#6b7280' }}>Upload event photos for the Charismatic gallery.</p>
          <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
          <button onClick={handleUpload} className="btn-primary" style={{ marginTop: 16 }}>Upload photos</button>
        </div>
      </div>
    </div>
  );
};

export default CharismaticAdminPanel;

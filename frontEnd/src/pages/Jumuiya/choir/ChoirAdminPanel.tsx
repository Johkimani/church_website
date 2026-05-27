import React, { useEffect, useState } from 'react';
import { fetchTable, createTableRecord, updateTableRecord, deleteTableRecord, uploadFile } from '../../../api/axiosInstance';
import { getApiErrorMessageFromError } from '../../../api/axiosInstance';
import { showErrorToast, showSuccessToast } from '../../../utils/customToast';

const moduleId = 'choir';

const ChoirAdminPanel: React.FC = () => {
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
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const handleCreateAnnouncement = async () => {
    const title = prompt('Announcement title');
    if (!title?.trim()) {
      showErrorToast('Validation required', 'Announcement title is required.');
      return;
    }
    const content = prompt('Announcement body')?.trim() || '';
    if (!content) {
      showErrorToast('Validation required', 'Announcement content is required.');
      return;
    }

    setLoading(true);
    try {
      await createTableRecord('hub_announcements', { title: title.trim(), content, module_id: moduleId });
      showSuccessToast('Announcement added', 'Your announcement was saved successfully.');
      loadAll();
    } catch (err) {
      const message = getApiErrorMessageFromError(err);
      console.error('Error creating announcement:', err);
      showErrorToast('Failed to add announcement', message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: any) => {
    if (!confirm('Delete announcement?')) return;

    setLoading(true);
    try {
      await deleteTableRecord('hub_announcements', id);
      showSuccessToast('Announcement deleted', 'The announcement has been removed.');
      loadAll();
    } catch (err) {
      const message = getApiErrorMessageFromError(err);
      console.error('Error deleting announcement:', err);
      showErrorToast('Delete failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      showErrorToast('No files selected', 'Please choose one or more images to upload.');
      return;
    }

    setLoading(true);
    try {
      const res = await uploadFile(Array.from(files) as any);
      for (const f of res.data || []) {
        await createTableRecord('hub_gallery', {
          module_id: moduleId,
          image_url: f.url || f.secure_url || f.path,
          public_id: f.public_id || f.id,
          description: '',
        });
      }
      showSuccessToast('Upload successful', 'Files were uploaded successfully.');
      setFiles(null);
      loadAll();
    } catch (err) {
      const message = getApiErrorMessageFromError(err);
      console.error('Upload failed:', err);
      showErrorToast('Upload failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div>
        <h3>Announcements</h3>
        <button onClick={handleCreateAnnouncement} className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'New'}
        </button>
        <div style={{ marginTop: 12 }}>
          {loading ? (
            <p>Loading announcements...</p>
          ) : announcements.length === 0 ? (
            <p>No announcements yet.</p>
          ) : (
            announcements.map((a) => (
              <div key={a.id} style={{ border: '1px solid #eee', padding: 10, marginBottom: 8 }}>
                <strong>{a.title}</strong>
                <p style={{ margin: 8 }}>{a.content}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => navigator.clipboard.writeText(JSON.stringify(a))}>Copy</button>
                  <button onClick={() => handleDeleteAnnouncement(a.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h3>Activities</h3>
        <button onClick={async () => {
          const title = prompt('Activity title');
          if (!title?.trim()) return showErrorToast('Validation', 'Activity title is required.');

          setLoading(true);
          try {
            await createTableRecord('hub_activities', { title: title.trim(), module_id: moduleId });
            showSuccessToast('Activity added', 'The activity was saved successfully.');
            loadAll();
          } catch (err) {
            const message = getApiErrorMessageFromError(err);
            console.error('Error creating activity:', err);
            showErrorToast('Create failed', message);
          } finally {
            setLoading(false);
          }
        }} className="btn-primary" disabled={loading}>New</button>
        <div style={{ marginTop: 12 }}>
          {activities.map(act => (
            <div key={act.id} style={{ border: '1px solid #eee', padding: 10, marginBottom: 8 }}>
              <strong>{act.title || act.name}</strong>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={async () => {
                  if (!confirm('Delete activity?')) return;
                  setLoading(true);
                  try {
                    await deleteTableRecord('hub_activities', act.id);
                    showSuccessToast('Activity deleted', 'The activity was removed.');
                    loadAll();
                  } catch (err) {
                    const message = getApiErrorMessageFromError(err);
                    console.error('Error deleting activity:', err);
                    showErrorToast('Delete failed', message);
                  } finally {
                    setLoading(false);
                  }
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: 18 }}>Officials (Leaders)</h3>
        <div style={{ marginBottom: 8 }}>
          <button onClick={async () => {
            const name = prompt('Leader name');
            if (!name?.trim()) return showErrorToast('Validation', 'Leader name is required.');
            if (officials.length >= 7) { showErrorToast('Limit reached', 'Maximum 7 leaders allowed.'); return; }

            setLoading(true);
            try {
              await createTableRecord('hub_officials', { name: name.trim(), role: 'Leader', module_id: moduleId });
              showSuccessToast('Leader added', 'A new leader has been added.');
              loadAll();
            } catch (err) {
              const message = getApiErrorMessageFromError(err);
              console.error('Error adding leader:', err);
              showErrorToast('Create failed', message);
            } finally {
              setLoading(false);
            }
          }} className="btn-primary" disabled={loading}>Add Leader</button>
        </div>
        {officials.map(o => (
          <div key={o.id} style={{ border: '1px solid #eee', padding: 10, marginBottom: 8 }}>
            <strong>{o.name}</strong>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={async () => {
                const newName = prompt('New name', o.name);
                if (!newName?.trim()) return;
                setLoading(true);
                try {
                  await updateTableRecord('hub_officials', o.id, { name: newName.trim() });
                  showSuccessToast('Leader updated', 'Leader details were saved.');
                  loadAll();
                } catch (err) {
                  const message = getApiErrorMessageFromError(err);
                  console.error('Error updating leader:', err);
                  showErrorToast('Update failed', message);
                } finally {
                  setLoading(false);
                }
              }}>Edit</button>
              <button onClick={async () => {
                if (!confirm('Remove leader?')) return;
                setLoading(true);
                try {
                  await deleteTableRecord('hub_officials', o.id);
                  showSuccessToast('Leader removed', 'The leader has been removed.');
                  loadAll();
                } catch (err) {
                  const message = getApiErrorMessageFromError(err);
                  console.error('Error removing leader:', err);
                  showErrorToast('Delete failed', message);
                } finally {
                  setLoading(false);
                }
              }}>Remove</button>
            </div>
          </div>
        ))}

        <h3 style={{ marginTop: 18 }}>Gallery Upload</h3>
        <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
        <div style={{ marginTop: 8 }}>
          <button onClick={handleUpload} className="btn-primary">Upload to Choir Gallery</button>
        </div>
      </div>
    </div>
  );
};

export default ChoirAdminPanel;

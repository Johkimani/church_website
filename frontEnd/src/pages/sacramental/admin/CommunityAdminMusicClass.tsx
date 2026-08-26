import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../api/axiosInstance';
import PageLoader from '../../../assets/Layouts/PageLoader';
import { FaMusic, FaPhone, FaUser } from 'react-icons/fa';

/**
 * Choir officials' dedicated view of members who opted into music classes
 * on the join form. Shows only name + phone — nothing more.
 */
const CommunityAdminMusicClass: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['music-class-signups', moduleId],
    queryFn: async () => {
      const res = await apiClient.get(`/community-enrollment/${moduleId}/music-class`);
      return res.data?.data || [];
    },
    enabled: !!moduleId,
  });

  const signups: { full_name: string; phone: string }[] = data || [];

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <FaMusic />
        </div>
        <h2 className="text-xl font-black text-slate-800">Music Class</h2>
      </div>
      <p className="text-xs text-slate-400 font-semibold mb-6">
        Members who asked to join music classes on the choir join form. Contact them directly to schedule sessions.
      </p>

      {isLoading ? (
        <PageLoader message="Loading sign-ups" />
      ) : isError ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-sm font-semibold text-red-600">
          Failed to load music class sign-ups.
        </div>
      ) : signups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
          <FaMusic className="text-slate-200 mx-auto mb-2" size={28} />
          <p className="text-sm font-semibold text-slate-400">No one has signed up for music classes yet.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500 font-bold mb-3">
            {signups.length} member{signups.length !== 1 ? 's' : ''} interested
          </p>
          <div className="space-y-2.5">
            {signups.map((s, i) => (
              <div
                key={`${s.phone}-${i}`}
                className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3.5 hover:shadow-md transition-shadow"
              >
                <span className="flex items-center gap-2.5 text-sm font-bold text-slate-800 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                    <FaUser size={12} />
                  </span>
                  <span className="truncate">{s.full_name}</span>
                </span>
                <a
                  href={`tel:${String(s.phone).replace(/[^+0-9]/g, '')}`}
                  className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors shrink-0"
                  title={`Call ${s.full_name}`}
                >
                  <FaPhone size={11} />
                  {s.phone}
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CommunityAdminMusicClass;

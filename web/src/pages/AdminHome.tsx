// web/src/pages/AdminHome.tsx

import { useOutletContext } from 'react-router-dom';
import type { AppUserProfile } from '../data/users';

type Ctx = { profile: AppUserProfile };

export default function AdminHome() {
  const { profile } = useOutletContext<Ctx>();

  return (
    <div style={{ padding: '1rem', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <h1>Admin</h1>
      <p>
        Signed in as <strong>{profile.email ?? '(no email found)'}</strong> — role:{' '}
        <strong>{profile.role ?? '(none)'}</strong>
      </p>

      <hr style={{ margin: '1.25rem 0' }} />

      <h2>Ingestion</h2>
      <p>(Placeholder) Controls and job runs will live here.</p>

      <h2>Edits</h2>
      <p>(Placeholder) Admin editing tools will live here.</p>

      <h2>Users</h2>
      <p>(Placeholder) Role management will live here.</p>
    </div>
  );
}

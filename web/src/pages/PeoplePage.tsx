// web/src/pages/PeoplePage.tsx

import { Link } from 'react-router-dom';

export default function PeoplePage() {
  return (
    <div>
      <h1>My Politicians</h1>
      <p>
        Placeholder. This will become the campaign finance + ethics profiles explorer.
      </p>

      <p style={{ marginTop: '1rem' }}>
        Next step idea: pick your town first on <Link to="/town">My Town</Link>.
      </p>
    </div>
  );
}

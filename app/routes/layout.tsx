import { Outlet } from 'react-router';
import SiteLayout from '~/components/Layout';

export default function LayoutRoute() {
  return (
    <SiteLayout>
      <Outlet />
    </SiteLayout>
  );
}

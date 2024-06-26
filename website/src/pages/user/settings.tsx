import dynamic from 'next/dynamic';

import Metadata from '@/components/Metadata';

const UserSettingsDynamic = dynamic(
  () => import('@/components/User/UserSettings'),
  { ssr: false },
);

const UserSettings = () => {
  return (
    <>
      <Metadata title="User Settings | ApplicantAtlas" />
      <UserSettingsDynamic />
    </>
  );
};

export default UserSettings;

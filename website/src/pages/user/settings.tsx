import dynamic from 'next/dynamic';

const UserSettingsDynamic = dynamic(
  () => import('@/components/User/UserSettings'),
  { ssr: false },
);

export default UserSettingsDynamic;

import { useNavigate } from 'react-router-dom';

export type RoleType = 'viewer' | 'manager';

export const RoleSelector = () => {
  const navigate = useNavigate();
  const handleRoleChange = (role: RoleType) => {
    const query = new URLSearchParams({ role });
    navigate(`/?${query}`);
  };

  return (
    <div className="h-screen grid place-content-center">
      <div>
        <h1 className="text-4xl text-center">
          Welcome to the Sales Dashboard! Please select your role
        </h1>
        <div className="flex justify-center mt-8">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
            onClick={() => handleRoleChange('viewer')}
          >
            Viewer
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => handleRoleChange('manager')}
          >
            Manager
          </button>
        </div>
      </div>
    </div>
  );
};

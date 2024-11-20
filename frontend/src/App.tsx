import { SalesDashboard } from './components/SalesDashboard';
import { RoleSelector, RoleType } from './components/RoleSelector';
import { useSearchParams } from 'react-router-dom';

function App() {
  const [queryParams] = useSearchParams();
  const role = queryParams.get('role') as RoleType;

  return (
    <main className="container mx-auto mt-8">
      {role ? <SalesDashboard role={role} /> : <RoleSelector />}
    </main>
  );
}

export default App;

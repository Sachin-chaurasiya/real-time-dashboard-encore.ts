import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { dashboard } from '../lib/client';
import { v4 as uuidv4 } from 'uuid';
import getRequestClient from '../lib/getRequestClient';
import { RoleType } from './RoleSelector';
import SalesTable from './SalesTable';
import SalesMetrics from './SalesMetrics';
import GenerateSales from './GenerateSales';

interface SalesDashboardProps {
  role: RoleType;
}

export const SalesDashboard: FC<SalesDashboardProps> = ({ role }) => {
  const saleStream =
    useRef<
      Awaited<ReturnType<typeof dashboard.ServiceClient.prototype.sale>>
    >();

  const [userID] = useState<string>(uuidv4());
  const [loading, setLoading] = useState(true);
  const [recentSalesData, setRecentSalesData] = useState<dashboard.Sale[]>([]);
  const [salesData, setSalesData] = useState<dashboard.Sale[]>([]);

  const { isManager, roleLabel } = useMemo(() => {
    const isManager = role === 'manager';

    const roleLabel = isManager ? 'Manager' : 'Viewer';

    return { isManager, roleLabel };
  }, [role]);

  const { recentSales, combinedSales } = useMemo(() => {
    const combinedSales = [...salesData, ...recentSalesData];

    const recentSales = combinedSales.slice(-5).reverse(); // Show the last 5 sales

    return {
      recentSales,
      combinedSales,
    };
  }, [salesData, recentSalesData]);

  const fetchSales = async () => {
    try {
      const { sales } = await getRequestClient().dashboard.listSales();
      setSalesData(sales);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  useEffect(() => {
    const connect = async () => {
      setLoading(true);
      saleStream.current = await getRequestClient().dashboard.sale({
        id: userID,
      });
      saleStream.current.socket.on('close', connect);
      saleStream.current.socket.on('open', () => setLoading(false));

      for await (const sale of saleStream.current) {
        setRecentSalesData((prevState) => {
          return [...prevState, sale];
        });
      }
    };

    connect();
    return () => {
      saleStream.current?.socket.off('close', connect);
      saleStream.current?.close();
    };
  }, [userID]);

  useEffect(() => {
    fetchSales();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl font-extrabold">
          Welcome to the Live Dashboard, {roleLabel}!
        </h1>
        <p className="mt-2 text-lg">
          Here you can monitor and manage all your sales data in real-time.
        </p>
      </div>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          {isManager && <GenerateSales />}

          <SalesMetrics
            salesData={salesData}
            recentSalesData={recentSalesData}
          />

          <div className="mb-8 p-4 bg-blue-100 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Recent Sales</h2>
            <SalesTable salesData={recentSales} />
          </div>

          <div className="mb-8 p-4 bg-blue-100 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">All Time Sales</h2>
            <SalesTable salesData={combinedSales} />
          </div>
        </>
      )}
    </div>
  );
};

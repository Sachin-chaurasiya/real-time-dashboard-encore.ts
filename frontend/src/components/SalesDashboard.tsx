import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { dashboard } from '../lib/client';
import { v4 as uuidv4 } from 'uuid';
import getRequestClient from '../lib/getRequestClient';
import { MOCK_SALES_DATA } from '../constant';
import { RoleType } from './RoleSelector';
import SalesTable from './SalesTable';
import SalesMetrics from './SalesMetrics';

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
  const [isGeneratingSales, setIsGeneratingSales] = useState(false);

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

  const handleGenerateSales = async () => {
    const uniqueID = uuidv4();
    const sendSalesData = async () => {
      for await (const sale of MOCK_SALES_DATA) {
        // Simulate a delay of 2 seconds between each sale
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await getRequestClient().dashboard.addSale({
          ...sale,
          id: uniqueID,
          sale: `${sale.sale} - ${new Date().toISOString()}`,
          date: new Date().toISOString().split('T')[0], // Format date as yyyy-mm-dd
        });
      }
    };

    setIsGeneratingSales(true);
    await sendSalesData();
    setIsGeneratingSales(false);
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
          {isManager && (
            <div className="flex gap-4 mb-8">
              <button
                disabled={isGeneratingSales}
                onClick={handleGenerateSales}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-300 disabled:cursor-not-allowed"
              >
                Generate Sales
              </button>
            </div>
          )}

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

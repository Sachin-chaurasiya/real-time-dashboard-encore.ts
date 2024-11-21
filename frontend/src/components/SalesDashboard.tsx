import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { dashboard, StreamInOut } from '../lib/client';
import { v4 as uuidv4 } from 'uuid';
import getRequestClient from '../lib/getRequestClient';
import { MOCK_SALES_DATA } from '../constant';
import { RoleType } from './RoleSelector';
import AddSaleForm from './AddSaleForm';

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
  const [salesData, setSalesData] = useState<dashboard.Sale[]>(
    MOCK_SALES_DATA.slice(0, 5)
  );
  const [showForm, setShowForm] = useState(false);
  const [isGeneratingSales, setIsGeneratingSales] = useState(false);

  const { isManager, roleLabel } = useMemo(() => {
    const isManager = role === 'manager';

    const roleLabel = isManager ? 'Manager' : 'Viewer';

    return { isManager, roleLabel };
  }, [role]);

  const {
    totalSalesAmount,
    distinctSalesCount,
    averageSaleAmount,
    highestSale,
    lowestSale,
    recentSales,
  } = useMemo(() => {
    const totalSalesAmount = salesData.reduce(
      (acc, sale) => acc + sale.total,
      0
    );
    const distinctSalesCount = new Set(salesData.map((sale) => sale.sale)).size;
    const averageSaleAmount = (totalSalesAmount / salesData.length).toFixed(2);
    const highestSale = Math.max(...salesData.map((sale) => sale.total));
    const lowestSale = Math.min(...salesData.map((sale) => sale.total));
    const recentSales = salesData.slice(-5).reverse(); // Show the last 5 sales

    return {
      totalSalesAmount,
      distinctSalesCount,
      averageSaleAmount,
      highestSale,
      lowestSale,
      recentSales,
    };
  }, [salesData]);

  const handleAddSale = async (newSale: {
    sale: string;
    total: number;
    date: string;
  }) => {
    if (!saleStream.current || loading) return;

    saleStream.current.send(newSale);
  };

  const handleGenerateSales = async () => {
    if (!saleStream.current || loading) return;

    const sendSalesData = async (
      activeStream: StreamInOut<dashboard.PostSale, dashboard.Sale>
    ) => {
      for await (const sale of MOCK_SALES_DATA) {
        // Simulate a delay of 3 seconds between each sale
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await activeStream.send(sale);
      }
    };

    setIsGeneratingSales(true);
    await sendSalesData(saleStream.current);
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
        setSalesData((prevState) => {
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
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-300"
              >
                {showForm ? 'Cancel' : 'Add Sale'}
              </button>
              <button
                disabled={isGeneratingSales}
                onClick={handleGenerateSales}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-300"
              >
                Generate Sales
              </button>
            </div>
          )}

          {showForm && <AddSaleForm onAddSale={handleAddSale} />}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-blue-100 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-blue-800">
                Total Sales
              </h2>
              <p className="text-2xl font-bold text-blue-900">
                ${totalSalesAmount.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-blue-100 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-blue-800">
                Total Number of Distinct Sales
              </h2>
              <p className="text-2xl font-bold text-blue-900">
                {distinctSalesCount}
              </p>
            </div>
            <div className="p-4 bg-blue-100 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-blue-800">
                Average Sale Amount
              </h2>
              <p className="text-2xl font-bold text-blue-900">
                ${averageSaleAmount}
              </p>
            </div>
            <div className="p-4 bg-blue-100 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-blue-800">
                Highest Sale
              </h2>
              <p className="text-2xl font-bold text-blue-900">
                ${highestSale.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-blue-100 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-blue-800">
                Lowest Sale
              </h2>
              <p className="text-2xl font-bold text-blue-900">
                ${lowestSale.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mb-8 p-4 bg-blue-100 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Recent Sales</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-transparent">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Sale</th>
                    <th className="py-2 px-4 border-b text-left">Total Sale</th>
                    <th className="py-2 px-4 border-b text-left">
                      Date of Sale
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-100 transition-colors duration-200"
                    >
                      <td className="py-2 px-4 border-b">{sale.sale}</td>
                      <td className="py-2 px-4 border-b">${sale.total}</td>
                      <td className="py-2 px-4 border-b">{sale.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

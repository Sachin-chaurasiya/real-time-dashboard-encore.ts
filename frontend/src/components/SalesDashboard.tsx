import { useEffect, useRef, useState } from 'react';
import { dashboard } from '../lib/client';
import { v4 as uuidv4 } from 'uuid';
import getRequestClient from '../lib/getRequestClient';
import { MOCK_SALES_DATA } from '../constant';

export const SalesDashboard = () => {
  const saleStream =
    useRef<
      Awaited<ReturnType<typeof dashboard.ServiceClient.prototype.sale>>
    >();

  const [userID] = useState<string>(uuidv4());
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<dashboard.Sale[]>(MOCK_SALES_DATA);
  const [newSale, setNewSale] = useState({ sale: '', total: 0, date: '' });
  const [showForm, setShowForm] = useState(false);

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

  const handleAddSale = async () => {
    if (!saleStream.current || loading) return;

    if (Object.values(newSale).some((value) => value === '')) return;

    saleStream.current.send(newSale);

    setNewSale({ sale: '', total: 0, date: '' });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Live Sales Dashboard</h1>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          <button
            onClick={() => setShowForm(!showForm)}
            className="mb-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-300"
          >
            {showForm ? 'Cancel' : 'Add Sale'}
          </button>
          {showForm && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Add New Sale</h2>
              <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label className="mb-2 font-semibold text-gray-700">
                      Sale
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter sale item"
                        value={newSale.sale}
                        onChange={(e) =>
                          setNewSale({ ...newSale, sale: e.target.value })
                        }
                        className="border p-2 rounded w-full pl-10"
                      />
                      <span className="absolute left-3 top-2.5 text-gray-400">
                        <i className="fas fa-tag"></i>
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-2 font-semibold text-gray-700">
                      Total
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Enter total amount"
                        value={newSale.total}
                        onChange={(e) =>
                          setNewSale({
                            ...newSale,
                            total: Number(e.target.value),
                          })
                        }
                        className="border p-2 rounded w-full pl-10"
                      />
                      <span className="absolute left-3 top-2.5 text-gray-400">
                        <i className="fas fa-dollar-sign"></i>
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-2 font-semibold text-gray-700">
                      Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={newSale.date}
                        onChange={(e) =>
                          setNewSale({ ...newSale, date: e.target.value })
                        }
                        className="border p-2 rounded w-full pl-10"
                      />
                      <span className="absolute left-3 top-2.5 text-gray-400">
                        <i className="fas fa-calendar-alt"></i>
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleAddSale}
                  className="mt-4 bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition-colors duration-300"
                >
                  Add Sale
                </button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Sale</th>
                  <th className="py-2 px-4 border-b text-left">Total Sale</th>
                  <th className="py-2 px-4 border-b text-left">Date of Sale</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((sale, index) => (
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
        </>
      )}
    </div>
  );
};

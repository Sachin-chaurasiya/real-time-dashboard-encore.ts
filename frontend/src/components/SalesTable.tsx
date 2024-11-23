import { FC } from 'react';
import { dashboard } from '../lib/client';

interface SalesTableProps {
  salesData: dashboard.Sale[];
}

const SalesTable: FC<SalesTableProps> = ({ salesData }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-transparent">
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
  );
};

export default SalesTable;

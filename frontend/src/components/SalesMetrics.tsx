import { FC, useMemo } from 'react';
import { dashboard } from '../lib/client';

interface SalesMetricsProps {
  recentSalesData: dashboard.Sale[];
  salesData: dashboard.Sale[];
}

const SalesMetrics: FC<SalesMetricsProps> = ({
  salesData,
  recentSalesData,
}) => {
  const {
    totalSalesAmount,
    distinctSalesCount,
    averageSaleAmount,
    highestSale,
    lowestSale,
  } = useMemo(() => {
    const combinedSales = [...salesData, ...recentSalesData];
    const hasRecentSalesData = combinedSales.length > 0;
    const totalSalesAmount = combinedSales.reduce(
      (acc, sale) => acc + sale.total,
      0
    );
    const distinctSalesCount = new Set(combinedSales.map((sale) => sale.sale))
      .size;
    const averageSaleAmount = hasRecentSalesData
      ? (totalSalesAmount / combinedSales.length).toFixed(2)
      : 0;
    const highestSale = hasRecentSalesData
      ? Math.max(...combinedSales.map((sale) => sale.total))
      : 0;
    const lowestSale = hasRecentSalesData
      ? Math.min(...combinedSales.map((sale) => sale.total))
      : 0;

    return {
      totalSalesAmount,
      distinctSalesCount,
      averageSaleAmount,
      highestSale,
      lowestSale,
    };
  }, [salesData, recentSalesData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <div className="p-4 bg-blue-100 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-blue-800">Total Sales</h2>
        <p className="text-2xl font-bold text-blue-900">
          ${totalSalesAmount.toLocaleString()}
        </p>
      </div>
      <div className="p-4 bg-blue-100 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-blue-800">
          Total Number of Distinct Sales
        </h2>
        <p className="text-2xl font-bold text-blue-900">{distinctSalesCount}</p>
      </div>
      <div className="p-4 bg-blue-100 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-blue-800">
          Average Sale Amount
        </h2>
        <p className="text-2xl font-bold text-blue-900">${averageSaleAmount}</p>
      </div>
      <div className="p-4 bg-blue-100 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-blue-800">Highest Sale</h2>
        <p className="text-2xl font-bold text-blue-900">
          ${highestSale.toLocaleString()}
        </p>
      </div>
      <div className="p-4 bg-blue-100 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-blue-800">Lowest Sale</h2>
        <p className="text-2xl font-bold text-blue-900">
          ${lowestSale.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default SalesMetrics;

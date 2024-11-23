import { v4 as uuidv4 } from 'uuid';
import { MOCK_SALES_DATA } from '../constant';
import getRequestClient from '../lib/getRequestClient';

const GenerateSales = () => {
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

    await sendSalesData();
  };

  return (
    <div className="flex gap-4 mb-8">
      <button
        onClick={handleGenerateSales}
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-300"
      >
        Generate Sales
      </button>
    </div>
  );
};

export default GenerateSales;

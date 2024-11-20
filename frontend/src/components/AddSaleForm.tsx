import { FC, useState } from 'react';

interface AddSaleFormProps {
  onAddSale: (newSale: {
    sale: string;
    total: number;
    date: string;
  }) => Promise<void>;
}

const AddSaleForm: FC<AddSaleFormProps> = ({ onAddSale }) => {
  const [newSale, setNewSale] = useState({ sale: '', total: 0, date: '' });

  const handleAddSale = async () => {
    if (Object.values(newSale).some((value) => value === '')) return;

    await onAddSale(newSale);

    setNewSale({ sale: '', total: 0, date: '' });
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Add New Sale</h2>
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Sale</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter sale item"
                value={newSale.sale}
                onChange={(e) =>
                  setNewSale({ ...newSale, sale: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Total</label>
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
                className="border p-2 rounded w-full"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Date</label>
            <div className="relative">
              <input
                type="date"
                value={newSale.date}
                onChange={(e) =>
                  setNewSale({ ...newSale, date: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
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
  );
};

export default AddSaleForm;

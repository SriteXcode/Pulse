import React from 'react';

export default function CropDetailModal({ isOpen, onClose, record, attributeKeys, labels }) {
  if (!isOpen || !record) return null;

  const getAttributeData = (key) => {
    const lowerKey = key;
    const upperKey = lowerKey.charAt(0).toUpperCase() + lowerKey.slice(1);
    return record.attributes?.[lowerKey] || record.attributes?.[upperKey] || {};
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative my-8 animate-fade-in">
        <button 
          onClick={onClose}
          className="absolute top-2 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>
        
        <h2 className="text-2xl font-bold text-green-800 mb-6 border-b pb-2">
          {record.crop} - {record.variety}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-gray-700 uppercase text-sm tracking-wider">Basic Information</h3>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">{labels.crop}</p>
              <p className="font-medium">{record.crop}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">{labels.variety}</p>
              <p className="font-medium">{record.variety}</p>
            </div>
            {record.user && (
               <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-500">Submitted By</p>
                <p className="font-medium">{record.user.name || record.user.email}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-700 uppercase text-sm tracking-wider">Attributes</h3>
            <div className="grid grid-cols-1 gap-2">
              {attributeKeys.map(attr => {
                const data = getAttributeData(attr.key);
                return (
                  <div key={attr.key} className="border-l-4 border-green-500 bg-green-50 p-2">
                    <p className="text-xs font-bold text-green-800">{attr.label}</p>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-600">Avg: <span className="font-mono font-bold">{data.avg ?? "-"}</span></span>
                      <span className="text-sm text-gray-600">SD: <span className="font-mono font-bold">{data.sd ?? "-"}</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-700 hover:bg-green-800 text-white rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

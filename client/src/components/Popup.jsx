import React from 'react';

const Popup = ({ isOpen, message, type = 'alert', onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-80 max-w-sm animate-fade-in scale-100 transform transition-all">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
          {type === 'confirm' ? 'Confirm Action' : 'Notice'}
        </h3>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          {type === 'confirm' && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={type === 'confirm' ? onConfirm : onClose}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            {type === 'confirm' ? 'Confirm' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;

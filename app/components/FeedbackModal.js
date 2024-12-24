import React, { useState } from 'react';

export default function FeedbackModal({ isOpen, onClose, onSubmit }) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(reason);
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">¿Por qué no te gustó la respuesta?</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full p-2 border rounded-lg mb-4"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows="4"
            placeholder="Explica por qué no te gustó la respuesta..."
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
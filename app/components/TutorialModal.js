'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const steps = [
  {
    title: "Bienvenido al Editor de Flujos",
    content: "Esta herramienta te permite crear y modificar flujos de trabajo de forma conversacional.",
    image: "🎯"
  },
  {
    title: "Nodos",
    content: "Cada paso del flujo es un nodo. Los nodos representan acciones y están conectados entre sí.",
    image: "🔄"
  },
  {
    title: "Campos de Entrada y Salida",
    content: "Los nodos tienen campos de entrada (lo que necesitan) y campos de salida (lo que generan). Los campos de salida de un nodo pueden ser campos de entrada de otro.",
    image: "📥📤"
  },
  {
    title: "Chat Asistente",
    content: "Usa el chat para modificar el flujo. Puedes decir cosas como 'añade un nodo de validación' o 'necesito un nodo que guarde en base de datos'.",
    image: "💬"
  },
  {
    title: "Modo Ligero",
    content: "Si notas que la interfaz va lenta, puedes activar el modo ligero para desactivar las animaciones.",
    image: "🚀"
  }
];

export default function TutorialModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorialAgain, setShowTutorialAgain] = useState(true);

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Tutorial</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl mb-4">{steps[currentStep].image}</div>
              <h3 className="text-xl font-medium mb-2">{steps[currentStep].title}</h3>
              <p className="text-gray-600">{steps[currentStep].content}</p>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showAgain"
                  checked={showTutorialAgain}
                  onChange={(e) => setShowTutorialAgain(e.target.checked)}
                  className="rounded text-green-500 focus:ring-green-500"
                />
                <label htmlFor="showAgain" className="text-sm text-gray-600">
                  Mostrar tutorial al inicio
                </label>
              </div>
              
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Anterior
                  </button>
                )}
                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="px-4 py-2 text-sm text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                  >
                    Finalizar
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 
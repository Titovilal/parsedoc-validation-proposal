import { useState } from 'react';
import { Copy, Code, ArrowRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResource } from '../contexts/ResourceContext';
import FieldBadges from './FieldBadges';

export default function ProcessFlow({ flow, fields }) {
  const [showCode, setShowCode] = useState(false);
  const [showFields, setShowFields] = useState(false);
  const { lowResources } = useResource();

  const copyToClipboard = () => {
    const flowString = JSON.stringify(flow, null, 2);
    navigator.clipboard.writeText(flowString);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const renderVariable = (varName, field, isInput) => {
    if (field) {
      return (
        <div
          key={field.id}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md border ${
            isInput 
              ? 'bg-green-50 text-green-700 border-green-100'
              : 'bg-blue-50 text-blue-700 border-blue-100'
          }`}
        >
          {field.type === 'text' ? '📝' : '📅'}
          <span>{field.label}</span>
        </div>
      );
    }
    return (
      <div
        key={varName}
        className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md border ${
          isInput 
            ? 'bg-green-50/50 text-green-700 border-green-100'
            : 'bg-blue-50/50 text-blue-700 border-blue-100'
        }`}
      >
        <span>🔄</span>
        <span>{varName}</span>
      </div>
    );
  };

  return (
    <div className="h-full bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-100/50 p-6 border border-gray-100 flex flex-col">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-2xl font-semibold text-gray-800">
          Flujo del Proceso
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFields(!showFields)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
          >
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${showFields ? 'rotate-180' : ''}`}
            />
            <span className="text-sm">Campos</span>
          </button>
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
          >
            <Code className="w-4 h-4" />
            <span className="text-sm">Ver código</span>
          </button>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 hover:bg-green-200 transition-colors text-green-700"
          >
            <Copy className="w-4 h-4" />
            <span className="text-sm">Copiar JSON</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFields && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="border-b border-gray-100 pb-6">
              <FieldBadges fields={fields} hideTitle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden flex-shrink-0"
          >
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded-xl">
              <pre className="bg-gray-900 text-gray-100 p-4 text-sm">
                <code>{JSON.stringify(flow, null, 2)}</code>
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 min-h-0 overflow-hidden">
        <motion.div
          className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2"
          variants={!lowResources ? containerVariants : {}}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="popLayout">
            {flow.map((step, index) => (
              <motion.div
                key={step.id}
                className="w-full mb-4 last:mb-0"
                variants={!lowResources ? itemVariants : {}}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, x: -100 }}
                layout
              >
                <div className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md hover:border-green-100 transition-all duration-200 border border-gray-100">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                        <span className="text-lg">{step.icon}</span>
                      </div>
                      <span className="text-gray-700 text-sm font-medium">{step.content}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1 flex flex-wrap justify-end gap-1">
                        {step.variables?.input.map((varName) => {
                          const field = fields.find(f => f.id === varName);
                          return renderVariable(varName, field, true);
                        })}
                      </div>

                      <div className="w-px h-8 bg-gray-100"></div>

                      <div className="flex-1 flex flex-wrap gap-1">
                        {step.variables?.output.map((varName) => {
                          const field = fields.find(f => f.id === varName);
                          return renderVariable(varName, field, false);
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                
                {index < flow.length - 1 && (
                  <motion.div 
                    className="flex justify-center my-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <div className="h-6 w-px bg-gray-200"></div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
} 
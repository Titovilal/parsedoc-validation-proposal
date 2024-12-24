'use client';
import { useState } from 'react';
import { useChat } from '../hooks/useChat';
import FeedbackModal from '../components/FeedbackModal';
import Chat from '../components/Chat';
import ProcessFlow from '../components/ProcessFlow';

export default function Demo() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(null);
  
  const [flow, setFlow] = useState([
    { 
      id: 1, 
      content: 'Actualizar registro en HubSpot', 
      icon: '🔄',
      variables: {
        input: ['nombre', 'cif', "paco"],
        output: ['hubspot_id']
      }
    },
    { 
      id: 2, 
      content: 'Obtener información del producto', 
      icon: '🔍',
      variables: {
        input: ['hubspot_id'],
        output: ['product_info']
      }
    },
    { 
      id: 3, 
      content: 'Buscar interacción de soporte', 
      icon: '💬',
      variables: {
        input: ['hubspot_id', 'product_info'],
        output: ['support_interaction']
      }
    }
  ]);

  const updateFlow = (newSteps) => {
    setFlow(newSteps.map((step, index) => ({
      id: index + 1,
      content: step.content,
      icon: step.icon || '▶️'
    })));
  };

  const fields = [
    { id: 'nombre', label: 'Nombre', type: 'text', value: '' },
    { id: 'fecha', label: 'Fecha', type: 'date', value: '' },
    { id: 'cif', label: 'CIF', type: 'text', value: '' }
  ];

  const {
    messages,
    input,
    setInput,
    isLoading,
    partialResponse,
    sendMessage,
    submitFeedback
  } = useChat({
    flow,
    updateFlow
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleFeedback = (index, isPositive) => {
    if (!isPositive) {
      setSelectedMessageIndex(index);
      setModalOpen(true);
    } else {
      submitFeedback(index, true);
    }
  };

  const handleModalSubmit = (reason) => {
    submitFeedback(selectedMessageIndex, false, reason);
  };

  return (
    <div className="min-h-screen p-2 sm:p-2 bg-gray-100">
      <div className="flex gap-2 h-[calc(100vh-1rem)]">
        <Chat 
          messages={messages}
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          partialResponse={partialResponse}
          handleSubmit={handleSubmit}
          handleFeedback={handleFeedback}
        />

        <div className="w-2/3 h-full">
          <ProcessFlow 
            flow={flow} 
            fields={fields}
          />
        </div>
      </div>

      <FeedbackModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
} 

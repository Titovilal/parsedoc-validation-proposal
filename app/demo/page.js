'use client';
import { useState } from 'react';
import { useChat } from '../hooks/useChat';
import FeedbackModal from '../components/FeedbackModal';
import Chat from '../components/Chat';
import ProcessFlow from '../components/ProcessFlow';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle
} from 'react-resizable-panels';
import { GripVertical } from 'lucide-react';

const ResizeHandle = () => {
  return (
    <PanelResizeHandle className="relative group">
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4 group-hover:w-6 
        flex items-center justify-center transition-all cursor-col-resize">
        <GripVertical className="absolute text-gray-400 F
          transition-opacity w-4 h-4" />
      </div>
    </PanelResizeHandle>
  );
};

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
      icon: step.icon || '▶️',
      variables: {
        input: step.variables?.input || [],
        output: step.variables?.output || []
      }
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
    submitFeedback,
    clearChat
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
      <PanelGroup direction="horizontal" className="h-[calc(100vh-1rem)]">
        <Panel 
          defaultSize={33} 
          minSize={33}
        >
          <div className="h-[calc(100vh-1rem)]">
            <Chat 
              messages={messages}
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              partialResponse={partialResponse}
              handleSubmit={handleSubmit}
              handleFeedback={handleFeedback}
              clearChat={clearChat}
            />
          </div>
        </Panel>

        <ResizeHandle />

        <Panel minSize={40}>
          <div className="h-[calc(100vh-1rem)]">
            <ProcessFlow 
              flow={flow} 
              fields={fields}
            />
          </div>
        </Panel>
      </PanelGroup>

      <FeedbackModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
} 

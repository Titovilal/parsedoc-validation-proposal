import { useState } from 'react';
import { useResource } from '../contexts/ResourceContext';

export function useChat({ flow, updateFlow }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [partialResponse, setPartialResponse] = useState('');
  const { lowResourceMode } = useResource();

  // Nuevo estado para guardar el historial de estados del flow
  const [flowHistory, setFlowHistory] = useState([flow]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Función auxiliar para encontrar JSON válido en un string
  const findJsonInString = (str) => {
    let depth = 0;
    let startIndex = -1;
    let jsonObjects = [];

    for (let i = 0; i < str.length; i++) {
      if (str[i] === '{') {
        if (depth === 0) startIndex = i;
        depth++;
      } else if (str[i] === '}') {
        depth--;
        if (depth === 0 && startIndex !== -1) {
          const potentialJson = str.substring(startIndex, i + 1);
          try {
            const parsed = JSON.parse(potentialJson);
            // Validar estructura básica
            if (parsed.type === 'flow_update' && Array.isArray(parsed.steps)) {
              // Validar y normalizar cada paso
              const validSteps = parsed.steps.every(step => 
                step.content && 
                step.icon && 
                step.variables &&
                Array.isArray(step.variables.input) &&
                Array.isArray(step.variables.output)
              );

              if (validSteps) {
                console.log('JSON válido encontrado:', parsed);
                jsonObjects.push({ json: parsed, string: potentialJson });
              } else {
                console.log('JSON con estructura inválida:', parsed);
              }
            }
          } catch (e) {
            console.log('Error parsing JSON:', e);
          }
        }
      }
    }
    return jsonObjects;
  };

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    setIsLoading(true);
    const userMessage = { role: 'user', content: message };
    
    // Añadir el mensaje del usuario al estado
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Enviamos todos los mensajes anteriores para mantener el contexto
          messages: [...messages, userMessage],
          flow,
          lowResourceMode
        }),
      });

      if (!response.ok) throw new Error('Error en la respuesta');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulatedResponse += chunk;
        
        setPartialResponse(accumulatedResponse);

        // Buscar y procesar JSON en la respuesta
        const jsonObjects = findJsonInString(accumulatedResponse);
        for (const { json, string } of jsonObjects) {
          if (json.type === 'flow_update') {
            updateFlow(json.steps);
            accumulatedResponse = accumulatedResponse.replace(string, '');
            setPartialResponse(accumulatedResponse);
          }
        }
      }

      // Añadir la respuesta completa del asistente
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: accumulatedResponse.trim() 
      }]);
      setPartialResponse('');

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Lo siento, ha ocurrido un error al procesar tu mensaje.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = (messageIndex, isPositive, reason = '') => {
    setMessages(prev => prev.map((msg, i) => 
      i === messageIndex ? { ...msg, feedback: isPositive, reason } : msg
    ));
  };

  const clearChat = () => {
    setMessages([]);
    setInput('');
    setPartialResponse('');
    setIsLoading(false);
  };

  // Modificar updateFlow para guardar el historial
  const handleFlowUpdate = (newSteps) => {
    const newFlow = newSteps.map((step, index) => ({
      id: index + 1,
      content: step.content,
      icon: step.icon || '▶️',
      variables: {
        input: step.variables?.input || [],
        output: step.variables?.output || []
      }
    }));

    updateFlow(newFlow);
    setFlowHistory(prev => [...prev.slice(0, historyIndex + 1), newFlow]);
    setHistoryIndex(prev => prev + 1);
  };

  const undoToMessage = (messageIndex) => {
    // Retrocedemos al estado del flow anterior al mensaje seleccionado
    const previousFlowState = flowHistory[messageIndex - 1] || flow;
    if (previousFlowState) {
      updateFlow(previousFlowState);
      setHistoryIndex(messageIndex - 1);
    }
    // Eliminamos todos los mensajes desde el mensaje seleccionado (inclusive)
    setMessages(prev => prev.slice(0, messageIndex));
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    partialResponse,
    sendMessage,
    submitFeedback,
    clearChat,
    undoToMessage,
  };
} 
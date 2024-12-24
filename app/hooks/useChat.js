import { useState } from 'react';

export function useChat({ flow, updateFlow }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [partialResponse, setPartialResponse] = useState('');

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
            jsonObjects.push({ json: parsed, string: potentialJson });
          } catch (e) {}
        }
      }
    }
    return jsonObjects;
  };

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    setIsLoading(true);
    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          flow,
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
        
        // Actualizar el mensaje parcial
        setPartialResponse(accumulatedResponse);

        // Buscar y procesar JSON en la respuesta
        const jsonObjects = findJsonInString(accumulatedResponse);
        for (const { json, string } of jsonObjects) {
          console.log('JSON encontrado:', json); // Log para depuración
          if (json.type === 'flow_update') {
            console.log('Actualizando flow con:', json.steps); // Log para depuración
            updateFlow(json.steps);
            // Limpiar el JSON del mensaje
            accumulatedResponse = accumulatedResponse.replace(string, '');
            setPartialResponse(accumulatedResponse);
          }
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: accumulatedResponse.trim() }]);
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

  return {
    messages,
    input,
    setInput,
    isLoading,
    partialResponse,
    sendMessage,
    submitFeedback,
  };
} 
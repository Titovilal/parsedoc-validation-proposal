'use client';
import { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ThumbsUp, ThumbsDown, Trash2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MessageContent = ({ content }) => (
  <div className="prose prose-sm max-w-none">
    <ReactMarkdown>{content}</ReactMarkdown>
  </div>
);

export default function Chat({ 
  messages, 
  input, 
  setInput, 
  isLoading, 
  partialResponse, 
  handleSubmit, 
  handleFeedback,
  clearChat,
  lowResourceMode,
  toggleLowResourceMode,
  undoToMessage
}) {
  const chatContainerRef = useRef(null);

  const messageVariants = !lowResourceMode ? {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -100 }
  } : {};

  return (
    <div className="h-full bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-100/50 p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">Chat</h2>
          <button
            onClick={clearChat}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 
            bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200 border border-red-100 
            hover:border-red-200 shadow-sm hover:shadow active:scale-95"
          >
           <Trash2 className="h-5 w-5" />
            Limpiar chat
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Bajos recursos</span>
          <button
            onClick={toggleLowResourceMode}
            className={`w-12 h-6 rounded-full transition-colors ${
              lowResourceMode ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <motion.div
              className="w-5 h-5 bg-white rounded-full shadow-md"
              animate={{ x: lowResourceMode ? 24 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="h-[calc(100%-7rem)] overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              variants={messageVariants}
              initial={!lowResourceMode ? "hidden" : false}
              animate={!lowResourceMode ? "visible" : false}
              exit={!lowResourceMode ? "exit" : false}
              layout={!lowResourceMode}
              className={`p-4 rounded-2xl backdrop-blur-sm transition-all duration-200 ${
                message.role === 'user' 
                  ? 'bg-green-50 ml-auto max-w-[80%] hover:shadow-md border border-green-100' 
                  : 'bg-white mr-auto max-w-[80%] hover:shadow-md border border-gray-100'
              }`}
            >
              <MessageContent content={message.content} />
              {message.role === 'assistant' && (
                <motion.div 
                  initial={!lowResourceMode ? { opacity: 0 } : false}
                  animate={!lowResourceMode ? { opacity: 1 } : false}
                  className="mt-2 flex gap-2"
                >
                  <button
                    onClick={() => handleFeedback(index, true)}
                    className={`p-1 rounded-full hover:bg-gray-100 transition-all ${
                      message.feedback === true ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <ThumbsUp className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleFeedback(index, false)}
                    className={`p-1 rounded-full hover:bg-gray-100 transition-all ${
                      message.feedback === false ? 'text-red-600' : 'text-gray-400'
                    }`}
                  >
                    <ThumbsDown className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => undoToMessage(index)}
                    className="p-1 rounded-full hover:bg-gray-100 transition-all text-gray-400 hover:text-orange-500"
                    title="Deshacer hasta este mensaje"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {partialResponse && (
          <motion.div
            initial={!lowResourceMode ? { opacity: 0, y: 20 } : false}
            animate={!lowResourceMode ? { opacity: 1, y: 0 } : false}
            className="bg-white p-4 rounded-2xl mr-auto max-w-[80%] border border-gray-100"
          >
            <MessageContent content={partialResponse} />
          </motion.div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-3 border border-gray-200 rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
          placeholder="Escribe tu mensaje..."
        />
        <motion.button
          type="submit"
          disabled={isLoading}
          whileTap={!lowResourceMode ? { scale: 0.95 } : false}
          className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all disabled:bg-green-300 shadow-lg shadow-green-600/10 hover:shadow-xl hover:shadow-green-600/20"
        >
          Enviar
        </motion.button>
      </form>
    </div>
  );
} 
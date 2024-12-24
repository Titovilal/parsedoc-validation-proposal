import Groq from "groq-sdk";
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { messages, flow } = await req.json();
    console.log('🔵 Flow recibido:', flow);

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const systemMessage = {
      role: "system",
      content: `Eres un asistente que ayuda a gestionar flujos de trabajo. Solo modificarás el flujo cuando el usuario te lo pida específicamente.

      Si el usuario te pide modificar el flujo, primero explica los cambios que harás y luego envía el JSON con la actualización en este formato:
      {
        "type": "flow_update",
        "steps": [
          {
            "content": "Nuevo paso",
            "icon": "🔄",
            "variables": {
              "input": ["variable1", "variable2"],
              "output": ["resultado1", "resultado2"]
            }
          }
        ]
      }
      
      El flujo actual es: ${JSON.stringify(flow, null, 2)}
      
      Instrucciones importantes:
      1. NO modifiques el flujo a menos que el usuario lo solicite explícitamente
      2. Si te piden modificar el flujo, primero explica los cambios
      3. Usa emojis relevantes como iconos para cada paso
      4. Mantén la estructura del JSON exactamente como se muestra arriba
      5. Incluye siempre las variables de entrada y salida para cada paso
      6. Asegúrate de que las variables de salida de un paso estén disponibles como entrada para los pasos siguientes
      
      Para cualquier otra pregunta o consulta, responde normalmente sin modificar el flujo.`
    };

    const allMessages = [systemMessage, ...messages];
    console.log('📨 Enviando mensajes a Groq:', allMessages);

    try {
      const stream = await groq.chat.completions.create({
        messages: allMessages,
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        max_tokens: 1024,
        stream: true,
      });

      console.log('✅ Stream iniciado correctamente');

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              if (chunk.choices && chunk.choices[0]?.delta?.content) {
                const text = chunk.choices[0].delta.content;
                if (text.includes('"type": "flow_update"')) {
                  console.log('🔄 Detectada actualización de flow en chunk:', text);
                }
                controller.enqueue(encoder.encode(text));
              }
            }
            console.log('✅ Stream completado correctamente');
            controller.close();
          } catch (error) {
            console.error('❌ Error en el stream:', error);
            controller.error(error);
          }
        },
        cancel() {
          console.log('🚫 Stream cancelado');
        }
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (streamError) {
      console.error('❌ Error en el streaming:', streamError);
      return NextResponse.json(
        { error: 'Error en el streaming: ' + streamError.message },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('❌ Error general:', error);
    return NextResponse.json(
      { error: 'Error procesando la solicitud: ' + error.message },
      { status: 500 }
    );
  }
} 
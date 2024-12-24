import Groq from "groq-sdk";
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { messages, flow } = await req.json();
    console.log('🔵 Flow recibido:', flow);

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const systemPrompt = `Eres un asistente especializado en gestionar flujos de trabajo. Tu función es ayudar a mantener y modificar flujos de procesos.

El flujo actual está compuesto por nodos. Cada nodo representa un paso del proceso y tiene:
- Un nombre que describe la acción
- Un icono representativo
- Campos de entrada (variables que necesita)
- Campos de salida (variables que genera)

El flujo actual es: ${JSON.stringify(flow, null, 2)}

IMPORTANTE: Cuando necesites actualizar el flujo, SIEMPRE debes devolver un JSON con este formato exacto:

{
  "type": "flow_update",
  "steps": [
    {
      "content": "Nombre del nodo",
      "icon": "🔄",
      "variables": {
        "input": ["campo_entrada1", "campo_entrada2"],
        "output": ["campo_salida1"]
      }
    }
  ]
}

REGLAS IMPORTANTES:
1. Cada nodo DEBE incluir campos de entrada (input) y campos de salida (output) como arrays
2. Los campos pueden ser:
   - Campos existentes del formulario: 'nombre', 'fecha', 'cif'
   - Campos generados por nodos anteriores
   - Nuevos campos necesarios para el proceso
3. Si un nodo necesita un campo generado por un nodo anterior, debe incluirlo en sus campos de entrada
4. Cada nodo debe generar al menos un campo de salida
5. Los nombres de los campos deben ser descriptivos y en minúsculas
6. Usa emojis relevantes como iconos para cada nodo:
   - 🔄 para actualizaciones
   - 📝 para escritura
   - 🔍 para búsquedas
   - ✅ para validaciones
   - 💾 para guardado
   - 📊 para análisis

Para cualquier otra consulta que no implique modificar el flujo, responde normalmente como un asistente helpful.

Recuerda: Los usuarios se referirán a los pasos como "nodos" y a las variables como "campos de entrada/salida".`;

    const allMessages = [{ role: "system", content: systemPrompt }, ...messages];
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
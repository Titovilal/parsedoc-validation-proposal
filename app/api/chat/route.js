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

El flujo actual es: ${JSON.stringify(flow, null, 2)}

IMPORTANTE: Cuando necesites actualizar el flujo, SIEMPRE debes devolver un JSON con este formato exacto:

{
  "type": "flow_update",
  "steps": [
    {
      "content": "Nombre del paso",
      "icon": "🔄",
      "variables": {
        "input": ["variable1", "variable2"],
        "output": ["variable3"]
      }
    }
  ]
}

REGLAS IMPORTANTES:
1. Cada paso DEBE incluir las propiedades 'variables.input' y 'variables.output' como arrays
2. Las variables pueden ser:
   - Campos existentes: 'nombre', 'fecha', 'cif'
   - Variables generadas en pasos anteriores
   - Nuevas variables necesarias para el proceso
3. Si un paso necesita una variable generada en un paso anterior, debe incluirla en su array 'input'
4. Cada paso debe generar al menos una variable en su array 'output'
5. Los nombres de las variables deben ser descriptivos y en minúsculas
6. Usa emojis relevantes como iconos para cada paso:
   - 🔄 para actualizaciones
   - 📝 para escritura
   - 🔍 para búsquedas
   - ✅ para validaciones
   - 💾 para guardado
   - 📊 para análisis

Para cualquier otra consulta que no implique modificar el flujo, responde normalmente como un asistente helpful.

Ejemplo de respuesta con actualización:
"Voy a actualizar el flujo para incluir la validación del CIF.

{
  \\"type\\": \\"flow_update\\",
  \\"steps\\": [
    {
      \\"content\\": \\"Validar CIF\\",
      \\"icon\\": \\"✅\\",
      \\"variables\\": {
        \\"input\\": [\\"cif\\"],
        \\"output\\": [\\"cif_validado\\"]
      }
    },
    {
      \\"content\\": \\"Actualizar registro en HubSpot\\",
      \\"icon\\": \\"🔄\\",
      \\"variables\\": {
        \\"input\\": [\\"nombre\\", \\"cif_validado\\"],
        \\"output\\": [\\"hubspot_id\\"]
      }
    }
  ]
}"`;

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
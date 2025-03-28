// server.ts
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { type ConnInfo } from "https://deno.land/std@0.201.0/http/server.ts";

// --- Interfaces ---
interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIChatCompletionRequest {
  model: string;
  messages: OpenAIMessage[];
  stream?: boolean;
  // Add other potential OpenAI parameters if needed (temperature, max_tokens, etc.)
}

// --- Configuration ---
// const AUTH_TOKEN = Deno.env.get("AUTH_TOKEN") || "sk-你的鉴权密钥"; // Authentication ignored as requested
const TARGET_API = "https://www.deepseek.cloudns.org/api/chat";
const MODELS = [
  "gemini-2.0-flash-exp",
  "gemini-2.0-pro-exp-02-05",
  "gemini-2.0-flash-thinking-exp-01-21",
];

/**
 * Generates a standard OpenAI models list response.
 */
function generateModelsResponse() {
  const timestamp = Math.floor(Date.now() / 1000);
  return {
    object: "list",
    data: MODELS.map((model, index) => ({
      id: model,
      object: "model",
      created: timestamp - index, // Simple timestamp variation
      owned_by: "clouddns", // Or appropriate owner
    })),
  };
}

/**
 * Extracts a structured prompt string from the message history.
 * Adapts OpenAI messages format to the target API's expected format.
 * @param messages - Array of OpenAI message objects.
 * @returns A string representation of the conversation history.
 */
function extractUserPrompt(messages: OpenAIMessage[]): string {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "";
  }

  // This implementation concatenates messages with roles.
  // Verify if TARGET_API expects this exact format in its 'message' field.
  // An alternative might be just the last user message:
  // return messages.slice().reverse().find(m => m.role === "user")?.content || "";

  let prompt = "";
  for (const msg of messages) {
    // Only include messages with actual content
    if (msg.content) {
      switch (msg.role) {
        case "system":
          prompt += `系统: ${msg.content}\n`;
          break;
        case "user":
          prompt += `用户: ${msg.content}\n`;
          break;
        case "assistant":
          prompt += `助手: ${msg.content}\n`;
          break;
        // Ignore other potential roles
      }
    }
  }
  return prompt.trim();
}

/**
 * Handles the /v1/chat/completions endpoint.
 * @param req - The incoming Request object.
 * @param body - The parsed JSON request body.
 */
async function handleChatCompletion(req: Request, body: OpenAIChatCompletionRequest) {
  const stream = Boolean(body.stream);
  const model = body.model || MODELS[0]; // Default to first model if not specified
  const messages = body.messages || [];

  const userPrompt = extractUserPrompt(messages);

  if (!userPrompt) {
    return new Response(
      JSON.stringify({ error: { message: "No valid user message content found", type: "invalid_request_error", param: "messages", code: null } }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  console.log(`[${new Date().toISOString()}] Processing request for model: ${model} (Stream: ${stream})`);
  console.log(`[${new Date().toISOString()}] User prompt (first 100 chars): ${userPrompt.substring(0, 100)}${userPrompt.length > 100 ? '...' : ''}`);

  try {
    // Forward request to the target API
    const upstreamResponse = await fetch(TARGET_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add potential Authorization header for TARGET_API if needed
        // "Authorization": `Bearer ${TARGET_API_KEY}`
      },
      // This body structure depends entirely on TARGET_API's expectations
      body: JSON.stringify({ message: userPrompt, model: model }),
    });

    if (!upstreamResponse.ok) {
      const errorBody = await upstreamResponse.text();
      console.error(`[${new Date().toISOString()}] Upstream API error: ${upstreamResponse.status} ${upstreamResponse.statusText}`, errorBody);
      return new Response(
        JSON.stringify({
          error: {
             message: `Upstream API error: ${upstreamResponse.status} ${upstreamResponse.statusText}`,
             type: "upstream_error",
             details: errorBody, // Include upstream error body if helpful
             code: upstreamResponse.status
          }
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }, // 502 Bad Gateway
      );
    }

    // Assuming upstream returns JSON like { message: "response text" }
    const data = await upstreamResponse.json();

    if (typeof data.message !== 'string') {
      console.error(`[${new Date().toISOString()}] Invalid response format from upstream API:`, data);
      return new Response(
        JSON.stringify({ error: { message: "Invalid response format from upstream API", type: "upstream_error", code: null } }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    const responseMessage = data.message;
    const responseId = `chatcmpl-${crypto.randomUUID()}`; // Use crypto.randomUUID for better IDs
    const createdTimestamp = Math.floor(Date.now() / 1000);

    console.log(`[${new Date().toISOString()}] Received response (first 100 chars): ${responseMessage.substring(0, 100)}${responseMessage.length > 100 ? '...' : ''}`);

    // --- Handle Streaming Response ---
    if (stream) {
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          // 1. Send initial chunk with role
          const startChunk = {
            id: responseId,
            object: "chat.completion.chunk",
            created: createdTimestamp,
            model: model,
            choices: [{
              index: 0,
              delta: { role: "assistant", content: null }, // Standard practice: role in first delta
              finish_reason: null,
            }],
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(startChunk)}\n\n`));

          // 2. Simulate streaming by chunking the complete response
          // Note: This is simulation. Real streaming would pipe chunks from upstream if available.
          const chunkSize = 10; // Adjust chunk size as needed
          for (let i = 0; i < responseMessage.length; i += chunkSize) {
            const chunkContent = responseMessage.slice(i, Math.min(i + chunkSize, responseMessage.length));
            const deltaChunk = {
              id: responseId,
              object: "chat.completion.chunk",
              created: Math.floor(Date.now() / 1000), // Can update timestamp per chunk
              model: model,
              choices: [{
                delta: { content: chunkContent },
                index: 0,
                finish_reason: null,
              }],
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(deltaChunk)}\n\n`));

            // Optional delay to make the simulated stream feel more "real"
            // Remove or adjust this in production
            await new Promise(resolve => setTimeout(resolve, 10));
          }

          // 3. Send the final chunk with finish_reason
          const endChunk = {
            id: responseId,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: model,
            choices: [{
              delta: {}, // Empty delta in the final chunk
              index: 0,
              finish_reason: "stop", // Indicate completion
            }],
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(endChunk)}\n\n`));

          // 4. Send the stream termination marker
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));

          // 5. Close the stream
          controller.close(); // Correct way to close the stream
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }
    // --- Handle Non-Streaming Response ---
    else {
      const responsePayload = {
        id: responseId,
        object: "chat.completion",
        created: createdTimestamp,
        model: model,
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: responseMessage,
          },
          finish_reason: "stop",
        }],
        // Usage field is often expected, but hard to calculate accurately without upstream info
        // You might need to estimate or omit it if the upstream API doesn't provide token counts
        usage: {
           prompt_tokens: null, // Placeholder - Unknown
           completion_tokens: null, // Placeholder - Unknown
           total_tokens: null, // Placeholder - Unknown
        }
      };

      return new Response(JSON.stringify(responsePayload), {
        headers: { "Content-Type": "application/json" },
      });
    }

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Internal server error:`, error);
    return new Response(
      JSON.stringify({ error: { message: "Internal server error", type: "api_error", code: null } }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

/**
 * Main HTTP request handler.
 */
async function handler(req: Request, connInfo: ConnInfo): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  console.log(`[${new Date().toISOString()}] Received request: ${req.method} ${pathname} from ${connInfo.remoteAddr.hostname}`);

  // --- Routing ---
  if (req.method === "GET" && pathname === "/v1/models") {
    return new Response(JSON.stringify(generateModelsResponse()), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "POST" && pathname === "/v1/chat/completions") {
    // Basic Content-Type check
    if (req.headers.get("content-type")?.includes("application/json")) {
      try {
        const body = await req.json();
        // Validate essential body parts (basic check)
        if (!body.messages || !body.model) {
           return new Response(
               JSON.stringify({ error: { message: "Missing 'messages' or 'model' in request body", type: "invalid_request_error", param: null, code: null } }),
               { status: 400, headers: { "Content-Type": "application/json" } }
           );
        }
        return await handleChatCompletion(req, body as OpenAIChatCompletionRequest);
      } catch (e) {
        console.error(`[${new Date().toISOString()}] Failed to parse JSON body:`, e);
        return new Response(
          JSON.stringify({ error: { message: "Invalid JSON body", type: "invalid_request_error", code: null } }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: { message: "Content-Type must be application/json", type: "invalid_request_error", code: null } }),
        { status: 415, headers: { "Content-Type": "application/json" } }, // Unsupported Media Type
      );
    }
  }

  // --- Default 404 ---
  return new Response(
    JSON.stringify({ error: { message: `Endpoint not found: ${pathname}`, type: "invalid_request_error", code: null } }),
    { status: 404, headers: { "Content-Type": "application/json" } },
  );
}

// --- Start Server ---
const port = parseInt(Deno.env.get("PORT") || "8000");
console.log(`[${new Date().toISOString()}] OpenAI compatible proxy started on http://localhost:${port}`);
console.log(`[${new Date().toISOString()}] Target API: ${TARGET_API}`);
console.log(`[${new Date().toISOString()}] Available models: ${MODELS.join(", ")}`);

serve(handler, { port });
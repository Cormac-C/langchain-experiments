import React, { useEffect, useRef } from "react";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatMessageHistory, BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";

import { getSession, commitSession } from "../sessions";
import { AIChatMessage, HumanChatMessage } from "langchain/schema";

// Source: https://js.langchain.com/docs/getting-started/guide-chat#memory-add-state-to-chains-and-agents

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  let existingMemory = [];
  if (session.has("memory-1")) {
    existingMemory = session.get("memory-1");
  }
  return json({ memory: existingMemory });
}

export async function action({ request }) {
  const formData = await request.formData();
  const session = await getSession(request.headers.get("Cookie"));
  if (formData.get("intent") === "clear") {
    session.set("memory-1", { messages: [] });
    return json(
      { result: "", memory: [] },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  } else {
    let existingMemory = [];
    if (session.has("memory-1")) {
      existingMemory = session.get("memory-1");
    }

    const chatModel = new ChatOpenAI({
      temperature: 0.3,
    });
    // TODO move this parsing into a separate function
    const messageHistory = existingMemory?.messages || [];
    let parsedMessageHistory = messageHistory.map((message) => {
      return message.type === "human"
        ? new HumanChatMessage(message.data.content)
        : new AIChatMessage(message.data.content);
    });

    const memory = new BufferMemory({
      chatHistory: new ChatMessageHistory(parsedMessageHistory),
    });

    const chain = new ConversationChain({ llm: chatModel, memory: memory });

    const input = formData.get("input");

    const res = await chain.call({ input });

    session.set("memory-1", memory.chatHistory);

    return json(
      { result: res?.response, memory: memory.chatHistory },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }
}

export default function ChatModelForm() {
  const formRef = useRef(null);
  const outputRef = useRef(null);

  const navigation = useNavigation();
  const showLoading =
    navigation.state === "submitting" || navigation.state === "loading";

  const data = useActionData() || useLoaderData();
  const memory = data?.memory;
  let formattedConversation = "";
  if (memory?.messages) {
    memory.messages.forEach((message) => {
      formattedConversation += `${message.type}: ${message.data.content
        .replaceAll("\n", "")
        .trim()}\n`;
    });
  }

  useEffect(() => {
    if (formRef.current) {
      formRef.current.input.focus();
    }
  }, []);

  useEffect(() => {
    if (formRef.current) {
      formRef.current?.reset();
    }
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [showLoading]);
  // TODO: Colour code the messages by speaker
  return (
    <div>
      <h2 className="pb-4 text-xl">Interact with the Chatbot.</h2>
      <label className="block text-sm font-medium text-gray-700">Output</label>
      <div className="mt-1">
        <textarea
          id="output"
          name="output"
          ref={outputRef}
          className="w-full rounded border border-gray-500 bg-blue-200 px-2 py-1 text-lg"
          rows={8}
          readOnly
          value={formattedConversation || ""}
        />
      </div>
      <Form method="post" className="space-y-6 py-4" ref={formRef}>
        <div>
          <label
            htmlFor="input"
            className="block text-sm font-medium text-gray-700"
          >
            Input
          </label>
          <div className="mt-1">
            <input
              id="input"
              name="input"
              type="text"
              className="bg-whitepx-2 w-full rounded border border-gray-500 bg-blue-200 py-1 text-lg"
            />
          </div>
        </div>
        <button
          disabled={showLoading}
          name="intent"
          value="submit"
          type="submit"
          className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-800 focus:bg-blue-400"
        >
          {showLoading ? "Submitting..." : "Submit"}
        </button>
        <button
          disabled={showLoading}
          name="intent"
          value="clear"
          className="w-full rounded border border-red-400 bg-blue-200 px-4 py-2 text-red-400 hover:bg-blue-300 focus:bg-blue-400"
        >
          Clear Conversation
        </button>
      </Form>

      <Link
        to="/chat"
        className="flex items-center justify-center rounded-md border border-blue-800 bg-blue-200 px-4 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-300 sm:px-8"
      >
        Back
      </Link>
    </div>
  );
}

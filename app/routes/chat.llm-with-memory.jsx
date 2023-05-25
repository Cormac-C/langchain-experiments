import React, { useEffect, useRef } from "react";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { OpenAI } from "langchain/llms/openai";
import { ChatMessageHistory, BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";

import { getSession, commitSession } from "../sessions";
import { AIChatMessage, HumanChatMessage } from "langchain/schema";

// Source: https://js.langchain.com/docs/getting-started/guide-llm#memory-add-state-to-chains-and-agents

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  let existingMemory = [];
  if (session.has("memory")) {
    existingMemory = session.get("memory");
  }
  return json({ memory: existingMemory });
}

export async function action({ request }) {
  const formData = await request.formData();
  const session = await getSession(request.headers.get("Cookie"));
  if (formData.get("intent") === "clear") {
    session.set("memory", { messages: [] });
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
    if (session.has("memory")) {
      existingMemory = session.get("memory");
    }

    const model = new OpenAI({
      temperature: 0.5,
    });
    const messageHistory = existingMemory?.messages || [];
    let parsedMessageHistory = messageHistory.map((message) => {
      return message.type === "human"
        ? new HumanChatMessage(message.data.content)
        : new AIChatMessage(message.data.content);
    });

    const memory = new BufferMemory({
      chatHistory: new ChatMessageHistory(parsedMessageHistory),
    });

    const chain = new ConversationChain({ llm: model, memory: memory });

    const input = formData.get("input");

    const res = await chain.call({ input });

    session.set("memory", memory.chatHistory);

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

export default function StatefulLLMForm() {
  const formRef = useRef(null);
  const outputRef = useRef(null);

  const navigation = useNavigation();
  const showLoading =
    navigation.state === "submitting" || navigation.state === "loading";

  const data = useActionData() || useLoaderData();
  const memory = data?.memory;
  let conversationArray = [];
  if (memory?.messages) {
    conversationArray = memory.messages.map((message) => {
      const styling = message.type === "human" ? "black" : "blue";
      return `
      <span style="color: ${styling}">
        ${message.type}: ${message.data.content.trim()}
      </span>`;
    });
  }

  let formattedResult = data?.result;
  if (formattedResult) {
    formattedResult = formattedResult.trim();
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

  return (
    <div>
      <h2 className="pb-4 text-xl">Interact with the Chatbot.</h2>
      <label className="block text-sm font-medium text-gray-700">Output</label>

      <div
        className="mt-1 max-h-64 min-h-[8rem] w-full overflow-y-scroll rounded border border-gray-500 bg-blue-200 px-2 py-1 text-lg"
        ref={outputRef}
      >
        {conversationArray.map((message) => {
          return <div dangerouslySetInnerHTML={{ __html: message }} />;
        })}
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

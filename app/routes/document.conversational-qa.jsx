import React, { useEffect, useRef } from "react";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { ChatMessageHistory } from "langchain/memory";
import { ConversationalRetrievalQAChain } from "langchain/chains";

import { getSession, commitSession } from "../sessions";
import { AIChatMessage, HumanChatMessage } from "langchain/schema";

const SESSION_EMBEDDINGS_KEY = "doc-embeddings";
const SESSION_MEMORY_KEY = "memory-4";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  let embeddings = [];
  let existingMemory = [];
  if (session.has(SESSION_EMBEDDINGS_KEY)) {
    embeddings = session.get(SESSION_EMBEDDINGS_KEY);
  }
  if (session.has(SESSION_MEMORY_KEY)) {
    existingMemory = session.get(SESSION_MEMORY_KEY);
  }
  return json({ memory: existingMemory, currentEmbeddings: embeddings });
}

async function clearSession(session) {
  session.set(SESSION_MEMORY_KEY, { messages: [] });
  return json(
    { result: "", memory: [] },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const session = await getSession(request.headers.get("Cookie"));
  if (formData.get("intent") === "clear") {
    return clearSession(session);
  } else {
    let existingMemory = [];
    if (session.has(SESSION_MEMORY_KEY)) {
      existingMemory = session.get(SESSION_MEMORY_KEY);
    }

    const chatModel = new ChatOpenAI({
      temperature: 0.3,
    });

    const messageHistory = existingMemory?.messages || [];
    let parsedMessageHistory = messageHistory.map((message) => {
      return message.type === "human"
        ? new HumanChatMessage(message.data.content)
        : new AIChatMessage(message.data.content);
    });

    const embeddingDirectory = formData.get("document");
    const question = formData.get("question");

    let vectorStore = await HNSWLib.load(
      embeddingDirectory,
      new OpenAIEmbeddings()
    );

    const chain = ConversationalRetrievalQAChain.fromLLM(
      chatModel,
      vectorStore.asRetriever()
    );

    const res = await chain.call({
      question: question,
      chat_history: new ChatMessageHistory(parsedMessageHistory),
    });

    messageHistory.push(new HumanChatMessage(question));
    messageHistory.push(new AIChatMessage(res?.text));

    session.set(SESSION_MEMORY_KEY, {
      fileDirectory: embeddingDirectory,
      messages: messageHistory,
    });

    return json(
      { result: res?.text },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }
}

export default function DocumentQAChatForm() {
  const formRef = useRef(null);
  const outputRef = useRef(null);

  const navigation = useNavigation();
  const showLoading =
    navigation.state === "submitting" || navigation.state === "loading";

  const actionData = useActionData();
  const loaderData = useLoaderData();

  const availableEmbeddings = loaderData?.currentEmbeddings || [];

  const data = actionData || loaderData;

  let directory = data?.memory?.fileDirectory;

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
      <h2 className="pb-4 text-xl">Document Q&A Chat</h2>
      <h2 className="text-xl">Pick a file, chat to learn more.</h2>
      <Form method="post" className="space-y-6 py-4">
        <div>
          <label
            htmlFor="document"
            className="block text-sm font-medium text-gray-700"
          >
            Document
          </label>
          <select
            id="document"
            name="document"
            className="w-full rounded border border-gray-500 bg-red-100 p-2"
            defaultValue={directory || ""}
          >
            {availableEmbeddings.map((embedding, index) => (
              <option key={index} value={embedding.directory}>
                {embedding.name}
              </option>
            ))}
          </select>
          <Link
            to="/document/embed"
            className="text-gray-500 hover:text-gray-700"
          >
            Create more embeddings
          </Link>
        </div>
        <div
          className="mt-1 max-h-64 min-h-[8rem] w-full overflow-y-scroll rounded border border-gray-500 bg-red-200 px-2 py-1 text-lg"
          ref={outputRef}
        >
          {conversationArray.map((message, index) => {
            return (
              <div key={index} dangerouslySetInnerHTML={{ __html: message }} />
            );
          })}
        </div>
        <div>
          <label
            htmlFor="question"
            className="block text-sm font-medium text-gray-700"
          >
            Input
          </label>
          <div className="mt-1">
            <input
              id="question"
              name="question"
              type="text"
              className="bg-whitepx-2 w-full rounded border border-gray-500 bg-red-200 py-1 text-lg"
            />
          </div>
        </div>
        <button
          disabled={showLoading}
          name="intent"
          value="submit"
          type="submit"
          className="w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-800 focus:bg-red-400"
        >
          {showLoading ? "Submitting..." : "Submit"}
        </button>
        <button
          disabled={showLoading}
          name="intent"
          value="clear"
          className="w-full rounded border border-red-400 bg-red-200 px-4 py-2 text-red-400 hover:bg-red-300 focus:bg-red-400"
        >
          Clear Conversation
        </button>
      </Form>

      <Link
        to="/document"
        className="flex items-center justify-center rounded-md border border-red-800 bg-red-200 px-4 py-3 text-base font-medium text-red-700 shadow-sm hover:bg-red-300 sm:px-8"
      >
        Back
      </Link>
    </div>
  );
}

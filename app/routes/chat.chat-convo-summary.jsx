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

import { getSession, commitSession } from "../sessions";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";

// Source: https://js.langchain.com/docs/modules/memory/examples/conversation_summary

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  let existingMemory = [];
  if (session.has("memory-2")) {
    existingMemory = session.get("memory-2");
  }
  return json({ memory: existingMemory });
}

export async function action({ request }) {
  const formData = await request.formData();
  const session = await getSession(request.headers.get("Cookie"));
  if (formData.get("intent") === "clear") {
    session.set("memory-2", { chat_history: "" });
    return json(
      { return: "", memory: "" },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  } else {
    let existingMemory = "";
    if (session.has("memory-2")) {
      existingMemory = session.get("memory-2");
    }

    const chatHistory = existingMemory?.text || "";

    const chatModel = new ChatOpenAI({
      temperature: 0.3,
    });

    // Kind of manually doing what Conversation Summary Memory should do
    const summaryTemplate =
      "Progressively summarize the lines of conversation provided, adding onto the previous summary returning a new summary.\n" +
      "\n" +
      "EXAMPLE\n" +
      "Current summary:\n" +
      "The human asks what the AI thinks of artificial intelligence. The AI thinks artificial intelligence is a force for good.\n" +
      "\n" +
      "New lines of conversation:\n" +
      "Human: Why do you think artificial intelligence is a force for good?\n" +
      "AI: Because artificial intelligence will help humans reach their full potential.\n" +
      "\n" +
      "New summary:\n" +
      "The human asks what the AI thinks of artificial intelligence. The AI thinks artificial intelligence is a force for good because it will help humans reach their full potential.\n" +
      "END OF EXAMPLE\n" +
      "\n" +
      "Current summary:\n" +
      "{summary}\n" +
      "\n" +
      "New lines of conversation:\n" +
      "{new_lines}\n" +
      "\n" +
      "New summary:";
    const summaryPrompt = new PromptTemplate({
      template: summaryTemplate,
      inputVariables: ["summary", "new_lines"],
    });
    const summaryChain = new LLMChain({
      llm: chatModel,
      prompt: summaryPrompt,
    });

    const template = `The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.
      Current conversation: {chatHistory}
      Human: {input}
      AI:
      `;
    const prompt = new PromptTemplate({
      template,
      inputVariables: ["input", "chatHistory"],
    });

    const chain = new LLMChain({ llm: chatModel, prompt });

    const input = formData.get("input");

    const res = await chain.call({ input, chatHistory });

    const memorySummary = await summaryChain.call({
      summary: chatHistory,
      new_lines: res?.text,
    });

    session.set("memory-2", memorySummary);

    return json(
      { result: res?.text, memory: memorySummary },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }
}

export default function ChatSummaryForm() {
  const formRef = useRef(null);
  const outputRef = useRef(null);

  const navigation = useNavigation();
  const showLoading =
    navigation.state === "submitting" || navigation.state === "loading";

  const actionData = useActionData();
  const loaderData = useLoaderData();

  const data = actionData || loaderData;

  const output = data?.result;

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
      <h2 className="pb-4 text-xl">Interact with Chatbot.</h2>
      <span>Conversation summary is saved, not exact transcript.</span>
      <div className="mt-1">
        <textarea
          id="output"
          name="output"
          ref={outputRef}
          className="w-full rounded border border-gray-500 bg-blue-200 px-2 py-1 text-lg"
          rows={8}
          readOnly
          value={output || ""}
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

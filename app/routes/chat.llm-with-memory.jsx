import { json } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { OpenAI } from "langchain/llms/openai";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { Session } from "@remix-run/node";

// Source: https://js.langchain.com/docs/getting-started/guide-llm#memory-add-state-to-chains-and-agents

export async function action({ request }) {
  // TODO: handle the model somewhere where it isn't re-instantiated with every request
  console.log("Loading model...");
  const model = new OpenAI({
    temperature: 0,
  });
  const memory = new BufferMemory();

  const chain = new ConversationChain({ llm: model, memory: memory });

  const formData = await request.formData();
  const input = formData.get("input");

  const res = await chain.call({ input });
  console.log("Got result: ", res);

  return json({ result: res?.response });
}

export default function StatefulLLMForm() {
  console.log("Rendering form...");
  const navigation = useNavigation();
  const showLoading =
    navigation.state === "submitting" || navigation.state === "loading";

  const data = useActionData() || {};
  let formattedResult = data?.result;
  if (formattedResult) {
    formattedResult = formattedResult.replaceAll("\n", "").trim();
  }

  return (
    <div>
      <h2 className="pb-4 text-xl">Interact with the Chatbot.</h2>
      <Form method="post" className="space-y-6 py-4">
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
              required
              name="input"
              type="text"
              className="bg-whitepx-2 w-full rounded border border-gray-500 bg-blue-200 py-1 text-lg"
            />
          </div>
        </div>
        <button
          disabled={showLoading}
          type="submit"
          className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-800 focus:bg-blue-400"
        >
          {showLoading ? "Submitting..." : "Submit"}
        </button>
      </Form>
      <label className="block text-sm font-medium text-gray-700">Output</label>
      <div className="mt-1">
        <textarea
          id="output"
          name="output"
          className="w-full rounded border border-gray-500 bg-blue-200 px-2 py-1 text-lg"
          rows={4}
          readOnly
          value={formattedResult || ""}
        />
      </div>
      <Link
        to="/chat"
        className="flex items-center justify-center rounded-md border border-blue-800 bg-blue-200 px-4 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-300 sm:px-8"
      >
        Back
      </Link>
    </div>
  );
}

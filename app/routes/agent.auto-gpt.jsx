import { json } from "@remix-run/node";
import { Form, Link, useNavigation, useActionData } from "@remix-run/react";
import { ReadFileTool, WriteFileTool, SerpAPI } from "langchain/tools";
import { NodeFileStore } from "langchain/stores/file/node";
import { AutoGPT } from "langchain/experimental/autogpt";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";

//Source: https://js.langchain.com/docs/use_cases/autonomous_agents/auto_gpt
// Doesn't work currently, can't seem to write to the file store
// Never reaches an end

export async function action({ request }) {
  const store = new NodeFileStore(
    process.env.HOME + "/langchain-exp/app/sessions"
  );

  const tools = [
    new ReadFileTool({ store }),
    new WriteFileTool({ store }),
    new SerpAPI(process.env.SERPAPI_API_KEY, {
      location: "Montreal,Quebec,Canada",
      gl: "ca",
      hl: "en",
    }),
  ];

  const vectorStore = new HNSWLib(new OpenAIEmbeddings(), {
    space: "cosine",
    numDimensions: 1536,
  });

  const autogpt = AutoGPT.fromLLMAndTools(new ChatOpenAI(), tools, {
    memory: vectorStore.asRetriever(),
    aiName: "Tom",
    aiRole: "Assistant",
  });
  const formData = await request.formData();

  const input = formData.get("input");

  const res = await autogpt.run([input]);
  console.log("Got result: ", res);

  return json({ result: res?.output });
}

export default function AutoGPTForm() {
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
      <h2 className="pb-4 text-xl">Interact with the Chatbot</h2>
      <h2 className="pb-4 text-xl">Give the agent a task.</h2>
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
              name="input"
              type="text"
              className="bg-whitepx-2 w-full rounded border border-gray-500 bg-green-100 py-1 text-lg"
            />
          </div>
        </div>
        <button
          disabled={showLoading}
          type="submit"
          className="w-full rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:bg-green-400"
        >
          {showLoading ? "Submitting..." : "Submit"}
        </button>
      </Form>
      <label className="block text-sm font-medium text-gray-700">Output</label>
      <div className="mt-1">
        <textarea
          id="output"
          name="output"
          className="w-full rounded border border-gray-500 bg-green-100 px-2 py-1 text-lg"
          rows={4}
          readOnly
          value={formattedResult || ""}
        />
      </div>
      <Link
        to="/agent"
        className="flex items-center justify-center rounded-md border border-green-700 bg-green-200 px-4 py-3 text-base font-medium text-green-700 shadow-sm hover:bg-green-300 sm:px-8"
      >
        Back
      </Link>
    </div>
  );
}

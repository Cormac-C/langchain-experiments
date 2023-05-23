import { json } from "@remix-run/node";
import { Form, Link, useNavigation, useActionData } from "@remix-run/react";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { OpenAI } from "langchain/llms/openai";
import { SerpAPI } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";

// Source: https://js.langchain.com/docs/getting-started/guide-llm#agents-dynamically-run-chains-based-on-user-input

export async function action({ request }) {
  const model = new OpenAI({
    temperature: 0,
  });
  const tools = [
    new SerpAPI(process.env.SERPAPI_API_KEY, {
      location: "Montreal,Quebec,Canada",
      gl: "ca",
      hl: "en",
    }),
    new Calculator(),
  ];
  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "zero-shot-react-description",
  });
  console.log("Loaded agent");
  const formData = await request.formData();
  console.log("Got form data");
  const question = formData.get("question");
  console.log("Got question: ", question);
  const res = await executor.call({ input: question });
  console.log("Got result: ", res);
  return json({ result: res?.output });
}

export default function SearchActionAgentForm() {
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
      <h2 className="pb-4 text-xl">Search-enabled action agent</h2>
      <h2 className="pb-4 text-xl">Enter a question.</h2>
      <Form method="post" className="space-y-6 py-4">
        <div>
          <label
            htmlFor="question"
            className="block text-sm font-medium text-gray-700"
          >
            Question
          </label>
          <div className="mt-1">
            <textarea
              id="question"
              required
              rows={4}
              name="question"
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
        className="flex items-center justify-center rounded-md border border-transparent bg-green-200 px-4 py-3 text-base font-medium text-green-700 shadow-sm hover:bg-green-50 sm:px-8"
      >
        Back
      </Link>
    </div>
  );
}

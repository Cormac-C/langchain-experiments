import { json } from "@remix-run/node";
import { Form, Link, useNavigation, useActionData } from "@remix-run/react";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { SerpAPI } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
import { PlanAndExecuteAgentExecutor } from "langchain/experimental/plan_and_execute";

//Source: https://js.langchain.com/docs/modules/agents/agents/plan_execute/

export async function action({ request }) {
  const model = new ChatOpenAI({
    temperature: 0.4,
    verbose: true,
  });
  const tools = [
    new SerpAPI(process.env.SERPAPI_API_KEY, {
      location: "Montreal,Quebec,Canada",
      gl: "ca",
      hl: "en",
    }),
    new Calculator(),
  ];
  // Uses a LOT of tokens
  const executor = await PlanAndExecuteAgentExecutor.fromLLMAndTools({
    llm: model,
    tools,
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

export default function SearchPlanExecuteAgentForm() {
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
      <h2 className="pb-4 text-xl">Search-enabled plan and execute agent</h2>
      <h2 className="pb-4 text-xl">Enter a question.</h2>
      <span className="text-md pb-4 text-red-500">
        Warning: Uses lots of tokens!!!
      </span>
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

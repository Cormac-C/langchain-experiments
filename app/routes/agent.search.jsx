import { Form, Link, useNavigation, useActionData } from "@remix-run/react";
import { OpenAI } from "langchain/llms/openai";

export async function action({ request }) {
  const model = new OpenAI({
    temperature: 0,
  });
  //TODO
}

export default function SearchAgentForm() {
  const navigation = useNavigation();
  const showLoading =
    navigation.state === "submitting" || navigation.state === "loading";

  const data = useActionData() || {};
  let formattedResult = data?.result?.text;
  if (formattedResult) {
    formattedResult = formattedResult.replaceAll("\n", "").trim();
  }

  return (
    <div>
      <h2 className="pb-4 text-xl">Enter a question.</h2>
      <Form method="post" className="space-y-6 py-4">
        <div>
          <label
            htmlFor="product"
            className="block text-sm font-medium text-gray-700"
          >
            Question
          </label>
          <div className="mt-1">
            <input
              id="product"
              required
              name="product"
              type="text"
              className="bg-whitepx-2 w-full rounded border border-gray-500 bg-[color:rgba(209,190,230,0.9)] py-1 text-lg"
            />
          </div>
        </div>
        <button
          disabled={showLoading}
          type="submit"
          className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          {showLoading ? "Submitting..." : "Submit"}
        </button>
      </Form>
      <label className="block text-sm font-medium text-gray-700">Output</label>
      <div className="mt-1">
        <textarea
          id="output"
          name="output"
          className="w-full rounded border border-gray-500 bg-[color:rgba(209,190,230,0.9)] px-2 py-1 text-lg"
          rows={4}
          readOnly
          value={formattedResult || ""}
        />
      </div>
      <Link
        to="/prompt"
        className="flex items-center justify-center rounded-md border border-transparent bg-[color:rgba(209,190,230,0.9)] px-4 py-3 text-base font-medium text-purple-700 shadow-sm hover:bg-purple-50 sm:px-8"
      >
        Back
      </Link>
    </div>
  );
}

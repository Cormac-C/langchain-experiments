import { json } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";

export async function action({ request }) {
  const model = new OpenAI({
    temperature: 0.7,
  });

  const template =
    "What would be a good company name for a company that makes {product}?";
  const prompt = new PromptTemplate({
    template,
    inputVariables: ["product"],
  });

  const chain = new LLMChain({ llm: model, prompt: prompt });

  const formData = await request.formData();
  const product = formData.get("product");

  const res = await chain.call({ product });

  return json({ result: res });
}

export default function PromptPage() {
  const navigation = useNavigation();
  const showLoading =
    navigation.state === "submitting" || navigation.state === "loading";

  const data = useActionData() || {};
  let formattedResult = data?.result?.text;
  if (formattedResult) {
    formattedResult = formattedResult.replaceAll("\n", "").trim();
  }

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <h2>Enter a product, receive a company name.</h2>
      </div>
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="product"
              className="block text-sm font-medium text-gray-700"
            >
              Product
            </label>
            <div className="mt-1">
              <input
                id="product"
                required
                name="product"
                type="text"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
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
      </div>
      <div className="mx-auto my-4 w-full max-w-md px-8">
        <label className="block text-sm font-medium text-gray-700">
          Output
        </label>
        <div className="mt-1">
          <textarea
            id="output"
            name="output"
            className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
            rows={10}
            readOnly
            value={formattedResult || ""}
          />
        </div>
      </div>
    </div>
  );
}

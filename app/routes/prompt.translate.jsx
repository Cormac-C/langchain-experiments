import { json } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";

// Source: https://js.langchain.com/docs/modules/chains/llm_chain

export async function action({ request }) {
  const model = new OpenAI({
    temperature: 0,
  });

  const template =
    "Translate the following phrase into {language}: ```{phrase}```. If you don't know the language, say so.";
  const prompt = new PromptTemplate({
    template,
    inputVariables: ["language", "phrase"],
  });

  const chain = new LLMChain({ llm: model, prompt: prompt });

  const formData = await request.formData();
  const language = formData.get("language");
  const phrase = formData.get("phrase");

  const res = await chain.call({ language, phrase });

  return json({ result: res });
}

export default function CompanyPromptForm() {
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
      <h2 className="pb-4 text-xl">
        Enter a language and phrase, receive a translation.
      </h2>
      <div className="text-md pb-2 text-gray-700">
        <span className="font-bold">Actual prompt: </span>
        {`Translate the following phrase into {language}: ` +
          "```" +
          `{phrase}` +
          "```" +
          `. If you don't know the language, say so.`}
      </div>
      <Form method="post" className="space-y-6 py-4">
        <div>
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-700"
          >
            Target Language
          </label>
          <div className="mt-1">
            <input
              id="language"
              required
              name="language"
              type="text"
              className="bg-whitepx-2 w-full rounded border border-gray-500 bg-[color:rgba(209,190,230,0.9)] py-1 text-lg"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="phrase"
            className="block text-sm font-medium text-gray-700"
          >
            Phrase
          </label>
          <div className="mt-1">
            <input
              id="phrase"
              required
              name="phrase"
              type="text"
              className="bg-whitepx-2 w-full rounded border border-gray-500 bg-[color:rgba(209,190,230,0.9)] py-1 text-lg"
            />
          </div>
        </div>
        <button
          disabled={showLoading}
          type="submit"
          className="w-full rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-800 focus:bg-purple-400"
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
        className="flex items-center justify-center rounded-md border border-purple-800 bg-[color:rgba(209,190,230,0.9)] px-4 py-3 text-base font-medium text-purple-700 shadow-sm hover:bg-purple-300 sm:px-8"
      >
        Back
      </Link>
    </div>
  );
}

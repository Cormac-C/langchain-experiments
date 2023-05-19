import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
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
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[color:rgba(126,81,166,0.5)] mix-blend-multiply" />
          </div>

          <div className="relative mx-auto w-full max-w-lg px-4 pb-4 pt-8 sm:px-6 lg:px-16 lg:pb-8 lg:pt-12">
            <h2 className="pb-4 text-center text-6xl font-extrabold tracking-tight">
              <span className="block uppercase text-purple-500 drop-shadow-md">
                LLM Chain
              </span>
            </h2>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

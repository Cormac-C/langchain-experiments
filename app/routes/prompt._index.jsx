import { Link } from "@remix-run/react";

export const meta = () => [{ title: "Prompts" }];

export default function PromptOptions() {
  return (
    <div>
      <div className="py-4">
        <div className="text-md pb-4">
          These are basic prompts that can be used to generate text based on a
          template. ref:{" "}
          <a
            className="text-purple-800 hover:text-purple-500"
            href="https://js.langchain.com/docs/modules/chains/llm_chain"
          >
            Langchain's LLMChains
          </a>
        </div>
        <h1 className="pb-4 text-lg">Choose a prompt:</h1>
        <ul className="space-y-4">
          <li>
            <Link
              className="text-purple-700 hover:text-purple-500"
              to="/prompt/company"
            >
              • Company
            </Link>
          </li>
          <li>
            <Link
              className="text-purple-700 hover:text-purple-500"
              to="/prompt/translate"
            >
              • Translate
            </Link>
          </li>
        </ul>
      </div>
      <Link
        to="/"
        className="flex items-center justify-center rounded-md border border-purple-700 bg-purple-200 px-4 py-3 text-base font-medium text-purple-700 shadow-sm hover:bg-purple-300 sm:px-8"
      >
        Return to home
      </Link>
    </div>
  );
}

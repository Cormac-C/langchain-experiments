import { Link } from "@remix-run/react";

export const meta = () => [{ title: "Chatbots" }];

export default function ChatOptions() {
  return (
    <div>
      <div className="py-4">
        <div className="text-md pb-4">
          These chatbots generate text with a context of the conversation. ref:{" "}
          <a
            className="text-blue-800 hover:text-blue-500"
            href="https://js.langchain.com/docs/modules/models/chat/"
            target="_blank"
          >
            Langchain's Chat Models
          </a>
        </div>
        <h1 className="pb-4 text-lg">Choose an chatbot:</h1>
        <ul className="space-y-4">
          <li>
            <Link
              className="text-blue-700 hover:text-blue-500"
              to="/chat/llm-with-memory"
            >
              • State-enabled LLM
            </Link>
          </li>
          <li>
            <Link
              className="text-blue-700 hover:text-blue-500"
              to="/chat/chat-model-basic"
            >
              • Chat model
            </Link>
          </li>
          <li>
            <Link
              className="text-blue-700 hover:text-blue-500"
              to="/chat/chat-convo-summary"
            >
              • Chat model with summary memory
            </Link>
          </li>
        </ul>
      </div>
      <Link
        disabled
        to="/"
        className="flex items-center justify-center rounded-md border border-blue-700 bg-blue-200 px-4 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-300 sm:px-8"
      >
        Return to home
      </Link>
    </div>
  );
}

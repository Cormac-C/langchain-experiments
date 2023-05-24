import { Link } from "@remix-run/react";

export default function ChatOptions() {
  return (
    <div>
      <div className="py-4">
        <h1 className="pb-4 text-lg">Choose an chatbot:</h1>
        <ul className="space-y-4">
          <li>
            <Link className="hover:text-blue-500" to="/chat/llm-with-memory">
              • State-enabled LLM
            </Link>
          </li>
          <li>
            <Link className="hover:text-blue-500" to="/chat/chat-model-basic">
              • Chat model
            </Link>
          </li>
        </ul>
      </div>
      <Link
        disabled
        to="/"
        className="flex items-center justify-center rounded-md border border-transparent bg-blue-300 px-4 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-300 sm:px-8"
      >
        Return to home
      </Link>
    </div>
  );
}

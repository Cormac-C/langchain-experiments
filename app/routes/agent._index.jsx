import { Link } from "@remix-run/react";

export default function AgentOptions() {
  return (
    <div>
      <div className="py-4">
        <div className="text-md pb-4">
          These agents are LLMs with access to two tools{" "}
          <a href="https://serpapi.com/">serpapi</a> (Google search) and a{" "}
          <a href="https://js.langchain.com/docs/api/tools_calculator/classes/Calculator">
            calculator
          </a>
          . ref:{" "}
          <a
            className="text-green-800 hover:text-green-500"
            href="https://js.langchain.com/docs/modules/agents/"
          >
            Langchain's Agents
          </a>
        </div>
        <h1 className="pb-4 text-lg">Choose an agent:</h1>
        <ul className="space-y-4">
          <li>
            <Link
              className="text-green-700 hover:text-green-500"
              to="/agent/search-action-agent"
            >
              • Search-enabled action agent
            </Link>
          </li>
          <li>
            <Link
              className="text-green-700 hover:text-green-500"
              to="/agent/search-plan-execute-agent"
            >
              • Search-enabled plan and execute agent
            </Link>
          </li>
        </ul>
      </div>
      <Link
        to="/"
        className="flex items-center justify-center rounded-md border border-green-700 bg-green-200 px-4 py-3 text-base font-medium text-green-700 shadow-sm hover:bg-green-300 sm:px-8"
      >
        Return to home
      </Link>
    </div>
  );
}

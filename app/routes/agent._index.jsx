import { Link } from "@remix-run/react";

export default function AgentOptions() {
  return (
    <div>
      <div className="py-4">
        <h1 className="pb-4 text-lg">Choose an agent:</h1>
        <ul className="space-y-4">
          <li>
            <Link
              className="hover:text-green-500"
              to="/agent/search-action-agent"
            >
              • Search-enabled action agent
            </Link>
          </li>
        </ul>
      </div>
      <Link
        to="/"
        className="flex items-center justify-center rounded-md border border-transparent bg-green-200 px-4 py-3 text-base font-medium text-green-700 shadow-sm hover:bg-green-300 sm:px-8"
      >
        Return to home
      </Link>
    </div>
  );
}

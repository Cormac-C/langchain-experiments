import { Link } from "@remix-run/react";

export default function AgentOptions() {
  return (
    <div>
      <div className="py-4">
        <h1 className="pb-4 text-lg">Choose an agent:</h1>
        <ul className="space-y-4">
          <li>
            <Link className="hover:text-purple-500" to="/agent/search">
              • Search-enabled
            </Link>
          </li>
        </ul>
      </div>
      <Link
        to="/"
        className="flex items-center justify-center rounded-md border border-transparent bg-[color:rgba(209,190,230,0.9)] px-4 py-3 text-base font-medium text-purple-700 shadow-sm hover:bg-purple-300 sm:px-8"
      >
        Return to home
      </Link>
    </div>
  );
}

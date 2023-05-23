import { Link } from "@remix-run/react";

export default function PromptOptions() {
  return (
    <div>
      <div className="py-4">
        <h1 className="pb-4 text-lg">Choose a prompt type:</h1>
        <ul className="space-y-4">
          <li>
            <Link className="hover:text-purple-500" to="/prompt/company">
              • Company
            </Link>
          </li>
          <li>
            <Link className="hover:text-purple-500" to="/prompt/translate">
              • Translate
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

import { Link } from "@remix-run/react";

export default function DocumentOptions() {
  return (
    <div>
      <div className="py-4">
        <h1 className="pb-4 text-lg">Choose a document tool:</h1>
        <ul className="space-y-4">
          <li>
            <Link
              className="text-red-700 hover:text-red-500"
              to="/document/basic-qa"
            >
              • Document QA
            </Link>
          </li>
        </ul>
      </div>
      <Link
        disabled
        to="/"
        className="flex items-center justify-center rounded-md border border-red-700 bg-red-200 px-4 py-3 text-base font-medium text-red-700 shadow-sm hover:bg-red-300 sm:px-8"
      >
        Return to home
      </Link>
    </div>
  );
}

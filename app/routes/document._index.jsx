import { Link } from "@remix-run/react";

export const meta = () => [{ title: "Documents" }];

// Possible TODO: https://js.langchain.com/docs/modules/chains/other_chains/multi_retrieval_qa_chain

export default function DocumentOptions() {
  return (
    <div>
      <div className="py-4">
        <div className="text-md pb-4">
          Upload documents to create embeddings then interact with them via Q&A.
          ref:{" "}
          <a
            className="text-red-800 hover:text-red-500"
            href="https://docs.langchain.com/docs/use-cases/qa-docs"
            target="_blank"
          >
            Langchain's Chat Models
          </a>
        </div>
        <h1 className="pb-4 text-lg">Choose a document tool:</h1>
        <ul className="space-y-4">
          <li>
            <Link
              className="text-red-700 hover:text-red-500"
              to="/document/embed"
            >
              • Document Embedding
            </Link>
          </li>
          <li>
            <Link
              className="text-red-700 hover:text-red-500"
              to="/document/basic-qa"
            >
              • Document QA
            </Link>
          </li>
          <li>
            <Link
              className="text-red-700 hover:text-red-500"
              to="/document/conversational-qa"
            >
              • Conversational Document QA
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

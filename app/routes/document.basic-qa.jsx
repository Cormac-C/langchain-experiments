import { json } from "@remix-run/node";
import {
  Link,
  Form,
  useNavigation,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { getSession, commitSession } from "../sessions";

// Source: https://js.langchain.com/docs/modules/chains/index_related_chains/retrieval_qa

const SESSION_EMBEDDINGS_KEY = "doc-embeddings";
const SESSION_MEMORY_KEY = "memory-3";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  let embeddings = [];
  let sessionData = {};
  if (session.has(SESSION_EMBEDDINGS_KEY)) {
    embeddings = session.get(SESSION_EMBEDDINGS_KEY);
  }
  if (session.has(SESSION_MEMORY_KEY)) {
    sessionData = session.get(SESSION_MEMORY_KEY);
  }
  return json({ sessionData: sessionData, currentEmbeddings: embeddings });
}

export async function action({ request }) {
  const formData = await request.formData();
  const session = await getSession(request.headers.get("Cookie"));

  const embeddingDirectory = formData.get("document");
  const question = formData.get("question");

  const chatModel = new ChatOpenAI();

  let vectorStore = await HNSWLib.load(
    embeddingDirectory,
    new OpenAIEmbeddings()
  );

  const chain = RetrievalQAChain.fromLLM(chatModel, vectorStore.asRetriever(), {
    // returnSourceDocuments: true, // Uncomment to return source 'documents' (chunks of text)
  });

  const res = await chain.call({
    query: question,
  });

  const sessionInfo = {
    fileDirectory: embeddingDirectory,
    question: question,
    result: res?.text,
  };

  session.set(SESSION_MEMORY_KEY, sessionInfo);

  return json(
    { result: res?.text },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export default function DocumentQAForm() {
  const navigation = useNavigation();
  const showLoading =
    navigation.state === "submitting" || navigation.state === "loading";

  const actionData = useActionData();
  const loaderData = useLoaderData();

  const availableEmbeddings = loaderData?.currentEmbeddings || [];

  const data = actionData || loaderData?.sessionData || {};

  let formattedResult = data?.result;
  if (formattedResult) {
    formattedResult = formattedResult.trim();
  }
  let directory = data?.fileDirectory;

  return (
    <div>
      <h2 className="pb-4 text-xl">Document Q&A</h2>
      <h2 className="text-xl">Pick a file, enter a question.</h2>
      <Form method="post" className="space-y-6 py-4">
        <div>
          <label
            htmlFor="document"
            className="block text-sm font-medium text-gray-700"
          >
            Document
          </label>
          <select
            id="document"
            name="document"
            className="w-full rounded border border-gray-500 bg-red-100 p-2"
            defaultValue={directory || ""}
          >
            {availableEmbeddings.map((embedding, index) => (
              <option key={index} value={embedding.directory}>
                {embedding.name}
              </option>
            ))}
          </select>
          <Link
            to="/document/embed"
            className="text-gray-500 hover:text-gray-700"
          >
            Create more embeddings
          </Link>
        </div>
        <div>
          <label
            htmlFor="question"
            className="block text-sm font-medium text-gray-700"
          >
            Question
          </label>
          <div className="mt-1">
            <textarea
              id="question"
              required
              rows={2}
              defaultValue={data?.question || ""}
              name="question"
              type="text"
              className="bg-whitepx-2 w-full rounded border border-gray-500 bg-red-100 py-1 text-lg"
            />
          </div>
        </div>
        <button
          disabled={showLoading}
          type="submit"
          className="w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:bg-red-400"
        >
          {showLoading ? "Submitting..." : "Submit"}
        </button>
      </Form>
      <div className="mt-1">
        <textarea
          id="output"
          name="output"
          className="w-full rounded border border-gray-500 bg-red-100 px-2 py-1 text-lg"
          rows={8}
          readOnly
          value={formattedResult || ""}
        />
      </div>
      <Link
        to="/document"
        className="flex items-center justify-center rounded-md border border-red-700 bg-red-200 px-4 py-3 text-base font-medium text-red-700 shadow-sm hover:bg-red-300 sm:px-8"
      >
        Back
      </Link>
    </div>
  );
}

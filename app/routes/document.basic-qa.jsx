import {
  json,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import {
  Link,
  Form,
  useNavigation,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import * as fs from "fs";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { getSession, commitSession } from "../sessions";

// Source: https://js.langchain.com/docs/modules/chains/index_related_chains/retrieval_qa

//TODO: Separate out file upload and embedding, with save, into a separate route
export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  let sessionData = [];
  if (session.has("memory-3")) {
    sessionData = session.get("memory-3");
  }
  return json({ sessionData: sessionData });
}

export async function action({ request }) {
  const session = await getSession(request.headers.get("Cookie"));

  const chatModel = new ChatOpenAI();

  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      avoidFileConflicts: true,
      directory: "/tmp",
      file: ({ filename }) => filename,
      maxPartSize: 5_000_000,
    }),
    unstable_createMemoryUploadHandler()
  );

  // Kind of convoluted to get the file from the form
  // https://github.com/remix-run/remix/issues/3238
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );
  const file = formData.get("file");

  let vectorStore;
  if (!file.name && session.has("memory-3")) {
    // Shouldn't happen currently
    const sessionData = session.get("memory-3");
    const fileName = sessionData.file.name;
    const slicedFileName = fileName.slice(0, fileName.length - 4);
    const directory =
      process.env.HOME + "/langchain-exp/app/sessions/" + slicedFileName;
    console.log(directory, "directory");

    // Use the current vector store
    vectorStore = await HNSWLib.load(directory, new OpenAIEmbeddings());
    console.log("Vector store loaded.");
  } else if (file.name) {
    const fileName = file.name;
    const slicedFileName = fileName.slice(0, fileName.length - 4);
    const directory =
      process.env.HOME + "/langchain-exp/app/sessions/" + slicedFileName;
    console.log(directory, "directory");

    //Need to create the vector store
    const text = fs.readFileSync(file.filepath, "utf8");
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });
    const docs = await textSplitter.createDocuments([text]);

    // In-memory vector store https://www.npmjs.com/package/hnswlib-node
    vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

    // TODO: Vector store should be persisted somewhere
    // Saving like this messes everything up
    // await vectorStore.save(directory);
    console.log("New vector store created.");
  } else {
    console.log("No file uploaded.");
    return json({ result: "No file uploaded." });
  }

  const chain = RetrievalQAChain.fromLLM(chatModel, vectorStore.asRetriever());

  const question = formData.get("question");

  console.log(question, "question");

  const res = await chain.call({
    query: question,
  });
  console.log(res, "res");

  const fileFormatted = {
    lastModified: file.lastModified,
    webkitRelativePath: file.webkitRelativePath,
    filepath: file.filepath,
    name: file.name,
    type: file.type,
  };

  const sessionInfo = {
    file: fileFormatted,
    question: question,
    result: res?.text,
  };

  session.set("memory-3", sessionInfo);

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

  const data = actionData || loaderData;

  let formattedResult = data?.result;
  if (formattedResult) {
    formattedResult = formattedResult.trim();
  }

  return (
    <div>
      <h2 className="pb-4 text-xl">Document Q&A</h2>
      <h2 className="text-xl">Upload a file, enter a question.</h2>
      <Form
        method="post"
        className="space-y-6 py-4"
        encType="multipart/form-data"
      >
        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-700"
          >
            File
          </label>
          <div className="mt-1">
            <input id="file" name="file" type="file" accept=".txt" required />
            <p className="mt-2 text-sm text-gray-500">
              Current vector store: {data?.file?.name}
            </p>
          </div>
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

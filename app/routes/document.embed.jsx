import {
  json,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { Form, Link, useNavigation, useLoaderData } from "@remix-run/react";
import * as fs from "fs";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { UnstructuredLoader } from "langchain/document_loaders/fs/unstructured";

import { getSession, commitSession } from "../sessions";

const SESSION_EMBEDDINGS_KEY = "doc-embeddings";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  let embeddings = [];
  if (session.has(SESSION_EMBEDDINGS_KEY)) {
    embeddings = session.get(SESSION_EMBEDDINGS_KEY);
  }
  return json({ currentEmbeddings: embeddings });
}

export async function action({ request }) {
  const session = await getSession(request.headers.get("Cookie"));

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

  if (file.name) {
    // Create and save vector store
    const fileName = file.name;
    const slicedFileName = fileName.slice(0, fileName.length - 4);
    const directory =
      process.env.HOME + "/langchain-exp/app/sessions/" + slicedFileName;

    let docs;

    if (file.type === "text/plain") {
      const text = fs.readFileSync(file.filepath, "utf8");
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
      });
      docs = await textSplitter.createDocuments([text]);
    } else {
      const loader = new UnstructuredLoader(file.filepath);
      docs = await loader.load();
    }

    docs = docs.filter((doc) => !!doc.pageContent);

    // In-memory vector store https://www.npmjs.com/package/hnswlib-node
    let vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

    await vectorStore.save(directory);
    let currentEmbeddings = session.get(SESSION_EMBEDDINGS_KEY) || [];
    const embeddingData = {
      name: slicedFileName,
      directory: directory,
    };
    currentEmbeddings.push(embeddingData);
    session.set(SESSION_EMBEDDINGS_KEY, currentEmbeddings);
    return json(
      {
        result: "New vector store created.",
        fileName: slicedFileName,
      },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  } else {
    return json({ result: "No file uploaded." });
  }
}

export default function DocumentEmbedForm() {
  const navigation = useNavigation();
  const showLoading =
    navigation.state === "submitting" || navigation.state === "loading";

  const loaderData = useLoaderData() || {};
  let currentEmbeddings = loaderData?.currentEmbeddings;

  return (
    <div>
      <h2 className="pb-4 text-xl">Document Embedding</h2>
      <h2 className="text-xl">Upload a file to embed.</h2>
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
          <input
            type="file"
            name="file"
            accept=".txt, .pdf, .doc, .docx, .html"
            required
          />
        </div>
        <button
          disabled={showLoading}
          type="submit"
          className="w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:bg-red-400"
        >
          {showLoading ? "Submitting..." : "Submit"}
        </button>
      </Form>
      <table className="table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Directory</th>
          </tr>
        </thead>
        <tbody>
          {currentEmbeddings?.map((embedding, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">{embedding.name}</td>
              <td className="border px-4 py-2">{embedding.directory}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link
        to="/document"
        className="my-4 flex items-center justify-center rounded-md border border-red-700 bg-red-200 px-4 py-3 text-base font-medium text-red-700 shadow-sm hover:bg-red-300 sm:px-8"
      >
        Back
      </Link>
    </div>
  );
}

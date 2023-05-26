import { Link } from "@remix-run/react";

export const meta = () => [{ title: "Langchain" }];

export default function Index() {
  return (
    <main className="relative min-h-screen bg-yellow-100 sm:flex sm:items-center sm:justify-center">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[color:rgba(254,204,27,0.5)] mix-blend-multiply" />
            </div>
            <div className="relative px-4 pb-8 pt-16 sm:px-6 sm:pb-14 sm:pt-24 lg:px-8 lg:pb-20 lg:pt-32">
              <h1 className="text-center text-6xl font-extrabold tracking-tight">
                <span className="block uppercase text-yellow-500 drop-shadow-md">
                  Trying Langchain
                </span>
              </h1>
              <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                <div className="space-y-4 sm:mx-auto sm:space-y-0">
                  <Link
                    to="/prompt"
                    className="flex items-center justify-center rounded-md border border-purple-400 bg-white px-4 py-3 text-base font-medium text-purple-700 shadow-sm hover:bg-purple-50 sm:px-8"
                  >
                    Try a prompt
                  </Link>
                </div>
                <div className="space-y-4 sm:mx-auto sm:space-y-0">
                  <Link
                    to="/agent"
                    className="flex items-center justify-center rounded-md border border-green-400 bg-white px-4 py-3 text-base font-medium text-green-700 shadow-sm hover:bg-green-50 sm:px-8"
                  >
                    Try an agent
                  </Link>
                </div>
                <div className="space-y-4 sm:mx-auto sm:space-y-0">
                  <Link
                    to="/chat"
                    className="flex items-center justify-center rounded-md border border-blue-400 bg-white px-4 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50 sm:px-8"
                  >
                    Try a chatbot
                  </Link>
                </div>
              </div>
              <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                <div className="space-y-4 sm:mx-auto sm:space-y-0">
                  <Link
                    to="/document"
                    className="flex items-center justify-center rounded-md border border-red-400 bg-white px-4 py-3 text-base font-medium text-red-700 shadow-sm hover:bg-red-50 sm:px-8"
                  >
                    Try a document
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

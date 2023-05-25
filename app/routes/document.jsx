import { Outlet } from "@remix-run/react";

export default function DocumentPage() {
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-red-100 mix-blend-multiply" />
          </div>

          <div className="relative mx-auto w-full max-w-2xl px-4 pb-4 pt-8 sm:px-6 lg:px-16 lg:pb-8 lg:pt-12">
            <h2 className="px-16 pb-4 text-center text-6xl font-extrabold tracking-tight">
              <span className="block uppercase text-red-500 drop-shadow-md">
                Documents
              </span>
            </h2>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

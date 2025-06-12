import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "preline/preline";
import { IStaticMethods } from "preline/preline";

declare global {
  interface Window {
    HSStaticMethods: IStaticMethods;
  }
}

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    window.HSStaticMethods.autoInit();
  }, [location.pathname]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-neutral-900">
      <main
        id="content"
        role="main"
        className="text-center p-4 sm:p-6 lg:p-8"
      >
        <div className="space-y-5">
          <h1 className="leading-none text-8xl font-semibold text-gray-800 dark:text-neutral-200">
            404
          </h1>
          <h2 className="text-3xl font-medium tracking-tight text-gray-800 dark:text-neutral-200">
            Page not found
          </h2>
          <p className="text-gray-500 dark:text-neutral-500">
            Sorry, the page you're looking for cannot be found.
          </p>
          <div>
            <a
              href="/"
              type="button"
              className="py-2 px-3 inline-flex justify-center items-center gap-x-2 text-start bg-blue-600 border border-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm align-middle hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-300 dark:focus:ring-blue-500"
            >
              <svg
                className="flex-shrink-0 w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Back to home
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;

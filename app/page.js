import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-white">
      <main className="flex flex-col gap-8 row-start-2 items-center text-center max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-semibold bg-gradient-to-r from-green-600 to-cyan-500 bg-clip-text text-transparent">
          Welcome to Parsedoc Validation
        </h1>
        
        <p className="text-lg text-gray-600">
          A modern solution for document validation and verification using advanced technologies.
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-4">
          <Link
            className="rounded-lg border border-solid border-transparent transition-all flex items-center justify-center bg-green-600 hover:bg-green-700 text-white gap-2 text-base h-12 px-8 shadow-lg hover:shadow-xl"
            href="/demo"
          >
            Try Demo
          </Link>
          <a
            className="rounded-lg border border-solid border-gray-200 transition-all flex items-center justify-center hover:bg-gray-50 text-base h-12 px-8"
            href="https://github.com/yourusername/persedoc"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </div>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-sm text-gray-600">
        <p>© 2024 Parsedoc. All rights reserved.</p>
      </footer>
    </div>
  );
}

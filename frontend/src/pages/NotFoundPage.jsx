import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-2xl font-bold text-zinc-950">Page not found</h1>
      <Link className="mt-4 inline-block font-medium text-blue-600" to="/">
        Back to products
      </Link>
    </main>
  );
}

export default NotFoundPage;

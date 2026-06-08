import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-gray-500">Halaman tidak ditemukan.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
      >
        Kembali ke beranda
      </Link>
    </main>
  );
}

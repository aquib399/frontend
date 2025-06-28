export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="mb-4 text-4xl font-bold">Meeting Not Found</h1>
      <p className="text-lg text-gray-600">
        The meeting you are looking for does not exist or has been deleted.
      </p>
    </div>
  );
}

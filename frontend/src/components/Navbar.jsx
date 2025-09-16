export default function Navbar({ title }) {
  return (
    <div className="w-full border-b-2 border-gray-200 py-3 px-6 bg-white">
      <h1 className="text-xl font-bold text-gray-700">{title}</h1>
    </div>
  );
}

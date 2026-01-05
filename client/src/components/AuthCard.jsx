import { Link } from "react-router-dom";

export default function AuthCard({ title, route, onClick }) {
  if (onClick) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6 w-64 text-center">
        <button onClick={onClick} className="bg-green-600 text-white px-4 py-2 w-full rounded">
          {title}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-64 text-center">
      <Link to={route}>
        <button className="bg-green-600 text-white px-4 py-2 w-full rounded">
          {title}
        </button>
      </Link>
    </div>
  );
}

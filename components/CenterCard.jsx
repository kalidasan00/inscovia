// components/CenterCard.jsx
import Link from "next/link";

export default function CenterCard({ center }) {
  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="h-40 w-full bg-gray-100 flex items-center justify-center">
        <img src={center.image} alt={center.name} className="object-cover h-40 w-full"/>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{center.name}</h3>
            <div className="text-sm text-gray-500 mt-1">{center.location} • {center.type}</div>
          </div>
          <div className="text-sm font-medium text-green-600">{center.rating} ★</div>
        </div>

        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{center.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-gray-500">{center.courses.slice(0,3).join(" • ")}</div>
          <Link href={`/centers/${center.id}`} className="text-sm px-3 py-1 bg-primary text-white rounded-md">View</Link>
        </div>
      </div>
    </article>
  );
}

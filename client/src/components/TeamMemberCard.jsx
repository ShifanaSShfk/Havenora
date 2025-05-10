// src/components/TeamMemberCard.jsx
export default function TeamMemberCard({ name, role, bio, image }) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="h-64 bg-gray-100 overflow-hidden">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{name}</h3>
          <p className="text-blue-600 font-medium mb-3">{role}</p>
          <p className="text-gray-600">{bio}</p>
        </div>
      </div>
    );
  }
// Reusable stat card displaying an icon, label, and value
const StatCard = ({ icon, title, value, bgColor = "bg-blue-50", textColor = "text-[#2563EB]" }) => {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${bgColor} ${textColor} text-2xl`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-[#6B7280]">{title}</p>
        <p className="text-2xl font-bold text-[#111827]">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;

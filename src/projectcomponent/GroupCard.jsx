export default function GroupCard({ 
  group, 
  onClick, 
  onStatusToggle 
}) {

  const { stats = {}, bidSpecs = {} } = group;

  const isProjectPaused = group.projectId?.status === "Paused";

  const getStatusIcon = () => {
    if (group.status === "Live") return "🟢";
    if (group.status === "Paused") return "⏸";
    return "✅";
  };

  const getStatusColor = () => {
    if (group.status === "Live") return "text-green-600";
    if (group.status === "Paused") return "text-yellow-600";
    return "text-blue-600";
  };

  // const handleIconClick = (e) => {
  //   e.stopPropagation();

  //   // ❌ If project paused → block
  //   if (isProjectPaused && group.status === "Paused") {
  //     alert("Project is paused. Please make project Live first.");
  //     return;
  //   }

  //   onStatusToggle(group);
  // };

const handleIconClick = async (e) => {
  e.stopPropagation();

  if (isProjectPaused && group.status === "Paused") {
    alert("Project is paused. Please make project Live first.");
    return;
  }

  // Parent component handles the API request and CSRF token
  if (typeof onStatusToggle === "function") {
    await onStatusToggle(group);
  }
};

  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white border rounded-xl shadow-sm hover:shadow-md transition p-4 w-[380px]"
    >
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-3">

        {/* 🔥 STATUS ICON */}
        <div
          onClick={handleIconClick}
          className={`w-10 h-10 border rounded-lg flex items-center justify-center 
          ${isProjectPaused ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 cursor-pointer"}`}
        >
          {getStatusIcon()}
        </div>

        {/* Group Name */}
        <div className="flex flex-col">
          <span
            className="font-semibold text-blue-600 truncate"
          >
            {group.projectName || "Unknown Project"} | {group.groupName}
          </span>

          {/* Status Text */}
          <span className={`text-xs font-semibold ${getStatusColor()}`}>
            {group.status}
          </span>
        </div>
      </div>

      {/* ===== META ===== */}
      <div className="flex justify-between text-sm text-gray-600 mb-3">
        <span>🌐 {bidSpecs.language || "English"}</span>
        <span>📍 {bidSpecs.country || "United States"}</span>
      </div>

      <Divider />

      {/* ===== ROW 1 ===== */}
      <StatsRow
        leftLabel="Hits"
        leftValue={stats.hits || 0}
        rightLabel="Survey Starts"
        rightValue={stats.starts || 0}
      />

      <Divider />

      {/* ===== ROW 2 ===== */}
      <StatsRow
        leftLabel="Completes"
        leftValue={stats.completes || 0}
        centerLabel="Terminates"
        centerValue={`${stats.terminates || 0}/${stats.starts || 0}`}
        rightLabel="QuotaFull"
        rightValue={stats.quotaFull || 0}
      />

      <Divider />

      {/* ===== ROW 3 ===== */}
      <StatsRow
        leftLabel="Incidence"
        leftValue={`${stats.incidence || 0}%`}
        rightLabel="Median LOI"
        rightValue={`${stats.medianLOI || 0} Min`}
      />
    </div>
  );
}


/* ===== Helpers ===== */

function Divider() {
  return <div className="border-t my-3" />;
}

function StatsRow({ leftLabel, leftValue, centerLabel, centerValue, rightLabel, rightValue }) {
  return (
    <div className="grid grid-cols-3 text-center text-sm">
      <Stat label={leftLabel} value={leftValue} />
      {centerLabel ? <Stat label={centerLabel} value={centerValue} /> : <div />}
      <Stat label={rightLabel} value={rightValue} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="font-semibold text-gray-700">{label}</div>
      <div className="text-teal-600 font-bold">{value}</div>
    </div>
  );
}
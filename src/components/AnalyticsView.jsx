import {
  HiOutlineUserGroup,
  HiOutlineClock,
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineTrendingUp,
  HiOutlineChatAlt2,
  HiOutlineCalendar
} from "react-icons/hi";

export default function AnalyticsView({ stats, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-official" />
      </div>
    );
  }

  const kpis = [
    { title: "Total Leads Captured", value: stats?.totalLeads || 0, icon: HiOutlineUserGroup, color: "text-slate-900 bg-slate-100" },
    { title: "Pending Calls", value: stats?.pendingCount || 0, icon: HiOutlineClock, color: "text-zinc-950 bg-official/20" },
    { title: "In Active Discussion", value: (stats?.contactedCount || 0) + (stats?.inDiscussionCount || 0), icon: HiOutlineChatAlt2, color: "text-blue-700 bg-blue-100" },
    { title: "Demos Booked", value: stats?.demoCount || 0, icon: HiOutlineCalendar, color: "text-indigo-700 bg-indigo-100" },
    { title: "Students Enrolled", value: stats?.enrolledCount || 0, icon: HiOutlineCheckCircle, color: "text-emerald-700 bg-emerald-100" },
    { title: "Conversion Ratio", value: `${stats?.conversionRate || 0}%`, icon: HiOutlineTrendingUp, color: "text-indigo-700 bg-indigo-100" }
  ];

  const totalSources = stats?.sourceStats?.reduce((acc, curr) => acc + curr.count, 0) || 1;
  const totalCourses = stats?.courseStats?.reduce((acc, curr) => acc + curr.count, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Admissions Performance & Metrics</h2>
        <p className="text-xs text-slate-500 mt-0.5">Real-time overview of student inquiries, conversion rates and counselor activity.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 truncate">{kpi.title}</span>
                <div className={`p-1.5 rounded-lg ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-bold text-slate-900 tracking-tight">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-semibold text-sm text-slate-900">Admissions Pipeline Funnel</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3.5 bg-official/15 border border-official/30 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-zinc-950 uppercase">1. Inquiries</span>
            <p className="text-lg font-bold text-zinc-950">{stats?.totalLeads || 0}</p>
            <p className="text-[10px] text-zinc-700">100% Top of Funnel</p>
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-blue-800 uppercase">2. Contacted</span>
            <p className="text-lg font-bold text-blue-950">{(stats?.contactedCount || 0) + (stats?.inDiscussionCount || 0)}</p>
            <p className="text-[10px] text-blue-700">Discussions in Progress</p>
          </div>

          <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-indigo-800 uppercase">3. Demos Booked</span>
            <p className="text-lg font-bold text-indigo-950">{stats?.demoCount || 0}</p>
            <p className="text-[10px] text-indigo-700">Mentorship Attended</p>
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase">4. Enrolled</span>
            <p className="text-lg font-bold text-emerald-950">{stats?.enrolledCount || 0}</p>
            <p className="text-[10px] text-emerald-700">{stats?.conversionRate || 0}% Conversion</p>
          </div>
        </div>
      </div>

      {/* Breakdown: Lead Sources & Course Demands */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Lead Sources Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-semibold text-sm text-slate-900">Lead Acquisition Sources</h3>
          <div className="space-y-3">
            {stats?.sourceStats?.map((src) => {
              const pct = Math.round((src.count / totalSources) * 100);
              return (
                <div key={src._id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium text-slate-700">
                    <span>{src._id || "Direct / Unknown"}</span>
                    <span className="text-slate-500">
                      {src.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-official h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most Inquired Courses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-semibold text-sm text-slate-900">Top Inquired Courses</h3>
          <div className="space-y-3">
            {stats?.courseStats?.map((crs) => {
              const pct = Math.round((crs.count / totalCourses) * 100);
              return (
                <div key={crs._id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium text-slate-700">
                    <span className="truncate max-w-[240px]">{crs._id || "General"}</span>
                    <span className="text-slate-500">
                      {crs.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-slate-800 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function RadarChartUi({ metrics }: { metrics: any }) {
  if (!metrics) return null;

  const data = [
    { subject: 'Frontend', A: metrics.frontend || 0, fullMark: 100 },
    { subject: 'Backend', A: metrics.backend || 0, fullMark: 100 },
    { subject: 'Database', A: metrics.database || 0, fullMark: 100 },
    { subject: 'Sys Design', A: metrics.systemDesign || 0, fullMark: 100 },
    { subject: 'Soft Skills', A: metrics.softSkills || 0, fullMark: 100 },
  ];

  return (
    <div className="h-64 w-full mt-4 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-center text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Skill Breakdown</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" className="text-xs font-semibold text-gray-600" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
          <Radar name="Candidate" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.5} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface StarsPoint {
  date: string;
  stars: number;
}

export function StarsHistory({ data }: { data: StarsPoint[] }) {
  if (!data || data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid stroke="#04471c" strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#16db65", fontSize: 11 }}
          minTickGap={40}
        />
        <YAxis
          tick={{ fill: "#16db65", fontSize: 11 }}
          allowDecimals={false}
          width={50}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#020202",
            border: "1px solid #058c42",
          }}
          labelStyle={{ color: "#16db65" }}
        />
        <Line
          type="monotone"
          dataKey="stars"
          stroke="#16db65"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export interface ViewsPoint {
  date: string;
  count: number;
  uniques: number;
}

export function ViewsHistory({ data }: { data: ViewsPoint[] }) {
  if (!data || data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid stroke="#04471c" strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#16db65", fontSize: 11 }}
          minTickGap={40}
        />
        <YAxis
          tick={{ fill: "#16db65", fontSize: 11 }}
          allowDecimals={false}
          width={50}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#020202",
            border: "1px solid #058c42",
          }}
          labelStyle={{ color: "#16db65" }}
        />
        <Bar dataKey="count" fill="#058c42" />
        <Bar dataKey="uniques" fill="#16db65" />
      </BarChart>
    </ResponsiveContainer>
  );
}

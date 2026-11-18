import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

export interface CategoryCount {
  label: string;
  count: number;
}

export default function CategoryChart({ data }: { data: CategoryCount[] }) {
  return (
    <BarChart width={560} height={220} data={data}>
      <CartesianGrid stroke="#04471c" strokeDasharray="3 3" />
      <XAxis dataKey="label" tick={{ fill: "#16db65" }} />
      <YAxis allowDecimals={false} tick={{ fill: "#16db65" }} />
      <Tooltip
        contentStyle={{ backgroundColor: "#020202", border: "1px solid #058c42" }}
        labelStyle={{ color: "#16db65" }}
      />
      <Bar dataKey="count" fill="#16db65" />
    </BarChart>
  );
}

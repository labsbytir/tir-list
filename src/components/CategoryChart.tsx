import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

export interface CategoryCount {
  label: string;
  count: number;
}

export default function CategoryChart({ data }: { data: CategoryCount[] }) {
  return (
    <BarChart width={560} height={220} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="label" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Bar dataKey="count" />
    </BarChart>
  );
}

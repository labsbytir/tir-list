import { ThemeProvider } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { theme } from "./theme";

export interface CategoryCount {
  label: string;
  count: number;
}

export default function CategoryChart({ data }: { data: CategoryCount[] }) {
  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Typography variant="h6" gutterBottom>
          By category
        </Typography>
        <BarChart width={560} height={220} data={data}>
          <CartesianGrid stroke="#04471c" strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fill: "#16db65", fontFamily: "system-ui" }} />
          <YAxis allowDecimals={false} tick={{ fill: "#16db65" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#020202", border: "1px solid #058c42" }}
            labelStyle={{ color: "#16db65" }}
          />
          <Bar dataKey="count" fill="#16db65" />
        </BarChart>
      </Box>
    </ThemeProvider>
  );
}

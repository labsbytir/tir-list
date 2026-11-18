import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#16db65" },
    background: { default: "#020202", paper: "#0d2818" },
    text: { primary: "#d7efe0", secondary: "#8fb8a0" },
    divider: "#04471c",
  },
  typography: {
    fontFamily: "system-ui, sans-serif",
    h4: { fontFamily: "ui-monospace, monospace" },
    h6: { fontFamily: "ui-monospace, monospace" },
  },
  shape: { borderRadius: 8 },
});

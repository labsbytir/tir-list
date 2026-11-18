import { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  Chip,
  Container,
  Link,
  Menu,
  MenuItem,
  Paper,
  Rating,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

const theme = createTheme({
  palette: { mode: "dark", primary: { main: "#16db65" }, background: { default: "#020202", paper: "#0d2818" } },
  typography: { fontFamily: "system-ui, sans-serif", h4: { fontFamily: "ui-monospace, monospace" } },
  shape: { borderRadius: 8 },
});

type Fact = { text: string; open: number; closed: number };
type Sibling = { href: string; name: string; description: string; stars?: number };
type Price = { plan: string; price: string };
type Built = { kind: string; name: string };

export interface ListingProps {
  name: string;
  owner?: string;
  description: string;
  about?: string;
  url: string;
  github?: string;
  stars?: number;
  license?: string;
  pushedAt?: string;
  features: string[];
  highlights: string[];
  strengths: Fact[];
  tradeoffs: Fact[];
  sampled?: number;
  pricing: Price[];
  pricingSource?: string;
  builtWith: Built[];
  similar: Sibling[];
  installs: { label: string; href?: string; copy?: string }[];
}

function FactList({ title, rows }: { title: string; rows: Fact[] }) {
  if (!rows.length) return null;
  return (
    <Box>
      <Typography variant="overline">{title}</Typography>
      {rows.map((r) => (
        <Typography key={r.text} variant="body2">
          {r.text}{" "}
          <Typography component="span" variant="caption" color="text.secondary">
            {r.open} open, {r.closed} closed
          </Typography>
        </Typography>
      ))}
    </Box>
  );
}

export default function Listing(props: ListingProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [copied, setCopied] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const does = props.highlights.length ? props.highlights : props.features;
  return (
    <ThemeProvider theme={theme}>
    <Container maxWidth="lg" disableGutters sx={{ py: 2 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems="flex-start">
        <Stack spacing={2} sx={{ flex: 1 }}>
          <Box>
            <Typography variant="h4">{props.name}</Typography>
            {props.owner ? (
              <Typography variant="body2" color="text.secondary">
                {props.owner}
              </Typography>
            ) : null}
          </Box>
          <Typography>{props.description}</Typography>
          {props.about ? <Typography color="text.secondary">{props.about}</Typography> : null}
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {props.stars !== undefined ? <Chip label={`${props.stars.toLocaleString()} stars`} /> : null}
            {props.license ? <Chip label={props.license} /> : null}
            {props.pushedAt ? <Chip label={`Pushed ${props.pushedAt.slice(0, 10)}`} /> : null}
          </Stack>
          <Stack direction="row" spacing={1}>
            {props.github ? (
              <Button variant="outlined" href={props.github}>
                GitHub
              </Button>
            ) : null}
            <Button variant="contained" href={props.url}>
              Website
            </Button>
            <Button variant="text" onClick={(e) => setAnchor(e.currentTarget)}>
              More
            </Button>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
              <MenuItem component="a" href="/leaderboard">
                Leaderboard
              </MenuItem>
              <MenuItem component="a" href="/compare">
                Compare
              </MenuItem>
            </Menu>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">Your rating</Typography>
            <Rating value={score} onChange={(_, v) => setScore(v)} />
          </Stack>
          {does.length ? (
            <Box>
              <Typography variant="overline">What it does</Typography>
              {does.map((line) => (
                <Typography key={line} variant="body2">
                  {line}
                </Typography>
              ))}
            </Box>
          ) : null}
          <FactList title="Strengths" rows={props.strengths} />
          <FactList title="Tradeoffs" rows={props.tradeoffs} />
          {props.sampled ? (
            <Typography variant="caption" color="text.secondary">
              Counted from the latest {props.sampled} GitHub issues. Not a review.
            </Typography>
          ) : null}
          {props.pricing.length ? (
            <Box>
              <Typography variant="overline">Pricing</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Plan</TableCell>
                    <TableCell>Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {props.pricing.map((p) => (
                    <TableRow key={p.plan + p.price}>
                      <TableCell>{p.plan}</TableCell>
                      <TableCell>{p.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Typography variant="caption" color="text.secondary">
                From their site. Check it before you buy.
                {props.pricingSource ? ` ${props.pricingSource}` : ""}
              </Typography>
            </Box>
          ) : null}
          {props.builtWith.length ? (
            <Box>
              <Typography variant="overline">Built with</Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {props.builtWith.map((b) => (
                  <Chip key={b.kind + b.name} label={`${b.kind}: ${b.name}`} variant="outlined" />
                ))}
              </Stack>
            </Box>
          ) : null}
          {props.similar.length ? (
            <Box>
              <Typography variant="overline">Compared to</Typography>
              {props.similar.map((s) => (
                <Paper key={s.href} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                  <Link href={s.href}>{s.name}</Link>
                  <Typography variant="body2" color="text.secondary">
                    {s.description}
                    {s.stars ? ` · ${s.stars.toLocaleString()} stars` : ""}
                  </Typography>
                </Paper>
              ))}
            </Box>
          ) : null}
        </Stack>
        {props.installs.length ? (
          <Paper variant="outlined" sx={{ p: 2, width: { xs: "100%", md: 320 } }}>
            <Typography variant="overline">Install</Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {props.installs.map((row) => (
                <Stack key={row.label} direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">{row.label}</Typography>
                  {row.href ? (
                    <Button size="small" href={row.href}>
                      1-Click
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      onClick={() => {
                        if (!row.copy) return;
                        navigator.clipboard.writeText(row.copy);
                        setCopied(row.label);
                      }}
                    >
                      {copied === row.label ? "Copied" : "Copy"}
                    </Button>
                  )}
                </Stack>
              ))}
            </Stack>
          </Paper>
        ) : null}
      </Stack>
    </Container>
    </ThemeProvider>
  );
}

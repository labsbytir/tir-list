import { useState } from "react";
import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import type { Category, Entry } from "../lib/catalog";
import { theme } from "./theme";
import StackMark from "./StackMark";
import CategoryFacts, { FactGrid } from "./CategoryFacts";
import FactEvidence, { ListingEntryContext } from "./FactEvidence";

type Fact = { text: string; open: number; closed: number };
type Sibling = {
  href: string;
  name: string;
  description: string;
  stars?: number;
  reason?: string;
};

export function resolveAlternatives(
  entry: Entry,
  category: string,
  catalog: Category[]
): Sibling[] {
  const candidates = catalog
    .flatMap((c) => c.items.map((item) => ({ item, category: c.id })))
    .filter((c) => c.category !== category || c.item.slug !== entry.slug);
  const selected: { item: Entry; category: string; reason: string }[] = [];
  for (const ref of entry.details?.alternatives || []) {
    const found = candidates.find(
      (c) => c.category === ref.category && c.item.slug === ref.slug
    );
    if (
      found &&
      !selected.some(
        (c) => c.category === found.category && c.item.slug === found.item.slug
      )
    )
      selected.push({ ...found, reason: ref.reason });
  }
  for (const c of candidates) {
    if (selected.length >= 4) break;
    if (
      selected.some(
        (s) => s.category === c.category && s.item.slug === c.item.slug
      )
    )
      continue;
    const shared = c.item.tags.find(
      (tag) => tag !== category && entry.tags.includes(tag)
    );
    if (c.category === category || shared)
      selected.push({
        ...c,
        reason:
          c.category === category ? "Same category" : `Shared topic: ${shared}`,
      });
  }
  return selected.slice(0, 4).map(({ item, category: id, reason }) => ({
    href: `/${id}/${item.slug}`,
    name: item.name,
    description: item.description,
    stars: typeof item.stats?.stars === "number" ? item.stats.stars : undefined,
    reason,
  }));
}

export interface ListingProps {
  entry: Entry;
  category: string;
  modelFacts?: ReactNode;
  activity?: ReactNode;
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
  pricing: { plan: string; price: string }[];
  pricingSource?: string;
  builtWith: { kind: string; name: string }[];
  similar: Sibling[];
}

function Section({
  id,
  title,
  children,
  className = "",
}: {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`listing-section ${className}`}
      aria-labelledby={`${id}-heading`}
    >
      <h2 id={`${id}-heading`}>{title}</h2>
      {children}
    </section>
  );
}

function TextList({ title, items }: { title: string; items?: string[] }) {
  return items?.length ? (
    <div>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  ) : null;
}

function IssueFacts({ title, rows }: { title: string; rows: Fact[] }) {
  return rows.length ? (
    <div>
      <h3>{title}</h3>
      <ul>
        {rows.map((r) => (
          <li key={r.text}>
            {r.text}{" "}
            <small>
              {r.open} open, {r.closed} closed
            </small>
          </li>
        ))}
      </ul>
    </div>
  ) : null;
}

export default function Listing(props: ListingProps) {
  const { entry, category } = props;
  const d = entry.details || {};
  const setup = d.setup;
  const cost = d.cost;
  const privacy = d.dataHandling;
  const evidence = entry.evidence;
  const categoryLabel =
    (
      {
        skills: "Skills",
        agents: "Agents",
        containers: "Container images",
        servers: "MCP Servers",
        models: "Models",
        tools: "Tools",
      } as Record<string, string>
    )[category] || category;
  const [copyStatus, setCopyStatus] = useState("");
  const capabilities = props.highlights.length
    ? props.highlights
    : props.features;
  const categoryData =
    entry.categoryDetails?.[
      category as keyof NonNullable<Entry["categoryDetails"]>
    ];
  const hasCategoryFacts =
    (category === "models" && !!entry.specs) ||
    (categoryData &&
      Object.values(categoryData).some(
        (value) =>
          value !== undefined && (!Array.isArray(value) || value.length)
      ));
  const sectionLinks = [
    ["overview", "Overview"],
    ...(hasCategoryFacts ? [["category-facts", "Specifications"]] : []),
    ["getting-started", "Getting started"],
    ["pricing", "Pricing"],
    ["data-handling", "Data handling"],
    ["evidence", "Sources & evidence"],
    ...(props.similar.length ? [["alternatives", "Alternatives"]] : []),
  ];

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus(`${label} copied.`);
    } catch {
      setCopyStatus(
        `Could not copy ${label}. Select the text and copy it manually.`
      );
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <ListingEntryContext.Provider value={entry}>
        <Box
          className="listing"
          sx={{
            color: "text.primary",
            minWidth: 0,
            py: 2,
            fontSize: "1rem",
            lineHeight: 1.6,
            "& h1, & h2, & h3, & p, & figure": { margin: 0 },
            "& h1": {
              fontFamily: "ui-monospace, monospace",
              fontSize: { xs: "1.8rem", md: "2.7rem" },
              lineHeight: 1.15,
              overflowWrap: "anywhere",
            },
            "& h2": {
              fontFamily: "ui-monospace, monospace",
              fontSize: "1.2rem",
              mb: 2,
            },
            "& h3": { fontSize: "1rem", mt: 2, mb: 1 },
            "& p": { maxWidth: "72ch", mb: 1 },
            "& small, & dt, & .listing-muted": { color: "text.secondary" },
            "& .listing-fact-evidence": {
              display: "block",
              fontSize: "0.72rem",
              marginTop: "0.25rem",
            },
            "& a": {
              color: "primary.main",
              textUnderlineOffset: "0.2em",
              overflowWrap: "anywhere",
            },
            "& a:focus-visible, & button:focus-visible, & summary:focus-visible":
              { outline: "2px solid #16db65", outlineOffset: 4 },
            "& ul, & ol": { pl: 2.5, my: 1 },
            "& li": { mb: 0.75 },
            "& .listing-identity": {
              display: "flex",
              gap: 2,
              alignItems: "flex-start",
              mb: 2,
            },
            "& .listing-logo": {
              width: 56,
              height: 56,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              backgroundColor: "background.paper",
              borderRadius: 2,
              fontFamily: "ui-monospace",
              fontSize: "1.5rem",
            },
            "& .listing-logo img": {
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            },
            "& .listing-chip": {
              display: "inline-block",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "5px",
              px: 1,
              py: 0.25,
              fontSize: "0.8rem",
              mr: 0.75,
              mb: 0.75,
              maxWidth: "100%",
              overflowWrap: "anywhere",
            },
            "& .listing-actions": {
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              alignItems: "center",
              my: 2,
            },
            "& .listing-primary": {
              color: "#020202",
              backgroundColor: "primary.main",
              px: 2,
              py: 1,
              borderRadius: 1,
              textDecoration: "none",
              fontWeight: 600,
            },
            "& .listing-nav": {
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              borderBlock: "1px solid",
              borderColor: "divider",
              py: 1.5,
              my: 3,
              fontSize: "0.85rem",
            },
            "& .listing-grid": {
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                md: "minmax(0, 1fr) 310px",
              },
              columnGap: 4,
            },
            "& .listing-section": {
              gridColumn: 1,
              minWidth: 0,
              scrollMarginTop: "5rem",
              pb: 3,
              mb: 3,
              borderBottom: "1px solid",
              borderColor: "divider",
            },
            "& .listing-setup": {
              gridColumn: { xs: 1, md: 2 },
              gridRow: { md: "1 / span 3" },
              alignSelf: "start",
              backgroundColor: "background.paper",
              p: 2.5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            },
            "& .listing-wide": { gridColumn: "1 / -1" },
            "& .listing-facts": {
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0,1fr)",
                sm: "repeat(2,minmax(0,1fr))",
              },
              gap: 2,
              m: 0,
            },
            "& .listing-facts > div": { minWidth: 0 },
            "& dt": { fontSize: "0.8rem", mb: 0.25 },
            "& dd": { m: 0, overflowWrap: "anywhere" },
            "& pre": {
              m: 0,
              p: 1.5,
              backgroundColor: "#020202",
              fontSize: "0.8rem",
              overflowX: "auto",
              maxWidth: "100%",
              whiteSpace: "pre",
              borderRadius: 1,
            },
            "& button": {
              font: "inherit",
              fontSize: "0.8rem",
              color: "primary.main",
              background: "transparent",
              border: "1px solid #058c42",
              borderRadius: 1,
              px: 1.5,
              py: 0.5,
              cursor: "pointer",
            },
            "& .listing-scroll": { overflowX: "auto", maxWidth: "100%", my: 2 },
            "& table": {
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.85rem",
            },
            "& caption": { textAlign: "left", fontWeight: 600, mb: 1 },
            "& th, & td": {
              textAlign: "left",
              verticalAlign: "top",
              p: 1,
              borderBottom: "1px solid",
              borderColor: "divider",
            },
            "& .listing-media": { display: "grid", gap: 2, mt: 2 },
            "& .listing-media img": {
              display: "block",
              width: "100%",
              height: "auto",
              borderRadius: 1,
            },
            "& .listing-source": {
              padding: 1.5,
              borderLeft: "2px solid #04471c",
              mb: 2,
            },
            "& .listing-alternatives": {
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2,minmax(0,1fr))" },
              gap: 2,
            },
          }}
        >
          <header>
            <div className="listing-identity">
              <div className="listing-logo" aria-hidden="true">
                {entry.icon ? (
                  <img src={entry.icon} alt="" />
                ) : (
                  props.name.slice(0, 2)
                )}
              </div>
              <div>
                <span className="listing-muted">{categoryLabel}</span>
                <h1>{props.name}</h1>
                {(d.maintainer?.name || props.owner) && (
                  <p className="listing-muted">
                    {d.maintainer?.url ? (
                      <a href={d.maintainer.url}>
                        {d.maintainer.name || props.owner}
                      </a>
                    ) : (
                      d.maintainer?.name || props.owner
                    )}
                    {d.maintainer?.status ? ` · ${d.maintainer.status}` : ""}
                    <FactEvidence field="details.maintainer.status" />
                  </p>
                )}
              </div>
            </div>
            <p>{props.description}</p>
            <div>
              {props.stars !== undefined && (
                <span className="listing-chip">
                  {props.stars.toLocaleString()} GitHub stars
                </span>
              )}
              {props.license && (
                <span className="listing-chip">{props.license}</span>
              )}
              {props.pushedAt && (
                <span className="listing-chip">
                  Repository pushed {props.pushedAt.slice(0, 10)}
                </span>
              )}
            </div>
            <div className="listing-actions">
              <a className="listing-primary" href={props.url}>
                Visit website
              </a>
              {props.github && <a href={props.github}>GitHub</a>}
              {(d.support?.docsUrl || entry.links?.docs) && (
                <a href={d.support?.docsUrl || entry.links?.docs}>
                  Documentation
                </a>
              )}
              <a href="/compare">Compare</a>
            </div>
          </header>
          <nav className="listing-nav" aria-label="On this page">
            {sectionLinks.map(([id, title]) => (
              <a key={id} href={`#${id}`}>
                {title}
              </a>
            ))}
          </nav>
          <div className="listing-grid">
            <Section id="overview" title="Overview">
              {props.about && <p>{props.about}</p>}
              {!!d.bestFor?.length && (
                <div>
                  <h3>Best for</h3>
                  {d.bestFor.map((s) => (
                    <span className="listing-chip" key={s}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
              <TextList title="Not suited for" items={d.notSuitedFor} />
              <TextList title="What it does" items={capabilities} />
              <h3>Compatibility</h3>
              <FactEvidence field="details.compatibility" />
              {d.compatibility?.length ? (
                <div>
                  {d.compatibility.map((c) => (
                    <span className="listing-chip" key={`${c.kind}-${c.name}`}>
                      {c.name}
                      {c.versions ? ` ${c.versions}` : ""}{" "}
                      <small>({c.kind})</small>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="listing-muted">Not provided</p>
              )}
              <h3>Requirements</h3>
              <FactEvidence field="details.requirements" />
              {d.requirements?.length ? (
                <ul>
                  {d.requirements.map((r) => (
                    <li key={`${r.kind}-${r.description}`}>
                      {r.description} <small>({r.kind})</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="listing-muted">Not provided</p>
              )}
              {!!props.builtWith.length && (
                <div>
                  <h3>Built with</h3>
                  {props.builtWith.map((b) => (
                    <span className="listing-chip" key={b.kind + b.name}>
                      <StackMark name={b.name} /> {b.name}
                    </span>
                  ))}
                </div>
              )}
              {!!d.media?.length && (
                <div className="listing-media">
                  {d.media.map((m) =>
                    m.kind === "screenshot" ? (
                      <figure key={m.url}>
                        <img src={m.url} alt={m.alt || ""} loading="lazy" />
                        {m.caption && <figcaption>{m.caption}</figcaption>}
                      </figure>
                    ) : (
                      <a key={m.url} href={m.url}>
                        {m.caption || "Watch demo"}
                      </a>
                    )
                  )}
                </div>
              )}
            </Section>
            {hasCategoryFacts && (
              <Section
                id="category-facts"
                title={`${categoryLabel} specifications`}
              >
                <CategoryFacts
                  category={category}
                  details={entry.categoryDetails}
                />
                {category === "models" && props.modelFacts}
                {category === "models" && <FactEvidence field="specs" />}
              </Section>
            )}
            <Section
              id="getting-started"
              title="Getting started"
              className="listing-setup"
            >
              <FactEvidence field="details.setup" />
              {setup?.difficulty && (
                <span className="listing-chip">{setup.difficulty}</span>
              )}
              {setup?.estimatedMinutes !== undefined && (
                <span className="listing-chip">
                  About {setup.estimatedMinutes} minutes
                </span>
              )}
              {!!setup?.steps?.length && (
                <ol>
                  {setup.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              )}
              {setup?.instructions?.length ? (
                setup.instructions.map((instruction, i) => (
                  <div key={`${instruction.label}-${i}`}>
                    <h3>{instruction.label}</h3>
                    <p className="listing-muted">{instruction.target}</p>
                    {instruction.kind === "link" ? (
                      <p>
                        <a href={instruction.value}>{instruction.label}</a>
                      </p>
                    ) : (
                      <>
                        <pre tabIndex={0}>{instruction.value}</pre>
                        <div className="listing-actions">
                          <button
                            type="button"
                            onClick={() =>
                              copy(instruction.value, instruction.label)
                            }
                          >
                            Copy {instruction.kind}
                          </button>
                        </div>
                      </>
                    )}
                    {instruction.sourceUrl && (
                      <p>
                        <a href={instruction.sourceUrl}>Instruction source</a>
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p>
                  No documented install instructions provided.{" "}
                  <a
                    href={d.support?.docsUrl || entry.links?.docs || props.url}
                  >
                    Read the documentation
                  </a>{" "}
                  before getting started.
                </p>
              )}
              {setup?.example && (
                <div>
                  <h3>Example</h3>
                  {setup.example.environment && (
                    <p>{setup.example.environment}</p>
                  )}
                  <h3>Input</h3>
                  <pre tabIndex={0}>{setup.example.input}</pre>
                  {setup.example.output && (
                    <>
                      <h3>Output</h3>
                      <pre tabIndex={0}>{setup.example.output}</pre>
                    </>
                  )}
                </div>
              )}
              <p role="status" aria-live="polite">
                {copyStatus}
              </p>
            </Section>
            <Section id="pricing" title="Pricing">
              {cost?.model && (
                <p>
                  <strong>{cost.model.replaceAll("-", " ")}</strong>
                  <FactEvidence field="details.cost.model" />
                </p>
              )}
              {cost?.plans?.length ? (
                <div className="listing-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Plan</th>
                        <th>Price</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cost.plans.map((plan, i) => (
                        <tr key={`${plan.name}-${i}`}>
                          <th scope="row">{plan.name}</th>
                          <td>
                            {plan.amount !== undefined
                              ? `${plan.amount} ${plan.currency} / ${plan.unit}`
                              : "Not provided"}
                            <FactEvidence
                              field={`details.cost.plans[${i}].amount`}
                            />
                          </td>
                          <td>
                            {plan.notes}
                            {plan.sourceUrl && (
                              <>
                                {" "}
                                <a href={plan.sourceUrl}>Pricing source</a>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : props.pricing.length ? (
                <div className="listing-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Plan</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {props.pricing.map((p) => (
                        <tr key={p.plan + p.price}>
                          <th scope="row">{p.plan}</th>
                          <td>
                            {p.price}
                            <FactEvidence field="pricing" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                !cost?.model && <p className="listing-muted">Not provided</p>
              )}
              {cost?.trial && <p>Trial: {cost.trial}</p>}
              <TextList title="Separate costs" items={cost?.externalCosts} />
              {props.pricingSource && (
                <p>
                  <a href={props.pricingSource}>Pricing source</a>
                </p>
              )}
              <small>
                Prices can change. Check the provider before buying.
              </small>
              {category === "tools" &&
                entry.categoryDetails?.tools?.cancellationUrl && (
                  <p>
                    <a href={entry.categoryDetails.tools.cancellationUrl}>
                      Cancellation terms
                    </a>
                  </p>
                )}
            </Section>
            <Section id="data-handling" title="Data handling">
              <FactGrid
                prefix="details.dataHandling."
                rows={[
                  [
                    "Processing",
                    privacy?.processing || "Not provided",
                    "processing",
                  ],
                  [
                    "Retention",
                    privacy?.retention || "Not provided",
                    "retention",
                  ],
                  [
                    "Permissions",
                    privacy?.permissions?.join(", ") || "Not provided",
                    "permissions",
                  ],
                  [
                    "Data destinations",
                    privacy?.destinations?.join(", ") || "Not provided",
                    "destinations",
                  ],
                ]}
              />
              {privacy?.privacyUrl && (
                <p>
                  <a href={privacy.privacyUrl}>Privacy policy</a>
                </p>
              )}
              {(d.support?.channels?.length ||
                d.support?.tier ||
                d.support?.responseCommitment) && (
                <>
                  <h3>Support</h3>
                  {d.support.tier && (
                    <p>
                      {d.support.tier}
                      <FactEvidence field="details.support.tier" />
                    </p>
                  )}
                  {d.support.responseCommitment && (
                    <p>
                      {d.support.responseCommitment}
                      <FactEvidence field="details.support.responseCommitment" />
                    </p>
                  )}
                  {d.support.channels?.map((s) => (
                    <p key={s.url}>
                      <a href={s.url}>{s.label}</a>
                    </p>
                  ))}
                </>
              )}
            </Section>
            <Section
              id="evidence"
              title="Sources & evidence"
              className="listing-wide"
            >
              <h3>Last verified</h3>
              {evidence?.verification ? (
                <div className="listing-source">
                  <p>
                    <time dateTime={evidence.verification.checkedAt}>
                      {evidence.verification.checkedAt.slice(0, 10)}
                    </time>{" "}
                    — {evidence.verification.method}
                  </p>
                  <p>
                    Fields checked: {evidence.verification.fields.join(", ")}
                  </p>
                  <small>
                    This check covers only the fields listed, not every claim on
                    this page.
                  </small>
                </div>
              ) : (
                <p className="listing-muted">
                  Not provided. Listing metadata has not been independently
                  verified.
                </p>
              )}
              {!!evidence?.facts?.length && (
                <details>
                  <summary>Inspect fact sources</summary>
                  {evidence.facts.map((f, i) => (
                    <div
                      id={`fact-source-${i}`}
                      className="listing-source"
                      key={`${f.field}-${i}`}
                    >
                      <p>
                        <code>{f.field}</code> — {f.attribution}
                        {f.version ? ` · ${f.version}` : ""}
                      </p>
                      <p>
                        <a href={f.sourceUrl}>Source</a> · Observed{" "}
                        {f.observedAt.slice(0, 10)}
                      </p>
                    </div>
                  ))}
                </details>
              )}
              {!!evidence?.security?.length && (
                <div>
                  <h3>Security evidence</h3>
                  <p className="listing-muted">
                    Evidence describes the named target at the check date. It is
                    not a guarantee of safety.
                  </p>
                  {evidence.security.map((s, i) => (
                    <div className="listing-source" key={`${s.type}-${i}`}>
                      <h3>{s.type.toUpperCase()}</h3>
                      <p>{s.result}</p>
                      {category === "containers" &&
                        entry.categoryDetails?.containers?.digest &&
                        s.target !==
                          entry.categoryDetails.containers.digest && (
                          <p>
                            This evidence does not cover the listed image
                            digest.
                          </p>
                        )}
                      <p>
                        Target: <code>{s.target}</code>
                      </p>
                      <p>
                        Checked {s.checkedAt.slice(0, 10)} ·{" "}
                        <a href={s.sourceUrl}>Evidence report</a>
                      </p>
                      {s.counts && (
                        <p>
                          {Object.entries(s.counts)
                            .map(([severity, count]) => `${severity}: ${count}`)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {!!evidence?.benchmarks?.length && (
                <div>
                  <h3>Benchmarks</h3>
                  {evidence.benchmarks.map((b, i) => (
                    <div className="listing-source" key={`${b.metric}-${i}`}>
                      <p>
                        <strong>
                          {b.metric}: {b.value} {b.scale}
                        </strong>
                      </p>
                      <p>
                        {b.target} · Measured {b.measuredAt.slice(0, 10)}
                      </p>
                      {b.configuration && <p>{b.configuration}</p>}
                      <p>
                        <a href={b.sourceUrl}>Measurement source</a> ·{" "}
                        <a href={b.methodologyUrl}>Methodology</a>
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <IssueFacts
                title="Issue-derived strengths"
                rows={props.strengths}
              />
              <IssueFacts
                title="Issue-derived tradeoffs"
                rows={props.tradeoffs}
              />
              {(props.strengths.length > 0 || props.tradeoffs.length > 0) && (
                <small>
                  Analysis of {props.sampled ?? "an unspecified number of"}{" "}
                  GitHub issues. Not a user review.
                </small>
              )}
              {props.activity}
            </Section>
            {!!props.similar.length && (
              <Section
                id="alternatives"
                title="Alternatives"
                className="listing-wide"
              >
                <div className="listing-alternatives">
                  {props.similar.slice(0, 4).map((s) => (
                    <article key={s.href}>
                      <h3>
                        <a href={s.href}>{s.name}</a>
                      </h3>
                      <p>{s.description}</p>
                      <small>
                        {s.reason || "Same category or shared use case"}
                        {s.stars !== undefined
                          ? ` · ${s.stars.toLocaleString()} GitHub stars`
                          : ""}
                      </small>
                    </article>
                  ))}
                </div>
              </Section>
            )}
          </div>
        </Box>
      </ListingEntryContext.Provider>
    </ThemeProvider>
  );
}

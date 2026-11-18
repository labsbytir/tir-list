import { createContext, useContext } from "react";
import type { Entry } from "../lib/catalog";

export const ListingEntryContext = createContext<Entry | null>(null);

function covers(scope: string, field: string) {
  return (
    field === scope ||
    field.startsWith(`${scope}.`) ||
    field.startsWith(`${scope}[`)
  );
}

export default function FactEvidence({ field }: { field: string }) {
  const entry = useContext(ListingEntryContext);
  if (!entry) return null;
  let value: unknown = entry;
  for (const part of field.replace(/\[(\d+)\]/g, ".$1").split(".")) {
    if (!value || typeof value !== "object" || !Object.hasOwn(value, part))
      return null;
    value = (value as Record<string, unknown>)[part];
  }
  if (
    value === undefined ||
    value === null ||
    (Array.isArray(value) && !value.length)
  )
    return null;
  const checked = entry.evidence?.verification?.fields.some((scope) =>
    covers(scope, field)
  );
  const sources = (entry.evidence?.facts || [])
    .map((fact, index) => ({ fact, index }))
    .filter(
      ({ fact }) => covers(fact.field, field) || covers(field, fact.field)
    );
  return (
    <small className="listing-fact-evidence">
      {checked ? "Checked" : "Not verified"}
      {sources.map(({ fact, index }) => (
        <span key={index}>
          {" "}
          ·{" "}
          <a
            href={`#fact-source-${index}`}
            aria-label={`Source for ${field}: ${fact.attribution}`}
            onClick={() =>
              document
                .getElementById(`fact-source-${index}`)
                ?.closest("details")
                ?.setAttribute("open", "")
            }
          >
            {fact.attribution} source
          </a>
        </span>
      ))}
    </small>
  );
}

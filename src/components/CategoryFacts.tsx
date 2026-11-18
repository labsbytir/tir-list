import type { ReactNode } from "react";
import type { CategoryDetails } from "../lib/catalog";
import FactEvidence from "./FactEvidence";

export function FactGrid({
  rows,
  prefix = "",
}: {
  rows: [string, ReactNode, string?][];
  prefix?: string;
}) {
  const visible = rows.filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );
  if (!visible.length) return null;
  return (
    <dl className="listing-facts">
      {visible.map(([label, value, field]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>
            {value}
            {field && <FactEvidence field={`${prefix}${field}`} />}
          </dd>
        </div>
      ))}
    </dl>
  );
}

const list = (items?: string[]) =>
  items?.length ? items.join(", ") : undefined;
const support = (value?: boolean) =>
  value === undefined ? "Not provided" : value ? "Supported" : "Not supported";

export default function CategoryFacts({
  category,
  details,
}: {
  category: string;
  details?: CategoryDetails;
}) {
  if (!details) return null;
  if (category === "skills" && details.skills) {
    const d = details.skills;
    return (
      <FactGrid
        prefix="categoryDetails.skills."
        rows={[
          ["Skill format", d.format, "format"],
          ["Allowed tools", list(d.allowedTools), "allowedTools"],
        ]}
      />
    );
  }
  if (category === "agents" && details.agents) {
    const d = details.agents;
    return (
      <FactGrid
        prefix="categoryDetails.agents."
        rows={[
          ["Tasks", list(d.tasks), "tasks"],
          ["Execution environments", list(d.environments), "environments"],
          ["Autonomy", d.autonomy, "autonomy"],
          ["Approval controls", d.approvalControls, "approvalControls"],
          ["Memory", d.memory, "memory"],
          ["Triggers", list(d.triggers), "triggers"],
          [
            "Model requirements",
            list(d.modelRequirements),
            "modelRequirements",
          ],
          ["Integrations", list(d.integrations), "integrations"],
          [
            "Deployment options",
            list(d.deploymentOptions),
            "deploymentOptions",
          ],
        ]}
      />
    );
  }
  if (category === "containers" && details.containers) {
    const d = details.containers;
    return (
      <>
        <FactGrid
          prefix="categoryDetails.containers."
          rows={[
            ["Registry", d.registry, "registry"],
            ["Repository", d.repository, "repository"],
            ["Tag", d.tag, "tag"],
            ["Digest", d.digest, "digest"],
            ["Architectures", list(d.architectures), "architectures"],
            ["Base OS", d.baseOs, "baseOs"],
            ["License", d.license, "license"],
            ["Version policy", d.versionPolicy, "versionPolicy"],
            ["Update cadence", d.updateCadence, "updateCadence"],
            ["Rootless", support(d.rootless), "rootless"],
            [
              "Required privileges",
              list(d.requiredPrivileges),
              "requiredPrivileges",
            ],
            ["Exposed ports", list(d.ports), "ports"],
            ["Volumes", list(d.volumes), "volumes"],
          ]}
        />
        {!!d.sizes?.length && (
          <div className="listing-scroll">
            <table>
              <caption>Compressed image size</caption>
              <thead>
                <tr>
                  <th>Architecture</th>
                  <th>Size</th>
                  <th>Basis</th>
                </tr>
              </thead>
              <tbody>
                {d.sizes.map((s) => (
                  <tr key={s.architecture}>
                    <td>{s.architecture}</td>
                    <td>{s.bytes.toLocaleString()} bytes</td>
                    <td>{s.basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <FactEvidence field="categoryDetails.containers.sizes" />
          </div>
        )}
        {!!d.environment?.length && (
          <div className="listing-scroll">
            <table>
              <caption>Environment variables</caption>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {d.environment.map((v) => (
                  <tr key={v.name}>
                    <td>
                      <code>{v.name}</code>
                      {v.required ? " (required)" : ""}
                    </td>
                    <td>{v.description}</td>
                    <td>{v.secret ? "<SECRET>" : "See documentation"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <FactEvidence field="categoryDetails.containers.environment" />
          </div>
        )}
      </>
    );
  }
  if (category === "servers" && details.servers) {
    const d = details.servers;
    return (
      <>
        <FactGrid
          prefix="categoryDetails.servers."
          rows={[
            ["Transport", d.transport, "transport"],
            ["Hosting", d.hosting, "hosting"],
            [
              "Compatible clients",
              d.clients
                ?.map((c) => `${c.name}${c.versions ? ` ${c.versions}` : ""}`)
                .join(", "),
              "clients",
            ],
            [
              "Authentication",
              list(d.authentication?.methods),
              "authentication.methods",
            ],
            [
              "Permission scopes",
              list(d.authentication?.scopes),
              "authentication.scopes",
            ],
            [
              "Authentication notes",
              d.authentication?.notes,
              "authentication.notes",
            ],
          ]}
        />
        {(["tools", "resources", "prompts"] as const).map((kind) =>
          d[kind]?.length ? (
            <div key={kind}>
              <h3>
                {kind === "tools"
                  ? "Available tools"
                  : kind === "resources"
                    ? "Resources"
                    : "Prompts"}
              </h3>
              <ul>
                {d[kind]!.map((item) => (
                  <li key={item.name}>
                    <strong>{item.name}</strong>{" "}
                    {"effect" in item ? (
                      <span className="listing-chip">
                        {String(item.effect || "unknown")}
                      </span>
                    ) : null}
                    <p>{item.description}</p>
                  </li>
                ))}
              </ul>
              <FactEvidence field={`categoryDetails.servers.${kind}`} />
            </div>
          ) : null
        )}
      </>
    );
  }
  if (category === "models" && details.models) {
    const d = details.models;
    return (
      <>
        <FactGrid
          prefix="categoryDetails.models."
          rows={[
            ["Provider", d.provider, "provider"],
            ["Version", d.version, "version"],
            ["Availability", d.availability, "availability"],
            [
              "License restrictions",
              d.licenseRestrictions,
              "licenseRestrictions",
            ],
            ["Tool calling", support(d.toolCalling), "toolCalling"],
            [
              "Structured output",
              support(d.structuredOutput),
              "structuredOutput",
            ],
            ["Local hardware", d.hardwareRequirements, "hardwareRequirements"],
            ["Rate limits", d.rateLimits, "rateLimits"],
          ]}
        />
        {!!d.accessOptions?.length && (
          <div className="listing-actions">
            {d.accessOptions.map((a) => (
              <a key={a.url} href={a.url}>
                {a.label}
              </a>
            ))}
          </div>
        )}
      </>
    );
  }
  if (category === "tools" && details.tools) {
    const d = details.tools;
    return (
      <>
        <FactGrid
          prefix="categoryDetails.tools."
          rows={[
            ["Integrations", list(d.integrations), "integrations"],
            ["Import formats", list(d.importFormats), "importFormats"],
            ["Export formats", list(d.exportFormats), "exportFormats"],
            ["Offline support", support(d.offlineSupport), "offlineSupport"],
            ["Offline limitations", d.offlineLimitations, "offlineLimitations"],
            [
              "Account required",
              d.accountRequired === undefined
                ? "Not provided"
                : d.accountRequired
                  ? "Yes"
                  : "No",
              "accountRequired",
            ],
            ["Accessibility", d.accessibility, "accessibility"],
          ]}
        />
        {d.cancellationUrl && (
          <a href={d.cancellationUrl}>Cancellation terms</a>
        )}
      </>
    );
  }
  return null;
}

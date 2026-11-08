import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  GitBranch,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

type Envelope<T> = { status: string; data: T; mode?: string; source?: string };
type BranchList = Envelope<string[]> & { complete?: boolean; count?: number; warning?: string };
type TreeEntry = { path: string; type: string; sha: string; size?: number; url: string };
type RemoteFile = { content: string; name: string; path: string };
type State = "verified" | "blocked" | "attention" | "unverified";
type Check = { id: string; title: string; state: State; evidence: string[] };
type FieldCheck = { label: string; value: string; present: boolean };
type RequestDocument = {
  path: string;
  kind: "integration" | "financial";
  fields: FieldCheck[];
  branch?: { name: string; exists: boolean; listComplete: boolean };
  claims: string[];
  content: string;
  error?: string;
};
type Review = {
  timestamp: string;
  branch: string;
  branches: string[];
  treeCount: number;
  found: number;
  skipped: number;
  checks: Check[];
  documents: RequestDocument[];
};

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText || "Request failed"}`);
  }
  return response.json() as Promise<T>;
}

function firstMatch(source: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match?.[1]?.trim()) {
      return match[1].trim().replace(/[*`_]/g, "").slice(0, 160);
    }
  }
  return "";
}

function inspectDocument(file: RemoteFile, branches: string[], branchListComplete: boolean): RequestDocument {
  const content = (file.content || "").replace(/\\r?\\n/g, "\n");
  const sample = `${file.path} ${content.slice(0, 3000)}`;
  const integration =
    /integration|repository|pull request|merge request/i.test(sample) &&
    !/on[- ]chain|token withdrawal|fund withdrawal|wallet destination/i.test(sample);
  const kind = integration ? "integration" : "financial";
  const requirements: [string, RegExp[]][] = integration
    ? [
        ["Request ID", [/(?:request|withdrawal)\s*id\**\s*[:#-]\s*([^\n]+)/i]],
        ["Status", [/\bstatus\**\s*[:=-]\s*([^\n]+)/i]],
        ["Request context", [/#{1,4}\s*(?:request summary|summary)\s*\n+([^\n]+)/i, /\b(?:purpose|summary)\s*[:=-]\s*([^\n]+)/i]],
        ["Referenced branch", [/\b(?:(?:target|source)\s+)?branch(?:\s+created)?\**\s*[:=-]\s*[`"']?([A-Za-z0-9._/-]+)/i]],
        ["Change scope", [/#{1,4}\s*(?:items for withdrawal|change scope)\s*\n+([^\n]+)/i, /\b(?:scope|changes|files)\s*[:=-]\s*([^\n]+)/i]],
        ["Review evidence", [/\b(?:evidence|validation|checks|test results)\**\s*[:=-]\s*([^\n]+)/i]],
      ]
    : [
        ["Request ID", [/(?:request|withdrawal)\s*id\**\s*[:#-]\s*([^\n]+)/i]],
        ["Status", [/\bstatus\**\s*[:=-]\s*([^\n]+)/i]],
        ["Asset / token", [/\b(?:asset|token|currency)\**\s*[:=-]\s*([^\n]+)/i]],
        ["Amount", [/\bamount\**\s*[:=-]\s*([^\n]+)/i]],
        ["Chain / network", [/\b(?:chain|network)\**\s*[:=-]\s*([^\n]+)/i]],
        ["Destination", [/\b(?:destination|recipient|to address|wallet)\**\s*[:=-]\s*([^\n]+)/i]],
        ["Evidence / signature", [/\b(?:evidence|signature|transaction hash|tx hash|proof)\**\s*[:=-]\s*([^\n]+)/i]],
      ];
  const fields = requirements.map(([label, patterns]) => {
    const value = firstMatch(content, patterns);
    return { label, value: value || "Not found in document", present: Boolean(value) };
  });
  const branchName = firstMatch(content, [
    /\b(?:(?:target|source)\s+)?branch(?:\s+created)?\**\s*[:=-]\s*[`"']?([A-Za-z0-9._/-]+)/i,
  ]);
  const claims = (content.match(/(?:^|\n)\s*(?:[-*]\s*)?(?:claim|claimed|asserts?|reports?)\s*[:=-]\s*([^\n]+)/gi) || [])
    .slice(0, 5)
    .map((claim) => claim.replace(/^\s*[-*]?\s*(?:claim|claimed|asserts?|reports?)\s*[:=-]\s*/i, "").trim());
  return {
    path: file.path,
    kind,
    fields,
    ...(branchName ? { branch: { name: branchName, exists: branches.includes(branchName), listComplete: branchListComplete } } : {}),
    claims,
    content,
  };
}

function labelFor(state: State): string {
  return state === "verified"
    ? "Verified"
    : state === "attention"
      ? "Needs review"
      : state === "blocked"
        ? "Blocked"
        : "Unverified";
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : "Request unavailable";
}

export default function WarehouseReview() {
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [branchError, setBranchError] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [review, setReview] = useState<Review | null>(null);

  const loadBranches = useCallback(async () => {
    setLoadingBranches(true);
    setBranchError("");
    try {
      const result = await getJson<BranchList>("/api/github/branches");
      if (result.status !== "success" || !Array.isArray(result.data)) {
        throw new Error("Unexpected branch-list response");
      }
      setBranches(result.data);
      setSelectedBranch((current) =>
        current && result.data.includes(current)
          ? current
          : result.data.includes("main")
            ? "main"
            : result.data[0] || "",
      );
    } catch (reason) {
      setBranchError(errorText(reason));
    } finally {
      setLoadingBranches(false);
    }
  }, []);

  useEffect(() => {
    void loadBranches();
  }, [loadBranches]);

  const runReview = async () => {
    setRunning(true);
    setError("");
    try {
      const [branchResult, health, contracts, matrix, payments] = await Promise.all([
        getJson<BranchList>("/api/github/branches"),
        getJson<{ status: string }>("/api/healthz").then((value) => ({ value })).catch((reason) => ({ error: errorText(reason) })),
        getJson<Envelope<unknown[]>>("/api/contracts").then((value) => ({ value })).catch((reason) => ({ error: errorText(reason) })),
        getJson<Envelope<unknown[]>>("/api/pirc_matrix").then((value) => ({ value })).catch((reason) => ({ error: errorText(reason) })),
        getJson<{ configured: boolean }>("/api/payments/config").then((value) => ({ value })).catch((reason) => ({ error: errorText(reason) })),
      ]);
      if (branchResult.status !== "success" || !Array.isArray(branchResult.data)) {
        throw new Error("Repository branch check returned an unexpected response");
      }
      const liveBranches = branchResult.data;
      const branch = liveBranches.includes(selectedBranch)
        ? selectedBranch
        : liveBranches.includes("main")
          ? "main"
          : liveBranches[0] || "";
      if (!branch) throw new Error("No repository branches were returned");
      setBranches(liveBranches);
      setSelectedBranch(branch);

      let tree: TreeEntry[] = [];
      let treeError = "";
      try {
        const result = await getJson<Envelope<TreeEntry[]>>(
          `/api/github/tree?branch=${encodeURIComponent(branch)}`,
        );
        if (result.status !== "success" || !Array.isArray(result.data)) {
          throw new Error("Unexpected branch-tree response");
        }
        tree = result.data;
      } catch (reason) {
        treeError = errorText(reason);
      }

      const matching = tree.filter(
        (entry) =>
          entry.type === "blob" &&
          /\.md$/i.test(entry.path) &&
          /withdraw|payout|payment[-_/ ]?request/i.test(entry.path),
      );
      const documents = await Promise.all(
        matching.slice(0, 25).map(async (entry) => {
          try {
            const result = await getJson<Envelope<RemoteFile>>(
              `/api/github/file?branch=${encodeURIComponent(branch)}&path=${encodeURIComponent(entry.path)}`,
            );
            if (result.status !== "success" || typeof result.data?.content !== "string") {
              throw new Error("Unexpected request-document response");
            }
            return inspectDocument(result.data, liveBranches, branchResult.complete !== false);
          } catch (reason) {
            return {
              ...inspectDocument({ path: entry.path, name: entry.path.split("/").pop() || entry.path, content: "" }, liveBranches, branchResult.complete !== false),
              error: errorText(reason),
            };
          }
        }),
      );

      const checks: Check[] = [
        {
          id: "branches",
          title: "Repository branches",
          state: liveBranches.length && branchResult.complete !== false ? "verified" : "attention",
          evidence: [
            `${liveBranches.length} branches returned${branchResult.complete === false ? " (list is incomplete)" : ""}`,
            `Selected branch: ${branch}`,
            ...(branchResult.warning ? [branchResult.warning] : []),
          ],
        },
        {
          id: "tree",
          title: "Selected branch tree",
          state: treeError ? "attention" : "verified",
          evidence: treeError
            ? [`Tree request failed: ${treeError}`]
            : [`${tree.length} entries returned`, `${matching.length} request documents found; ${documents.length} inspected`],
        },
        {
          id: "health",
          title: "API health",
          state: "error" in health ? "attention" : health.value.status === "ok" ? "verified" : "attention",
          evidence: "error" in health ? [health.error] : [`/api/healthz: ${health.value.status}`],
        },
        {
          id: "contracts",
          title: "Contracts API response",
          state: "error" in contracts
            ? "attention"
            : contracts.value.status === "success" && Array.isArray(contracts.value.data) && contracts.value.mode !== "demo" && !/placeholder/i.test(contracts.value.source || "")
              ? "verified"
              : "attention",
          evidence: "error" in contracts
            ? [contracts.error]
            : [
                `Response: ${contracts.value.status}`,
                `Records: ${Array.isArray(contracts.value.data) ? contracts.value.data.length : "unexpected shape"}`,
                `Mode: ${contracts.value.mode || "not reported"}`,
                `Source: ${contracts.value.source || "not reported"}`,
                "A successful response verifies route availability, not the truth of source records.",
              ],
        },
        {
          id: "matrix",
          title: "PiRC matrix API response",
          state: "error" in matrix
            ? "attention"
            : matrix.value.status === "success" && Array.isArray(matrix.value.data) && matrix.value.mode !== "demo" && !/placeholder/i.test(matrix.value.source || "")
              ? "verified"
              : "attention",
          evidence: "error" in matrix
            ? [matrix.error]
            : [
                `Response: ${matrix.value.status}`,
                `Records: ${Array.isArray(matrix.value.data) ? matrix.value.data.length : "unexpected shape"}`,
                `Mode: ${matrix.value.mode || "not reported"}`,
                `Source: ${matrix.value.source || "not reported"}`,
                "A successful response verifies route availability, not the truth of source records.",
              ],
        },
        {
          id: "payments",
          title: "Payments configuration",
          state: "error" in payments ? "attention" : payments.value.configured ? "verified" : "blocked",
          evidence: "error" in payments
            ? [payments.error]
            : [`Configured flag: ${String(payments.value.configured)}`, "This does not verify token activation or on-chain readiness."],
        },
        { id: "chain", title: "Chain / RPC configuration", state: "unverified", evidence: ["No chain or RPC target is supplied by the available endpoints."] },
        { id: "logos", title: "Task-to-logo readiness", state: "unverified", evidence: ["No task-to-logo mapping is supplied by the available endpoints."] },
        { id: "delivery", title: "Report delivery", state: "attention", evidence: ["Download locally or open a prefilled GitHub issue draft.", "The user must review and click Create issue.", "No additional report destination has been specified."] },
      ];
      setReview({
        timestamp: new Date().toISOString(),
        branch,
        branches: liveBranches,
        treeCount: tree.length,
        found: matching.length,
        skipped: Math.max(0, matching.length - documents.length),
        checks,
        documents,
      });
    } catch (reason) {
      setError(errorText(reason));
    } finally {
      setRunning(false);
    }
  };

  const report = useMemo(() => (review ? createReport(review) : ""), [review]);
  const issueUrl = useMemo(() => {
    if (!review || !report) return "";
    const title = `PiRC Warehouse review — ${review.branch} — ${review.timestamp.slice(0, 10)}`;
    return `https://github.com/Ze0ro99/PiRC/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(report)}`;
  }, [report, review]);

  const download = () => {
    if (!review || !report) return;
    const objectUrl = URL.createObjectURL(new Blob([report], { type: "text/markdown;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `pirc-warehouse-review-${review.timestamp.slice(0, 10)}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  };

  return (
    <main className="min-h-full bg-[#11191d] text-[#e7ece7]">
      <div className="mx-auto max-w-[1450px] px-4 pb-12 pt-5 sm:px-7 lg:px-10">
        <header className="warehouse-enter flex flex-wrap items-center justify-between gap-4 border-b border-[#29383a] pb-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center border border-[#48615f] bg-[#1c302f] text-[#9bd1be]"><ShieldCheck size={19} /></div>
            <div>
              <div className="font-display text-[15px] font-bold tracking-[.03em] text-[#edf2ed]">PiRC / Warehouse CI</div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[.15em] text-[#849493]">Read-only operations review</div>
            </div>
          </div>
          <span className="flex items-center gap-2 border border-[#344743] bg-[#192522] px-3 py-2 text-[11px] text-[#a7c5b5]"><ShieldX size={14} /> No financial actions</span>
        </header>

        <section className="warehouse-enter warehouse-delay grid gap-6 border-b border-[#29383a] py-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.19em] text-[#8aa49b]"><span className="h-px w-6 bg-[#729c8a]" /> Network & repository assurance</p>
            <h2 className="max-w-[720px] font-display text-[clamp(2rem,4.8vw,3.7rem)] font-semibold leading-[1.08] tracking-[-.045em] text-[#e7ece7]">Inspect the evidence.<br /><span className="text-[#9bcbb7]">Keep the boundary clear.</span></h2>
            <p className="mt-4 max-w-[660px] text-sm leading-6 text-[#9aa9a7]">Check repository readiness, API signals, and withdrawal request documents. Findings separate live responses from document claims.</p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="block min-w-[210px]">
              <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[.14em] text-[#82918f]">Repository branch</span>
              <span className="relative block">
                <select data-testid="select-branch" aria-label="Selected repository branch" value={selectedBranch} disabled={loadingBranches || branches.length === 0} onChange={(event) => setSelectedBranch(event.target.value)} className="h-10 w-full appearance-none border border-[#3b4d4d] bg-[#1a2427] px-3 pr-9 font-mono text-xs text-[#d8e1dc] disabled:opacity-55">
                  {loadingBranches && <option value="">Loading branches…</option>}
                  {!loadingBranches && branches.length === 0 && <option value="">No branches available</option>}
                  {branches.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 text-[#7b8c89]" size={15} />
              </span>
            </label>
            <button data-testid="button-run-review" onClick={runReview} disabled={running || loadingBranches || !selectedBranch} className="flex h-10 items-center justify-center gap-2 border border-[#83b89f] bg-[#9acbb3] px-4 font-display text-xs font-bold text-[#16241f] transition-colors hover:bg-[#b1d8c4] disabled:cursor-not-allowed disabled:opacity-50">
              {running ? <LoaderCircle size={15} className="animate-spin" /> : <Activity size={15} />}
              {running ? "Reviewing…" : "Run read-only review"}
            </button>
            <button aria-label="Refresh branches" data-testid="button-refresh-branches" onClick={() => void loadBranches()} disabled={loadingBranches || running} className="grid h-10 w-10 place-items-center border border-[#3b4d4d] text-[#b5c3bd] transition-colors hover:bg-[#223033] disabled:opacity-50"><RefreshCw size={15} className={loadingBranches ? "animate-spin" : ""} /></button>
          </div>
        </section>

        {branchError && <div role="alert" data-testid="status-branch-error" className="mt-4 border border-[#674544] bg-[#302222] px-4 py-3 text-xs text-[#e0a9a0]">Branch list unavailable: {branchError}</div>}
        {error && <div role="alert" data-testid="status-review-error" className="mt-5 flex items-start gap-3 border border-[#704b44] bg-[#302522] px-4 py-3 text-sm text-[#e1b2a8]"><AlertCircle size={17} className="mt-0.5 shrink-0" /><div><strong>Review could not be completed.</strong><p className="mt-1 text-xs">{error}</p></div></div>}
        {!review && !running && !error && <section data-testid="empty-review" className="mt-6 grid min-h-[220px] place-items-center border border-dashed border-[#39494a] bg-[#151f22] px-6 text-center">
          <div className="max-w-md"><GitBranch className="mx-auto mb-4 text-[#9bcbb7]" size={28} /><h3 className="font-display text-lg font-semibold text-[#dbe4dd]">No review has been run</h3><p className="mt-2 text-sm leading-6 text-[#8c9b98]">Choose a branch to run a live, read-only review. No repository or financial state will be changed.</p></div>
        </section>}
        {running && <section data-testid="loading-review" aria-label="Review in progress" className="mt-6 grid gap-3 md:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="warehouse-skeleton h-24 border border-[#2c3a3d]" />)}</section>}

        {review && !running && <div data-testid="review-results" className="warehouse-enter">
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-[#2d4140] bg-[#172321] px-4 py-3">
            <div className="flex items-center gap-3"><Clock3 size={16} className="text-[#9bcbb7]" /><div><div className="font-mono text-[10px] uppercase tracking-[.13em] text-[#8b9e97]">Latest review</div><div data-testid="text-review-timestamp" className="mt-1 font-mono text-xs text-[#d2ded6]">{new Date(review.timestamp).toLocaleString()}</div></div></div>
            <div className="flex flex-wrap items-center gap-2">
              <span data-testid="text-review-branch" className="flex items-center gap-1.5 font-mono text-[11px] text-[#c4d2ca]"><GitBranch size={13} />{review.branch}</span>
              <button data-testid="button-download-report" onClick={download} className="flex items-center gap-2 border border-[#719b86] bg-[#21352d] px-3 py-2 font-mono text-[10px] uppercase tracking-[.1em] text-[#b9ddc8] hover:bg-[#2a453a]"><ArrowDownToLine size={14} /> Download report</button>
              <a data-testid="link-github-issue-draft" href={issueUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 border border-[#3b4d4d] bg-[#1a2427] px-3 py-2 font-mono text-[10px] uppercase tracking-[.1em] text-[#c2d0c8] hover:bg-[#223033]"><ArrowUpRight size={14} /> GitHub issue draft</a>
            </div>
          </div>
          <p className="mt-2 font-mono text-[10px] text-[#82928e]">The issue opens as a draft; review it and click Create issue to submit.</p>

          <section className="mt-7">
            <div className="mb-3 border-b border-[#354447] pb-2"><div className="font-mono text-[10px] uppercase tracking-[.16em] text-[#86a298]">01 / Live signals</div><h3 className="mt-1 font-display text-lg font-semibold text-[#e0e7e2]">Repository & endpoint checks</h3></div>
            <div className="grid gap-px border border-[#2e3d40] bg-[#2e3d40] md:grid-cols-2 xl:grid-cols-3">
              {review.checks.map((check) => <CheckCard key={check.id} check={check} />)}
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-3 border-b border-[#354447] pb-2"><div className="font-mono text-[10px] uppercase tracking-[.16em] text-[#86a298]">02 / Document inspection</div><h3 className="mt-1 font-display text-lg font-semibold text-[#e0e7e2]">Withdrawal request documents</h3></div>
            {!review.documents.length
              ? <p data-testid="empty-withdrawal-docs" className="border border-[#344145] bg-[#182225] px-4 py-5 text-sm text-[#9aa8a5]">No matching Markdown request files were found in this branch tree.</p>
              : <div className="space-y-2">{review.documents.map((document) => <DocumentCard key={document.path} document={document} />)}</div>}
          </section>

          <section className="mt-8 border border-[#354447] bg-[#151f22] p-4">
            <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-[#dce4df]"><ShieldX size={15} className="text-[#d3a66a]" /> Explicit limitations</h3>
            <ul data-testid="list-review-limitations" className="mt-3 grid gap-2 text-xs leading-5 text-[#9aa8a5] md:grid-cols-2">
              <li>Repository and API results are time-bound; document statements remain claims.</li>
              <li>Code builds and tests are not run against remote branches.</li>
              <li>Token activation, testnet/RPC readiness, task logos, and external API addresses remain unverified.</li>
              <li>No approval, transaction, merge, or repository write is performed by this review.</li>
            </ul>
          </section>
        </div>}
      </div>
    </main>
  );
}

function CheckCard({ check }: { check: Check }) {
  const color =
    check.state === "verified"
      ? "border-[#456c5b] bg-[#21352c] text-[#9bcbb7]"
      : check.state === "attention"
        ? "border-[#6d5940] bg-[#372f22] text-[#e1bb79]"
        : check.state === "blocked"
          ? "border-[#704841] bg-[#392522] text-[#e4a69b]"
          : "border-[#625942] bg-[#302d24] text-[#c0b28f]";
  return (
    <article data-testid={`card-check-${check.id}`} className="bg-[#182225] p-4">
      <div className="flex items-start justify-between gap-2"><h4 className="font-display text-sm font-semibold text-[#dce4df]">{check.title}</h4><span data-testid={`status-check-${check.id}`} className={`shrink-0 border px-2 py-1 font-mono text-[9px] uppercase ${color}`}>{labelFor(check.state)}</span></div>
      <ul className="mt-3 space-y-1.5">{check.evidence.map((evidence, index) => <li key={index} data-testid={`text-evidence-${check.id}-${index}`} className="flex gap-2 text-[11px] leading-5 text-[#91a09d]"><span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#718984]" />{evidence}</li>)}</ul>
    </article>
  );
}

function DocumentCard({ document }: { document: RequestDocument }) {
  const missing = document.fields.filter((field) => !field.present).length;
  return (
    <details data-testid={`card-document-${document.path}`} className="border border-[#344145] bg-[#172124]">
      <summary data-testid={`button-expand-document-${document.path}`} className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-[#1b292c]">
        <span className="min-w-0"><span className="block truncate font-mono text-xs text-[#d2ddd6]">{document.path}</span><span className="mt-1 block font-mono text-[9px] uppercase tracking-[.13em] text-[#7f918c]">{document.kind === "integration" ? "Repository integration request" : "Financial / on-chain request"}</span></span>
        <span data-testid={`status-document-${document.path}`} className="font-mono text-[10px] text-[#dfb478]">{document.error ? "File unavailable" : `${missing} missing field${missing === 1 ? "" : "s"}`}</span>
      </summary>
      <div className="border-t border-[#344145] px-4 py-4">
        {document.error && <p role="alert" className="mb-3 text-xs text-[#e2a79c]">Document fetch failed: {document.error}</p>}
        {document.branch && <p data-testid={`text-branch-claim-${document.path}`} className="mb-3 border-l-2 border-[#8b9d78] bg-[#202920] px-3 py-2 text-xs text-[#c6d0bd]">Referenced branch <code>{document.branch.name}</code> {document.branch.exists ? "exists" : document.branch.listComplete ? "was not found in the complete live branch list" : "was not found in the returned branch list, which is incomplete"}. Document status and approvals are not independently verified.</p>}
        <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">{document.fields.map((field) => <div key={field.label} className="border-b border-[#2d3a3d] py-2"><div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[.1em] text-[#82938e]">{field.present ? <Check size={11} /> : <AlertCircle size={11} />}{field.label}</div><div className={`mt-1 break-words text-xs ${field.present ? "text-[#c5d2cb]" : "text-[#c99e78]"}`}>{field.value}</div></div>)}</div>
        {document.claims.length > 0 && <div className="mt-4 border border-[#544a35] bg-[#28271f] p-3"><div className="font-mono text-[9px] uppercase text-[#d2b875]">Document claims · not verified</div><ul className="mt-2 space-y-1 text-xs text-[#b4ae96]">{document.claims.map((claim, index) => <li key={index}>{claim}</li>)}</ul></div>}
        <details className="mt-3"><summary data-testid={`button-show-source-${document.path}`} className="cursor-pointer font-mono text-[10px] uppercase text-[#8ca69b]">Show fetched source</summary><pre className="warehouse-scrollbar mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words border border-[#2d3a3d] bg-[#111a1d] p-3 font-mono text-[10px] leading-5 text-[#a3b0ab]">{document.content || "No source content available."}</pre></details>
      </div>
    </details>
  );
}

function createReport(review: Review): string {
  return [
    "# PiRC Warehouse CI — Read-only audit report",
    "",
    `- **Generated:** ${review.timestamp}`,
    `- **Selected branch:** \`${review.branch}\``,
    "- **Review mode:** Read-only. No approval, execution, broadcast, merge, or repository changes.",
    "- **Delivery:** Local download or a prefilled GitHub issue draft; a person must review and submit the issue.",
    "",
    "## Live checks",
    ...review.checks.flatMap((check) => [`### ${check.title} — ${labelFor(check.state)}`, ...check.evidence.map((item) => `- Evidence: ${item}`), ""]),
    "## Repository tree",
    `- ${review.treeCount} entries returned; ${review.found} matching Markdown request documents found; ${review.documents.length} inspected; ${review.skipped} skipped by the safety limit.`,
    "",
    "## Withdrawal request documents",
    ...(review.documents.length
      ? review.documents.flatMap((document) => [
          `### \`${document.path}\` — ${document.kind === "integration" ? "Repository integration request" : "Financial / on-chain request"}`,
          ...(document.error ? [`- Fetch failed: ${document.error}`] : []),
          ...document.fields.map((field) => `- ${field.present ? "Present" : "MISSING"} — **${field.label}:** ${field.value}`),
          ...(document.branch ? [`- Referenced branch \`${document.branch.name}\`: ${document.branch.exists ? "exists" : document.branch.listComplete ? "not found in complete list" : "not found in incomplete list"}` ] : []),
          "",
        ])
      : ["No matching Markdown request files were found by path-based discovery.", ""]),
    "## Limitations",
    "- API responses and repository content are time-bound; document assertions are not proof.",
    "- Code builds and tests are not executed on remote branches.",
    "- Token activation, testnet/RPC readiness, task logos, and external API addresses remain unverified.",
    "- No financial approval, transaction, merge, or repository write was performed.",
    "",
  ].join("\n");
}

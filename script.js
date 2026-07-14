const { useState, useEffect, useMemo } = React;

const C = {
  bg: "#F4F3EE",
  card: "#FFFFFF",
  ink: "#1B2A25",
  inkSoft: "#5D6B63",
  line: "#E5E3DA",
  green: "#2E5D4B",
  greenSoft: "#E8F0EB",
  gold: "#B08D57",
  goldSoft: "#F3ECE0",
  blue: "#5E7E9B",
  blueSoft: "#E9EEF2",
  stone: "#A6987F",
  danger: "#B4553F",
};

const GROUPS = [
  {
    name: "Growth engine",
    color: C.green,
    items: [
      { label: "US total market", ticker: "VTI", pct: 33, ret: 9.5 },
      { label: "International", ticker: "VXUS", pct: 15, ret: 8 },
    ],
  },
  {
    name: "Inflation hedge",
    color: C.gold,
    items: [
      { label: "Gold", ticker: "GLDM", pct: 7, ret: 4 },
      { label: "Bitcoin", ticker: "IBIT", pct: 3, ret: 15 },
    ],
  },
  {
    name: "Bonds & ballast",
    color: C.blue,
    items: [
      { label: "Core bonds", ticker: "BND", pct: 17, ret: 4.5 },
      { label: "Long Treasuries", ticker: "TLT", pct: 6, ret: 4.5 },
    ],
  },
  {
    name: "Spending buffer",
    color: C.stone,
    items: [
      { label: "T-bills", ticker: "SGOV", pct: 9, ret: 3.5 },
      { label: "Cash / money mkt", ticker: "", pct: 10, ret: 3.5 },
    ],
  },
];
const ALL_ITEMS = GROUPS.flatMap((g) =>
  g.items.map((i) => ({ ...i, groupColor: g.color })),
);
const BLENDED = ALL_ITEMS.reduce((n, i) => n + (i.pct / 100) * i.ret, 0);

// Age -> account composition (illustrative conversion roadmap)
const AGES = [56, 60, 66, 72, 80, 90];
const FR = {
  trad: [0.5, 0.5, 0.3, 0.1, 0.08, 0.06],
  roth: [0.15, 0.16, 0.38, 0.59, 0.63, 0.67],
  tax: [0.26, 0.25, 0.24, 0.24, 0.23, 0.22],
  cash: [0.09, 0.09, 0.08, 0.07, 0.06, 0.05],
};
function lerpAt(age, arr) {
  if (age <= AGES[0]) return arr[0];
  if (age >= AGES[AGES.length - 1]) return arr[arr.length - 1];
  for (let i = 0; i < AGES.length - 1; i++) {
    if (age >= AGES[i] && age <= AGES[i + 1]) {
      const t = (age - AGES[i]) / (AGES[i + 1] - AGES[i]);
      return arr[i] + t * (arr[i + 1] - arr[i]);
    }
  }
  return arr[arr.length - 1];
}
function composition(age) {
  const raw = {
    trad: lerpAt(age, FR.trad),
    roth: lerpAt(age, FR.roth),
    tax: lerpAt(age, FR.tax),
    cash: lerpAt(age, FR.cash),
  };
  const s = raw.trad + raw.roth + raw.tax + raw.cash;
  return {
    trad: raw.trad / s,
    roth: raw.roth / s,
    tax: raw.tax / s,
    cash: raw.cash / s,
  };
}

const ACCOUNTS = [
  {
    key: "trad",
    name: "Traditional IRA",
    inst: "Fidelity",
    color: C.blue,
    assets: ["Bonds", "Some equity"],
    role: "Tax-deferred. Shrinks each year as she converts to Roth.",
    trend: "down",
  },
  {
    key: "roth",
    name: "Roth IRA",
    inst: "Fidelity",
    color: C.green,
    assets: ["Stocks", "Bitcoin"],
    role: "Tax-free forever — the best thing to inherit. Grows as she converts.",
    trend: "up",
  },
  {
    key: "tax",
    name: "Individual / Taxable",
    inst: "Fidelity",
    color: C.gold,
    assets: ["Stocks", "Gold", "T-bills"],
    role: "Flexible; gets a tax step-up at death. Holds the buffer.",
    trend: "flat",
  },
  {
    key: "cash",
    name: "Cash",
    inst: "High-yield savings + Bank of America",
    color: C.stone,
    assets: ["Money market"],
    role: "Her paycheck & buffer — she pays herself from here.",
    trend: "flat",
  },
];

const MAINTENANCE = [
  "Rebalance once or twice a year. Only act on a sleeve that has drifted past its band — otherwise do nothing.",
  "Trim equity toward the low end of its band only when market risk is clearly elevated. Small trims, never exits.",
  "Bond tent: cash-like starts high (~19%) to protect the early-retirement years, then glides down as she ages.",
  "Keep it boring on purpose. Low activity isn't no attention — the yearly check confirms each sleeve still does its job.",
];
const PRINCIPLES = [
  { icon: "leaf", t: "Well-funded — my job is to let it run, not tinker." },
  {
    icon: "shield",
    t: "Own real, uncorrelated assets — a little for every season.",
  },
  {
    icon: "wallet",
    t: "Never a forced seller — the cash buffer protects the stocks.",
  },
  { icon: "coins", t: "Quality of life over squeezing every last dollar." },
];

const usd = (n) => "$" + Math.round(n).toLocaleString();
const usdC = (n) =>
  n >= 1e6
    ? "$" + (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M"
    : n >= 1e3
      ? "$" + Math.round(n / 1e3) + "k"
      : "$" + Math.round(n);
const usdK = (n) => "$" + Math.round(n / 1000) + "k";

const ICONS = {
  pencil: [
    <path key="a" d="M12 20h9" />,
    <path key="b" d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />,
  ],
  check: [<polyline key="a" points="20 6 9 17 4 12" />],
  rotate: [
    <polyline key="a" points="1 4 1 10 7 10" />,
    <path key="b" d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />,
  ],
  wallet: [
    <path key="a" d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />,
    <path key="b" d="M3 5v14a2 2 0 0 0 2 2h16v-5" />,
    <path key="c" d="M18 12a2 2 0 0 0 0 4h4v-4Z" />,
  ],
  shield: [<path key="a" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />],
  leaf: [
    <path
      key="a"
      d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"
    />,
    <path key="b" d="M2 21c0-3 1.85-5.36 5.08-6" />,
  ],
  coins: [
    <circle key="a" cx="9" cy="9" r="6" />,
    <path key="b" d="M18.09 10.37A6 6 0 1 1 10.34 18" />,
  ],
  refresh: [
    <path key="a" d="M21 2v6h-6" />,
    <path key="b" d="M3 12a9 9 0 0 1 15-6.7L21 8" />,
    <path key="c" d="M3 22v-6h6" />,
    <path key="d" d="M21 12a9 9 0 0 1-15 6.7L3 16" />,
  ],
  calendar: [
    <rect key="a" x="3" y="4" width="18" height="18" rx="2" />,
    <path key="b" d="M3 10h18" />,
    <path key="c" d="M8 2v4" />,
    <path key="d" d="M16 2v4" />,
  ],
  trending: [
    <polyline key="a" points="22 7 13.5 15.5 8.5 10.5 2 17" />,
    <polyline key="b" points="16 7 22 7 22 13" />,
  ],
  down: [<path key="a" d="M12 5v14" />, <path key="b" d="m19 12-7 7-7-7" />],
  up: [<path key="a" d="M12 19V5" />, <path key="b" d="m5 12 7-7 7 7" />],
  cap: [
    <path key="a" d="M22 10 12 5 2 10l10 5 10-5Z" />,
    <path key="b" d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5" />,
  ],
};
function Icon({ name, size = 16, color }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  );
}

function GrowthChart({ data, color }) {
  const w = 560,
    h = 180,
    padL = 50,
    padR = 10,
    padT = 10,
    padB = 24;
  if (!data || data.length < 2) return null;
  const minAge = data[0].age,
    maxAge = data[data.length - 1].age;
  const maxV = Math.max(...data.map((d) => d.value), 1);
  const X = (a) =>
    padL + ((a - minAge) / (maxAge - minAge)) * (w - padL - padR);
  const Y = (v) => padT + (1 - v / maxV) * (h - padT - padB);
  const line = "M " + data.map((d) => X(d.age) + "," + Y(d.value)).join(" L ");
  const area =
    "M " +
    X(minAge) +
    "," +
    Y(0) +
    " L " +
    data.map((d) => X(d.age) + "," + Y(d.value)).join(" L ") +
    " L " +
    X(maxAge) +
    "," +
    Y(0) +
    " Z";
  const xticks = [];
  for (let a = Math.ceil(minAge / 5) * 5; a <= maxAge; a += 5) xticks.push(a);
  const yticks = [0, maxV / 2, maxV];
  return (
    <svg
      viewBox={"0 0 " + w + " " + h}
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.03" />
        </linearGradient>
      </defs>
      {yticks.map((v, i) => (
        <g key={i}>
          <line x1={padL} y1={Y(v)} x2={w - padR} y2={Y(v)} stroke={C.line} />
          <text
            x={padL - 6}
            y={Y(v) + 3}
            textAnchor="end"
            fontSize="11"
            fill={C.inkSoft}
          >
            {usdC(v)}
          </text>
        </g>
      ))}
      <path d={area} fill="url(#grad)" />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" />
      {xticks.map((a) => (
        <text
          key={a}
          x={X(a)}
          y={h - 6}
          textAnchor="middle"
          fontSize="11"
          fill={C.inkSoft}
        >
          {a}
        </text>
      ))}
    </svg>
  );
}

const DEFAULTS = {
  name: "Mom's Financial Plan",
  northStar:
    "I'm well-funded. The plan is simple, it's built, and my job is to let it run.",
  age: 56,
  portfolio: 2736000,
  spending: 95000,
  growthPct: 6,
  college: 160483,
};

const FLOW = [
  {
    label: "Growth",
    sub: "stocks · gold · bitcoin",
    acct: "Fidelity",
    note: "Trim a little only in good years",
    color: C.green,
  },
  {
    label: "Stable",
    sub: "bonds",
    acct: "Fidelity",
    note: "Quietly refills the buffer below",
    color: C.blue,
  },
  {
    label: "Cash buffer",
    sub: "T-bills · savings",
    acct: "Fidelity + high-yield savings",
    note: "2–3 years of spending, ready",
    color: C.stone,
  },
  {
    label: "Her paycheck",
    sub: "what she lives on",
    acct: "Bank of America",
    note: "",
    color: C.gold,
  },
];

function FlowCard() {
  return (
    <div className="mb-6 px-6 py-6 md:px-8 md:py-7 card">
      <div className="eyebrow mb-4">How the money flows</div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          {FLOW.map((f, i) => (
            <div key={f.label}>
              <div
                className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                style={{ background: f.color }}
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}
                    >
                      {f.label}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.22)",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {f.acct}
                    </span>
                  </div>
                  <div
                    style={{
                      color: "#fff",
                      opacity: 0.85,
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {f.sub}
                  </div>
                </div>
                {f.note && (
                  <div
                    style={{
                      color: "#fff",
                      opacity: 0.9,
                      fontSize: 12,
                      textAlign: "right",
                      maxWidth: 140,
                    }}
                  >
                    {f.note}
                  </div>
                )}
              </div>
              {i < FLOW.length - 1 && (
                <div className="flex justify-center" style={{ height: 20 }}>
                  <Icon name="down" size={17} color={C.inkSoft} />
                </div>
              )}
            </div>
          ))}
        </div>
        <div
          className="rounded-xl px-4 py-4 md:self-center"
          style={{ background: C.greenSoft, maxWidth: 250 }}
        >
          <Icon name="shield" size={20} color={C.green} />
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: C.green,
              marginTop: 6,
            }}
          >
            When markets drop
          </div>
          <div
            style={{
              fontSize: 13,
              color: C.green,
              lineHeight: 1.5,
              marginTop: 4,
            }}
          >
            She skips the trim at the top and just spends from cash. A crash
            never forces her to sell stocks low — that's the whole point of the
            buckets.
          </div>
        </div>
      </div>
    </div>
  );
}

function Plan() {
  const [s, setS] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mom-plan");
      if (raw) {
        const p = JSON.parse(raw);
        if (p && p.portfolio) setS({ ...DEFAULTS, ...p });
      }
    } catch (e) {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("mom-plan", JSON.stringify(s));
    } catch (e) {}
  }, [s, loaded]);
  const set = (patch) => setS((p) => ({ ...p, ...patch }));

  const rate = s.portfolio > 0 ? (s.spending / s.portfolio) * 100 : 0;
  const status =
    rate < 3
      ? { t: "Very safe", c: C.green }
      : rate < 4
        ? { t: "Comfortable", c: C.green }
        : rate < 5
          ? { t: "Watch it", c: C.gold }
          : { t: "Stretch", c: C.danger };
  const markerLeft = Math.max(2, Math.min(98, (rate / 6) * 100));

  const passive = useMemo(() => {
    const y = ALL_ITEMS.reduce((n, a) => {
      const yld =
        a.ticker === "BND" ||
        a.ticker === "TLT" ||
        a.ticker === "SGOV" ||
        a.ticker === ""
          ? a.ret / 100
          : a.ticker === "VTI" || a.ticker === "VXUS"
            ? 0.015
            : 0;
      return n + (a.pct / 100) * yld;
    }, 0);
    return s.portfolio * y;
  }, [s.portfolio]);

  const proj = useMemo(() => {
    const r = s.growthPct / 100;
    const data = [];
    let bal = s.portfolio;
    let runOut = null;
    for (let a = s.age; a <= 90; a++) {
      data.push({ age: a, value: Math.max(0, Math.round(bal)) });
      bal = bal * (1 + r) - s.spending;
      if (bal <= 0 && runOut === null) runOut = a + 1;
    }
    return { data, end: data[data.length - 1].value, runOut };
  }, [s.age, s.portfolio, s.spending, s.growthPct]);

  const comp = useMemo(() => composition(s.age), [s.age]);
  const acctVal = {
    trad: s.portfolio * comp.trad,
    roth: s.portfolio * comp.roth,
    tax: s.portfolio * comp.tax,
    cash: s.portfolio * comp.cash,
  };

  const numInput = (val, on, w = 120) => (
    <input
      type="number"
      value={val}
      onChange={(e) => on(Number(e.target.value))}
      className="px-2 py-1 rounded"
      style={{ border: "1px solid " + C.line, width: w }}
    />
  );

  return (
    <div className="min-h-screen w-full px-4 py-8 md:px-8">
      <div className="mx-auto" style={{ maxWidth: 900 }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            {edit ? (
              <input
                value={s.name}
                onChange={(e) => set({ name: e.target.value })}
                className="serif w-full px-3 py-2 rounded-lg"
                style={{ border: "1px solid " + C.line, fontSize: 28 }}
              />
            ) : (
              <h1
                className="serif"
                style={{ fontSize: 34, lineHeight: 1.1, fontWeight: 600 }}
              >
                {s.name}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {edit && (
              <button
                onClick={() => setS(DEFAULTS)}
                className="flex items-center gap-1 px-3 rounded-full text-sm"
                style={{
                  height: 40,
                  border: "1px solid " + C.line,
                  color: C.inkSoft,
                }}
              >
                <Icon name="rotate" size={13} /> Reset
              </button>
            )}
            <button
              onClick={() => setEdit((v) => !v)}
              className="rounded-full flex items-center justify-center"
              style={{
                width: 40,
                height: 40,
                border: "1px solid " + C.line,
                background: edit ? C.gold : C.card,
                color: edit ? "#fff" : C.inkSoft,
              }}
            >
              {edit ? (
                <Icon name="check" size={18} />
              ) : (
                <Icon name="pencil" size={16} />
              )}
            </button>
          </div>
        </div>

        {/* North star */}
        <div
          className="mb-5 px-6 py-6 md:px-8 md:py-7 card"
          style={{ background: C.green }}
        >
          {edit ? (
            <textarea
              value={s.northStar}
              onChange={(e) => set({ northStar: e.target.value })}
              rows={2}
              className="serif w-full bg-transparent resize-none"
              style={{ color: "#fff", fontSize: 22, lineHeight: 1.35 }}
            />
          ) : (
            <p
              className="serif"
              style={{
                color: "#F4F3EE",
                fontSize: 23,
                lineHeight: 1.35,
                fontWeight: 500,
              }}
            >
              &ldquo;{s.northStar}&rdquo;
            </p>
          )}
        </div>

        {/* Today strip */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="px-5 py-4 card">
            <div style={{ fontSize: 12, color: C.inkSoft }}>Age</div>
            {edit ? (
              numInput(s.age, (v) => set({ age: v }), 80)
            ) : (
              <div className="serif" style={{ fontSize: 30, fontWeight: 600 }}>
                {s.age}
              </div>
            )}
          </div>
          <div className="px-5 py-4 card">
            <div style={{ fontSize: 12, color: C.inkSoft }}>
              Savings (excl. college)
            </div>
            {edit ? (
              numInput(s.portfolio, (v) => set({ portfolio: v }), 150)
            ) : (
              <div className="serif" style={{ fontSize: 30, fontWeight: 600 }}>
                {usdC(s.portfolio)}
              </div>
            )}
          </div>
        </div>

        {/* Am I okay */}
        <div className="mb-6 px-6 py-6 md:px-8 md:py-7 card">
          <div className="eyebrow mb-4">Am I okay?</div>
          <div className="flex flex-col md:flex-row md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <span
                  className="serif"
                  style={{
                    fontSize: 52,
                    fontWeight: 600,
                    color: status.c,
                    lineHeight: 1,
                  }}
                >
                  {rate.toFixed(1)}%
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    of her savings
                  </div>
                  <div style={{ fontSize: 13, color: C.inkSoft }}>
                    spent per year
                  </div>
                  <span
                    className="inline-block mt-1 px-2 py-0.5 rounded-full"
                    style={{
                      background: status.c,
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    {status.t}
                  </span>
                </div>
              </div>
              <p
                className="mt-4"
                style={{
                  fontSize: 14,
                  color: C.inkSoft,
                  lineHeight: 1.5,
                  maxWidth: 460,
                }}
              >
                She'd spend {usd(s.spending)} a year from {usd(s.portfolio)}.
                Planners call <strong style={{ color: C.ink }}>4%</strong> the
                &ldquo;safe-forever&rdquo; line — spend under it and savings
                generally last for life. She's{" "}
                {rate < 4 ? "comfortably under it." : "at or above it."}
              </p>
            </div>
            <div
              className="rounded-xl px-4 py-4 shrink-0"
              style={{ background: C.greenSoft, minWidth: 200 }}
            >
              <div style={{ fontSize: 12, color: C.green }}>
                Her money quietly earns
              </div>
              <div
                className="serif"
                style={{ fontSize: 26, color: C.green, fontWeight: 600 }}
              >
                {usd(passive)}/yr
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: C.green,
                  opacity: 0.85,
                  marginTop: 2,
                }}
              >
                in interest &amp; dividends —{" "}
                {passive >= s.spending
                  ? "covering her whole year"
                  : "toward her spending"}{" "}
                without selling a thing.
              </div>
            </div>
          </div>
          <div className="relative mt-7" style={{ height: 46 }}>
            <div
              className="absolute w-full rounded-full overflow-hidden flex"
              style={{ height: 14, top: 6 }}
            >
              <div
                style={{ width: (4 / 6) * 100 + "%", background: C.greenSoft }}
              />
              <div
                style={{ width: (1 / 6) * 100 + "%", background: C.goldSoft }}
              />
              <div
                style={{ width: (1 / 6) * 100 + "%", background: "#F1DED8" }}
              />
            </div>
            <div
              className="absolute"
              style={{
                left: (4 / 6) * 100 + "%",
                top: -2,
                height: 30,
                width: 2,
                background: C.inkSoft,
                opacity: 0.55,
              }}
            />
            <div
              className="absolute"
              style={{
                left: (4 / 6) * 100 + "%",
                top: 30,
                transform: "translateX(-50%)",
                fontSize: 11,
                color: C.inkSoft,
                whiteSpace: "nowrap",
              }}
            >
              4% safe line
            </div>
            <div
              className="absolute"
              style={{ left: 0, top: 30, fontSize: 11, color: C.inkSoft }}
            >
              spends less
            </div>
            <div
              className="absolute"
              style={{
                left: markerLeft + "%",
                top: 0,
                transform: "translateX(-50%)",
                transition: "left 300ms ease",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: status.c,
                  border: "3px solid #fff",
                  boxShadow: "0 1px 5px rgba(0,0,0,0.22)",
                }}
              />
            </div>
          </div>
          <div className="mt-6">
            <div
              className="flex justify-between mb-1"
              style={{ fontSize: 12, color: C.inkSoft }}
            >
              <span>Try a spending level</span>
              <span style={{ fontWeight: 600, color: C.ink }}>
                {usdK(s.spending)}/yr
              </span>
            </div>
            <input
              type="range"
              min={40000}
              max={140000}
              step={2500}
              value={s.spending}
              onChange={(e) => set({ spending: Number(e.target.value) })}
            />
            <div
              className="flex justify-between mt-1"
              style={{ fontSize: 11, color: C.inkSoft }}
            >
              <span>Comfortable ~$70k</span>
              <span>Generous ~$95k</span>
              <span>Everything ~$120k</span>
            </div>
          </div>
        </div>

        {/* Growth projection */}
        <div className="mb-6 px-6 py-6 md:px-8 md:py-7 card">
          <div className="flex items-baseline justify-between mb-1 flex-wrap gap-2">
            <div className="eyebrow">What it could grow to</div>
            <div style={{ fontSize: 13, color: C.inkSoft }}>
              by age 90 →{" "}
              <span
                className="serif"
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: proj.runOut ? C.danger : C.green,
                }}
              >
                {proj.runOut ? "runs out ~" + proj.runOut : usdC(proj.end)}
              </span>
            </div>
          </div>
          <p
            className="mb-3"
            style={{ fontSize: 13, color: C.inkSoft, maxWidth: 560 }}
          >
            From {usdC(s.portfolio)} at age {s.age}, growing {s.growthPct}% a
            year while she spends {usdK(s.spending)}.{" "}
            {proj.runOut
              ? "At this rate it would run low — raise returns or lower spending."
              : "It keeps growing even while she spends."}
          </p>
          <GrowthChart data={proj.data} color={C.green} />
          <div className="mt-4">
            <div
              className="flex justify-between mb-1"
              style={{ fontSize: 12, color: C.inkSoft }}
            >
              <span className="flex items-center gap-1">
                <Icon name="trending" size={13} /> Average return per year
              </span>
              <span style={{ fontWeight: 600, color: C.ink }}>
                {s.growthPct}%
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={10}
              step={0.5}
              value={s.growthPct}
              onChange={(e) => set({ growthPct: Number(e.target.value) })}
            />
            <div
              className="flex justify-between mt-1"
              style={{ fontSize: 11, color: C.inkSoft }}
            >
              <span>Cautious 3%</span>
              <span>Her plan ~6–7%</span>
              <span>Strong 10%</span>
            </div>
          </div>
        </div>

        {/* Where it lives + what she owns */}
        <div className="mb-6 px-6 py-6 md:px-8 md:py-7 card">
          <div className="eyebrow mb-4">Where it lives — and how it moves</div>

          {/* age scrubber */}
          <div className="mb-4">
            <div
              className="flex justify-between mb-1"
              style={{ fontSize: 12, color: C.inkSoft }}
            >
              <span>See the accounts at age</span>
              <span style={{ fontWeight: 700, color: C.ink }}>{s.age}</span>
            </div>
            <input
              type="range"
              min={56}
              max={90}
              step={1}
              value={s.age}
              onChange={(e) => set({ age: Number(e.target.value) })}
            />
            <div
              className="flex justify-between mt-1"
              style={{ fontSize: 11, color: C.inkSoft }}
            >
              <span>56 · today</span>
              <span>72 · conversions done</span>
              <span>90</span>
            </div>
          </div>

          {/* stacked migration bar */}
          <div
            className="w-full rounded-full overflow-hidden flex mb-2"
            style={{ height: 26 }}
          >
            {ACCOUNTS.map((a) => (
              <div
                key={a.key}
                style={{
                  width: comp[a.key] * 100 + "%",
                  background: a.color,
                  transition: "width 300ms",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {comp[a.key] > 0.08 && (
                  <span
                    style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}
                  >
                    {Math.round(comp[a.key] * 100)}%
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="mb-5" style={{ fontSize: 12, color: C.inkSoft }}>
            As she converts each year, money migrates from{" "}
            <span style={{ color: C.blue, fontWeight: 700 }}>Traditional</span>{" "}
            (taxed later) into{" "}
            <span style={{ color: C.green, fontWeight: 700 }}>Roth</span>{" "}
            (tax-free forever). Drag the age to watch it.
          </div>

          {/* account cards */}
          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            {ACCOUNTS.map((a) => (
              <div
                key={a.key}
                className="rounded-xl px-4 py-3"
                style={{ background: C.bg, border: "1px solid " + C.line }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 4,
                        background: a.color,
                      }}
                    />
                    <span style={{ fontWeight: 700, fontSize: 14 }}>
                      {a.name}
                    </span>
                    {a.trend !== "flat" && (
                      <Icon
                        name={a.trend}
                        size={13}
                        color={a.trend === "up" ? C.green : C.danger}
                      />
                    )}
                  </div>
                  <div className="text-right">
                    <div
                      className="serif"
                      style={{ fontSize: 16, fontWeight: 600, color: a.color }}
                    >
                      {usdC(acctVal[a.key])}
                    </div>
                    <div style={{ fontSize: 11, color: C.inkSoft }}>
                      {Math.round(comp[a.key] * 100)}% of total
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 2 }}>
                  {a.inst}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {a.assets.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-full"
                      style={{
                        background: C.card,
                        border: "1px solid " + C.line,
                        fontSize: 11,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: C.inkSoft,
                    marginTop: 6,
                    lineHeight: 1.4,
                  }}
                >
                  {a.role}
                </div>
              </div>
            ))}
          </div>

          <div
            className="rounded-xl px-4 py-3 mb-6 flex items-start gap-2"
            style={{ background: C.greenSoft }}
          >
            <Icon name="shield" size={18} color={C.green} />
            <div style={{ fontSize: 13, color: C.green, lineHeight: 1.5 }}>
              She pays herself from <strong>Cash (Bank of America)</strong>,
              refilled from the buckets above. When markets drop she simply
              spends from cash and skips the trim — so a crash never forces her
              to sell stocks low.
            </div>
          </div>

          {/* target mix */}
          <div className="pt-5" style={{ borderTop: "1px solid " + C.line }}>
            <div className="flex items-baseline justify-between mb-3">
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                What she owns — the target mix
              </div>
              <div style={{ fontSize: 12, color: C.inkSoft }}>
                blended ~{BLENDED.toFixed(1)}%/yr
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {GROUPS.map((g) => (
                <div key={g.name}>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: g.color,
                      }}
                    />
                    <span style={{ fontWeight: 700, fontSize: 13 }}>
                      {g.name}
                    </span>
                  </div>
                  {g.items.map((i) => (
                    <div
                      key={i.label}
                      className="flex justify-between pl-4"
                      style={{ fontSize: 13, color: C.inkSoft }}
                    >
                      <span>
                        {i.label}{" "}
                        {i.ticker && (
                          <span style={{ color: C.gold, fontWeight: 600 }}>
                            {i.ticker}
                          </span>
                        )}
                      </span>
                      <span>
                        <span style={{ color: C.ink, fontWeight: 600 }}>
                          {i.pct}%
                        </span>{" "}
                        · {usdC((s.portfolio * i.pct) / 100)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div
              style={{
                fontSize: 11,
                color: C.inkSoft,
                marginTop: 8,
                fontStyle: "italic",
              }}
            >
              Account totals migrate with age (above); the target mix is what
              she holds across all of them.
            </div>
          </div>
        </div>

        {/* 529 — separate */}
        <div className="mb-6 px-6 py-5 card" style={{ background: C.goldSoft }}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Icon name="cap" size={20} color={C.gold} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  College fund (529)
                </div>
                <div style={{ fontSize: 12, color: C.inkSoft }}>
                  For children and grandchildren, not counted above
                </div>
              </div>
            </div>
            {edit ? (
              numInput(s.college, (v) => set({ college: v }), 140)
            ) : (
              <div
                className="serif"
                style={{ fontSize: 24, fontWeight: 600, color: C.gold }}
              >
                {usdC(s.college)}
              </div>
            )}
          </div>
        </div>

        {/* Money flow */}
        <FlowCard />

        {/* Maintenance + principles */}
        <div className="mb-6 px-6 py-6 md:px-8 md:py-7 card">
          <div className="eyebrow mb-4">How she runs it</div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
            {[
              { icon: "wallet", t: "Pay herself from cash", s: "ongoing" },
              { icon: "refresh", t: "Rebalance", s: "1–2×/yr if drifted" },
              { icon: "calendar", t: "Roth convert", s: "each Oct–Nov" },
            ].map((it) => (
              <span
                key={it.t}
                className="flex items-center gap-2"
                style={{ fontSize: 13 }}
              >
                <Icon name={it.icon} size={16} color={C.green} />
                <span style={{ fontWeight: 600 }}>{it.t}</span>
                <span style={{ color: C.inkSoft }}>· {it.s}</span>
              </span>
            ))}
          </div>
          <div className="grid gap-2 mb-5">
            {MAINTENANCE.map((m, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl px-4 py-2.5"
                style={{ background: C.bg, border: "1px solid " + C.line }}
              >
                <span
                  className="serif shrink-0"
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: C.gold,
                    lineHeight: 1.2,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ fontSize: 13, color: C.ink, lineHeight: 1.45 }}>
                  {m}
                </span>
              </div>
            ))}
          </div>
          <div
            className="grid sm:grid-cols-2 gap-x-6 gap-y-3 pt-4"
            style={{ borderTop: "1px solid " + C.line }}
          >
            {PRINCIPLES.map((p, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Icon name={p.icon} size={17} color={C.gold} />
                <span style={{ fontSize: 13.5, lineHeight: 1.4 }}>{p.t}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="text-center pb-4"
          style={{ fontSize: 12, color: C.inkSoft }}
        >
          A plan to feel calm about — not a document to study. Not financial
          advice.
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Plan />);

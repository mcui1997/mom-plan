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

/* ---------------- formatting helpers ---------------- */
const usd = (n) => "$" + Math.round(n).toLocaleString();
const usdC = (n) =>
  n >= 1e6
    ? "$" + (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M"
    : n >= 1e3
      ? "$" + Math.round(n / 1e3) + "k"
      : "$" + Math.round(n);
const usdK = (n) => "$" + Math.round(n / 1000) + "k";

/* ---------------- comma number input ---------------- */
function CommaInput({ value, onChange, className, style, placeholder }) {
  const [text, setText] = useState(
    value != null ? Number(value).toLocaleString() : "",
  );
  useEffect(() => {
    setText(value != null ? Number(value).toLocaleString() : "");
  }, [value]);
  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setText(raw === "" ? "" : Number(raw).toLocaleString());
    onChange(raw === "" ? 0 : Number(raw));
  };
  return (
    <input
      type="text"
      inputMode="numeric"
      value={text}
      onChange={handleChange}
      className={className}
      style={style}
      placeholder={placeholder}
    />
  );
}

/* ---------------- icons ---------------- */
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
  down: [<path key="a" d="M12 5v14" />, <path key="b" d="m19 12-7 7-7-7" />],
  storm: [
    <path key="a" d="M22 10 12 5 2 10l10 5 10-5Z" opacity="0" />,
    <path key="b" d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
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

/* ---------------- phase + allocation engine ---------------- */
const PHASES = [
  { key: "build", label: "Build", blurb: "Time is your biggest asset." },
  {
    key: "sharpen",
    label: "Sharpen",
    blurb: "Compounding hard, risk coming into focus.",
  },
  {
    key: "transition",
    label: "Transition",
    blurb: "Protecting the runway into retirement.",
  },
  { key: "live", label: "Live", blurb: "Living off it — make it last." },
];
function phaseFor(age, retirementAge) {
  const yrs = retirementAge - age;
  if (yrs <= 0) return "live";
  if (yrs <= 5) return "transition";
  if (yrs <= 15) return "sharpen";
  return "build";
}

const BASE_GROWTH = { build: 88, sharpen: 72, transition: 52, live: 40 };
const STABLE_SHARE_OF_REST = {
  build: 0.55,
  sharpen: 0.55,
  transition: 0.55,
  live: 0.45,
};
const RISK_SHIFT = { conservative: -15, neutral: 0, aggressive: 35 };

const ASSET_RETURN = { us: 10.5, intl: 9, gold: 8, btc: 22, stable: 3.4, cash: 1.5 };
const GROWTH_SPLIT = { us: 0.55, intl: 0.2, gold: 0.15, btc: 0.1 };

function allocationFor(phase, risk) {
  let growth = BASE_GROWTH[phase] + (RISK_SHIFT[risk] || 0);
  growth = Math.max(15, Math.min(95, growth));
  const rest = 100 - growth;
  const stableShare = STABLE_SHARE_OF_REST[phase];
  const stable = rest * stableShare;
  const cash = rest * (1 - stableShare);
  return {
    growth,
    stable,
    cash,
    us: growth * GROWTH_SPLIT.us,
    intl: growth * GROWTH_SPLIT.intl,
    gold: growth * GROWTH_SPLIT.gold,
    btc: growth * GROWTH_SPLIT.btc,
  };
}

function allocationFromGrowthPct(phase, growthPct) {
  const growth = Math.max(15, Math.min(95, growthPct));
  const rest = 100 - growth;
  const stableShare = STABLE_SHARE_OF_REST[phase];
  const stable = rest * stableShare;
  const cash = rest * (1 - stableShare);
  return {
    growth,
    stable,
    cash,
    us: growth * GROWTH_SPLIT.us,
    intl: growth * GROWTH_SPLIT.intl,
    gold: growth * GROWTH_SPLIT.gold,
    btc: growth * GROWTH_SPLIT.btc,
  };
}

function blendedReturn(alloc) {
  return (
    (alloc.us * ASSET_RETURN.us +
      alloc.intl * ASSET_RETURN.intl +
      alloc.gold * ASSET_RETURN.gold +
      alloc.btc * ASSET_RETURN.btc +
      alloc.stable * ASSET_RETURN.stable +
      alloc.cash * ASSET_RETURN.cash) /
    100
  );
}

function growthPctForReturn(phase, targetReturn) {
  const lo = 15,
    hi = 95;
  let bestPct = lo,
    bestDiff = Infinity;
  for (let p = lo; p <= hi; p += 1) {
    const r = blendedReturn(allocationFromGrowthPct(phase, p));
    const diff = Math.abs(r - targetReturn);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestPct = p;
    }
  }
  return bestPct;
}

function riskForGrowthPct(phase, growthPct) {
  const presets = ["conservative", "neutral", "aggressive"];
  let best = "neutral",
    bestDiff = Infinity;
  presets.forEach((r) => {
    const g = Math.max(15, Math.min(95, BASE_GROWTH[phase] + RISK_SHIFT[r]));
    const diff = Math.abs(g - growthPct);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = r;
    }
  });
  return best;
}

const GROWTH_RATE_MIN = 3;
const GROWTH_RATE_MAX = 10;

function GrowthChart({ data, color, markAge, onHover }) {
  const w = 560,
    h = 190,
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

  const handleMove = (e) => {
    if (!onHover) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const xPx = ((e.clientX - rect.left) / rect.width) * w;
    const ageAtX =
      minAge + ((xPx - padL) / (w - padL - padR)) * (maxAge - minAge);
    let nearest = data[0];
    let bestDiff = Infinity;
    for (const d of data) {
      const diff = Math.abs(d.age - ageAtX);
      if (diff < bestDiff) {
        bestDiff = diff;
        nearest = d;
      }
    }
    onHover(nearest);
  };
  const handleLeave = () => {
    if (onHover) onHover(null);
  };

  return (
    <svg
      viewBox={"0 0 " + w + " " + h}
      style={{
        width: "100%",
        height: "auto",
        display: "block",
        cursor: "crosshair",
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onTouchMove={(e) => {
        if (!e.touches || !e.touches[0]) return;
        handleMove({
          currentTarget: e.currentTarget,
          clientX: e.touches[0].clientX,
        });
      }}
      onTouchEnd={handleLeave}
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
      {markAge != null && markAge >= minAge && markAge <= maxAge && (
        <line
          x1={X(markAge)}
          y1={padT}
          x2={X(markAge)}
          y2={h - padB}
          stroke={C.gold}
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
      )}
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

/* ---------------- age / phase bar ---------------- */
function AgeBar({ age, retirementAge }) {
  const lo = 20,
    hi = Math.max(90, retirementAge + 5);
  const span = hi - lo;
  const stops = [
    { until: retirementAge - 15, color: C.green },
    { until: retirementAge - 5, color: C.gold },
    { until: retirementAge, color: C.blue },
    { until: hi, color: C.stone },
  ];
  let last = lo;
  const segments = stops.map((s) => {
    const start = Math.max(lo, last);
    const end = Math.max(start, Math.min(hi, s.until));
    last = end;
    return { start, end, color: s.color };
  });
  const pct = (a) => ((Math.max(lo, Math.min(hi, a)) - lo) / span) * 100;
  const phase = phaseFor(age, retirementAge);
  const phaseInfo = PHASES.find((p) => p.key === phase);
  return (
    <div>
      <div
        className="relative"
        style={{
          height: 14,
          borderRadius: 999,
          overflow: "hidden",
          display: "flex",
        }}
      >
        {segments.map((s, i) =>
          s.end > s.start ? (
            <div
              key={i}
              style={{
                width: ((s.end - s.start) / span) * 100 + "%",
                background: s.color,
              }}
            />
          ) : null,
        )}
      </div>
      <div className="relative" style={{ height: 26 }}>
        <div
          className="absolute"
          style={{
            left: pct(retirementAge) + "%",
            top: -20,
            transform: "translateX(-50%)",
            width: 2,
            height: 20,
            background: C.inkSoft,
            opacity: 0.5,
          }}
        />
        <div
          className="absolute"
          style={{
            left: pct(retirementAge) + "%",
            top: 2,
            transform: "translateX(-50%)",
            fontSize: 10,
            color: C.inkSoft,
            whiteSpace: "nowrap",
          }}
        >
          retire at {retirementAge}
        </div>
        <div
          className="absolute"
          style={{
            left: pct(age) + "%",
            top: -24,
            transform: "translateX(-50%)",
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: C.ink,
              border: "3px solid #fff",
              boxShadow: "0 1px 5px rgba(0,0,0,0.25)",
            }}
          />
        </div>
      </div>
      <div className="mt-3" style={{ fontSize: 13, color: C.inkSoft }}>
        You're in <strong style={{ color: C.ink }}>{phaseInfo.label}</strong> —{" "}
        {phaseInfo.blurb}
      </div>
    </div>
  );
}

/* ---------------- questionnaire ---------------- */
const Q_DEFAULTS = {
  age: 35,
  retirementAge: 65,
  portfolio: 150000,
  savings: 15000,
  risk: "neutral",
};

function Questionnaire({ initial, onSubmit }) {
  const [q, setQ] = useState(initial || Q_DEFAULTS);
  const set = (patch) => setQ((p) => ({ ...p, ...patch }));
  const preRetirement = q.age < q.retirementAge;
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10">
      <div className="w-full" style={{ maxWidth: 480 }}>
        <div className="text-center mb-8">
          <h1 className="serif" style={{ fontSize: 32, fontWeight: 600 }}>
            Financial Freedom Plan
          </h1>
          <p style={{ fontSize: 14, color: C.inkSoft, marginTop: 6 }}>
            Build financial freedom through long-term investing in diversified,
            resilient assets.
          </p>
        </div>
        <div className="card px-6 py-7 md:px-8 md:py-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="q-field">
              <label>Current age</label>
              <CommaInput value={q.age} onChange={(v) => set({ age: v })} />
            </div>
            <div className="q-field">
              <label>Retirement age</label>
              <CommaInput
                value={q.retirementAge}
                onChange={(v) => set({ retirementAge: v })}
              />
            </div>
          </div>
          <div className="q-field mt-4">
            <label>Current portfolio value</label>
            <CommaInput
              value={q.portfolio}
              onChange={(v) => set({ portfolio: v })}
            />
          </div>
          {preRetirement && (
            <div className="q-field mt-4">
              <label>Annual savings (investing per year)</label>
              <CommaInput
                value={q.savings}
                onChange={(v) => set({ savings: v })}
              />
            </div>
          )}
          <div className="mt-5">
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: C.inkSoft,
                marginBottom: 8,
              }}
            >
              Risk tolerance
            </label>
            <div
              className="seg"
              style={{
                width: "100%",
                justifyContent: "space-between",
                display: "flex",
              }}
            >
              {["conservative", "neutral", "aggressive"].map((r) => (
                <button
                  key={r}
                  className={r === q.risk ? "active" : ""}
                  style={{ flex: 1 }}
                  onClick={() => set({ risk: r })}
                >
                  {r[0].toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => onSubmit(q)}
            className="w-full mt-7 rounded-full"
            style={{
              background: C.green,
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              padding: "13px 0",
            }}
          >
            See my plan
          </button>
          <div
            className="text-center mt-4"
            style={{ fontSize: 11, color: C.inkSoft }}
          >
            Illustrative only — not financial advice.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- flow / allocation card ---------------- */
function FlowCard({ alloc, portfolio }) {
  const dollars = (pct) => (pct / 100) * portfolio;

  const buckets = [
    {
      label: "Growth",
      color: C.green,
      soft: C.greenSoft,
      pct: alloc.growth,
      note: "The engine — long-term compounding",
      sub: [
        { label: "US stocks", pct: alloc.us },
        { label: "International stocks", pct: alloc.intl },
        { label: "Gold", pct: alloc.gold },
        { label: "Bitcoin", pct: alloc.btc },
      ],
    },
    {
      label: "Stable",
      color: C.blue,
      soft: C.blueSoft,
      pct: alloc.stable,
      note: "Bonds & treasuries — ballast that steadies the ride",
      sub: null,
    },
    {
      label: "Cash buffer",
      color: C.stone,
      soft: "#F0EDE5",
      pct: alloc.cash,
      note: "T-bills & savings — spend from here first",
      sub: null,
    },
  ];

  return (
    <div className="mb-6 px-6 py-6 md:px-8 md:py-7 card">
      <div className="eyebrow mb-1">Today's target mix</div>
      <p style={{ fontSize: 13, color: C.inkSoft, marginBottom: 16 }}>
        Based on {usdC(portfolio)} at your current growth-rate setting.
      </p>

      <div className="grid gap-4">
        {buckets.map((b) => (
          <div
            key={b.label}
            className="rounded-2xl px-5 py-5"
            style={{
              background: b.soft,
              border: "1px solid " + b.color,
              borderOpacity: 0.2,
            }}
          >
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: b.color }}>
                  {b.label}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: C.inkSoft,
                    marginTop: 2,
                    maxWidth: 380,
                  }}
                >
                  {b.note}
                </div>
              </div>
              <div className="text-right">
                <div
                  className="serif"
                  style={{ fontSize: 26, fontWeight: 600, color: b.color }}
                >
                  {Math.round(b.pct)}%
                </div>
                <div style={{ fontSize: 13, color: C.inkSoft }}>
                  {usdC(dollars(b.pct))}
                </div>
              </div>
            </div>

            {b.sub && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {b.sub.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl px-3 py-2.5"
                    style={{
                      background: "rgba(255,255,255,0.6)",
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <div style={{ fontSize: 11, color: C.inkSoft }}>
                      {s.label}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: C.ink,
                        marginTop: 2,
                      }}
                    >
                      {s.pct.toFixed(1)}%
                    </div>
                    <div style={{ fontSize: 11.5, color: C.inkSoft }}>
                      {usdC(dollars(s.pct))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className="mt-5 rounded-xl px-4 py-4"
        style={{ background: C.greenSoft }}
      >
        <div className="flex items-start gap-2.5">
          <Icon name="shield" size={20} color={C.green} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.green }}>
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
              Spend from cash and skip the trim. A downturn should never force a
              sale of stocks at a loss — that's the whole point of the buckets.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- maintenance / principles ---------------- */
const MAINTENANCE = [
  "Rebalance once or twice a year. Only act on a sleeve that's drifted past its band — otherwise do nothing.",
  "Trim growth toward the low end of its band only when risk is clearly elevated. Small trims, never exits.",
  "Cash buffer stays sized to 2–3 years of spending once you're within a few years of retiring.",
  "Keep it boring on purpose. Low activity isn't no attention — the yearly check confirms each sleeve still does its job.",
];
const PRINCIPLES = [
  { icon: "leaf", t: "Stay well-funded — let it compound, don't tinker." },
  {
    icon: "shield",
    t: "Own real, uncorrelated assets — a little for every season.",
  },
  {
    icon: "wallet",
    t: "Never be a forced seller — the cash buffer protects the stocks.",
  },
  { icon: "coins", t: "Quality of life over squeezing every last dollar." },
];

/* ---------------- result / plan view ---------------- */
function Result({ answers, onReset }) {
  const [a, setA] = useState(answers);
  const [stress, setStress] = useState(false);
  const [hoverPoint, setHoverPoint] = useState(null);
  const [edit, setEdit] = useState(false);

  const [spendOverride, setSpendOverride] = useState(
    answers.spendOverride ?? null,
  );
  const [growthOverride, setGrowthOverride] = useState(
    answers.growthOverride ?? null,
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        "ffp-answers",
        JSON.stringify({ ...a, spendOverride, growthOverride }),
      );
    } catch (e) {}
  }, [a, spendOverride, growthOverride]);
  const set = (patch) => setA((p) => ({ ...p, ...patch }));

  const preRetirement = a.age < a.retirementAge;
  const phaseToday = phaseFor(a.age, a.retirementAge);

  const baseAllocToday = useMemo(
    () => allocationFor(phaseToday, a.risk),
    [phaseToday, a.risk],
  );
  const baseReturnToday = useMemo(
    () => blendedReturn(baseAllocToday),
    [baseAllocToday],
  );

  const growthRate = growthOverride != null ? growthOverride : baseReturnToday;

  const allocToday = useMemo(() => {
    const growthPct = growthPctForReturn(phaseToday, growthRate);
    return allocationFromGrowthPct(phaseToday, growthPct);
  }, [phaseToday, growthRate]);

  const effectiveRisk = useMemo(
    () => riskForGrowthPct(phaseToday, allocToday.growth),
    [phaseToday, allocToday.growth],
  );

  const sim = useMemo(() => {
    const data = [];
    let bal = a.portfolio;
    let balAtRetirement = null;
    let ruleSpend = null;
    let runOut = null;
    const stressYears = stress ? 3 : 0;
    for (let age = a.age; age <= 90; age++) {
      data.push({ age, value: Math.max(0, Math.round(bal)) });
      const phase = phaseFor(age, a.retirementAge);
      let r = growthRate / 100;
      const yearsIntoRetirement = age - a.retirementAge;
      if (yearsIntoRetirement >= 0 && yearsIntoRetirement < stressYears) {
        r = r - (yearsIntoRetirement === 0 ? 0.22 : 0.08);
      }
      if (age === a.retirementAge) {
        balAtRetirement = bal;
        ruleSpend = bal * 0.04;
      }
      if (age < a.retirementAge) {
        bal = bal * (1 + r) + a.savings;
      } else {
        const spend =
          spendOverride != null
            ? spendOverride
            : ruleSpend != null
              ? ruleSpend
              : bal * 0.04;
        bal = bal * (1 + r) - spend;
      }
      if (bal <= 0 && runOut === null) runOut = age + 1;
    }
    if (balAtRetirement === null) {
      balAtRetirement = a.portfolio;
      ruleSpend = a.portfolio * 0.04;
    }
    const actualSpend = spendOverride != null ? spendOverride : ruleSpend;
    const withdrawalRate =
      balAtRetirement > 0 ? (actualSpend / balAtRetirement) * 100 : 0;
    return {
      data,
      balAtRetirement,
      ruleSpend,
      actualSpend,
      withdrawalRate,
      runOut,
      end: data[data.length - 1].value,
    };
  }, [
    a.age,
    a.retirementAge,
    a.portfolio,
    a.savings,
    growthRate,
    spendOverride,
    stress,
  ]);

  const numInput = (val, on, w = 120) => (
    <CommaInput
      value={val}
      onChange={on}
      className="px-2 py-1 rounded"
      style={{ border: "1px solid " + C.line, width: w }}
    />
  );

  return (
    <div className="min-h-screen w-full px-4 py-8 md:px-8">
      <div className="mx-auto" style={{ maxWidth: 900 }}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1
              className="serif"
              style={{ fontSize: 32, lineHeight: 1.1, fontWeight: 600 }}
            >
              Financial Freedom Plan
            </h1>
            <p style={{ fontSize: 13, color: C.inkSoft, marginTop: 4 }}>
              Build financial freedom through long-term investing in
              diversified, resilient assets.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-3 rounded-full text-sm"
              style={{
                height: 40,
                border: "1px solid " + C.line,
                color: C.inkSoft,
              }}
            >
              <Icon name="rotate" size={13} /> Reset
            </button>
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

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="px-5 py-4 card">
            <div style={{ fontSize: 12, color: C.inkSoft }}>Age</div>
            {edit ? (
              numInput(a.age, (v) => set({ age: v }), 80)
            ) : (
              <div className="serif" style={{ fontSize: 30, fontWeight: 600 }}>
                {a.age}
              </div>
            )}
          </div>
          <div className="px-5 py-4 card">
            <div style={{ fontSize: 12, color: C.inkSoft }}>
              Portfolio today
            </div>
            {edit ? (
              numInput(a.portfolio, (v) => set({ portfolio: v }), 150)
            ) : (
              <div className="serif" style={{ fontSize: 30, fontWeight: 600 }}>
                {usdC(a.portfolio)}
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 px-6 py-6 md:px-8 md:py-7 card">
          <div className="eyebrow mb-3">The verdict</div>
          {preRetirement ? (
            <p
              className="serif"
              style={{ fontSize: 22, lineHeight: 1.4, fontWeight: 500 }}
            >
              At this pace, you're on track for about{" "}
              <span style={{ color: C.green, fontWeight: 700 }}>
                {usdC(sim.balAtRetirement)}
              </span>{" "}
              by age {a.retirementAge} — enough to safely spend roughly{" "}
              <span style={{ color: C.green, fontWeight: 700 }}>
                {usd(sim.ruleSpend)}/yr
              </span>{" "}
              using the 4% rule.
            </p>
          ) : (
            <p
              className="serif"
              style={{ fontSize: 22, lineHeight: 1.4, fontWeight: 500 }}
            >
              Based on the 4% rule, you can safely spend about{" "}
              <span style={{ color: C.green, fontWeight: 700 }}>
                {usd(sim.ruleSpend)}/yr
              </span>{" "}
              from your {usdC(a.portfolio)}.
            </p>
          )}
          {sim.runOut && (
            <p style={{ fontSize: 13, color: C.danger, marginTop: 6 }}>
              At this pace, funds would run low around age {sim.runOut}. Raising
              savings, lowering the retirement-age target, lowering spending, or
              reducing the growth-rate assumption would fix this.
            </p>
          )}

          <div className="mt-6">
            <AgeBar age={a.age} retirementAge={a.retirementAge} />
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-5">
            <div>
              <div
                className="flex justify-between mb-1"
                style={{ fontSize: 12, color: C.inkSoft }}
              >
                <span>Retirement age</span>
                <span style={{ fontWeight: 700, color: C.ink }}>
                  {a.retirementAge}
                </span>
              </div>
              <input
                type="range"
                min={Math.max(a.age + 1, 45)}
                max={75}
                step={1}
                value={a.retirementAge}
                onChange={(e) => set({ retirementAge: Number(e.target.value) })}
              />
            </div>
            <div>
              <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 6 }}>
                Risk tolerance
              </div>
              <div className="seg" style={{ display: "flex" }}>
                {["conservative", "neutral", "aggressive"].map((r) => (
                  <button
                    key={r}
                    className={r === effectiveRisk ? "active" : ""}
                    style={{ flex: 1 }}
                    onClick={() => {
                      set({ risk: r });
                      setGrowthOverride(null);
                    }}
                  >
                    {r[0].toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div
              className="flex justify-between mb-1"
              style={{ fontSize: 12, color: C.inkSoft }}
            >
              <span>Spending in retirement</span>
              <span style={{ fontWeight: 700, color: C.ink }}>
                {usd(sim.actualSpend)}/yr · {sim.withdrawalRate.toFixed(1)}%
                withdrawal
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(sim.ruleSpend * 3, 10000)}
              step={500}
              value={sim.actualSpend}
              onChange={(e) => setSpendOverride(Number(e.target.value))}
            />
            <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 4 }}>
              4%-rule reference: {usd(sim.ruleSpend)}/yr
              {spendOverride != null && (
                <button
                  onClick={() => setSpendOverride(null)}
                  style={{
                    marginLeft: 8,
                    color: C.gold,
                    textDecoration: "underline",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  reset to 4% rule
                </button>
              )}
            </div>
          </div>

          {preRetirement && (
            <div className="mt-5">
              <div
                className="flex justify-between mb-1"
                style={{ fontSize: 12, color: C.inkSoft }}
              >
                <span>Annual savings (investing per year)</span>
                <span style={{ fontWeight: 700, color: C.ink }}>
                  {usdK(a.savings)}/yr
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={80000}
                step={1000}
                value={a.savings}
                onChange={(e) => set({ savings: Number(e.target.value) })}
              />
            </div>
          )}
        </div>

        {/* Projection */}
        <div className="mb-6 px-6 py-6 md:px-8 md:py-7 card">
          <div className="flex items-baseline justify-between mb-1 flex-wrap gap-2">
            <div className="eyebrow">How it plays out</div>
            <button
              onClick={() => setStress((v) => !v)}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs"
              style={{
                border: "1px solid " + C.line,
                background: stress ? C.goldSoft : C.card,
                color: stress ? C.gold : C.inkSoft,
                fontWeight: 600,
              }}
            >
              <Icon
                name="storm"
                size={13}
                color={stress ? C.gold : C.inkSoft}
              />{" "}
              Rough start in retirement
            </button>
          </div>
          <p
            className="mb-3"
            style={{ fontSize: 13, color: C.inkSoft, maxWidth: 560 }}
          >
            From {usdC(a.portfolio)} today,{" "}
            {preRetirement
              ? `investing ${usdK(a.savings)}/yr until ${a.retirementAge}, then `
              : ""}
            spending about {usd(sim.actualSpend)}/yr from age {a.retirementAge}{" "}
            on, assuming {growthRate.toFixed(1)}%/yr growth.{" "}
            {stress
              ? "This run assumes a rough first few years of retirement — a real stress test."
              : "This run assumes steady average returns each year."}
          </p>

          <div className="mb-4">
            <div
              className="serif"
              style={{
                fontSize: 34,
                fontWeight: 600,
                color: C.green,
                lineHeight: 1.1,
              }}
            >
              {usdC(hoverPoint ? hoverPoint.value : sim.data[0].value)}
            </div>
            <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 2 }}>
              {hoverPoint ? (
                <>
                  at age{" "}
                  <strong style={{ color: C.ink }}>{hoverPoint.age}</strong>
                </>
              ) : (
                "hover the chart to see any year"
              )}
            </div>
          </div>
          <div className="mb-5">
            <div
              className="flex justify-between mb-1"
              style={{ fontSize: 12, color: C.inkSoft }}
            >
              <span>Growth rate — cautious to insane</span>
              <span style={{ fontWeight: 700, color: C.ink }}>
                {growthRate.toFixed(1)}%/yr
              </span>
            </div>
            <input
              type="range"
              min={GROWTH_RATE_MIN}
              max={GROWTH_RATE_MAX}
              step={0.1}
              value={growthRate}
              onChange={(e) => setGrowthOverride(Number(e.target.value))}
            />
            <div
              className="flex justify-between"
              style={{ fontSize: 10, color: C.inkSoft, marginTop: 2 }}
            >
              <span>3% cautious</span>
              <span>6.5% moderate</span>
              <span>10% strong</span>
            </div>
          </div>

          <GrowthChart
            data={sim.data}
            color={C.green}
            markAge={a.retirementAge}
            onHover={setHoverPoint}
          />
        </div>

        <FlowCard alloc={allocToday} portfolio={a.portfolio} />

        <div className="mb-6 px-6 py-6 md:px-8 md:py-7 card">
          <div className="eyebrow mb-4">How to run it</div>
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
          <div
            className="mt-5 rounded-xl px-4 py-3 flex items-start gap-2"
            style={{ background: C.blueSoft }}
          >
            <Icon name="wallet" size={17} color={C.blue} />
            <div style={{ fontSize: 12.5, color: C.blue, lineHeight: 1.5 }}>
              If you have access to tax-advantaged accounts (401k, IRA, Roth),
              prioritize filling those first — this plan covers the asset mix,
              not the account wrapper.
            </div>
          </div>
        </div>

        <div
          className="text-center pb-4"
          style={{ fontSize: 12, color: C.inkSoft }}
        >
          A compass to feel calm about — not a document to study. Reflects a
          specific investing thesis (real assets, always some gold and bitcoin).
          Not financial advice.
        </div>
      </div>
    </div>
  );
}

/* ---------------- root ---------------- */
function App() {
  const [answers, setAnswers] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ffp-answers");
      if (raw) {
        const p = JSON.parse(raw);
        if (p && p.portfolio) setAnswers(p);
      }
    } catch (e) {}
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  if (!answers) {
    return (
      <Questionnaire
        onSubmit={(q) => {
          try {
            localStorage.setItem("ffp-answers", JSON.stringify(q));
          } catch (e) {}
          setAnswers(q);
        }}
      />
    );
  }
  return (
    <Result
      answers={answers}
      onReset={() => {
        try {
          localStorage.removeItem("ffp-answers");
        } catch (e) {}
        setAnswers(null);
      }}
    />
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

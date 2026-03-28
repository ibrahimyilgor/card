/**
 * AchievementBadge — enamel pin hexagon badges.
 * Hover: rotateY tilt (left/right), specular shine follows cursor X.
 * No idle animation.
 *
 * streak   → flame icon
 * accuracy → target/crosshair icon
 * volume   → stacked cards icon
 */
import { useRef, useState, useCallback } from "react";

// Rounded hex path generator for viewBox 0..200 centered at 100,100
function makeRoundedHexPath(cx, cy, radius, corner) {
	const pts = [];
	const angles = [-90, -30, 30, 90, 150, 210];
	for (let a of angles) {
		const rad = (a * Math.PI) / 180;
		pts.push([cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)]);
	}

	const n = pts.length;
	const p1 = new Array(n);
	const p2 = new Array(n);
	for (let i = 0; i < n; i++) {
		const prev = pts[(i - 1 + n) % n];
		const curr = pts[i];
		const next = pts[(i + 1) % n];

		const toPrev = [prev[0] - curr[0], prev[1] - curr[1]];
		const toNext = [next[0] - curr[0], next[1] - curr[1]];
		const norm = (v) => {
			const l = Math.hypot(v[0], v[1]) || 1;
			return [v[0] / l, v[1] / l];
		};
		const nPrev = norm(toPrev);
		const nNext = norm(toNext);
		p1[i] = [curr[0] + nPrev[0] * corner, curr[1] + nPrev[1] * corner];
		p2[i] = [curr[0] + nNext[0] * corner, curr[1] + nNext[1] * corner];
	}

	let d = `M ${p1[0][0]} ${p1[0][1]}`;
	for (let i = 0; i < n; i++) {
		const arcEnd = p2[i];
		d += ` A ${corner} ${corner} 0 0 1 ${arcEnd[0]} ${arcEnd[1]}`;
		const nextP1 = p1[(i + 1) % n];
		d += ` L ${nextP1[0]} ${nextP1[1]}`;
	}
	d += " Z";
	return d;
}

const HEX_PATH = makeRoundedHexPath(100, 100, 88, 10);
const HEX_INNER_PATH = makeRoundedHexPath(100, 100, 76, 8);

function useTilt(enabled) {
	const ref = useRef(null);
	const [ry, setRy] = useState(0);
	const [sx, setSx] = useState(50);
	const [hovered, setHovered] = useState(false);
	const raf = useRef(null);

	const onMouseMove = useCallback(
		(e) => {
			if (!enabled || !ref.current) return;
			const r = ref.current.getBoundingClientRect();
			const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
			if (raf.current) cancelAnimationFrame(raf.current);
			raf.current = requestAnimationFrame(() => {
				setRy(dx * 35);
				setSx((dx + 1) * 50);
			});
		},
		[enabled],
	);

	const onMouseEnter = useCallback(() => setHovered(true), []);
	const onMouseLeave = useCallback(() => {
		setHovered(false);
		if (raf.current) cancelAnimationFrame(raf.current);
		setRy(0);
		setSx(50);
	}, []);

	return { ref, ry, sx, hovered, onMouseMove, onMouseEnter, onMouseLeave };
}

// ─── Shared gold gradient defs (inlined per badge to avoid id collisions) ─────
function GoldDefs({ id }) {
	return (
		<>
			<linearGradient id={`${id}gold`} x1="12%" y1="0%" x2="88%" y2="100%">
				<stop offset="0%" stopColor="#fffbda" />
				<stop offset="12%" stopColor="#fff0a0" />
				<stop offset="34%" stopColor="#f2c84a" />
				<stop offset="58%" stopColor="#e3b03a" />
				<stop offset="78%" stopColor="#b88010" />
				<stop offset="100%" stopColor="#7a4f06" />
			</linearGradient>
			<linearGradient id={`${id}shine`} x1="0%" y1="0%" x2="60%" y2="100%">
				<stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
				<stop offset="45%" stopColor="rgba(255,255,255,0.08)" />
				<stop offset="100%" stopColor="rgba(255,255,255,0)" />
			</linearGradient>
			{/* small inner sheen for enamel highlights (used per-badge) */}
			<radialGradient id={`${id}sheen`} cx="30%" cy="28%" r="60%">
				<stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
				<stop offset="45%" stopColor="rgba(255,255,255,0.28)" />
				<stop offset="100%" stopColor="rgba(255,255,255,0)" />
			</radialGradient>
		</>
	);
}

// ─── STREAK — flame ───────────────────────────────────────────────────────────

// Returns flat hex points (no rounding) for 3D edge calculation
function hexPoints(cx, cy, r) {
	return [-90, -30, 30, 90, 150, 210].map((a) => {
		const rad = (a * Math.PI) / 180;
		return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
	});
}

function StreakSVG({ size, streakDays, tiltRy }) {
	const outerPath = makeRoundedHexPath(100, 100, 88, 0);
	const innerPath = makeRoundedHexPath(100, 100, 82, 0);

	// 3D thickness: project tilt angle into a horizontal offset
	const THICKNESS = 10;
	const ryRad = ((tiltRy || 0) * Math.PI) / 180;
	// when rotated right (positive ry), left edge becomes visible → negative xShift
	const xShift = -Math.sin(ryRad) * THICKNESS;

	// hex outer points for edge faces
	const pts = hexPoints(100, 100, 88);

	// Determine which edges are "side-facing" based on tilt direction
	// For each edge, compute its normal x component; if same sign as xShift → visible
	const edgeFaces = [];
	const n = pts.length;
	for (let i = 0; i < n; i++) {
		const a = pts[i];
		const b = pts[(i + 1) % n];
		// edge midpoint normal (pointing outward)
		const mx = (a[0] + b[0]) / 2 - 100;
		// visible if normal faces the same direction as the shift
		if (xShift !== 0 && Math.sign(mx) === Math.sign(-xShift)) {
			const darkness = Math.abs(mx) / 88; // darker toward pure side edges
			edgeFaces.push({ a, b, darkness });
		}
	}

	return (
		<svg
			viewBox="0 0 200 200"
			width={size}
			height={size}
			style={{ display: "block", overflow: "visible" }}
		>
			<defs>
				<linearGradient id="goldBevel" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="12%" stopColor="#fffbda" />
					<stop offset="30%" stopColor="#e1b84a" />
					<stop offset="55%" stopColor="#8a6d3b" />
					<stop offset="85%" stopColor="#c08f2a" />
					<stop offset="100%" stopColor="#5e4c25" />
				</linearGradient>

				{/* Same gradient in userSpace coords for stroke use on stripes */}
				<linearGradient id="goldBevelStroke" x1="10" y1="60" x2="190" y2="140" gradientUnits="userSpaceOnUse">
					<stop offset="0%"   stopColor="#fffbda" />
					<stop offset="25%"  stopColor="#e1b84a" />
					<stop offset="55%"  stopColor="#8a6d3b" />
					<stop offset="80%"  stopColor="#c08f2a" />
					<stop offset="100%" stopColor="#5e4c25" />
				</linearGradient>

				{/* clip using the inner path so stripes don't overlap the rim */}
				<clipPath id="clipHex">
					<path d={innerPath} />
				</clipPath>
			</defs>

			{/* 0. 3D edge faces — drawn behind the front face */}
			{edgeFaces.map(({ a, b, darkness }, i) => (
				<polygon
					key={i}
					points={`${a[0]},${a[1]} ${b[0]},${b[1]} ${b[0] + xShift},${b[1]} ${a[0] + xShift},${a[1]}`}
					fill={`rgba(90,60,10,${0.55 + darkness * 0.35})`}
					stroke="#3f2c12"
					strokeWidth="0.5"
				/>
			))}

			{/* 1. Main Gold Body/Base (front) */}
			<path
				d={outerPath}
				fill="url(#goldBevel)"
				stroke="#d4af37"
				strokeWidth="4"
				strokeLinejoin="round"
			/>

			{/* 2. White Enamel Background */}
			<path d={innerPath} fill="#e8e0d0" />

			<g clipPath="url(#clipHex)">
				{/* Pink stripe */}
				<path d="M10 100 L190 -4" fill="none" stroke="url(#goldBevelStroke)" strokeWidth="12" strokeLinecap="butt" />
				<path d="M10 100 L190 -4" fill="none" stroke="#f04d8c" strokeWidth="6" strokeLinecap="butt" />
				{/* Green stripe */}
				<path d="M10 112 L190 8" fill="none" stroke="url(#goldBevelStroke)" strokeWidth="12" strokeLinecap="butt" />
				<path d="M10 112 L190 8" fill="none" stroke="#a2d149" strokeWidth="6" strokeLinecap="butt" />
				{/* Teal stripe */}
				<path d="M10 124 L190 20" fill="none" stroke="url(#goldBevelStroke)" strokeWidth="12" strokeLinecap="butt" />
				<path d="M10 124 L190 20" fill="none" stroke="#2dbbc4" strokeWidth="6" strokeLinecap="butt" />
			</g>

			{/* 4. Top polish sheen */}
			<path d="M100 25 L165 62 L165 70 L35 70 L35 62 Z" fill="white" opacity="0.1" />

			{/* 5. Streak day number */}
			{streakDays != null && (() => {
				const depth = 4;
				const ryRad = ((tiltRy || 0) * Math.PI) / 180;
				const xOff = Math.sin(ryRad) * depth;
				const yOff = Math.abs(Math.sin(ryRad)) * 1.5;
				const fontSize = streakDays >= 100 ? "36" : "46";
				return (
					<g>
						{/* 3D shadow layers */}
						{[3, 2, 1].map((i) => (
							<text
								key={i}
								x={100 + xOff * i * 0.6}
								y={138 + yOff * i * 0.6}
								textAnchor="middle"
								dominantBaseline="middle"
								fontFamily="Georgia, 'Times New Roman', serif"
								fontWeight="400"
								fontSize={fontSize}
								fill={`rgba(100,70,10,${0.18 - i * 0.04})`}
							>
								{streakDays}
							</text>
						))}
						{/* Main text */}
						<text
							x="100"
							y="138"
							textAnchor="middle"
							dominantBaseline="middle"
							fontFamily="Georgia, 'Times New Roman', serif"
							fontWeight="400"
							fontSize={fontSize}
							fill="#d4af37"
							stroke="#d4af37"
							strokeWidth="1"
							paintOrder="stroke"
						>
							{streakDays}
						</text>
					</g>
				);
			})()}
		</svg>
	);
}

// ─── ACCURACY — target ────────────────────────────────────────────────────────
function AccuracySVG({ size, accuracyDays, tiltRy }) {
	// Circle-based: use cx/cy/r directly, no hex path needed for shape
	const THICKNESS = 10;
	const ryRad = ((tiltRy || 0) * Math.PI) / 180;
	const xShift = -Math.sin(ryRad) * THICKNESS;

	// For 3D edges on a circle, sample points around the circumference
	const R = 88;
	const edgeFaces = [];
	const segments = 24;
	for (let i = 0; i < segments; i++) {
		const a1 = (i / segments) * 2 * Math.PI - Math.PI / 2;
		const a2 = ((i + 1) / segments) * 2 * Math.PI - Math.PI / 2;
		const ax = 100 + R * Math.cos(a1), ay = 100 + R * Math.sin(a1);
		const bx = 100 + R * Math.cos(a2), by = 100 + R * Math.sin(a2);
		const mx = (ax + bx) / 2 - 100;
		if (xShift !== 0 && Math.sign(mx) === Math.sign(-xShift)) {
			const t = Math.abs(mx) / R;
			edgeFaces.push({ ax, ay, bx, by, t });
		}
	}

	return (
		<svg
			viewBox="0 0 200 200"
			width={size}
			height={size}
			style={{ display: "block", overflow: "visible" }}
		>
			<defs>
				<linearGradient id="acGoldBevel" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="12%" stopColor="#fffbda" />
					<stop offset="30%" stopColor="#e1b84a" />
					<stop offset="55%" stopColor="#8a6d3b" />
					<stop offset="85%" stopColor="#c08f2a" />
					<stop offset="100%" stopColor="#5e4c25" />
				</linearGradient>
				<linearGradient id="acGoldStroke" x1="10" y1="10" x2="190" y2="190" gradientUnits="userSpaceOnUse">
					<stop offset="0%"   stopColor="#fffbda" />
					<stop offset="25%"  stopColor="#e1b84a" />
					<stop offset="55%"  stopColor="#8a6d3b" />
					<stop offset="80%"  stopColor="#c08f2a" />
					<stop offset="100%" stopColor="#5e4c25" />
				</linearGradient>
				<clipPath id="acClipHex">
					<circle cx="100" cy="100" r="82" />
				</clipPath>
			</defs>

			{/* 0. 3D edge faces */}
			{edgeFaces.map(({ ax, ay, bx, by, t }, i) => (
				<polygon
					key={i}
					points={`${ax},${ay} ${bx},${by} ${bx + xShift},${by} ${ax + xShift},${ay}`}
					fill={`rgba(90,60,10,${0.6 + t * 0.35})`}
					stroke="#c08f2a"
					strokeWidth="0.5"
				/>
			))}

			{/* 1. Main Gold Body — circle */}
			<circle cx="100" cy="100" r="88" fill="url(#acGoldBevel)" />

			{/* 2. Inner enamel background */}
			<circle cx="100" cy="100" r="82" fill="#e8e0d0" />

			{/* 3. Three concentric rings — pembe, yeşil, mavi */}
			<g clipPath="url(#acClipHex)">
				{/* Outer — pembe */}
				<circle cx="100" cy="100" r="68" fill="none" stroke="url(#acGoldStroke)" strokeWidth="8" />
				<circle cx="100" cy="100" r="68" fill="none" stroke="#f04d8c" strokeWidth="6" />
				{/* Middle — yeşil */}
				<circle cx="100" cy="100" r="60" fill="none" stroke="url(#acGoldStroke)" strokeWidth="8" />
				<circle cx="100" cy="100" r="60" fill="none" stroke="#a2d149" strokeWidth="6" />
				{/* Inner — mavi */}
				<circle cx="100" cy="100" r="52" fill="none" stroke="url(#acGoldStroke)" strokeWidth="8" />
				<circle cx="100" cy="100" r="52" fill="none" stroke="#2979ff" strokeWidth="6" />
			</g>

			{/* 4. Number in center */}
			{accuracyDays != null && (() => {
				const depth = 4;
				const xOff = Math.sin(ryRad) * depth;
				const yOff = Math.abs(Math.sin(ryRad)) * 1.5;
				const fontSize = accuracyDays >= 100 ? "28" : accuracyDays >= 10 ? "34" : "40";
				return (
					<g>
						{[3, 2, 1].map((i) => (
							<text
								key={i}
								x={100 + xOff * i * 0.6}
								y={100 + yOff * i * 0.6}
								textAnchor="middle"
								dominantBaseline="middle"
								fontFamily="Georgia, 'Times New Roman', serif"
								fontWeight="400"
								fontSize={fontSize}
								fill={`rgba(100,70,10,${0.18 - i * 0.04})`}
							>
								{accuracyDays}
							</text>
						))}
						<text
							x="100"
							y="100"
							textAnchor="middle"
							dominantBaseline="middle"
							fontFamily="Georgia, 'Times New Roman', serif"
							fontWeight="400"
							fontSize={fontSize}
							fill="#d4af37"
							stroke="#d4af37"
							strokeWidth="1"
							paintOrder="stroke"
						>
							{accuracyDays}
						</text>
					</g>
				);
			})()}
		</svg>
	);
}

// ─── VOLUME — stacked cards ───────────────────────────────────────────────────
function VolumeSVG({ size, volumeDays, tiltRy }) {
	// Rounded rectangle shape
	const RX = 14; // corner radius
	const W = 176, H = 176; // outer rect size
	const X = (200 - W) / 2, Y = (200 - H) / 2; // centered

	const THICKNESS = 10;
	const ryRad = ((tiltRy || 0) * Math.PI) / 180;
	const xShift = -Math.sin(ryRad) * THICKNESS;

	// 3D edge faces — left or right vertical edge of the rect
	const edgeFaces = [];
	if (xShift > 0) {
		// tilted right → left edge visible
		edgeFaces.push({ ax: X, ay: Y, bx: X, by: Y + H, t: 1 });
	} else if (xShift < 0) {
		// tilted left → right edge visible
		edgeFaces.push({ ax: X + W, ay: Y, bx: X + W, by: Y + H, t: 1 });
	}

	// helper: compact format for large numbers (K/M)
	function compactNumber(n) {
		if (n >= 1000000) {
			const m = Math.round((n / 1000000) * 10) / 10;
			return (m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)) + "M";
		}
		if (n >= 1000) {
			const k = Math.round((n / 1000) * 10) / 10;
			return (k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)) + "K";
		}
		return String(n);
	}

	return (
		<svg
			viewBox="0 0 200 200"
			width={size}
			height={size}
			style={{ display: "block", overflow: "visible" }}
		>
			<defs>
				<linearGradient id="voGoldBevel" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="30%" stopColor="#e1b84a" />
					<stop offset="55%" stopColor="#8a6d3b" />
					<stop offset="85%" stopColor="#c08f2a" />
					<stop offset="100%" stopColor="#5e4c25" />
				</linearGradient>
				<linearGradient id="voGoldStroke" x1="10" y1="10" x2="190" y2="190" gradientUnits="userSpaceOnUse">
					<stop offset="0%"   stopColor="#fffbda" />
					<stop offset="25%"  stopColor="#e1b84a" />
					<stop offset="55%"  stopColor="#8a6d3b" />
					<stop offset="80%"  stopColor="#c08f2a" />
					<stop offset="100%" stopColor="#5e4c25" />
				</linearGradient>
				<clipPath id="voClipRect">
					<rect x={X + 6} y={Y + 6} width={W - 12} height={H - 12} rx={RX - 2} />
				</clipPath>
			</defs>

			{/* 1. Main Gold Body — rounded rect */}
			<rect x={X} y={Y} width={W} height={H} rx={RX} fill="url(#voGoldBevel)" />

			{/* 2. Inner enamel */}
			<rect x={X + 6} y={Y + 6} width={W - 12} height={H - 12} rx={RX - 2} fill="#e8e0d0" />

			{/* 3. Three nested rects — pembe, yeşil, mavi — aşağıya uzanan */}
			<g clipPath="url(#voClipRect)">
				{/* Pink — outermost */}
				<rect x={X + 14} y={Y + 14} width={W - 28} height={H - 14} rx="6"
					fill="none" stroke="url(#voGoldStroke)" strokeWidth="8" />
				<rect x={X + 14} y={Y + 14} width={W - 28} height={H - 14} rx="6"
					fill="none" stroke="#f04d8c" strokeWidth="6" />
				{/* Green — middle */}
				<rect x={X + 22} y={Y + 22} width={W - 44} height={H - 22} rx="6"
					fill="none" stroke="url(#voGoldStroke)" strokeWidth="8" />
				<rect x={X + 22} y={Y + 22} width={W - 44} height={H - 22} rx="6"
					fill="none" stroke="#a2d149" strokeWidth="6" />
				{/* Blue — innermost */}
				<rect x={X + 30} y={Y + 30} width={W - 60} height={H - 30} rx="6"
					fill="none" stroke="url(#voGoldStroke)" strokeWidth="8" />
				<rect x={X + 30} y={Y + 30} width={W - 60} height={H - 30} rx="6"
					fill="none" stroke="#2979ff" strokeWidth="6" />
			</g>

			{/* 4. Number */}
			{volumeDays != null && (() => {
				const depth = 4;
				const xOff = Math.sin(ryRad) * depth;
				const yOff = Math.abs(Math.sin(ryRad)) * 1.5;
				const label = compactNumber(volumeDays);
				const fontSize = volumeDays >= 100 ? "36" : "46";
				return (
					<g>
						{[3, 2, 1].map((i) => (
							<text key={i}
								x={100 + xOff * i * 0.6} y={138 + yOff * i * 0.6}
								textAnchor="middle" dominantBaseline="middle"
								fontFamily="Georgia, 'Times New Roman', serif"
								fontWeight="400" fontSize={fontSize}
								fill={`rgba(100,70,10,${0.18 - i * 0.04})`}
							>{label}</text>
						))}
						<text x="100" y="138"
							textAnchor="middle" dominantBaseline="middle"
							fontFamily="Georgia, 'Times New Roman', serif"
							fontWeight="400" fontSize={fontSize}
							fill="#d4af37" stroke="#d4af37" strokeWidth="1" paintOrder="stroke"
						>{label}</text>
					</g>
				);
			})()}
		</svg>
	);
}
	// ─── Shell ────────────────────────────────────────────────────────────────────
const SHADOWS = {
	streak: "rgba(180,80,0,0.65)",
	accuracy: "rgba(0,60,180,0.65)",
	volume: "rgba(100,0,180,0.65)",
};
const SHIMMERS = {
	streak: "rgba(255,220,80,0.55)",
	accuracy: "rgba(80,210,255,0.55)",
	volume: "rgba(210,140,255,0.55)",
};

function BadgeShell({ size, earned, type, interactive, children, onTiltRy }) {
	const shadow = SHADOWS[type] || SHADOWS.accuracy;
	const { ref, ry, sx, hovered, onMouseMove, onMouseEnter, onMouseLeave } =
		useTilt(interactive && earned);

	// expose ry to parent if needed (for streak 3D edges)
	const prevRy = useRef(ry);
	if (onTiltRy && prevRy.current !== ry) {
		prevRy.current = ry;
		onTiltRy(ry);
	}

	return (
		<div
			ref={ref}
			onMouseMove={onMouseMove}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			style={{
				width: size,
				height: size,
				perspective: "500px",
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
				cursor: earned ? "pointer" : "default",
			}}
		>
			<div
				style={{
					width: "100%",
					height: "100%",
					position: "relative",
					transformStyle: "preserve-3d",
					transform: `rotateY(${ry}deg) scale(${hovered ? 1.06 : 1})`,
					transition: hovered
						? "transform 0.08s ease-out, filter 0.12s ease"
						: "transform 0.6s cubic-bezier(0.23,1,0.32,1), filter 0.3s ease",
					filter: earned
						? `drop-shadow(0 ${hovered ? 20 : 10}px ${hovered ? 36 : 22}px ${shadow})`
						: "grayscale(1) brightness(0.38)",
					willChange: "transform",
				}}
			>
				{children}
				{/* {earned && (
					<div
						style={
							{
								position: "absolute",
								inset: 0,
								background: `radial-gradient(ellipse at ${sx}% 45%, ${shimmer} 0%, transparent 58%)`,
								pointerEvents: "none",
								mixBlendMode: "screen",
								transition: hovered ? "background 0.05s" : "background 0.5s",
							}
						}
					/>
				)} */}
			</div>
		</div>
	);
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function AchievementBadge({
	type = "accuracy",
	size = 80,
	earned = true,
	interactive = true,
	streakDays,
	accuracyDays,
	volumeDays,
}) {
	const [tiltRy, setTiltRy] = useState(0);

	const inner =
		type === "streak" ? (
			<StreakSVG size={size} streakDays={streakDays} tiltRy={tiltRy} />
		) : type === "accuracy" ? (
			<AccuracySVG size={size} accuracyDays={accuracyDays} tiltRy={tiltRy} />
		) : (
			<VolumeSVG size={size} volumeDays={volumeDays} tiltRy={tiltRy} />
		);

	return (
		<BadgeShell
			size={size}
			earned={earned}
			type={type}
			interactive={interactive}
			onTiltRy={setTiltRy}
		>
			{inner}
		</BadgeShell>
	);
}

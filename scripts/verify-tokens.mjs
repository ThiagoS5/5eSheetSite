import { parse, formatHex, differenceEuclidean } from "culori";
const pairs = [
  ["#0a0b10", "oklch(0.15 0.01 276)"],  ["#e8e9f0", "oklch(0.93 0.006 270)"],
  ["#1c1e2a", "oklch(0.24 0.02 277)"],  ["#12131a", "oklch(0.19 0.01 279)"],
  ["#e61c23", "oklch(0.59 0.23 27)"],   ["#f3c969", "oklch(0.854 0.124 86)"],
  ["#7a7e99", "oklch(0.6 0.04 278)"],   ["#b0b5cc", "oklch(0.777 0.033 276)"],
  ["#f4a261", "oklch(0.781 0.127 58)"],
  ["#a91515", "oklch(0.47 0.18 28)"],   ["#c41e1e", "oklch(0.53 0.2 28)"],
  ["#50c878", "oklch(0.74 0.15 152)"],  ["#4a9eff", "oklch(0.69 0.16 255)"],
  ["#14151b", "oklch(0.2 0.01 278)"],   ["#555a70", "oklch(0.47 0.04 275)"],
  ["#ebc162", "oklch(0.81 0.12 86)"],   ["#a4c9ff", "oklch(0.82 0.07 258)"],
  ["#0065b7", "oklch(0.49 0.15 255)"],  ["#19375c", "oklch(0.33 0.07 255)"],
  ["#2f8f55", "oklch(0.59 0.13 152)"],  ["#183f2c", "oklch(0.33 0.06 152)"],
  ["#7e5e00", "oklch(0.50 0.10 86)"],   ["#4d3a12", "oklch(0.36 0.05 80)"],
  ["#5c171b", "oklch(0.32 0.1 22)"],    ["#3d1820", "oklch(0.27 0.06 8)"],
  ["#161824", "oklch(0.21 0.02 277)"],
];
const d = differenceEuclidean("oklch");
let bad = 0;
for (const [hex, ok] of pairs) {
  const delta = d(parse(hex), parse(ok));
  if (delta > 0.02) { bad++; console.error(`DRIFT ${hex} vs ${ok} -> got ${formatHex(ok)} d${delta.toFixed(3)}`); }
}
if (bad) { console.error(`${bad} token(s) drifted >0.02 - fix the OKLCH value.`); process.exit(1); }
console.log("All tokens within tolerance.");

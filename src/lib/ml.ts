/* Small, real ML algorithms that run in the browser on synthetic data. */

export type Row = number[];

/* ---------- linear regression (normal equations, optional Huber IRLS) ---------- */
function solve(A: number[][], b: number[]) {
  const n = b.length;
  const M = A.map((r, i) => [...r, b[i]]);
  for (let i = 0; i < n; i++) {
    let p = i;
    for (let k = i + 1; k < n; k++) if (Math.abs(M[k][i]) > Math.abs(M[p][i])) p = k;
    [M[i], M[p]] = [M[p], M[i]];
    const d = M[i][i] || 1e-9;
    for (let k = i; k <= n; k++) M[i][k] /= d;
    for (let r = 0; r < n; r++) {
      if (r === i) continue;
      const f = M[r][i];
      for (let k = i; k <= n; k++) M[r][k] -= f * M[i][k];
    }
  }
  return M.map((r) => r[n]);
}

export function linreg(X: Row[], y: number[], huber = false) {
  const d = X[0].length + 1;
  let w = new Array(y.length).fill(1);
  let beta = new Array(d).fill(0);
  const iters = huber ? 8 : 1;
  for (let it = 0; it < iters; it++) {
    const A = Array.from({ length: d }, () => new Array(d).fill(0));
    const b = new Array(d).fill(0);
    X.forEach((row, i) => {
      const xr = [1, ...row];
      for (let a = 0; a < d; a++) {
        b[a] += w[i] * xr[a] * y[i];
        for (let c = 0; c < d; c++) A[a][c] += w[i] * xr[a] * xr[c];
      }
    });
    beta = solve(A, b);
    if (huber) {
      const res = X.map((row, i) => y[i] - predictLin(beta, row));
      const mad = median(res.map(Math.abs)) / 0.6745 || 1;
      const k = 1.345 * mad;
      w = res.map((r) => (Math.abs(r) <= k ? 1 : k / Math.abs(r)));
    }
  }
  return beta;
}
export const predictLin = (beta: number[], row: Row) => beta[0] + row.reduce((s, x, i) => s + x * beta[i + 1], 0);
function median(a: number[]) {
  const s = [...a].sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)] ?? 0;
}

/* ---------- logistic regression (batch gradient descent) ---------- */
export function logreg(X: Row[], y: number[], weights?: number[], epochs = 400, lr = 0.5) {
  const d = X[0].length + 1;
  const beta = new Array(d).fill(0);
  const w = weights ?? new Array(y.length).fill(1);
  const W = w.reduce((a, b) => a + b, 0);
  for (let e = 0; e < epochs; e++) {
    const g = new Array(d).fill(0);
    for (let i = 0; i < X.length; i++) {
      const p = 1 / (1 + Math.exp(-predictLin(beta, X[i])));
      const err = (p - y[i]) * w[i];
      g[0] += err;
      for (let j = 0; j < X[i].length; j++) g[j + 1] += err * X[i][j];
    }
    for (let j = 0; j < d; j++) beta[j] -= (lr * g[j]) / W;
  }
  return beta;
}

/* ---------- CART decision tree (gini) ---------- */
export interface TreeNode {
  id: number;
  depth: number;
  n: number;
  p: number; // share of positive class
  feature?: number;
  thr?: number;
  left?: TreeNode;
  right?: TreeNode;
}
export function cart(X: Row[], y: number[], maxDepth: number, minLeaf = 2) {
  let idc = 0;
  const gini = (pos: number, n: number) => (n === 0 ? 0 : 1 - (pos / n) ** 2 - (1 - pos / n) ** 2);
  const build = (idx: number[], depth: number): TreeNode => {
    const pos = idx.reduce((s, i) => s + y[i], 0);
    const node: TreeNode = { id: idc++, depth, n: idx.length, p: pos / idx.length };
    if (depth >= maxDepth || idx.length < minLeaf * 2 || pos === 0 || pos === idx.length) return node;
    let best = { g: gini(pos, idx.length) - 1e-6, f: -1, t: 0 };
    const nf = X[0].length;
    for (let f = 0; f < nf; f++) {
      const sorted = [...idx].sort((a, b) => X[a][f] - X[b][f]);
      let lp = 0;
      for (let k = 0; k < sorted.length - 1; k++) {
        lp += y[sorted[k]];
        const a = X[sorted[k]][f];
        const b = X[sorted[k + 1]][f];
        if (a === b || k + 1 < minLeaf || sorted.length - k - 1 < minLeaf) continue;
        const nl = k + 1;
        const nr = sorted.length - nl;
        const g = (nl * gini(lp, nl) + nr * gini(pos - lp, nr)) / sorted.length;
        if (g < best.g) best = { g, f, t: (a + b) / 2 };
      }
    }
    if (best.f < 0) return node;
    node.feature = best.f;
    node.thr = best.t;
    node.left = build(idx.filter((i) => X[i][best.f] <= best.t), depth + 1);
    node.right = build(idx.filter((i) => X[i][best.f] > best.t), depth + 1);
    return node;
  };
  return build(X.map((_, i) => i), 0);
}
export function treePredict(node: TreeNode, row: Row): number {
  while (node.feature !== undefined && node.left && node.right) node = row[node.feature] <= node.thr! ? node.left : node.right;
  return node.p;
}
export function treeStats(node: TreeNode, acc = { leaves: 0, depth: 0, features: new Map<number, number>() }) {
  acc.depth = Math.max(acc.depth, node.depth);
  if (node.feature === undefined) acc.leaves++;
  else {
    acc.features.set(node.feature, (acc.features.get(node.feature) ?? 0) + 1);
    treeStats(node.left!, acc);
    treeStats(node.right!, acc);
  }
  return acc;
}

/* ---------- k-means (returns every iteration for animation) ---------- */
export function kmeansSteps(P: Row[], k: number, seedIdx: number[], iters = 10) {
  let C = seedIdx.slice(0, k).map((i) => P[i].slice());
  const steps: { C: Row[]; A: number[] }[] = [];
  for (let it = 0; it < iters; it++) {
    const A = P.map((p) => {
      let bi = 0;
      let bd = Infinity;
      C.forEach((c, j) => {
        const d = c.reduce((s, v, q) => s + (v - p[q]) ** 2, 0);
        if (d < bd) { bd = d; bi = j; }
      });
      return bi;
    });
    steps.push({ C: C.map((c) => c.slice()), A });
    C = C.map((c, j) => {
      const mem = P.filter((_, i) => A[i] === j);
      if (!mem.length) return c;
      return c.map((_, q) => mem.reduce((s, p) => s + p[q], 0) / mem.length);
    });
  }
  return steps;
}

/**
 * Simplex Noise implementation for procedural generation.
 * Based on Stefan Gustavson's implementation.
 */

// Permutation table
const perm: number[] = [];
const gradP: { x: number; y: number }[] = [];

const grad3 = [
	{ x: 1, y: 1 },
	{ x: -1, y: 1 },
	{ x: 1, y: -1 },
	{ x: -1, y: -1 },
	{ x: 1, y: 0 },
	{ x: -1, y: 0 },
	{ x: 0, y: 1 },
	{ x: 0, y: -1 },
];

const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

/**
 * Seed the noise generator for reproducible results.
 */
export function seedNoise(seed: number): void {
	const p: number[] = [];

	// Generate permutation based on seed
	const random = mulberry32(seed);
	for (let i = 0; i < 256; i++) {
		p[i] = i;
	}

	// Shuffle using Fisher-Yates
	for (let i = 255; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[p[i], p[j]] = [p[j], p[i]];
	}

	// Extend permutation table
	for (let i = 0; i < 512; i++) {
		perm[i] = p[i & 255];
		gradP[i] = grad3[perm[i] % 8];
	}
}

/**
 * Mulberry32 PRNG for seeded random numbers.
 */
function mulberry32(initialSeed: number): () => number {
	let seed = initialSeed;
	return () => {
		seed += 0x6d2b79f5;
		let t = seed;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * 2D Simplex Noise.
 * Returns a value between -1 and 1.
 */
export function simplex2D(x: number, y: number): number {
	// Skew input space to determine which simplex cell we're in
	const s = (x + y) * F2;
	const i = Math.floor(x + s);
	const j = Math.floor(y + s);

	const t = (i + j) * G2;
	const X0 = i - t;
	const Y0 = j - t;
	const x0 = x - X0;
	const y0 = y - Y0;

	// Determine which simplex we're in
	const i1 = x0 > y0 ? 1 : 0;
	const j1 = x0 > y0 ? 0 : 1;

	const x1 = x0 - i1 + G2;
	const y1 = y0 - j1 + G2;
	const x2 = x0 - 1 + 2 * G2;
	const y2 = y0 - 1 + 2 * G2;

	// Hash coordinates of the three simplex corners
	const ii = i & 255;
	const jj = j & 255;

	// Calculate contribution from three corners
	let n0 = 0;
	let n1 = 0;
	let n2 = 0;

	let t0 = 0.5 - x0 * x0 - y0 * y0;
	if (t0 >= 0) {
		const gi0 = gradP[ii + perm[jj]];
		t0 *= t0;
		n0 = t0 * t0 * (gi0.x * x0 + gi0.y * y0);
	}

	let t1 = 0.5 - x1 * x1 - y1 * y1;
	if (t1 >= 0) {
		const gi1 = gradP[ii + i1 + perm[jj + j1]];
		t1 *= t1;
		n1 = t1 * t1 * (gi1.x * x1 + gi1.y * y1);
	}

	let t2 = 0.5 - x2 * x2 - y2 * y2;
	if (t2 >= 0) {
		const gi2 = gradP[ii + 1 + perm[jj + 1]];
		t2 *= t2;
		n2 = t2 * t2 * (gi2.x * x2 + gi2.y * y2);
	}

	// Scale to [-1, 1]
	return 70 * (n0 + n1 + n2);
}

/**
 * Fractal Brownian Motion - layered noise for more natural terrain.
 * @param x X coordinate
 * @param y Y coordinate
 * @param octaves Number of noise layers
 * @param persistence How much each octave contributes
 * @param lacunarity How much detail increases per octave
 */
export function fbm(
	x: number,
	y: number,
	octaves = 4,
	persistence = 0.5,
	lacunarity = 2,
): number {
	let total = 0;
	let frequency = 1;
	let amplitude = 1;
	let maxValue = 0;

	for (let i = 0; i < octaves; i++) {
		total += simplex2D(x * frequency, y * frequency) * amplitude;
		maxValue += amplitude;
		amplitude *= persistence;
		frequency *= lacunarity;
	}

	return total / maxValue;
}

// Initialize with a default seed
seedNoise(12345);

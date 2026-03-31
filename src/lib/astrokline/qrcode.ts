/**
 * Minimal QR Code generator using Canvas API.
 * Generates a simple QR-code-like data matrix pattern.
 * For production, swap with a real QR library if needed.
 */
export function drawQRCode(
  canvas: HTMLCanvasElement,
  url: string,
  size: number = 80,
  fg: string = '#D4AF37',
  bg: string = 'transparent'
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = size;
  canvas.height = size;
  ctx.clearRect(0, 0, size, size);

  // Simple deterministic pattern from URL hash
  const modules = 21; // QR version 1
  const cellSize = size / modules;
  const hash = hashString(url);

  // Background
  if (bg !== 'transparent') {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
  }

  ctx.fillStyle = fg;

  // Draw finder patterns (the 3 corner squares)
  drawFinderPattern(ctx, 0, 0, cellSize);
  drawFinderPattern(ctx, (modules - 7) * cellSize, 0, cellSize);
  drawFinderPattern(ctx, 0, (modules - 7) * cellSize, cellSize);

  // Draw data modules from hash
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      // Skip finder pattern areas
      if (isFinderArea(row, col, modules)) continue;

      // Use hash to determine if module is filled
      const idx = row * modules + col;
      const bit = (hash[idx % hash.length] >> (idx % 8)) & 1;
      if (bit) {
        ctx.fillRect(col * cellSize, row * cellSize, cellSize - 0.5, cellSize - 0.5);
      }
    }
  }
}

function drawFinderPattern(ctx: CanvasRenderingContext2D, x: number, y: number, cell: number) {
  // Outer border
  ctx.fillRect(x, y, 7 * cell, 7 * cell);
  // Inner white
  ctx.clearRect(x + cell, y + cell, 5 * cell, 5 * cell);
  // Inner dot
  ctx.fillRect(x + 2 * cell, y + 2 * cell, 3 * cell, 3 * cell);
}

function isFinderArea(row: number, col: number, modules: number): boolean {
  // Top-left
  if (row < 8 && col < 8) return true;
  // Top-right
  if (row < 8 && col >= modules - 8) return true;
  // Bottom-left
  if (row >= modules - 8 && col < 8) return true;
  return false;
}

function hashString(str: string): number[] {
  const result: number[] = [];
  for (let i = 0; i < 64; i++) {
    let h = 0;
    for (let j = 0; j < str.length; j++) {
      h = ((h << 5) - h + str.charCodeAt(j) + i * 31) | 0;
    }
    result.push(Math.abs(h) % 256);
  }
  return result;
}

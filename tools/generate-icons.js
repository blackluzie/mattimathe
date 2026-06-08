/* Erzeugt App-Icons (PNG) ohne externe Abhängigkeiten.
   Motiv: petrol-farbenes, abgerundetes Quadrat mit weißer Parabel.
   Aufruf:  node tools/generate-icons.js                                   */
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

function makeIcon(size) {
  const W = size, H = size;
  const buf = Buffer.alloc(W * H * 4); // RGBA

  const bg = [0x0e, 0x74, 0x90];   // Petrol/Teal (--blau)
  const white = [0xff, 0xff, 0xff];
  const r = size * 0.22;            // Eckradius
  const margin = 0;

  // Hilfsfunktion: ist Punkt innerhalb des abgerundeten Quadrats?
  function inRounded(x, y) {
    const x0 = margin, y0 = margin, x1 = W - margin, y1 = H - margin;
    if (x < x0 || x > x1 || y < y0 || y > y1) return false;
    const cx = Math.min(Math.max(x, x0 + r), x1 - r);
    const cy = Math.min(Math.max(y, y0 + r), y1 - r);
    const dx = x - cx, dy = y - cy;
    return dx * dx + dy * dy <= r * r;
  }

  // Parabel y = a·(x − mx)² + my (nach oben offen), als dicke weiße Kurve.
  const mx = size * 0.50;           // Scheitel x
  const my = size * 0.66;           // Scheitel y
  const a = 3.2 / size;             // Öffnung relativ zur Größe
  const dicke = size * 0.055;       // halbe Strichbreite
  function onParabel(x, y) {
    const yp = a * (x - mx) * (x - mx) + my;
    // nur im sichtbaren Bereich zeichnen
    if (x < size * 0.16 || x > size * 0.84) return false;
    if (yp < size * 0.18 || yp > size * 0.84) return false;
    return Math.abs(y - yp) <= dicke;
  }

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (!inRounded(x, y)) {
        buf[i] = 0; buf[i + 1] = 0; buf[i + 2] = 0; buf[i + 3] = 0; // transparent
      } else if (onParabel(x + 0.5, y + 0.5)) {
        buf[i] = white[0]; buf[i + 1] = white[1]; buf[i + 2] = white[2]; buf[i + 3] = 255;
      } else {
        buf[i] = bg[0]; buf[i + 1] = bg[1]; buf[i + 2] = bg[2]; buf[i + 3] = 255;
      }
    }
  }
  return encodePNG(W, H, buf);
}

// Minimaler PNG-Encoder (RGBA, keine Filter)
function encodePNG(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // Filtertyp 0
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });

  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, "ascii");
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([t, data])) >>> 0, 0);
    return Buffer.concat([len, t, data, crc]);
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });
for (const s of [192, 512]) {
  fs.writeFileSync(path.join(outDir, `icon-${s}.png`), makeIcon(s));
  console.log(`icons/icon-${s}.png erstellt`);
}

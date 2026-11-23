import { PNG } from 'pngjs'; import fs from 'node:fs';
const [,, a, b, x, y, w, h, out] = process.argv;
const imgs = [a, b].map(f => PNG.sync.read(fs.readFileSync(f)));
const o = new PNG({ width: +w * 2 + 10, height: +h }); o.data.fill(255);
imgs.forEach((im, i) => PNG.bitblt(im, o, +x, +y, Math.min(+w, im.width - x), Math.min(+h, im.height - y), i * (+w + 10), 0));
fs.writeFileSync(out, PNG.sync.write(o));

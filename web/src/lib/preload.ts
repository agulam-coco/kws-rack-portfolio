import { ROOM_SRC } from "./intro";

// only the room images this visit will actually show
const IMAGES = Object.values(ROOM_SRC).filter((src): src is string => !!src);

const FONTS = [
  '700 30px "Space Grotesk"',
  '500 12px "JetBrains Mono"',
  '600 12px "JetBrains Mono"',
];

// Film grain as a real image, generated once.
// Way cheaper than an SVG filter that re-renders while scaling.
function makeNoise(): Promise<string> {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 22; // grain strength
  }
  ctx.putImageData(img, 0, 0);
  return new Promise((resolve) =>
    c.toBlob((b) => resolve(URL.createObjectURL(b!)))
  );
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function preloadAll(onProgress: (p: number) => void) {
  const tasks: Promise<unknown>[] = [
    ...IMAGES.map((src) => {
      const img = new Image();
      img.src = src;
      return img.decode().catch(() => { });
    }),
    ...FONTS.map((f) => document.fonts.load(f).catch(() => { })),
    makeNoise().then((url) =>
      document.documentElement.style.setProperty("--noise", `url(${url})`)
    ),
  ];

  let done = 0;
  tasks.forEach((t) => t.then(() => onProgress(++done / tasks.length)));

  // short minimum so the loader doesn't just flash
  await Promise.all([Promise.all(tasks), wait(900)]);
}

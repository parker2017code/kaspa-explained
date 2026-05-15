#!/usr/bin/env node
import fs from "node:fs";

const html = fs.readFileSync("index.html", "utf8");
const layers = [...html.matchAll(/<g class="(demo-layer[^"]*)">([\s\S]*?)(?=<g class="demo-layer|<\/svg>)/g)];

if (layers.length !== 3) {
  console.error(`Expected 3 demo layers, found ${layers.length}.`);
  process.exit(1);
}

const expectedCounts = new Map([
  ["demo-layer demo-layer-chain", 6],
  ["demo-layer demo-layer-dag", 11],
  ["demo-layer demo-layer-pressure", 15],
]);

const failures = [];

for (const [, layerName, layerBody] of layers) {
  const blocks = [...layerBody.matchAll(/<g class="demo-block[^"]*" transform="translate\(([-\d.]+) ([-\d.]+)\)"><circle r="([-\d.]+)"><\/circle><text y="6">([^<]+)<\/text><\/g>/g)]
    .map((match) => ({
      x: Number(match[1]),
      y: Number(match[2]),
      r: Number(match[3]),
      label: match[4],
    }));

  const expected = expectedCounts.get(layerName);
  if (blocks.length !== expected) {
    failures.push(`${layerName}: expected ${expected} blocks, found ${blocks.length}`);
  }

  for (let i = 0; i < blocks.length; i += 1) {
    for (let j = i + 1; j < blocks.length; j += 1) {
      const a = blocks[i];
      const b = blocks[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const minimum = a.r + b.r + 8;
      if (distance < minimum) {
        failures.push(`${layerName} ${a.label}/${b.label}: distance ${distance.toFixed(1)} < ${minimum}`);
      }
    }
  }

  const label = layerBody.match(/<text class="demo-label" x="[-\d.]+" y="([-\d.]+)">/);
  if (!label) {
    failures.push(`${layerName}: missing demo label`);
  } else {
    const labelY = Number(label[1]);
    const lowestBlock = Math.max(...blocks.map((block) => block.y + block.r));
    if (labelY < lowestBlock + 14) {
      failures.push(`${layerName}: label y=${labelY} is too close to lowest block bottom=${lowestBlock}`);
    }
  }
}

if (failures.length) {
  console.error("SVG spacing check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SVG spacing check passed.");

const fs = require("fs");

// Create SVG logo based on BUA GROUP design
const svgLogo = `<svg width="150" height="50" viewBox="0 0 150 50" xmlns="http://www.w3.org/2000/svg">
  <!-- Red background (upper 2/3) -->
  <rect width="150" height="33" fill="#dc2626"/>
  
  <!-- Golden globe -->
  <circle cx="75" cy="20" r="8" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
  <path d="M67 20 Q75 12 83 20 Q75 28 67 20" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
  <path d="M67 20 Q75 28 83 20" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
  <line x1="75" y1="12" x2="75" y2="28" stroke="#fbbf24" stroke-width="1.5"/>
  <line x1="67" y1="20" x2="83" y2="20" stroke="#fbbf24" stroke-width="1.5"/>
  
  <!-- BUA text -->
  <text x="75" y="32" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white" text-anchor="middle">BUA</text>
  
  <!-- Yellow background (bottom 1/3) -->
  <rect y="33" width="150" height="17" fill="#fbbf24"/>
  
  <!-- GROUP text -->
  <text x="75" y="44" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="black" text-anchor="middle">GROUP</text>
</svg>`;

// Convert to base64
const base64 = Buffer.from(svgLogo).toString("base64");
console.log("data:image/svg+xml;base64," + base64);

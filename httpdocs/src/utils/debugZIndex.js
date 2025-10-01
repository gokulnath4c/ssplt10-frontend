export function findHighestZIndex() {
  const all = [...document.querySelectorAll('*')];
  let highest = -Infinity;
  let highestEl = null;
  all.forEach(el => {
    const zStr = window.getComputedStyle(el).zIndex;
    const z = isNaN(Number(zStr)) ? null : Number(zStr);
    if (z !== null && z > highest) {
      highest = z;
      highestEl = el;
    }
  });
  console.log("🔍 Highest z-index found:", highest === -Infinity ? "none" : highest, "on element:", highestEl);
  if (highestEl) console.log("Element outerHTML:", highestEl.outerHTML);
}
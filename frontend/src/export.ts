/** Chart export helpers. No extra dependency: CSV is built by hand, PNG is
 *  produced by serializing the chart's own inline SVG (Recharts renders one)
 *  onto a canvas — this works entirely client-side and needs no server support. */

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on a delay so Safari/Firefox have time to start the download first.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeName(name: string) {
  return name.trim().replace(/[^a-z0-9\-_]+/gi, "_").slice(0, 80) || "chart";
}

/** Downloads the chart's underlying {label, value} rows as a CSV file. */
export function exportChartCSV(data: {label: string; value: number}[], title: string) {
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = ["label,value", ...data.map(d => `${escape(d.label)},${escape(d.value)}`)];
  const blob = new Blob([lines.join("\n")], {type: "text/csv;charset=utf-8;"});
  downloadBlob(blob, `${safeName(title)}.csv`);
}

/** Finds the <svg> Recharts rendered inside `container` and rasterizes it to a PNG.
 *  Returns a rejected promise (caller should catch) if no SVG is found. */
export function exportChartPNG(container: HTMLElement | null, title: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const svg = container?.querySelector("svg");
    if (!svg) { reject(new Error("No chart to export yet.")); return; }

    const clone = svg.cloneNode(true) as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const width = Math.ceil(rect.width) || 700;
    const height = Math.ceil(rect.height) || 300;
    clone.setAttribute("width", String(width));
    clone.setAttribute("height", String(height));
    // Background so the exported PNG isn't transparent-on-black when viewed elsewhere.
    clone.insertAdjacentHTML("afterbegin", `<rect width="100%" height="100%" fill="#14171D"/>`);

    const svgData = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const scale = 2; // export at 2x for crisp text on high-DPI screens
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error("Canvas unavailable.")); return; }
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error("Could not create image.")); return; }
        downloadBlob(blob, `${safeName(title)}.png`);
        resolve();
      }, "image/png");
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not render chart image.")); };
    img.src = url;
  });
}
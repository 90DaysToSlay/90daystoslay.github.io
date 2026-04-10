import fs from 'fs';
import path from 'path';

const reportsDir = path.join(__dirname, '..', 'reports');

export function generateReport() {
  const report: Record<string, any> = {
    generated: new Date().toISOString(),
    original: 'https://www.90daystoslay.biz',
    static: 'https://90daystoslay.github.io',
    visual: {},
    content: {},
    structure: {},
    assets: {},
    layout: {},
  };

  // Collect visual results
  const visualPath = path.join(reportsDir, 'visual-results.json');
  if (fs.existsSync(visualPath)) {
    report.visual = JSON.parse(fs.readFileSync(visualPath, 'utf8'));
  }

  // Collect content results
  const contentDir = path.join(reportsDir, 'content');
  if (fs.existsSync(contentDir)) {
    for (const file of fs.readdirSync(contentDir)) {
      const key = file.replace(/\.\w+$/, '');
      const content = fs.readFileSync(path.join(contentDir, file), 'utf8');
      report.content[key] = file.endsWith('.json') ? JSON.parse(content) : content;
    }
  }

  // Collect structure results
  const structureDir = path.join(reportsDir, 'structure');
  if (fs.existsSync(structureDir)) {
    for (const file of fs.readdirSync(structureDir)) {
      const key = file.replace(/\.\w+$/, '');
      report.structure[key] = JSON.parse(fs.readFileSync(path.join(structureDir, file), 'utf8'));
    }
  }

  // Collect asset results
  const assetsDir = path.join(reportsDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    for (const file of fs.readdirSync(assetsDir)) {
      const key = file.replace(/\.\w+$/, '');
      report.assets[key] = JSON.parse(fs.readFileSync(path.join(assetsDir, file), 'utf8'));
    }
  }

  // Collect layout results
  const layoutDir = path.join(reportsDir, 'layout');
  if (fs.existsSync(layoutDir)) {
    for (const file of fs.readdirSync(layoutDir)) {
      const key = file.replace(/\.\w+$/, '');
      report.layout[key] = JSON.parse(fs.readFileSync(path.join(layoutDir, file), 'utf8'));
    }
  }

  // Write JSON report
  fs.writeFileSync(
    path.join(reportsDir, 'comparison-report.json'),
    JSON.stringify(report, null, 2)
  );

  // Generate HTML report
  const html = generateHtmlReport(report);
  fs.writeFileSync(path.join(reportsDir, 'comparison-report.html'), html);

  console.log(`\nComparison report generated:`);
  console.log(`  JSON: ${path.join(reportsDir, 'comparison-report.json')}`);
  console.log(`  HTML: ${path.join(reportsDir, 'comparison-report.html')}`);
}

function generateHtmlReport(report: Record<string, any>): string {
  const visualEntries = Object.entries(report.visual || {});
  const screenshotRows = visualEntries.map(([key, data]: [string, any]) => `
    <tr>
      <td>${data.page}</td>
      <td>${data.viewport}</td>
      <td>${data.mismatchPercent}%</td>
      <td>${data.originalSize.width}x${data.originalSize.height}</td>
      <td>${data.staticSize.width}x${data.staticSize.height}</td>
      <td>
        <a href="screenshots/original/${key}.png" target="_blank">Original</a> |
        <a href="screenshots/static/${key}.png" target="_blank">Static</a> |
        <a href="screenshots/diffs/${key}-diff.png" target="_blank">Diff</a>
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>90DaysToSlay — Site Comparison Report</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
  h1 { color: #5B0088; }
  h2 { color: #333; border-bottom: 2px solid #5B0088; padding-bottom: 8px; margin-top: 40px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #eee; }
  th { background: #5B0088; color: white; }
  a { color: #ed258b; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.85em; font-weight: 600; }
  .badge-pass { background: #d4edda; color: #155724; }
  .badge-warn { background: #fff3cd; color: #856404; }
  .badge-fail { background: #f8d7da; color: #721c24; }
  pre { background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 13px; }
  .meta { color: #666; font-size: 0.9em; }
</style>
</head>
<body>
<h1>90DaysToSlay — Site Comparison Report</h1>
<p class="meta">Generated: ${report.generated}<br>
Original: <a href="${report.original}">${report.original}</a><br>
Static: <a href="${report.static}">${report.static}</a></p>

<h2>Visual Comparison</h2>
<table>
<tr><th>Page</th><th>Viewport</th><th>Mismatch</th><th>Original Size</th><th>Static Size</th><th>Screenshots</th></tr>
${screenshotRows || '<tr><td colspan="6">No visual results</td></tr>'}
</table>

<h2>Content Diffs</h2>
${Object.entries(report.content || {}).map(([key, data]: [string, any]) => {
    if (typeof data === 'string') {
      return `<h3>${key}</h3><pre>${escapeHtml(data)}</pre>`;
    }
    return `<h3>${key}</h3><pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
  }).join('')}

<h2>Structure</h2>
${Object.entries(report.structure || {}).map(([key, data]: [string, any]) =>
    `<h3>${key}</h3><pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`
  ).join('')}

<h2>Assets</h2>
${Object.entries(report.assets || {}).map(([key, data]: [string, any]) =>
    `<h3>${key}</h3><pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`
  ).join('')}

<h2>Layout</h2>
${Object.entries(report.layout || {}).map(([key, data]: [string, any]) =>
    `<h3>${key}</h3><pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`
  ).join('')}

</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

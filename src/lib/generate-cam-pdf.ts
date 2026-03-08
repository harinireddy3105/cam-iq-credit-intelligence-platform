import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatINR, getScoreBarColor } from '@/lib/format';

interface AssessmentData {
  borrower_name: string;
  cin: string | null;
  sector: string | null;
  loan_requested: number | null;
  loan_recommended: number | null;
  interest_rate: number | null;
  tenure_months: number | null;
  composite_score: number | null;
  character_score: number | null;
  capacity_score: number | null;
  capital_score: number | null;
  collateral_score: number | null;
  conditions_score: number | null;
  status: string;
  recommendation_rationale: string | null;
  created_at?: string;
}

interface FraudFlag {
  fraud_type: string | null;
  source_a: string | null;
  source_b: string | null;
  variance_amount: string | null;
  severity: string | null;
  evidence: string | null;
}

interface ResearchFinding {
  source: string | null;
  finding: string | null;
  sentiment: string | null;
}

interface Covenant {
  covenant_text: string | null;
}

const FIVE_CS = ['Character', 'Capacity', 'Capital', 'Collateral', 'Conditions'] as const;
const FIVE_CS_WEIGHTS: Record<string, number> = { Character: 25, Capacity: 30, Capital: 20, Collateral: 15, Conditions: 10 };

function hexFromHsl(hslStr: string): string {
  // Parse "hsl(h, s%, l%)" format
  const match = hslStr.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
  if (!match) return '#666666';
  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function generateCAMPdf(
  assessment: AssessmentData,
  fraudFlags: FraudFlag[],
  findings: ResearchFinding[],
  covenants: Covenant[]
) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const statusLabel = assessment.status === 'approved' ? 'APPROVED' : assessment.status === 'conditional' ? 'CONDITIONAL' : 'REJECTED';
  const statusColor = assessment.status === 'approved' ? '#10b981' : assessment.status === 'conditional' ? '#f59e0b' : '#ef4444';

  // ── Header ──
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 38, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Credit Appraisal Memorandum', margin, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${assessment.borrower_name}  ·  CIN: ${assessment.cin || 'N/A'}  ·  Sector: ${assessment.sector || 'N/A'}`, margin, 25);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, margin, 33);

  // Status badge
  const badgeW = 28;
  doc.setFillColor(...hexToRgb(statusColor));
  doc.roundedRect(pageWidth - margin - badgeW, 12, badgeW, 8, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(statusLabel, pageWidth - margin - badgeW / 2, 17.5, { align: 'center' });

  y = 48;

  // ── KPI Summary ──
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('LOAN SUMMARY', margin, y);
  y += 6;

  const kpis = [
    ['Loan Requested', assessment.loan_requested ? formatINR(assessment.loan_requested) : 'N/A'],
    ['Recommended Limit', assessment.loan_recommended ? formatINR(assessment.loan_recommended) : 'N/A'],
    ['Interest Rate', assessment.interest_rate ? `${assessment.interest_rate}%` : 'N/A'],
    ['Tenure', assessment.tenure_months ? `${assessment.tenure_months} Months` : 'N/A'],
    ['Composite Score', `${assessment.composite_score || 0}/100`],
  ];

  const kpiW = contentWidth / kpis.length;
  kpis.forEach(([label, value], i) => {
    const x = margin + i * kpiW;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, kpiW - 3, 16, 1.5, 1.5, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(label.toUpperCase(), x + (kpiW - 3) / 2, y + 5, { align: 'center' });
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(value, x + (kpiW - 3) / 2, y + 12, { align: 'center' });
  });
  y += 24;

  // ── Five-Cs Scoring ──
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('FIVE-Cs SCORING MODEL', margin, y);
  y += 6;

  const scores: Record<string, number> = {
    Character: assessment.character_score || 0,
    Capacity: assessment.capacity_score || 0,
    Capital: assessment.capital_score || 0,
    Collateral: assessment.collateral_score || 0,
    Conditions: assessment.conditions_score || 0,
  };

  FIVE_CS.forEach((c) => {
    const score = scores[c];
    const barColor = hexFromHsl(getScoreBarColor(score));

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${c} (${FIVE_CS_WEIGHTS[c]}%)`, margin, y + 4);

    doc.setFont('helvetica', 'bold');
    doc.text(`${score}/100`, margin + contentWidth, y + 4, { align: 'right' });

    // Bar background
    const barX = margin + 50;
    const barW = contentWidth - 75;
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(barX, y, barW, 5, 1.5, 1.5, 'F');
    // Bar fill
    doc.setFillColor(...hexToRgb(barColor));
    if (score > 0) {
      doc.roundedRect(barX, y, barW * (score / 100), 5, 1.5, 1.5, 'F');
    }

    y += 10;
  });

  y += 4;

  // ── Fraud Flags ──
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(fraudFlags.length > 0 ? `TRIANGULATION FLAGS (${fraudFlags.length} DETECTED)` : 'NO FRAUD SIGNALS DETECTED', margin, y);
  y += 4;

  if (fraudFlags.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Fraud Type', 'Source A', 'Source B', '₹ Variance', 'Severity']],
      body: fraudFlags.map(f => [
        f.fraud_type || '',
        f.source_a || '',
        f.source_b || '',
        f.variance_amount || '',
        f.severity || '',
      ]),
      styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 7 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didParseCell: (data) => {
        if (data.column.index === 4 && data.section === 'body') {
          const val = data.cell.raw as string;
          if (val === 'HIGH') {
            data.cell.styles.textColor = [239, 68, 68];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  } else {
    y += 6;
  }

  // Check for page overflow
  if (y > 240) {
    doc.addPage();
    y = margin;
  }

  // ── Research Findings ──
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('RESEARCH AGENT FINDINGS', margin, y);
  y += 4;

  if (findings.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Source', 'Finding', 'Sentiment']],
      body: findings.map(f => [f.source || '', f.finding || '', f.sentiment || '']),
      styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 7 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 1: { cellWidth: 100 } },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  } else {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('No research findings available.', margin, y + 4);
    y += 10;
  }

  if (y > 240) {
    doc.addPage();
    y = margin;
  }

  // ── Recommendation Rationale ──
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('RECOMMENDATION RATIONALE', margin, y);
  y += 6;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  const rationale = assessment.recommendation_rationale || 'No rationale provided.';
  const rationaleLines = doc.splitTextToSize(rationale, contentWidth);
  doc.text(rationaleLines, margin, y);
  y += rationaleLines.length * 4 + 4;

  // ── Covenants ──
  if (covenants.length > 0) {
    if (y > 250) {
      doc.addPage();
      y = margin;
    }

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('COVENANTS', margin, y);
    y += 6;

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    covenants.forEach((c, i) => {
      if (y > 275) {
        doc.addPage();
        y = margin;
      }
      const text = `${i + 1}. ${c.covenant_text || ''}`;
      const lines = doc.splitTextToSize(text, contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * 4 + 2;
    });
  }

  // ── Footer on each page ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(248, 250, 252);
    doc.rect(0, doc.internal.pageSize.getHeight() - 12, pageWidth, 12, 'F');
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('CAM-IQ · AI-Powered Credit Appraisal · Confidential', margin, doc.internal.pageSize.getHeight() - 5);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 5, { align: 'right' });
  }

  doc.save(`CAM_${assessment.borrower_name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

import { Complaint } from '../types';

function triggerHtmlDownload(htmlContent: string, filename: string): void {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function triggerIframePrint(htmlContent: string): void {
  try {
    const existing = document.getElementById('sc-print-frame');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
    const iframe = document.createElement('iframe');
    iframe.id = 'sc-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 250);
    }
  } catch {
    window.print();
  }
}

export function buildAcknowledgementHtml(complaint: Complaint): string {
  const submittedDate = new Date(complaint.createdAt).toLocaleString('en-IN', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
  const targetResponse = complaint.targetResponseDate
    ? new Date(complaint.targetResponseDate).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Within 12 Hours';
  const estResolution = complaint.slaDeadline
    ? new Date(complaint.slaDeadline).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : `${complaint.slaHours || 48} Hours`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SMART CIVIC PLATFORM - Grievance Acknowledgement ${complaint.id}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      padding: 32px;
      margin: 0;
    }
    .card {
      max-width: 780px;
      margin: 0 auto;
      background: #ffffff;
      border: 2px solid #059669;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.06);
    }
    .header {
      background: #0f172a;
      color: #ffffff;
      padding: 24px 32px;
      border-bottom: 4px solid #10b981;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      letter-spacing: 0.04em;
    }
    .header p {
      margin: 6px 0 0;
      font-size: 12px;
      color: #94a3b8;
    }
    .badge-box {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 16px 24px;
      margin: 24px 32px 0;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .id-label {
      font-size: 11px;
      text-transform: uppercase;
      color: #047857;
      font-weight: 700;
      letter-spacing: 0.08em;
    }
    .id-val {
      font-size: 24px;
      font-weight: 900;
      color: #065f46;
      font-family: monospace;
      margin-top: 4px;
    }
    .status-pill {
      background: #059669;
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 999px;
      text-transform: uppercase;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      padding: 24px 32px;
    }
    .field {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 14px;
      background: #f8fafc;
    }
    .field-full {
      grid-column: span 2;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 14px;
      background: #f8fafc;
    }
    .label {
      font-size: 10px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
      letter-spacing: 0.06em;
      margin-bottom: 4px;
    }
    .val {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
      line-height: 1.4;
    }
    .footer {
      padding: 18px 32px;
      background: #f1f5f9;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #475569;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { padding: 0; background: #fff; }
      .card { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>SMART CIVIC PLATFORM — OFFICIAL GRIEVANCE ACKNOWLEDGEMENT</h1>
      <p>Smart Civic Development &amp; Complaint Resolution Platform | Municipal Citizen Service</p>
    </div>
    <div class="badge-box">
      <div>
        <div class="id-label">Unique Grievance Acknowledgement ID</div>
        <div class="id-val">${complaint.id}</div>
      </div>
      <div class="status-pill">${complaint.status}</div>
    </div>
    <div class="grid">
      <div class="field">
        <div class="label">Citizen Name &amp; Contact</div>
        <div class="val">${complaint.reportedBy?.name || 'Citizen Resident'}<br/>${complaint.reportedBy?.phone || ''} ${complaint.reportedBy?.email ? `(${complaint.reportedBy.email})` : ''}</div>
      </div>
      <div class="field">
        <div class="label">Submission Date &amp; Time</div>
        <div class="val">${submittedDate}</div>
      </div>
      <div class="field">
        <div class="label">Category &amp; Subcategory</div>
        <div class="val">${complaint.category}${complaint.subcategory ? ` — ${complaint.subcategory}` : ''}</div>
      </div>
      <div class="field">
        <div class="label">Assigned Department</div>
        <div class="val">${complaint.department}</div>
      </div>
      <div class="field">
        <div class="label">District / City, Zone &amp; Ward</div>
        <div class="val">${complaint.district || complaint.location?.city || 'Chennai'} — ${complaint.location?.ward || ''}${complaint.location?.zone ? `<br/>Zone: ${complaint.location.zone}` : ''}</div>
      </div>
      <div class="field">
        <div class="label">Priority &amp; SLA Timeline</div>
        <div class="val">${complaint.priority} (${complaint.severity})<br/>Target Response: ${targetResponse}<br/>Est. Resolution: ${estResolution}</div>
      </div>
      <div class="field-full">
        <div class="label">Complaint Title</div>
        <div class="val">${complaint.title}</div>
      </div>
      <div class="field-full">
        <div class="label">Detailed Description</div>
        <div class="val">${complaint.description}</div>
      </div>
      <div class="field-full">
        <div class="label">Registered Location &amp; GPS Coordinates</div>
        <div class="val">${complaint.location?.address || ''}${complaint.location?.landmark ? ` (Landmark: ${complaint.location.landmark})` : ''}<br/>GPS: ${Number(complaint.location?.lat || 13.0827).toFixed(5)}°N, ${Number(complaint.location?.lng || 80.2707).toFixed(5)}°E</div>
      </div>
    </div>
    <div class="footer">
      <span>Generated by SMART CIVIC PLATFORM</span>
      <span>Use ID ${complaint.id} to track live status and resolution progress.</span>
    </div>
  </div>
</body>
</html>`;
}

export function downloadComplaintAcknowledgement(complaint: Complaint): void {
  const html = buildAcknowledgementHtml(complaint);
  triggerHtmlDownload(html, `SmartCivic_Acknowledgement_${complaint.id}.html`);
}

export function printComplaintAcknowledgement(complaint: Complaint): void {
  const html = buildAcknowledgementHtml(complaint);
  triggerIframePrint(html);
}

export function downloadComplaintStatusReport(complaint: Complaint, printMode = false): void {
  const timelineRows = Array.isArray(complaint.timeline)
    ? complaint.timeline
        .map(
          (item, idx) => `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-family:monospace;">#${idx + 1}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-weight:700;">${item?.status || 'Update'}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${item?.updatedBy || 'System'} (${item?.role || 'staff'})</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${item?.remarks || 'Status updated'}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;color:#475569;">${item?.timestamp ? new Date(item.timestamp).toLocaleString('en-IN') : ''}</td>
      </tr>`
        )
        .join('')
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SMART CIVIC PLATFORM - Complaint Status Report ${complaint.id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; background: #f8fafc; padding: 28px; margin: 0; }
    .container { max-width: 820px; margin: 0 auto; background: #fff; border: 2px solid #1e293b; border-radius: 16px; overflow: hidden; }
    .header { background: #0f172a; color: #fff; padding: 24px 30px; border-bottom: 4px solid #3b82f6; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { margin: 0; font-size: 18px; }
    .header p { margin: 4px 0 0; font-size: 12px; color: #94a3b8; }
    .section { padding: 20px 30px; border-bottom: 1px solid #e2e8f0; }
    .section h2 { margin: 0 0 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.06em; color: #334155; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 8px; }
    .box strong { display: block; font-size: 10px; text-transform: uppercase; color: #64748b; margin-bottom: 3px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #f1f5f9; text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
    .footer { padding: 14px 30px; background: #f8fafc; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; }
    @media print { body { padding: 0; background: #fff; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>SMART CIVIC PLATFORM — OFFICIAL COMPLAINT STATUS REPORT</h1>
        <p>Comprehensive Lifecycle &amp; Audit Dossier • Generated ${new Date().toLocaleString('en-IN')}</p>
      </div>
      <div style="text-align:right;font-family:monospace;font-size:18px;font-weight:900;color:#60a5fa;">${complaint.id}</div>
    </div>

    <div class="section">
      <h2>1. Grievance Overview &amp; Routing</h2>
      <div class="grid">
        <div class="box"><strong>Complaint Title</strong>${complaint.title}</div>
        <div class="box"><strong>Current Status</strong>${complaint.status}</div>
        <div class="box"><strong>Category &amp; Priority</strong>${complaint.category} • ${complaint.priority} (${complaint.severity})</div>
        <div class="box"><strong>Assigned Department</strong>${complaint.department}</div>
        <div class="box"><strong>Assigned Officer</strong>${complaint.assignedOfficer?.name || 'Department OfficerQueue'} (${complaint.assignedOfficer?.badgeNumber || 'N/A'})</div>
        <div class="box"><strong>Citizen Reporter</strong>${complaint.reportedBy?.name || 'Resident'} (${complaint.reportedBy?.phone || 'N/A'})</div>
        <div class="box" style="grid-column:span 2;"><strong>Location &amp; Ward</strong>${complaint.location?.address || ''} • ${complaint.location?.ward || ''}${complaint.location?.zone ? ` • ${complaint.location.zone}` : ''}</div>
        <div class="box" style="grid-column:span 2;"><strong>Problem Description</strong>${complaint.description}</div>
      </div>
    </div>

    ${
      complaint.workerProof
        ? `<div class="section">
      <h2>2. Field Execution &amp; Verification Proof</h2>
      <div class="grid">
        <div class="box"><strong>Field Officer / Engineer</strong>${complaint.workerProof.workerName || complaint.assignedOfficer?.name || 'Department Officer'}</div>
        <div class="box"><strong>Completion Timestamp</strong>${complaint.workerProof.completedAt ? new Date(complaint.workerProof.completedAt).toLocaleString('en-IN') : 'In Progress'}</div>
        <div class="box" style="grid-column:span 2;"><strong>Work Completion Notes</strong>${complaint.workerProof.completionNotes || 'Field inspection and repair logged.'}</div>
      </div>
    </div>`
        : ''
    }

    <div class="section">
      <h2>3. Complete Status History Timeline (${Array.isArray(complaint.timeline) ? complaint.timeline.length : 0} Events)</h2>
      <table>
        <thead>
          <tr>
            <th>Step</th>
            <th>Status</th>
            <th>Updated By</th>
            <th>Remarks</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          ${timelineRows}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <span>SMART CIVIC DEVELOPMENT &amp; COMPLAINT RESOLUTION PLATFORM</span>
      <span>Official Status Report • ID: ${complaint.id}</span>
    </div>
  </div>
</body>
</html>`;

  if (printMode) {
    triggerIframePrint(html);
  } else {
    triggerHtmlDownload(html, `SmartCivic_Status_Report_${complaint.id}.html`);
  }
}

export function downloadInspectionReport(complaint: Complaint, officerName = 'Department Officer', printMode = false): void {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SMART CIVIC PLATFORM - Field Inspection Report ${complaint.id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; background: #f8fafc; padding: 28px; margin: 0; }
    .container { max-width: 780px; margin: 0 auto; background: #fff; border: 2px solid #0284c7; border-radius: 16px; overflow: hidden; }
    .header { background: #0f172a; color: #fff; padding: 24px 30px; border-bottom: 4px solid #0ea5e9; }
    .header h1 { margin: 0; font-size: 18px; }
    .header p { margin: 4px 0 0; font-size: 12px; color: #94a3b8; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: 24px 30px; font-size: 13px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 14px; border-radius: 10px; }
    .box strong { display: block; font-size: 10px; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
    .footer { padding: 14px 30px; background: #f1f5f9; font-size: 11px; color: #475569; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SMART CIVIC PLATFORM — OFFICIAL SITE INSPECTION REPORT</h1>
      <p>Department Officer Field Verification Dossier • Complaint ID: ${complaint.id}</p>
    </div>
    <div class="grid">
      <div class="box"><strong>Complaint ID</strong>${complaint.id}</div>
      <div class="box"><strong>Inspection Date</strong>${new Date().toLocaleString('en-IN')}</div>
      <div class="box"><strong>Inspecting Officer</strong>${complaint.assignedOfficer?.name || officerName}</div>
      <div class="box"><strong>Department</strong>${complaint.department}</div>
      <div class="box"><strong>Category &amp; Priority</strong>${complaint.category} (${complaint.priority})</div>
      <div class="box"><strong>Current Operational Status</strong>${complaint.status}</div>
      <div class="box" style="grid-column:span 2;"><strong>Site Location &amp; GPS</strong>${complaint.location?.address || ''} • ${complaint.location?.ward || ''} (${Number(complaint.location?.lat || 13.0827).toFixed(5)}°N, ${Number(complaint.location?.lng || 80.2707).toFixed(5)}°E)</div>
      <div class="box" style="grid-column:span 2;"><strong>Site Defect &amp; Inspection Findings</strong>${complaint.description}</div>
      <div class="box" style="grid-column:span 2;"><strong>Recommended Technical Action / Field Remarks</strong>${complaint.workerProof?.completionNotes || complaint.aiAnalysis?.suggestedAction || 'On-site physical verification completed. Departmental repair crew mobilized as per SLA guidelines.'}</div>
    </div>
    <div class="footer">
      <span>Verified by Department Officer Portal</span>
      <span>SMART CIVIC PLATFORM • ${new Date().toLocaleDateString('en-IN')}</span>
    </div>
  </div>
</body>
</html>`;

  if (printMode) {
    triggerIframePrint(html);
  } else {
    triggerHtmlDownload(html, `SmartCivic_Inspection_Report_${complaint.id}.html`);
  }
}

export function downloadDepartmentSummaryReport(
  complaints: Complaint[],
  reportType: 'Department Complaint Summary' | 'Work Progress Report' | 'Resolution Report' | 'Monthly Complaint Report',
  departmentName = 'All Municipal Departments'
): void {
  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress' || c.status === 'Work Planned' || c.status === 'Assigned').length;
  const overdue = complaints.filter((c) => c.isOverdue).length;

  const rows = complaints
    .map(
      (c) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-family:monospace;font-weight:700;">${c.id}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${c.title}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${c.category}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${c.priority}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:700;">${c.status}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${c.location?.ward || ''}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${c.assignedOfficer?.name || 'Department Team'}</td>
    </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SMART CIVIC PLATFORM - ${reportType}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; background: #f8fafc; padding: 28px; margin: 0; }
    .container { max-width: 960px; margin: 0 auto; background: #fff; border: 2px solid #0f172a; border-radius: 16px; overflow: hidden; }
    .header { background: #0f172a; color: #fff; padding: 24px 30px; border-bottom: 4px solid #10b981; }
    .header h1 { margin: 0; font-size: 18px; text-transform: uppercase; }
    .header p { margin: 4px 0 0; font-size: 12px; color: #94a3b8; }
    .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 20px 30px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    .kpi { background: #fff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; text-align: center; }
    .kpi .num { font-size: 22px; font-weight: 900; color: #0f172a; }
    .kpi .lbl { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-top: 2px; }
    .table-wrap { padding: 20px 30px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #f1f5f9; text-align: left; padding: 8px; font-size: 10px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
    .footer { padding: 14px 30px; background: #f1f5f9; font-size: 11px; color: #475569; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SMART CIVIC PLATFORM — ${reportType}</h1>
      <p>Department: ${departmentName} • Generated: ${new Date().toLocaleString('en-IN')}</p>
    </div>
    <div class="kpis">
      <div class="kpi"><div class="num">${total}</div><div class="lbl">Total Complaints</div></div>
      <div class="kpi"><div class="num" style="color:#d97706;">${inProgress}</div><div class="lbl">Active / In Progress</div></div>
      <div class="kpi"><div class="num" style="color:#059669;">${resolved}</div><div class="lbl">Resolved / Closed</div></div>
      <div class="kpi"><div class="num" style="color:#e11d48;">${overdue}</div><div class="lbl">Overdue SLA</div></div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Complaint ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Ward</th>
            <th>Assigned Officer</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
    <div class="footer">
      <span>SMART CIVIC DEVELOPMENT &amp; COMPLAINT RESOLUTION PLATFORM</span>
      <span>Official Departmental Report (${complaints.length} records)</span>
    </div>
  </div>
</body>
</html>`;

  const slug = reportType.toLowerCase().replace(/\s+/g, '_');
  triggerHtmlDownload(html, `SmartCivic_${slug}_${new Date().toISOString().slice(0, 10)}.html`);
}

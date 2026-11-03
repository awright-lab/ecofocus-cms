export default function CaseStudyDownloadsExport() {
  return <div style={{ marginBottom: '1.5rem' }}>
    <a href="/api/case-study-downloads/export-csv" className="btn btn--style-secondary btn--size-medium">Export all downloads (.csv)</a>
    <p style={{ marginTop: '0.5rem' }}>Includes all download requests, across every page. List filters do not limit this export.</p>
  </div>
}

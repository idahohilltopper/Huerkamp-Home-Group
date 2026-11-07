// Renders static, server-built JSON-LD structured data for search engines.
// Never pass user input to this component. "<" is escaped so the data cannot close the script tag.
export default function JsonLd({ data }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

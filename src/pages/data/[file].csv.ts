// CSV downloads for /data, one per dataset in src/lib/datasets.ts.
import type { APIRoute } from 'astro';
import { datasets, toCsv } from '../../lib/datasets';

export function getStaticPaths() {
  return datasets.map((d) => ({ params: { file: d.slug } }));
}

export const GET: APIRoute = ({ params }) => {
  const d = datasets.find((x) => x.slug === params.file)!;
  return new Response(toCsv(d), { headers: { 'content-type': 'text/csv; charset=utf-8' } });
};

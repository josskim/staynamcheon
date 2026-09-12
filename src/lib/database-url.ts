/** Runtime-only pooling; migration/backup connection strings remain untouched. */
export function runtimeDatabaseUrl(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  const url = new URL(raw);
  if (url.hostname.endsWith('.pooler.supabase.com')) {
    if (url.port === '5432') url.port = '6543';
    if (url.port === '6543') {
      url.searchParams.set('pgbouncer', 'true');
      url.searchParams.set('connection_limit', '1');
      url.searchParams.set('pool_timeout', '10');
      url.searchParams.set('connect_timeout', '10');
    }
  }
  return url.toString();
}

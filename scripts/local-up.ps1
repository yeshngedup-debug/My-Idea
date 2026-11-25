<#
  Local development: pull the Neon branch environment, then start the Next.js
  dev server. All backend services (Postgres, Auth, Object Storage, Realtime)
  are managed by Neon — there is no local Docker stack.

  Run from anywhere:  powershell -ExecutionPolicy Bypass -File scripts/local-up.ps1

  Requires the Neon CLI to be installed and signed in (`neon login`) with this
  project's branch configured in neon.ts. Check the branch's Managed Auth with
  `neon neon-auth status`; set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET
  in .env.local if `neon env pull` does not provide them.
#>
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)

if (Test-Path .env.local) {
  $stale = Select-String -Path .env.local -Pattern 'SUPABASE' -Quiet
  if ($stale) {
    Write-Warning '.env.local still contains Supabase variables. Remove them; the app is Neon-only.'
  }
}

Write-Host '==> Pulling Neon branch environment variables...'
neon env pull
if ($LASTEXITCODE -ne 0) { throw 'neon env pull failed. Is the Neon CLI installed and signed in?' }

Write-Host '==> Starting Next.js on http://127.0.0.1:3000...'
npm run dev

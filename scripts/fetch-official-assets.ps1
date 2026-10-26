# Downloads official imagery and documents published on https://gohargoc.com/
# into public/. Re-runnable. For each asset the original upload (no WordPress
# size suffix) is tried first, then the published resized variant.
#
# Usage (from project root):  powershell -ExecutionPolicy Bypass -File scripts/fetch-official-assets.ps1

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$root = Split-Path -Parent $PSScriptRoot
$base = 'https://gohargoc.com/wp-content/uploads'

# dest (relative to public/) => candidate source paths (relative to uploads/), first that works wins
$assets = [ordered]@{
  'images/brand/gohar-logo-dark.png'  = @('2026/06/Gohar-Logo-02.png')
  'images/brand/gohar-logo-light.png' = @('2026/06/Gohar-Logo-01.png')

  'images/projects/141-broadway-heights/terrace.jpg'  = @('2026/08/Terrace-1.jpg.jpeg', '2026/08/Terrace-1.jpg-1024x576.jpeg')
  'images/projects/141-broadway-heights/living.jpg'   = @('2026/08/Living.jpg.jpeg', '2026/08/Living.jpg-1024x576.jpeg')
  'images/projects/141-broadway-heights/exterior.jpg' = @('2026/08/cam-03-HR.jpg.jpeg', '2026/08/cam-03-HR.jpg-819x1024.jpeg')
  'images/projects/141-broadway-heights/bedroom.jpg'  = @('2026/08/Bedroom.jpg.jpeg', '2026/08/Bedroom.jpg-1024x576.jpeg')
  'images/projects/141-broadway-heights/dusk.jpg'     = @('2026/08/dusk-new-broadway-141.jpg', '2026/08/dusk-new-broadway-141-1024x576.jpg')

  'images/projects/gohar-complex-shopping-mall/exterior.jpg' = @('2026/06/gohar-complex.jpg', '2026/06/gohar-complex-1024x1024.jpg')

  'images/projects/gohar-gateway/exterior.webp' = @('2026/06/Building_cam_06.webp', '2026/06/Building_cam_06-1024x576.webp')

  'images/projects/gohar-golf-vista/exterior.webp' = @('2026/06/CAM9-0-00-00-00-scaled.webp', '2026/06/CAM9-0-00-00-00-1024x576.webp')

  'images/projects/gohar-green-corner-shopping-center/exterior.jpg' = @('2026/06/green-corner-1-scaled.jpg', '2026/06/green-corner-1-1024x880.jpg')

  'images/projects/gohar-rabi-center/day-view.jpg' = @('2026/06/Gohar-Rabi-Day-View-scaled.jpg', '2026/06/Gohar-Rabi-Day-View-1024x598.jpg')

  'images/projects/gohar-residencia-shopping-mall/render-010.webp' = @('2026/06/ARCH-PAKISTAN-HIRES-RENDER-GOHAR-010-scaled.webp', '2026/06/ARCH-PAKISTAN-HIRES-RENDER-GOHAR-010-1024x576.webp')
  'images/projects/gohar-residencia-shopping-mall/render-008.webp' = @('2026/06/ARCH-PAKISTAN-HIRES-RENDER-GOHAR-008-scaled.webp', '2026/06/ARCH-PAKISTAN-HIRES-RENDER-GOHAR-008-1024x576.webp')
  'images/projects/gohar-residencia-shopping-mall/render-005.webp' = @('2026/06/ARCH-PAKISTAN-HIRES-RENDER-GOHAR-005-scaled.webp', '2026/06/ARCH-PAKISTAN-HIRES-RENDER-GOHAR-005-1024x576.webp')
  'images/projects/gohar-residencia-shopping-mall/render-001.webp' = @('2026/06/ARCH-PAKISTAN-HIRES-RENDER-GOHAR-001-scaled.webp', '2026/06/ARCH-PAKISTAN-HIRES-RENDER-GOHAR-001-1024x576.webp')

  'images/projects/gohar-towers/exterior.jpg' = @('2026/06/WhatsApp-Image-2026-06-12-at-8.30.16-PM-1.jpeg', '2026/06/WhatsApp-Image-2026-06-12-at-8.30.16-PM-1-1024x664.jpeg')

  'images/projects/gohar-villas/park.jpg'       = @('2026/08/Park-Cam_02-0-00-00-00.jpg-scaled.jpeg', '2026/08/Park-Cam_02-0-00-00-00.jpg-1024x576.jpeg')
  'images/projects/gohar-villas/masterplan.jpg' = @('2026/08/Masterplan-1-0-00-00-00.jpg-scaled.jpeg', '2026/08/Masterplan-1-0-00-00-00.jpg-1024x576.jpeg')
  'images/projects/gohar-villas/gate.jpg'       = @('2026/08/Gate-Cam_03-0-00-00-02.jpg-scaled.jpeg', '2026/08/Gate-Cam_03-0-00-00-02.jpg-1024x576.jpeg')

  'images/projects/kn-gohar-green-city/view-3.jpg' = @('2026/08/Green-City-3.jpg-scaled.jpeg', '2026/08/Green-City-3.jpg-1024x576.jpeg')
  'images/projects/kn-gohar-green-city/view-2.jpg' = @('2026/08/Green-City-2.jpg-scaled.jpeg', '2026/08/Green-City-2.jpg-1024x576.jpeg')
  'images/projects/kn-gohar-green-city/view-1.jpg' = @('2026/08/Green-City-1.jpg-scaled.jpeg', '2026/08/Green-City-1.jpg-1024x576.jpeg')

  'documents/141-broadway-heights-presentation-book.pdf'            = @('2026/08/Broadway-Presentation-Book.pdf.pdf')
  'documents/gohar-golf-vista-payment-plan.pdf'                     = @('2026/07/Golf-VIsta-Payment-Plan-copy-3.pdf')
  'documents/gohar-green-corner-shopping-center-presentation-book.pdf' = @('2026/07/Gohar-Green-Corner-Shopping-Center-Presentation-Book.pdf')
  'documents/kn-gohar-green-city-presentation.pdf'                  = @('2026/07/kn-Green-city-presentation.pdf')
}

foreach ($dest in $assets.Keys) {
  $out = Join-Path $root (Join-Path 'public' $dest)
  New-Item -ItemType Directory -Force (Split-Path $out) | Out-Null
  $ok = $false
  foreach ($candidate in $assets[$dest]) {
    try {
      Invoke-WebRequest -Uri "$base/$candidate" -OutFile $out -UseBasicParsing -TimeoutSec 180
      $size = (Get-Item $out).Length
      Write-Output ("OK   {0,-72} <= {1} ({2:N0} KB)" -f $dest, $candidate, ($size / 1KB))
      $ok = $true
      break
    } catch {
      Write-Output ("MISS {0}" -f $candidate)
    }
  }
  if (-not $ok) { Write-Output "FAIL $dest" }
}

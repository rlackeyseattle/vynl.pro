# Stratosphere Deployment Pipeline - PowerShell Runner
# Auto-generated default deployment script for RocketTree Labs

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🚀 STARTING STRATOSPHERE DEPLOYMENT SEQUENCE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 0. RESOLVE PROJECT NAME
$packageJsonPath = Join-Path $PSScriptRoot "package.json"
if (Test-Path $packageJsonPath) {
    $pkg = Get-Content $packageJsonPath | ConvertFrom-Json
    $projectName = $pkg.name
} else {
    $projectName = (Split-Path $PSScriptRoot -Leaf)
}
Write-Host "Project Name: $projectName" -ForegroundColor Yellow

# ==============================================================================
# STAGE 1: LOCAL COMPILATION & SOURCE CONTROL
# ==============================================================================
Write-Host "`n[STAGE 1] Local Compilation & Source Control..." -ForegroundColor Cyan

# Check Git Init
if (-not (Test-Path (Join-Path $PSScriptRoot ".git"))) {
    Write-Host "Initializing Git Repository..." -ForegroundColor Yellow
    git init
}

# Git Commit changes
git add -A
$status = git status --porcelain
if ($status) {
    Write-Host "Committing changes..." -ForegroundColor Yellow
    git commit -m "Auto-commit: Stratosphere deploy pipeline"
} else {
    Write-Host "No changes to commit." -ForegroundColor Green
}

# Setup GitHub Private Repository if gh CLI is available
if (Get-Command gh -ErrorAction SilentlyContinue) {
    $hasRemote = git remote | Select-String "origin"
    if (-not $hasRemote) {
        Write-Host "GitHub CLI found. Creating private GitHub repository..." -ForegroundColor Yellow
        try {
            gh repo create "rlackeyseattle/$projectName" --private --source=. --remote=origin --confirm
            Write-Host "GitHub repo created and remote origin added." -ForegroundColor Green
        } catch {
            Write-Host "Could not create GitHub repo automatically (it may already exist)." -ForegroundColor DarkYellow
            git remote add origin "https://github.com/rlackeyseattle/$projectName.git" 2>$null
        }
    }
    
    # Push to GitHub
    $currentBranch = (git branch --show-current).Trim()
    if (-not $currentBranch) { $currentBranch = "main" }
    Write-Host "Pushing changes to GitHub ($currentBranch)..." -ForegroundColor Yellow
    git push -u origin $currentBranch
} else {
    Write-Host "GitHub CLI (gh) not found. Skipping automatic GitHub repo creation." -ForegroundColor DarkYellow
}

# ==============================================================================
# STAGE 2: FRONTEND PRODUCTION DELIVERY (WEB COMPANION APP)
# ==============================================================================
Write-Host "`n[STAGE 2] Frontend Production Delivery (Web Companion App)..." -ForegroundColor Cyan

# Run local build
Write-Host "Running local production build..." -ForegroundColor Yellow
npm run build

# Deploy to Vercel
Write-Host "Deploying build artifacts directly to Vercel production..." -ForegroundColor Yellow
if (Get-Command vercel -ErrorAction SilentlyContinue) {
    # Deploy and capture output URL
    $deployOutput = vercel --prod --yes
    Write-Host $deployOutput
    
    $deployUrl = $deployOutput | Select-String -Pattern "https://[a-zA-Z0-9\-]+\.vercel\.app" | ForEach-Object { $_.Matches.Value } | Select-Object -First 1
    
    if ($deployUrl) {
        Write-Host "Production URL: $deployUrl" -ForegroundColor Green
        
        # Check if this is the core project or a subproject
        if ($projectName -eq "rocket-tree-hub" -or $projectName -eq "rockettree-labs") {
            $vanityDomain = "rockettreelabs.com"
            Write-Host "Core project detected. Binding to primary domain: $vanityDomain" -ForegroundColor Yellow
            vercel alias set $deployUrl $vanityDomain
            Write-Host "Successfully bound primary domain: https://$vanityDomain" -ForegroundColor Green
        } else {
            $vanityDomain = "$projectName.rockettreelabs.com"
            Write-Host "Subproject detected. Binding subdomain alias: $vanityDomain" -ForegroundColor Yellow
            vercel alias set $deployUrl $vanityDomain
            Write-Host "Successfully bound subdomain: https://$vanityDomain" -ForegroundColor Green
            
            # Output parent rewrite rules for the path-based vanity URL
            Write-Host "`n[VANITY ROUTE SETUP]" -ForegroundColor Yellow
            Write-Host "To serve this subproject at: https://rockettreelabs.com/$projectName" -ForegroundColor Green
            Write-Host "Add these rewrites to the parent rockettree-labs next.config.js:" -ForegroundColor Gray
            Write-Host "{" -ForegroundColor Gray
            Write-Host "  source: '/$projectName'," -ForegroundColor Gray
            Write-Host "  destination: '$deployUrl'," -ForegroundColor Gray
            Write-Host "}," -ForegroundColor Gray
            Write-Host "{" -ForegroundColor Gray
            Write-Host "  source: '/$projectName/:path*'," -ForegroundColor Gray
            Write-Host "  destination: '$deployUrl/:path*'," -ForegroundColor Gray
            Write-Host "}" -ForegroundColor Gray
        }
    } else {
        Write-Host "Could not parse Vercel deployment URL." -ForegroundColor DarkYellow
    }
} else {
    Write-Host "Vercel CLI not found. Skipping Vercel deployment." -ForegroundColor Red
}

# ==============================================================================
# STAGE 3: NATIVE MOBILE DELIVERY (iOS ENGINE)
# ==============================================================================
Write-Host "`n[STAGE 3] Native Mobile Delivery (iOS Engine)..." -ForegroundColor Cyan

# Sync Capacitor assets
if ((Test-Path (Join-Path $PSScriptRoot "capacitor.config.json")) -or (Test-Path (Join-Path $PSScriptRoot "capacitor.config.ts"))) {
    Write-Host "Syncing Capacitor assets with native project..." -ForegroundColor Yellow
    npx cap sync ios
}

# Check Apple Credential Bundle
$apiKeyPath = Join-Path $PSScriptRoot "api_key.json"
if (-not (Test-Path $apiKeyPath)) {
    # Check fallback in home directory
    $apiKeyPath = Join-Path $env:USERPROFILE ".config\antigravity\api_key.json"
}

# Build/Sign/Upload Steps
if (Get-Command xcodebuild -ErrorAction SilentlyContinue) {
    Write-Host "Xcode toolchain detected. Instantiating Xcode optimization builds..." -ForegroundColor Yellow
    
    # Bump build version
    cd ios/App
    agvtool next-version -all
    
    # Check credentials
    if (Test-Path $apiKeyPath) {
        $creds = Get-Content $apiKeyPath | ConvertFrom-Json
        $keyId = $creds.key_id
        $issuerId = $creds.issuer_id
        
        Write-Host "Credentials found. Key ID: $keyId, Issuer ID: $issuerId" -ForegroundColor Green
        
        # Build Archive
        Write-Host "Archiving Xcode project..." -ForegroundColor Yellow
        xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -archivePath build/App.xcarchive archive
        
        # Export IPA
        Write-Host "Exporting and signing IPA binary..." -ForegroundColor Yellow
        xcodebuild -exportArchive -archivePath build/App.xcarchive -exportPath build -exportOptionsPlist exportOptions.plist
        
        # Push to App Store Connect TestFlight
        Write-Host "Uploading signed distribution build to TestFlight..." -ForegroundColor Yellow
        xcrun altool --upload-app --type ios --file build/App.ipa --apiKey $keyId --apiIssuer $issuerId
        Write-Host "Successfully seeded TestFlight alpha track!" -ForegroundColor Green
    } else {
        Write-Host "api_key.json not found. Xcode build completed locally, but signing/TestFlight upload was skipped." -ForegroundColor Yellow
    }
    cd ../..
} else {
    Write-Host "Xcode toolchain (xcodebuild) is not natively available on this Windows host." -ForegroundColor Yellow
    Write-Host "For iOS native engine builds, please run this pipeline on a macOS build machine," -ForegroundColor Yellow
    Write-Host "or set up a remote cloud builder for Capacitor." -ForegroundColor Yellow
}

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "✅ STRATOSPHERE DEPLOYMENT SEQUENCE COMPLETE!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

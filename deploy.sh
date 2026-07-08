#!/bin/bash
# Stratosphere Deployment Pipeline - Bash Runner
# Auto-generated default deployment script for RocketTree Labs

set -e

echo -e "\033[0;36m=========================================\033[0m"
echo -e "\033[0;36m🚀 STARTING STRATOSPHERE DEPLOYMENT SEQUENCE\033[0m"
echo -e "\033[0;36m=========================================\033[0m"

# 0. RESOLVE PROJECT NAME
if [ -f "package.json" ]; then
    projectName=$(node -e "console.log(require('./package.json').name)")
else
    projectName=$(basename "$PWD")
fi
echo -e "\033[0;33mProject Name: $projectName\033[0m"

# ==============================================================================
# STAGE 1: LOCAL COMPILATION & SOURCE CONTROL
# ==============================================================================
echo -e "\n\033[0;36m[STAGE 1] Local Compilation & Source Control...\033[0m"

# Check Git Init
if [ ! -d ".git" ]; then
    echo -e "\033[0;33mInitializing Git Repository...\033[0m"
    git init
fi

# Git Commit changes
git add -A
status=$(git status --porcelain)
if [ -n "$status" ]; then
    echo -e "\033[0;33mCommitting changes...\033[0m"
    git commit -m "Auto-commit: Stratosphere deploy pipeline"
else
    echo -e "\033[0;32mNo changes to commit.\033[0m"
fi

# Setup GitHub Private Repository if gh CLI is available
if command -v gh &> /dev/null; then
    hasRemote=$(git remote | grep "origin" || true)
    if [ -z "$hasRemote" ]; then
        echo -e "\033[0;33mGitHub CLI found. Creating private GitHub repository...\033[0m"
        if gh repo create "rlackeyseattle/$projectName" --private --source=. --remote=origin --confirm; then
            echo -e "\033[0;32mGitHub repo created and remote origin added.\033[0m"
        else
            echo -e "\033[0;33mCould not create GitHub repo automatically (it may already exist).\033[0m"
            git remote add origin "https://github.com/rlackeyseattle/$projectName.git" || true
        fi
    fi
    
    # Push to GitHub
    currentBranch=$(git branch --show-current || echo "main")
    echo -e "\033[0;33mPushing changes to GitHub ($currentBranch)...\033[0m"
    git push -u origin "$currentBranch"
else
    echo -e "\033[0;33mGitHub CLI (gh) not found. Skipping automatic GitHub repo creation.\033[0m"
fi

# ==============================================================================
# STAGE 2: FRONTEND PRODUCTION DELIVERY (WEB COMPANION APP)
# ==============================================================================
echo -e "\n\033[0;36m[STAGE 2] Frontend Production Delivery (Web Companion App)...\033[0m"

# Run local build
echo -e "\033[0;33mRunning local production build...\033[0m"
npm run build

# Deploy to Vercel
if command -v vercel &> /dev/null; then
    echo -e "\033[0;33mDeploying build artifacts directly to Vercel production...\033[0m"
    deployOutput=$(vercel --prod --yes)
    echo "$deployOutput"
    
    # Parse URL
    deployUrl=$(echo "$deployOutput" | grep -o -E "https://[a-zA-Z0-9\-]+\.vercel\.app" | head -n 1 || true)
    
    if [ -n "$deployUrl" ]; then
        echo -e "\033[0;32mProduction URL: $deployUrl\033[0m"
        
        if [ "$projectName" = "rocket-tree-hub" ] || [ "$projectName" = "rockettree-labs" ]; then
            vanityDomain="rockettreelabs.com"
            echo -e "\033[0;33mCore project detected. Binding to primary domain: $vanityDomain\033[0m"
            vercel alias set "$deployUrl" "$vanityDomain"
            echo -e "\033[0;32mSuccessfully bound primary domain: https://$vanityDomain\033[0m"
        else
            vanityDomain="$projectName.rockettreelabs.com"
            echo -e "\033[0;33mSubproject detected. Binding subdomain alias: $vanityDomain\033[0m"
            vercel alias set "$deployUrl" "$vanityDomain"
            echo -e "\033[0;32mSuccessfully bound subdomain: https://$vanityDomain\033[0m"
            
            # Output parent rewrite rules for the path-based vanity URL
            echo -e "\n\033[0;33m[VANITY ROUTE SETUP]\033[0m"
            echo -e "\033[0;32mTo serve this subproject at: https://rockettreelabs.com/$projectName\033[0m"
            echo -e "\033[0;90mAdd these rewrites to the parent rockettree-labs next.config.js:\033[0m"
            echo -e "\033[0;90m{\033[0m"
            echo -e "\033[0;90m  source: '/$projectName',\033[0m"
            echo -e "\033[0;90m  destination: '$deployUrl',\033[0m"
            echo -e "\033[0;90m},\033[0m"
            echo -e "\033[0;90m{\033[0m"
            echo -e "\033[0;90m  source: '/$projectName/:path*',\033[0m"
            echo -e "\033[0;90m  destination: '$deployUrl/:path*',\033[0m"
            echo -e "\033[0;90m}\033[0m"
        fi
    else
        echo -e "\033[0;33mCould not parse Vercel deployment URL.\033[0m"
    fi
else
    echo -e "\033[0;31mVercel CLI not found. Skipping Vercel deployment.\033[0m"
fi

# ==============================================================================
# STAGE 3: NATIVE MOBILE DELIVERY (iOS ENGINE)
# ==============================================================================
echo -e "\n\033[0;36m[STAGE 3] Native Mobile Delivery (iOS Engine)...\033[0m"

# Sync Capacitor assets
if [ -f "capacitor.config.json" ] || [ -f "capacitor.config.ts" ]; then
    echo -e "\033[0;33mSyncing Capacitor assets with native project...\033[0m"
    npx cap sync ios
fi

# Check Apple Credential Bundle
apiKeyPath="./api_key.json"
if [ ! -f "$apiKeyPath" ]; then
    # Fallback to home config
    apiKeyPath="$HOME/.config/antigravity/api_key.json"
fi

# Prefill App Store Connect Metadata
if [ -f "$apiKeyPath" ]; then
    echo -e "\033[0;33mPrefilling App Store Connect metadata...\033[0m"
    bundleId=""
    if [ -f "capacitor.config.json" ]; then
        bundleId=$(node -e "console.log(require('./capacitor.config.json').appId)")
    fi
    if [ -f "app.json" ]; then
        bundleId=$(node -e "const app = require('./app.json'); console.log(app.expo && app.expo.ios ? app.expo.ios.bundleIdentifier : '')")
    fi
    
    if [ -n "$bundleId" ]; then
        echo -e "\033[0;32mResolved Bundle ID: $bundleId\033[0m"
        prefillerScript="$HOME/.config/antigravity/prep_appstore_listing.py"
        if [ -f "$prefillerScript" ]; then
            python "$prefillerScript" --bundle-id "$bundleId" --project-name "$projectName" --config-path "$apiKeyPath" || echo -e "\033[0;33mWarning: App Store metadata prefiller encountered an error.\033[0m"
        else
            echo -e "\033[0;33mApp Store metadata prefiller script not found at $prefillerScript\033[0m"
        fi
    else
        echo -e "\033[0;33mCould not resolve Bundle ID. Skipping metadata prefill.\033[0m"
    fi
fi

# Build/Sign/Upload Steps
if command -v xcodebuild &> /dev/null; then
    echo -e "\033[0;33mXcode toolchain detected. Instantiating Xcode optimization builds...\033[0m"
    
    # Bump build version
    cd ios/App
    agvtool next-version -all
    
    # Check credentials
    if [ -f "../../$apiKeyPath" ]; then
        keyId=$(node -e "console.log(require('../../$apiKeyPath').key_id)")
        issuerId=$(node -e "console.log(require('../../$apiKeyPath').issuer_id)")
        
        echo -e "\033[0;32mCredentials found. Key ID: $keyId, Issuer ID: $issuerId\033[0m"
        
        # Build Archive
        echo -e "\033[0;33mArchiving Xcode project...\033[0m"
        xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -archivePath build/App.xcarchive archive
        
        # Export IPA
        echo -e "\033[0;33mExporting and signing IPA binary...\033[0m"
        xcodebuild -exportArchive -archivePath build/App.xcarchive -exportPath build -exportOptionsPlist exportOptions.plist
        
        # Push to App Store Connect TestFlight
        echo -e "\033[0;33mUploading signed distribution build to TestFlight...\033[0m"
        xcrun altool --upload-app --type ios --file build/App.ipa --apiKey "$keyId" --apiIssuer "$issuerId"
        echo -e "\033[0;32mSuccessfully seeded TestFlight alpha track!\033[0m"
    else
        echo -e "\033[0;33mapi_key.json not found. Xcode build completed locally, but signing/TestFlight upload was skipped.\033[0m"
    fi
    cd ../..
else
    echo -e "\033[0;33mXcode toolchain (xcodebuild) is not natively available on this machine.\033[0m"
    echo -e "\033[0;33mFor iOS native engine builds, please run this pipeline on a macOS build machine.\033[0m"
fi

echo -e "\n\033[0;32m=========================================\033[0m"
echo -e "\033[0;32m✅ STRATOSPHERE DEPLOYMENT SEQUENCE COMPLETE!\033[0m"
echo -e "\033[0;32m=========================================\033[0m"

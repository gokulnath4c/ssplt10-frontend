#!/bin/bash

# Quick SSPL Deployment Status Check
# One-liner to verify if server is running latest commit

# Configuration
GITHUB_REPO="${1:-https://github.com/gokulnath4c/ssplt10.cloud.git}"
BRANCH="${2:-main}"
SERVER_HOST="62.72.43.74"
SERVER_USER="root"
DEPLOY_PATH="/var/www/vhosts/ssplt10.cloud/httpdocs"
DOMAIN="www.ssplt10.cloud"

echo "🔍 Checking SSPL Deployment Status..."
echo "====================================="

# Get latest GitHub commit
echo "📡 Fetching latest GitHub commit..."
GITHUB_COMMIT=$(curl -s "$GITHUB_REPO/commits/$BRANCH" 2>/dev/null | grep -o 'commit/[a-f0-9]*' | head -1 | cut -d'/' -f2)

if [ -z "$GITHUB_COMMIT" ]; then
    # Fallback to API
    GITHUB_COMMIT=$(curl -s "https://api.github.com/repos/${GITHUB_REPO#https://github.com/}/commits/$BRANCH" 2>/dev/null | grep -o '"sha":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

if [ -n "$GITHUB_COMMIT" ]; then
    echo "✅ GitHub commit: ${GITHUB_COMMIT:0:8}"
else
    echo "❌ Could not fetch GitHub commit"
    exit 1
fi

# Get deployed commit
echo "🖥️  Checking deployed commit..."
DEPLOYED_COMMIT=$(ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "cd $DEPLOY_PATH && git rev-parse HEAD 2>/dev/null" 2>/dev/null)

if [ -n "$DEPLOYED_COMMIT" ]; then
    echo "✅ Deployed commit: ${DEPLOYED_COMMIT:0:8}"
else
    echo "⚠️  No git repository found on server"
    DEPLOYED_COMMIT="unknown"
fi

# Compare commits
echo ""
echo "📊 Comparison Result:"
echo "=================="

if [ "$GITHUB_COMMIT" = "$DEPLOYED_COMMIT" ]; then
    echo "🎉 SERVER IS UP TO DATE!"
    echo "✅ Latest commit is deployed"
else
    echo "⚠️  SERVER IS OUTDATED!"
    echo "❌ GitHub:    ${GITHUB_COMMIT:0:8}"
    echo "❌ Deployed:  ${DEPLOYED_COMMIT:0:8}"

    # Check how many commits behind
    if [ "$DEPLOYED_COMMIT" != "unknown" ]; then
        COMMITS_BEHIND=$(ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "cd $DEPLOY_PATH && git rev-list --count $DEPLOYED_COMMIT..$GITHUB_COMMIT 2>/dev/null" 2>/dev/null)
        if [ -n "$COMMITS_BEHIND" ]; then
            echo "📉 $COMMITS_BEHIND commits behind"
        fi
    fi
fi

# Quick health check
echo ""
echo "🏥 Health Check:"
echo "=============="

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/" 2>/dev/null)
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Website accessible (HTTP $HTTP_STATUS)"
else
    echo "❌ Website not accessible (HTTP $HTTP_STATUS)"
fi

# Check caching
CACHE_HEADER=$(curl -I -s "https://$DOMAIN/" 2>/dev/null | grep -i "cache-control" | head -1)
if [ -n "$CACHE_HEADER" ]; then
    echo "✅ Caching headers present"
else
    echo "⚠️  No caching headers found"
fi

echo ""
echo "💡 Next Steps:"
echo "=============="
if [ "$GITHUB_COMMIT" != "$DEPLOYED_COMMIT" ]; then
    echo "• Run: ./deploy.sh production"
    echo "• Or push to trigger GitHub Actions"
fi
echo "• Full diagnostic: ./server-diagnostic.sh"
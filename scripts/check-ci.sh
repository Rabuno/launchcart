#!/bin/bash
# Script check GitHub Actions status và notify qua Hermes send_message
# Chạy bằng cron job mỗi 10 phút

cd /opt/data/workspace/launchcart

# Check CI status (last run on master)
CI_STATUS=$(gh run list --workflow=ci.yml --branch=master --limit 1 --json conclusion,status,createdAt --jq '.[0].conclusion // "unknown"')
CI_CREATED=$(gh run list --workflow=ci.yml --branch=master --limit 1 --json conclusion,status,createdAt --jq '.[0].createdAt // "unknown"')
CI_RUN_STATUS=$(gh run list --workflow=ci.yml --branch=master --limit 1 --json conclusion,status,createdAt --jq '.[0].status // "unknown"')

# Chỉ notify khoảng CI thay đổi status
STATE_FILE="/tmp/launchcart_ci_last_state"
LAST_STATE=$(cat "$STATE_FILE" 2>/dev/null || echo "none")

CURRENT_STATE="${CI_STATUS}:${CI_RUN_STATUS}"

if [ "$LAST_STATE" != "$CURRENT_STATE" ]; then
  if [ "$CI_STATUS" = "success" ]; then
    echo "CI_PASS|Build success at $CI_CREATED"
  elif [ "$CI_STATUS" = "failure" ]; then
    echo "CI_FAIL|Build FAILED at $CI_CREATED"
  fi
  echo "$CURRENT_STATE" > "$STATE_FILE"
fi

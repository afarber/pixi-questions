#!/bin/bash

# Check code formatting with ESLint across all projects
# Returns 0 if all files pass, 1 if any fail

echo "Checking code formatting with ESLint..."
echo ""

FAILED_PROJECTS=()

# List of projects to check
PROJECTS=(
  "checkered-board-buttons"
  "drag-tiles-3d-effect"
  "drag-tiles-layout"
  "fastapi-websockets-chat"
  "playing-cards-2-planes"
  "playing-cards-3d-effect"
)

for project in "${PROJECTS[@]}"; do
  if [ -f "$project/package.json" ] && grep -q '"lint"' "$project/package.json"; then
    echo "Checking $project..."
    cd "$project"
    npm run lint > /dev/null 2>&1
    if [ $? -ne 0 ]; then
      FAILED_PROJECTS+=("$project")
      echo "  FAILED"
    else
      echo "  OK"
    fi
    cd ..
  fi
done

echo ""

if [ ${#FAILED_PROJECTS[@]} -gt 0 ]; then
  echo "ERROR: Code formatting check failed in the following projects:"
  echo ""
  for project in "${FAILED_PROJECTS[@]}"; do
    echo "  - $project"
  done
  echo ""
  echo "Run 'cd <project> && npm run lint' to see detailed errors, for example:"
  echo ""
  echo "  cd ${FAILED_PROJECTS[0]} && npm run lint"
  echo ""
  exit 1
fi

echo "Code formatting is correct."
exit 0

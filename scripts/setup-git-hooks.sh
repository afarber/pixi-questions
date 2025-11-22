#!/bin/bash

# Setup Git hooks for the pixi-questions project
# This script creates a pre-commit hook that runs format and copyright checks

HOOK_DIR=".git/hooks"
HOOK_FILE="$HOOK_DIR/pre-commit"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
  echo "Error: Not in a git repository root directory"
  exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p "$HOOK_DIR"

# Create the pre-commit hook
cat > "$HOOK_FILE" << 'EOF'
#!/bin/bash

echo "Running pre-commit checks..."
echo ""

# Check code formatting
echo "1. Checking code formatting..."
FORMAT_OUTPUT=$(./scripts/check-format.sh 2>&1)

if [ $? -ne 0 ]; then
    echo ""
    echo "$FORMAT_OUTPUT"
    echo ""
    exit 1
fi

echo "   Code formatting: OK"

# Check copyright headers
echo "2. Checking copyright headers..."
./scripts/check-copyright.sh > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo ""
    echo "Copyright header check failed!"
    echo "Run './scripts/check-copyright.sh' to see missing files."
    echo ""
    exit 1
fi

echo "   Copyright headers: OK"
echo ""
echo "All pre-commit checks passed!"
EOF

# Make the hook executable
chmod +x "$HOOK_FILE"

echo "Git pre-commit hook installed successfully!"
echo ""
echo "The hook will run the following checks before each commit:"
echo "  1. Code formatting (ESLint)"
echo "  2. Copyright headers (MIT license)"
echo ""
echo "To skip the hook temporarily, use: git commit --no-verify"

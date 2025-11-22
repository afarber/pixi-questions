#!/bin/bash

# Check for missing MIT copyright headers in JavaScript and Python source files
# Returns 0 if all files have headers, 1 if any are missing

MISSING_FILES=()

# Check JavaScript files
while IFS= read -r file; do
  if ! grep -q "SPDX-License-Identifier: MIT" "$file"; then
    MISSING_FILES+=("$file")
  fi
done < <(find . -type f -name "*.js" \
         -not -path "*/node_modules/*" \
         -not -path "*/dist/*" \
         -not -path "*/.venv/*" \
         -not -path "*/venv/*")

# Check Python files
while IFS= read -r file; do
  if ! grep -q "SPDX-License-Identifier: MIT" "$file"; then
    MISSING_FILES+=("$file")
  fi
done < <(find . -type f -name "*.py" \
         -not -path "*/node_modules/*" \
         -not -path "*/dist/*" \
         -not -path "*/.venv/*" \
         -not -path "*/venv/*" \
         -not -path "*/__pycache__/*")

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
  echo ""
  echo "ERROR: The following files are missing the MIT copyright header:"
  echo ""
  for file in "${MISSING_FILES[@]}"; do
    echo "  - $file"
  done
  echo ""
  echo "Required header format for JavaScript:"
  echo "/*"
  echo " * Copyright (c) 2025 Alexander Farber"
  echo " * SPDX-License-Identifier: MIT"
  echo " *"
  echo " * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)"
  echo " */"
  echo ""
  echo "Required header format for Python:"
  echo "# Copyright (c) 2025 Alexander Farber"
  echo "# SPDX-License-Identifier: MIT"
  echo "#"
  echo "# This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)"
  echo ""
  exit 1
fi

echo "All source files have proper copyright headers."
exit 0

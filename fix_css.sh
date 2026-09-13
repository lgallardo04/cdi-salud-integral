#!/bin/bash
# Replaces some border-radius and fonts based on Clinical Precision

sed -i 's/--radius-md: 8px;/--radius-md: 8px; \/* Modals \/ Cards *\//g' frontend/src/index.css
sed -i 's/border-radius: var(--radius-md); \/* for btn \*\//border-radius: var(--radius-xs);/g' frontend/src/index.css
# But let's just do it directly using a python script for precision.

#!/data/data/com.termux/files/usr/bin/bash
# Professional Smart Importer - Extracts info from all folders, branches & files
echo "=== PiRC Smart Data Importer ==="
echo "Generating comprehensive master manifest..."

OUTPUT_FILE="AUTO_GENERATED_PIRC_MASTER_MANIFEST.md"

cat > "$OUTPUT_FILE" << EOF
# PiRC Master Manifest - Auto Generated
**Generated on:** $(date)
**Repository:** Ze0ro99/PiRC
**Current Branch:** $(git branch --show-current)

## Repository Overview
$(cat README.md 2>/dev/null | head -50 || echo "README not found")

## Branch Summary
$(git branch -a | head -50)

## Key Folders Inventory
EOF

    # Import from main folders
    for dir in PiRC-* PiRC1 PiRC2 SmartContracts automation scripts docs; do
        if [ -d "$dir" ]; then
            echo "### $dir" >> "$OUTPUT_FILE"
            if [ -f "$dir/README.md" ]; then
                echo "#### Content from README.md:" >> "$OUTPUT_FILE"
                head -30 "$dir/README.md" >> "$OUTPUT_FILE"
            fi
            echo "" >> "$OUTPUT_FILE"
        fi
    done

    # Import from branches (summary)
    echo "## Active Feature Branches Summary" >> "$OUTPUT_FILE"
    git for-each-ref --format='%(refname:short) - %(committerdate:relative)' refs/heads/ | head -20 >> "$OUTPUT_FILE"

    echo "" >> "$OUTPUT_FILE"
    echo "## Repository Structure (Top Level)" >> "$OUTPUT_FILE"
    tree -L 2 -d | head -60 >> "$OUTPUT_FILE"

    success "Master manifest created: $OUTPUT_FILE"

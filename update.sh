#!/usr/bin/env bash

# ============================================================
#  TheWebNote — Update Script (Mac / Linux)
#  Copies new extension files into your existing TheWebNote
#  folder so Chrome keeps the same extension ID and your
#  notes are never lost.
# ============================================================

set -euo pipefail

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

echo ""
echo -e " ${BOLD}=============================================${RESET}"
echo -e "  ${CYAN}TheWebNote Updater${RESET}"
echo -e " ${BOLD}=============================================${RESET}"
echo ""

# ── Step 1: Locate the NEW files (same folder as this script) ─────────────────

# Resolve the directory this script lives in, following symlinks
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -f "$SCRIPT_DIR/manifest.json" ]]; then
    echo -e " ${RED}[ERROR]${RESET} manifest.json not found next to this script."
    echo "  Make sure update.sh is inside the extracted TheWebNote folder."
    echo ""
    exit 1
fi

echo -e " ${GREEN}[OK]${RESET} New version files found at:"
echo "      $SCRIPT_DIR"
echo ""

# ── Step 2: Auto-search for the existing installed folder ─────────────────────

echo " Searching for your existing TheWebNote installation..."
echo ""

TARGET_FOLDER="TheWebNote"
FOUND_PATHS=()

# Common search roots — covers Mac and most Linux desktop setups
SEARCH_ROOTS=(
    "$HOME/Desktop"
    "$HOME/Downloads"
    "$HOME/Documents"
    "$HOME"
    # Mac-specific
    "$HOME/Library"
    # Linux-specific
    "$HOME/opt"
    "/opt"
    "/usr/local/share"
)

for ROOT in "${SEARCH_ROOTS[@]}"; do
    if [[ ! -d "$ROOT" ]]; then
        continue
    fi

    CANDIDATE="$ROOT/$TARGET_FOLDER"

    if [[ -f "$CANDIDATE/manifest.json" ]]; then
        # Skip if this is the same folder we're running from
        if [[ "$CANDIDATE" != "$SCRIPT_DIR" ]]; then
            FOUND_PATHS+=("$CANDIDATE")
            echo -e " ${GREEN}[FOUND]${RESET} $CANDIDATE"
        fi
    fi
done

# Also do a deeper search in Desktop/Downloads/Documents (one level down)
# in case the user put it inside a sub-folder
DEEP_ROOTS=(
    "$HOME/Desktop"
    "$HOME/Downloads"
    "$HOME/Documents"
)

for ROOT in "${DEEP_ROOTS[@]}"; do
    if [[ ! -d "$ROOT" ]]; then
        continue
    fi

    # Search one level deep only (avoid scanning entire home)
    while IFS= read -r -d '' CANDIDATE; do
        if [[ -f "$CANDIDATE/manifest.json" && "$CANDIDATE" != "$SCRIPT_DIR" ]]; then
            # Avoid duplicates
            ALREADY=false
            for EXISTING in "${FOUND_PATHS[@]+"${FOUND_PATHS[@]}"}"; do
                if [[ "$EXISTING" == "$CANDIDATE" ]]; then
                    ALREADY=true
                    break
                fi
            done
            if [[ "$ALREADY" == false ]]; then
                FOUND_PATHS+=("$CANDIDATE")
                echo -e " ${GREEN}[FOUND]${RESET} $CANDIDATE"
            fi
        fi
    done < <(find "$ROOT" -maxdepth 2 -type d -name "$TARGET_FOLDER" -print0 2>/dev/null)
done

echo ""

FOUND_COUNT=${#FOUND_PATHS[@]}

# ── Step 3: Decide what to do based on how many matches were found ────────────

INSTALL_PATH=""

if [[ $FOUND_COUNT -eq 0 ]]; then
    # Nothing found — ask user
    echo -e " ${YELLOW}[!]${RESET} Could not automatically find your TheWebNote folder."
    echo ""
    echo "  Please paste the full path to your existing TheWebNote folder."
    echo "  Example: /Users/john/Desktop/TheWebNote"
    echo ""
    read -rp "  Path: " INSTALL_PATH
    echo ""

    if [[ -z "$INSTALL_PATH" ]]; then
        echo -e " ${RED}[ERROR]${RESET} No path entered. Exiting."
        exit 1
    fi

    # Expand ~ if user typed it
    INSTALL_PATH="${INSTALL_PATH/#\~/$HOME}"

    # Strip trailing slash
    INSTALL_PATH="${INSTALL_PATH%/}"

    if [[ ! -f "$INSTALL_PATH/manifest.json" ]]; then
        echo -e " ${RED}[ERROR]${RESET} No manifest.json found at: $INSTALL_PATH"
        echo "  Make sure you are pointing to the correct TheWebNote folder."
        echo ""
        exit 1
    fi

elif [[ $FOUND_COUNT -eq 1 ]]; then
    # Exactly one match — use automatically
    INSTALL_PATH="${FOUND_PATHS[0]}"
    echo -e " ${GREEN}[OK]${RESET} Found exactly one installation. Using it automatically."
    echo "      $INSTALL_PATH"
    echo ""

else
    # Multiple matches — ask user to pick
    echo -e " ${YELLOW}[!]${RESET} Found $FOUND_COUNT TheWebNote folders. Which one is loaded in Chrome?"
    echo ""
    for i in "${!FOUND_PATHS[@]}"; do
        echo "    [$((i+1))] ${FOUND_PATHS[$i]}"
    done
    echo ""
    read -rp "  Enter number (1-$FOUND_COUNT): " PICK
    echo ""

    if [[ -z "$PICK" ]]; then
        echo -e " ${RED}[ERROR]${RESET} No selection made. Exiting."
        exit 1
    fi

    # Validate it's a number in range
    if ! [[ "$PICK" =~ ^[0-9]+$ ]] || [[ $PICK -lt 1 ]] || [[ $PICK -gt $FOUND_COUNT ]]; then
        echo -e " ${RED}[ERROR]${RESET} Invalid selection."
        exit 1
    fi

    INSTALL_PATH="${FOUND_PATHS[$((PICK-1))]}"
    echo -e " ${GREEN}[OK]${RESET} Using: $INSTALL_PATH"
    echo ""
fi

# ── Step 4: Confirm before overwriting ───────────────────────────────────────

echo "  -----------------------------------------------"
echo "   Ready to update:"
echo "     FROM: $SCRIPT_DIR"
echo "     TO:   $INSTALL_PATH"
echo "  -----------------------------------------------"
echo ""
echo "  Your notes stored in Chrome will NOT be affected."
echo "  Only the extension code files will be replaced."
echo ""
read -rp "  Proceed? (y/N): " CONFIRM
echo ""

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "  Update cancelled. No files were changed."
    echo ""
    exit 0
fi

# ── Step 5: Run the update ────────────────────────────────────────────────────

echo " Updating files..."
echo ""

# rsync flags:
#   -a  = archive mode (recursive, preserve permissions/timestamps)
#   -v  = verbose (show what's being copied)
#   --delete = remove files in destination that no longer exist in source
#   --exclude = don't overwrite the update scripts themselves
#
# Fallback to cp -r if rsync is not available (rare but possible on some Linux setups)

if command -v rsync &>/dev/null; then
    rsync -a --delete \
        --exclude="update.bat" \
        --exclude="update.sh" \
        "$SCRIPT_DIR/" "$INSTALL_PATH/"
else
    echo -e " ${YELLOW}[!]${RESET} rsync not found, falling back to cp..."
    # Copy everything except the scripts
    find "$SCRIPT_DIR" -maxdepth 1 \
        ! -name "update.bat" \
        ! -name "update.sh" \
        ! -path "$SCRIPT_DIR" \
        -exec cp -r {} "$INSTALL_PATH/" \;
fi

# ── Step 6: Fix permissions on Mac/Linux (just in case) ──────────────────────

chmod -R u+rw "$INSTALL_PATH" 2>/dev/null || true

# ── Step 7: Done — instruct user to reload ───────────────────────────────────

echo ""
echo -e " ${BOLD}=============================================${RESET}"
echo -e "  ${GREEN}Update complete!${RESET}"
echo -e " ${BOLD}=============================================${RESET}"
echo ""
echo "  One last step — reload the extension in Chrome:"
echo ""
echo "    1. Open Chrome and go to:  chrome://extensions"
echo "    2. Find 'The Web Note' in the list"
echo "    3. Click the reload icon (circular arrow)"
echo ""
echo "  That's it! Your notes are safe and the new"
echo "  version is now active."
echo ""
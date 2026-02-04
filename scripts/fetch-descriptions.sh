#!/bin/bash
# Fetch video descriptions from YouTube and update series.yaml

set -e

OUTPUT_FILE="src/data/series-with-descriptions.yaml"
TEMP_DIR=$(mktemp -d)

echo "Fetching video descriptions from YouTube..."
echo "This may take a while for playlists with many videos."

# Function to clean description - extract first paragraph only
clean_description() {
    echo "$1" | head -n 1 | sed 's/"/\\"/g'
}

# Start YAML file
cat > "$OUTPUT_FILE" << 'HEADER'
# Why Quran - Video Series Database
# Single source of truth for all series and episodes
# Descriptions sourced from YouTube metadata

channel:
  name: Why Quran
  youtube_url: https://www.youtube.com/@WhyQuran

series:
HEADER

# Life of Prophet Muhammad
echo "Fetching: The Life of Prophet Muhammad..."
PLAYLIST_ID="PLpkB0iwLgfTat-Pgh4W3WFmupPamiC9UT"

cat >> "$OUTPUT_FILE" << 'SERIES1'
  - id: the-life-of-prophet-muhammad
    title: "The Life of Prophet Muhammad"
    description: "A comprehensive 103-episode seerah series exploring the Prophet's biography from birth to passing, drawing from authentic Sunni and Shia historical sources."
    speaker: "Sheikh Azhar Nasser"
    playlist_url: "https://www.youtube.com/playlist?list=PLpkB0iwLgfTat-Pgh4W3WFmupPamiC9UT"
    thumbnail_video_id: "EBoMuqBrl8M"
    has_dedicated_page: true
    episodes:
SERIES1

# Fetch all videos with descriptions
uvx yt-dlp -j --flat-playlist "https://www.youtube.com/playlist?list=$PLAYLIST_ID" 2>/dev/null | while read -r line; do
    video_id=$(echo "$line" | jq -r '.id')
    title=$(echo "$line" | jq -r '.title' | sed 's/"/\\"/g')

    # Get full video info including description
    video_info=$(uvx yt-dlp -j "https://www.youtube.com/watch?v=$video_id" 2>/dev/null || echo '{}')
    description=$(echo "$video_info" | jq -r '.description // ""' | head -n 1 | sed 's/"/\\"/g')

    echo "      - video_id: \"$video_id\""
    echo "        title: \"$title\""
    echo "        url: \"https://www.youtube.com/watch?v=$video_id&list=$PLAYLIST_ID\""
    if [ -n "$description" ] && [ "$description" != "null" ]; then
        echo "        description: \"$description\""
    fi
done >> "$OUTPUT_FILE"

echo ""
echo "Done! Output saved to $OUTPUT_FILE"

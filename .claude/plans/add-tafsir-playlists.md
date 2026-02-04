# Plan: Add Remaining Quran Tafsir Playlists

## Current State
Already have in series.yaml:
1. Life of Prophet Muhammad (no surah #) - 103 episodes
2. Surah Tawbah (#9) - 44 episodes
3. Surah Al-Anbiya (#21) - 26 episodes
4. Surah Ar-Rum (#30) - 12 episodes
5. Surah Fatir (#35) - 13 episodes
6. Surah Hujurat (#49) - 12 episodes

## Playlists to Add (10+ videos, sorted by surah number)

| Surah # | Title | Videos | Speaker | Playlist ID |
|---------|-------|--------|---------|-------------|
| 2 | Surah Baqarah | 60 | Various | PLpkB0iwLgfTY0yynbzhVmHLn70oixiYof |
| 6 | Surah An'am Deep Tafsir | 28 | Sheikh Azhar Nasser | PLpkB0iwLgfTYkIWHLiRcRaSnXnwfjFQhC |
| 12 | Surah Yusuf | 14 | Sheikh Jaffer H. Jaffer | PLpkB0iwLgfTYXQw-nxc9LFKCy44NFvuSW |
| 36 | Surah Yasin | 18 | Molana Sayyid Muhammad Rizvi | PLpkB0iwLgfTYzrz_xusVs3RS94c5j4AzX |
| 44 | Surah Dukhan | 13 | Sayyid Muhammad Rizvi | PLpkB0iwLgfTZRLsFdSpmCt6MxlR_uagIv |
| 45 | Surah Jathiya | 13 | Sayyid Muhammad Rizvi | PLpkB0iwLgfTYz7QtT_Eu8iZt5uHNYDSuG |
| 53 | Surah Najm | 16 | Sheikh Azhar Nasser | PLpkB0iwLgfTYPCbkE5nTUGo_iHiDC3IP3 |
| 55 | Surah Rahman | 13 | Maulana Syed Muhammad Rizvi | PLpkB0iwLgfTZlig1DJQAxhLCyVnq9zP2h |
| 57 | Surah Al-Hadid | 14 | Sayyid Muhammad Rizvi | PLpkB0iwLgfTYHjOQoNsYZJp0YyNIGg17c |
| 65 | Surah at-Talaq | 13 | Molana Sayyid Muhammad Rizvi | PLpkB0iwLgfTZIuc7UCXQIKiEm4CHEw516 |
| 67 | Surah Al-Mulk | 13 | Syed Muhammad Rizvi | PLpkB0iwLgfTaOp2fZkRehj4MZhen5aBtD |

## Implementation Steps

1. For each new playlist:
   - Fetch all video metadata using yt-dlp
   - Extract video IDs, titles, URLs
   - Fetch descriptions for each video

2. Add to series.yaml in order:
   - Life of Prophet Muhammad (first, no surah number)
   - Then all surahs in numerical order by surah number

3. Update homepage to sort series:
   - Prophet Muhammad first
   - Then by surah_number ascending

## Final Ordering in series.yaml

1. Life of Prophet Muhammad (no surah #)
2. Surah Baqarah (#2)
3. Surah An'am (#6)
4. Surah Tawbah (#9) - existing
5. Surah Yusuf (#12)
6. Surah Al-Anbiya (#21) - existing
7. Surah Ar-Rum (#30) - existing
8. Surah Fatir (#35) - existing
9. Surah Yasin (#36)
10. Surah Dukhan (#44)
11. Surah Jathiya (#45)
12. Surah Hujurat (#49) - existing
13. Surah Najm (#53)
14. Surah Rahman (#55)
15. Surah Al-Hadid (#57)
16. Surah at-Talaq (#65)
17. Surah Al-Mulk (#67)

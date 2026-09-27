#!/usr/bin/env bash
# Builds src/data/geo/lakes.geojson and scratch lake-cities.json from Census TIGER 2024 AREAWATER + PLACE.
# Usage: scripts/build-lakes.sh <download-folder>
#   <folder>/water/wCCC/tl_2024_27CCC_areawater.shp for counties 053 123 163 139 037 019
#   (https://www2.census.gov/geo/tiger/TIGER2024/AREAWATER/tl_2024_27CCC_areawater.zip)
#   <folder>/place/tl_2024_27_place.shp (see build-communities.py)
# lake-cities.json lists every city whose boundary overlaps each lake; copy the result into src/data/lakes.json.
set -euo pipefail
S=$1; W=$S/water
EXPR="$(tr '\n' ' ' < "$(dirname "$0")/lake-assign.js")"
for c in 053 123 163 139 037 019; do
  npx mapshaper "$W/w$c/tl_2024_27${c}_areawater.shp" -each "COUNTYFP='$c'" -each "$EXPR" \
    -filter "lake != null" -filter-fields lake,AWATER -o format=geojson "$W/part$c.geojson"
done
npx mapshaper -i "$W"/part*.geojson combine-files -merge-layers force -dissolve lake sum-fields=AWATER \
  -each "acres=Math.round(AWATER/4046.86)" -filter-fields lake,acres -o format=geojson "$W/lakes-full.geojson"
npx mapshaper "$W/lakes-full.geojson" -simplify 10% keep-shapes -o precision=0.00001 format=geojson src/data/geo/lakes.geojson
npx mapshaper "$S/place/tl_2024_27_place.shp" -filter "+INTPTLAT>44.4 && +INTPTLAT<45.4" \
  -join "$W/lakes-full.geojson" calc="lakes=(collect(lake)||[]).join(',')" -filter "!!lakes" \
  -filter-fields NAME,lakes -o format=json "$W/lake-cities.json"

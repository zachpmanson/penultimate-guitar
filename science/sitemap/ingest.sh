#!/usr/bin/env bash

set -e

. ../../.env

function read_children() {
    while read p; do
        echo "$p"
        curl -s "$p" > "autorefresh/$(grep -e "sitemap[0-9]" -e "sitemap_ukulele" -o <<< "$p").xml"
        # curl -s "$p" > "autorefresh/$(date -I)-$(grep -e "sitemap[0-9]" -e "sitemap_ukulele" -o <<< "$p").xml"
        sleep 10 
    done <autorefresh/sitemaps.txt
}

rm -rf autorefresh
mkdir autorefresh


echo Pulling root sitemap
time curl -s -f https://tab.ultimate-guitar.com/sitemap.xml \
    | grep ".com/sitemap" \
    | sed -E 's/.*<loc>https:\/\/([^<]*)<\/loc>.*/https:\/\/\1/' \
    | grep -e "sitemap[0-9]" -e "sitemap_ukulele" \
    > autorefresh/sitemaps.txt

echo Pulling child sitemaps
time read_children

echo Filtering tab URLs
time grep "loc" autorefresh/*.xml \
    | sed -E 's/.*<loc>https:\/\/tabs\.ultimate-guitar\.com\/tab\/([^<]*)<\/loc>/\1/' \
    | grep '/es\.' -v  \
    | grep '/pt\.' -v \
    | grep "tar.com/" -v \
    | grep -v "guitar-pro-" \
    > autorefresh/clean-locations.txt

echo Sorting and deduping
time sort autorefresh/clean-locations.txt | uniq > autorefresh/clean-locations-sorted.txt

echo Extracting names and artists into CSV
time python3 taburl_to_song.py autorefresh/clean-locations-sorted.txt autorefresh/tab-urls.csv > /dev/null

time psql -Atx $DATABASE_URL -f update_possible_songs.sql
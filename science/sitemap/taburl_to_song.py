
import csv
import sys
from typing import final



suffixes = set()

valid_suffixes = ["tabs","chords","bass", "ukulele"]

input_file = sys.argv[1]
output_file = sys.argv[2]

with open(input_file, mode='r') as input_file:
    with open(output_file, mode='w', newline='') as output_file:
        writer = csv.writer(output_file)
        writer.writerow(["name","artist","taburl","type"])
        for row in input_file:
            row = row.strip()
            if "/" in (row):
                artist,slug = row.split("/")
                if artist == "":
                    # see taburl=tab//camera-phone-chords-4954027
                    continue
                # print(artist,slug)
                slug_words = slug.split("-")
                slug_artist = artist.split("-")
                
                title_words = slug_words[:-2]
                artist_words= slug_artist

                # print(title_words)
                suffix = slug_words[-2]
                suffixes.add(suffix)
                if suffix not in valid_suffixes:
                    continue
                
                final_title_words = []
                for word in title_words:
                    if word:
                        final_title_words.append(word[0].upper() + word[1:])
                final_title = " ".join(final_title_words)

                final_artist_words = []
                for word in artist_words:
                    if word:
                        final_artist_words.append(word[0].upper() + word[1:])
                final_artist = " ".join(final_artist_words)

                if final_title == "" or final_artist == "":
                    # see taburl tab/arctic-monkeys/--chords-2473050
                    continue
                print(final_title, final_artist, row, suffix)
                writer.writerow([final_title, final_artist, row, suffix])

print(suffixes)
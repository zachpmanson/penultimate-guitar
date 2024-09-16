import csv



# Replace 'your_file.csv' with the path to your CSV file
with open('t.csv', mode='r', newline='') as file:
    # Create a CSV DictReader object
    csv_reader = csv.DictReader(file)
    
    # Iterate over each row in the CSV file
    for row in csv_reader:
        # print(row)  # Each row is an OrderedDict
        if row["name"].lower().replace(" ","-") not in row["string_to_array"] and row["string_to_array"]:
            print(row["name"], "->",row["name"].lower().replace(" ","-"))
            print(row["taburl"], "->" ,row["string_to_array"])
            print()

"""
Problems:
non-ascii characters (these do not have the name in the url)
hyphens (usually surrounded by spaces, "My Little Pony Friendship Is Magic - The Smile Song" becomes my-little-pony-friendship-is-magic-the-smile-song-tabs-1135529)
"""
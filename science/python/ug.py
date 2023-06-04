from bs4 import BeautifulSoup
import requests
import json
from pprint import pprint

headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '3600',
    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0'
}

url = input("URL:")
req = requests.get(url, headers)
soup = BeautifulSoup(req.content, 'html.parser')
# print(soup.prettify())
js_store = json.loads(str(soup.find("div", {"class":"js-store"})["data-content"]))

lines = js_store["store"]["page"]["data"]["tab_view"]["wiki_tab"]["content"]
print((lines))


# liga
generate standings using openligadb-data (node)  
This will launch a HTTP-Server with a minimal user-interface that serves the standings ("Bundesliga-Tabelle") and a list of matches for the active matchday and the following one.

## Why?
I want to print the standings of german Fußball-Bundesliga on a thermal-printer.  
"For the sake of it."

## How?
I'll use an existing service on a Raspberry Pi that will launch a HTTP-request, get the pre-formatted data and send it to the thermal-printer. To create my own thermal-printer-table-style, the data needs to be available in raw format first. I decided to get the matches-data from [openligadb.de](http://openligadb.de) and do the math on my own.
- Create a Team-object for each Bundesliga-Team from teams-JSON. (Edited data from openligadb to fit my needs.)
- Parse match-data from openligadb and update Team-objects with current scores (won, draw, lost, goals_shot, goals_got).
- Sort teams by scores.
- Pre-format the data to fit the thermal-printer (fake columns by indenting blanks at a max-width of 32 characters).
- Create a HTTP-express-server to proxy and serve the data.
- Update data on demand (reload match-data from openligadb).
- (additional) Parse match-data to get matches of the current matchday and the following one.

## Usage
Install and start the server.
```
git clone http://github.com/gwelt/liga
npm install
npm start
```
http://localhost:3004 to call the HTTP-interface.  
http://localhost:3004/bl1/tabelle to get the pre-formatted standings.  
http://localhost:3004/bl1/spiele to get the pre-formatted list of matches for the active matchday and the following one.  
http://localhost:3004/bl1/update to update the server-cache.  

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
cd liga
npm install
npm start
```
http://localhost:3004 to call the HTTP-interface.  
http://localhost:3004/bl1 to get the standings and a list of matches.  
http://localhost:3004/bl1/json to get the standings and all matches data as JSON-object.  
http://localhost:3004/bl1/print/tabelle to get the pre-formatted standings.  
http://localhost:3004/bl1/print/spiele to get the pre-formatted list of matches for the active matchday and the following one.  
http://localhost:3004/bl1/update to update the server-cache.  

## Example
http://localhost:3004/bl1
```
 1 Dortmund    3  5:0   +5  7
 2 Hoffenheim  3  5:2   +3  7
 3 Hannover    3  3:1   +2  7
 4 RB Leipzig  3  6:3   +3  6
 5 Schalke     3  5:2   +3  6
 6 Bayern      3  5:3   +2  6
 7 Hamburg     3  4:3   +1  6
 8 Augsburg    3  5:3   +2  4
 9 Hertha BSC  3  3:3    0  4
   M'gladbach  3  3:3    0  4
11 Frankfurt   3  1:1    0  4
12 Wolfsburg   3  2:4   -2  4
13 Mainz 05    3  3:3    0  3
14 Stuttgart   3  2:5   -3  3
15 Freiburg    3  1:4   -3  2
16 Werder      3  1:4   -3  1
17 Leverkusen  3  4:8   -4  1
18 Koeln       3  1:7   -6  0

3. Spieltag
Hamburg    RB Leipzig 0:2
Freiburg   Dortmund   0:0
M'gladbach Frankfurt  0:1
Augsburg   Koeln      3:0
Mainz 05   Leverkusen 3:1
Wolfsburg  Hannover   1:1
Hoffenheim Bayern     2:0
Hertha BSC Werder     1:1
Schalke    Stuttgart  3:1

4. Spieltag
Hannover   Hamburg    FR 20:30
Bayern     Mainz 05   SA 15:30
Werder     Schalke    SA 15:30
Frankfurt  Augsburg   SA 15:30
Stuttgart  Wolfsburg  SA 15:30
RB Leipzig M'gladbach SA 18:30
Hoffenheim Hertha BSC SO 13:30
Leverkusen Freiburg   SO 15:30
Dortmund   Koeln      SO 18:00
```

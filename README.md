# liga
generate standings using openligadb-data (node)

## Why?
I want to print the standings of german Fußball-Bundesliga on a thermal-printer. 

## How?
The printer is attached to a Raspberry Pi that launches a HTTP-request and should get the pre-formatted-data.
So I need the data in some kind of raw format first and then create my own thermal-printer-table-style.
I decided to get the matches-data from openligadb.de and do the math on my own.
- Create a Team-object for each Bundesliga-Team from teams-JSON. (Edited data from openligadb to fit my needs.)
- Parse match-data from openligadb and update Team-objects with current scores (won, draw, lost, goals_shot, goals_got).
- Sort teams by scores.
- Pre-format the data to fit the thermal-printer (fake columns by indenting blanks at a max-width of 32 characters).
- Create a HTTP-express-server to proxy and serve the data.
- Update data on demand (reload match-data from openligadb).
- (additional) Parse match-data to get matches of the current match-day and the following one.

## Usage

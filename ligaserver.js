'use strict';
const Liga = require('./liga.js');
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3004;
const server = express()
	.use((req, res) => {
		res.setHeader('Access-Control-Allow-Origin','*');
		if (req.url=="/") {res.send('<a href=/bl1/tabelle>Tabelle</a> <a href=/bl1/spiele>Spiele</a><br><a href=/bl1/update>update</a> Stand: '+bundesliga.last_update)}
		if (req.url=="/bl1") {res.send(bundesliga.print_liga_table()+'\n'+bundesliga.print_matches()+'\n'+bundesliga.print_matches(bundesliga.active_matchday+1)+'\n'+bundesliga.last_update)}
		if (req.url=="/bl1/tabelle") {res.send(bundesliga.print_liga_table())}
		if (req.url=="/bl1/spiele") {res.send(bundesliga.print_matches()+'\n'+bundesliga.print_matches(bundesliga.active_matchday+1))}
		if (req.url=="/bl1/update") {bundesliga.load(()=>{res.send(bundesliga.last_update)})}
	})
	.listen(PORT, function() {
		bundesliga.load(()=>{console.log('\n'+bundesliga.print_liga_table()+'\n'+bundesliga.print_matches()+'\n'+bundesliga.print_matches(bundesliga.active_matchday+1))});
		process.stdout.write(`\x1b[44m LIGA SERVER LISTENING ON PORT ${ PORT } \x1b[0m `);
	});

var bl1_teams = [{"TeamId":65,"TeamName":"Koeln","ShortName":"KOE"},{"TeamId":81,"TeamName":"Mainz 05","ShortName":"M05"},{"TeamId":6,"TeamName":"Leverkusen","ShortName":"B04"},{"TeamId":40,"TeamName":"Bayern","ShortName":"FCB"},{"TeamId":7,"TeamName":"Dortmund","ShortName":"BVB"},{"TeamId":87,"TeamName":"M'gladbach","ShortName":"BMG"},{"TeamId":91,"TeamName":"Frankfurt","ShortName":"SGE"},{"TeamId":95,"TeamName":"Augsburg","ShortName":"FCA"},{"TeamId":9,"TeamName":"Schalke","ShortName":"S04"},{"TeamId":100,"TeamName":"Hamburg","ShortName":"HSV"},{"TeamId":55,"TeamName":"Hannover","ShortName":"H96"},{"TeamId":54,"TeamName":"Hertha BSC","ShortName":"BSC"},{"TeamId":1635,"TeamName":"RB Leipzig","ShortName":"RBL"},{"TeamId":112,"TeamName":"Freiburg","ShortName":"SCF"},{"TeamId":123,"TeamName":"Hoffenheim","ShortName":"TSG"},{"TeamId":16,"TeamName":"Stuttgart","ShortName":"VFB"},{"TeamId":131,"TeamName":"Wolfsburg","ShortName":"WOB"},{"TeamId":134,"TeamName":"Werder","ShortName":"SVW"}];
var bundesliga=new Liga(bl1_teams,'/api/getmatchdata/bl1/2017');

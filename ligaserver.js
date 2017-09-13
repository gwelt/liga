'use strict';
const Liga = require('./liga.js');
const config = require('./config.json');
var ligalist=[];
config.ligalist.forEach((liga)=>{
	ligalist.push(new Liga(liga.id,liga.apipath,liga.teams))
});
const express = require('express');
const PORT = process.env.PORT || config.port;
const server = express()
	.get('/:id?/:call?', (req,res)=>{
		res.setHeader('Access-Control-Allow-Origin','*');
		if (req.params.id) {
			var liga=get_liga_by_id(req.params.id);
			if (liga) {
				switch (req.params.call) {
					case undefined:
						res.send(liga.print_liga_table()+'\n'+liga.print_matches()+'\n'+liga.print_matches(liga.active_matchday+1)+'\n'+liga.last_update);
						break;
					case 'tabelle':
						res.send(liga.print_liga_table());
						break;
					case 'spiele':
						res.send(liga.print_matches()+'\n'+liga.print_matches(liga.active_matchday+1));
						break;
					case 'json':
						res.json(liga);
						break;
					case 'html':
						res.send('<pre>'+liga.print_liga_table()+'\n'+liga.print_matches()+'\n'+liga.print_matches(liga.active_matchday+1)+'\n'+liga.last_update+'</pre>');
						break;
					case 'update':
						liga.load(()=>{res.send('UPDATED. '+liga.last_update)});
						break;
					case 'check':
						liga.check((needs_update)=>{
							if (needs_update>0) {liga.load(()=>{res.send('CHECKED (='+needs_update+') AND UPDATED. '+liga.last_update)})}
							else {res.send('CHECKED. NO UPDATE NEEDED. '+liga.last_update)}
						});
						break;
					default:
						res.sendStatus(404);
				}
			}
			else {res.sendStatus(404)}
		}
		else {
			var out='';
			ligalist.forEach((liga)=>{
				out+='<a href=/'+liga.id+'/html>'+liga.leaguename+'</a> | <a href=/'+liga.id+'/json>JSON</a> | <a href=/'+liga.id+'/check>check for update</a> ('+liga.last_update+')<br>';
			});
			res.send(out)
		}
	})
	.listen(PORT, function() {
		ligalist.forEach((liga)=>{
			liga.load(()=>{console.log('\n'+liga.print_liga_table()+'\n'+liga.print_matches()+'\n'+liga.print_matches(liga.active_matchday+1))});
		});
		process.stdout.write(`\x1b[44m LIGA SERVER LISTENING ON PORT ${ PORT } \x1b[0m `);
	});

function get_liga_by_id(id) {
	var res;
	ligalist.forEach((l)=>{if (l.id==id) {res=l}});
	return res;
}
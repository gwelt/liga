var Liga = function (id,matchdatapath,teamlist) {
	this.id=id;
	this.leaguename=false;
	this.matchdatapath=matchdatapath;
	this.teams=[];
	this.teamlist=teamlist||[];
	this.matchdays=[];
	this.active_matchday=false;
	this.last_update=false;
	this.last_check=false;
}
module.exports = Liga;

function Team(TeamId,TeamName,ShortName) {
	this.TeamId=TeamId||-1;
	this.TeamName=TeamName||'=UNKNOWN=';
	this.ShortName=ShortName||'=NN=';
	this.won=0;
	this.draw=0;
	this.lost=0;
	this.goals_shot=0;  
	this.goals_got=0;
}

function MatchDay(MatchDayId) {
	this.MatchDayId=MatchDayId;
	this.matches=[];
}

function Match(MatchDateTime,Team1,Team2,MatchIsFinished,GoalsTeam1,GoalsTeam2) {
	//this.MatchDateTime=MatchDateTime;
	this.MatchDateTime=new Date(new Date(MatchDateTime).getTime()+(2*60*60*1000)).toISOString();
	this.Team1=Team1;
	this.Team2=Team2;
	this.MatchIsFinished=MatchIsFinished;
	this.GoalsTeam1=GoalsTeam1;
	this.GoalsTeam2=GoalsTeam2;
}

Liga.prototype.check = function(matchday,callback) {
	var liga=this;
	require('https').get({host:'api.openligadb.de', path:'/getlastchangedate'+liga.matchdatapath+'/'+matchday}, function(r) {
		var res=""; 
		r.on('data', function(d) {res+=d}); 
		r.on('end', function() {
			liga.last_check=new Date().toISOString();
			var last_change=res.slice(1,-1);
			callback(new Date(last_change) > new Date(liga.last_update));
		})
	})
}

Liga.prototype.load = function(callback) {
	var liga=this;
	liga.teams=[];
	liga.teamlist.forEach((t)=>{liga.teams.push(new Team(t.TeamId,t.TeamName,t.ShortName))});
	liga.matchdays=[];
	liga.leaguename=false;
	liga.active_matchday=false;
	liga.last_update=false;
	require('https').get({host:'api.openligadb.de', path:'/getmatchdata'+liga.matchdatapath}, function(r) {
		var res=""; 
		r.on('data', function(d) {res+=d}); 
		r.on('end', function() { 

			try {var json=JSON.parse(res)} catch(e) {json=[]; console.log('\nCould not parse data. Expected json-format. http://api.openligadb.de/getmatchdata'+liga.matchdatapath+'\n'+e)};
			json.forEach((m)=>{

				var matchday=liga.get_matchday_by_searchstring(m.group.groupOrderID);
				if (matchday==undefined) {
					matchday=new MatchDay(m.group.groupOrderID);
					liga.matchdays.push(matchday);
				}

				if (m.matchIsFinished && m.hasOwnProperty('matchResults') && m.team1.teamId>=0 && m.team2.teamId>=0) {

					var result_at_matchend={};
					m.matchResults.forEach((ram)=>{if (ram.resultName=="Endergebnis") {result_at_matchend=ram}});

					if (result_at_matchend.hasOwnProperty('pointsTeam1') && result_at_matchend.hasOwnProperty('pointsTeam2')) {
						var team1=liga.get_team_by_searchstring(m.team1.teamId);
						if (team1==undefined) {
							team1=new Team(m.team1.teamId,m.team1.teamName,m.team1.shortName);
							liga.teams.push(team1);
						}
						var team2=liga.get_team_by_searchstring(m.team2.teamId);
						if (team2==undefined) {
							team2=new Team(m.team2.teamId,m.team2.teamName,m.team2.shortName);
							liga.teams.push(team2);
						}
						team1.goals_shot+=result_at_matchend.pointsTeam1;
						team1.goals_got+=result_at_matchend.pointsTeam2;
						team2.goals_shot+=result_at_matchend.pointsTeam2;
						team2.goals_got+=result_at_matchend.pointsTeam1;
						if (result_at_matchend.pointsTeam1>result_at_matchend.pointsTeam2) {team1.won++; team2.lost++}
						else if (result_at_matchend.pointsTeam1<result_at_matchend.pointsTeam2) {team1.lost++; team2.won++}
						else {team1.draw++; team2.draw++}
						if (!liga.active_matchday||liga.active_matchday<m.group.groupOrderID) {liga.active_matchday=m.group.groupOrderID}
						matchday.matches.push(new Match(m.matchDateTimeUTC,m.team1.teamId,m.team2.teamId,m.matchIsFinished,result_at_matchend.pointsTeam1,result_at_matchend.pointsTeam2));
					} else {
						matchday.matches.push(new Match(m.matchDateTimeUTC,m.team1.teamId,m.team2.teamId,false,undefined,undefined));	
					}					

				} else {
					matchday.matches.push(new Match(m.matchDateTimeUTC,m.team1.teamId,m.team2.teamId,false,undefined,undefined));
				}

				if (!liga.last_update||liga.last_update<m.lastUpdateDateTime) {liga.last_update=m.lastUpdateDateTime}
				if (!liga.leaguename) {liga.leaguename=m.leagueName}

			});

			liga.teams.sort((a,b)=>liga.liga_order(a,b));
			callback();

		});
	}).on('error',(e)=>{console.log(e)})
}

Liga.prototype.get_team_by_searchstring = function (s) {
	var res = new Team(-1,'ID_'+s,'ID_'+s);
	this.teams.forEach((t)=>{
		if ((t.TeamId==s)||(t.TeamName==s)||(t.ShortName==s)) {res=t}
	})
	return res;
}

Liga.prototype.get_matchday_by_searchstring = function (s) {
	var res;
	this.matchdays.forEach((d)=>{
		if (d.MatchDayId==s) {res=d}
	})
	return res;
}

Liga.prototype.liga_order = function(a,b) {
	// 1. score
	var a_score=a.won*3+a.draw, b_score=b.won*3+b.draw;
	if ( a_score < b_score ) {return 1} else if ( a_score > b_score ) {return -1}
	// 2. goals sum
	var a_goals=a.goals_shot-a.goals_got, b_goals=b.goals_shot-b.goals_got;
	if ( a_goals < b_goals ) {return 1} else if ( a_goals > b_goals ) {return -1}
	// 3. goals more
	if ( a.goals_shot < b.goals_shot ) {return 1} else if ( a.goals_shot > b.goals_shot ) {return -1}
	return 0;
}

Liga.prototype.print_liga_table = function () {
	var out='', position=0;
	while (position<this.teams.length) {
		position++;
		var t=this.teams[position-1];
		if ( (position==1) || (this.liga_order(t,this.teams[position-2])!=0) ) {out+=z2h(position)} else {out+='  '};
		var goals=t.goals_shot-t.goals_got; if (goals>0) {goals='+'+goals}
		out+=' '+z10t(t.TeamName.replace(/[äüöÄÜÖß]/g,function(m){return {ä:"ae",ü:"ue",ö:"oe",Ä:"Ae",Ü:"Ue",Ö:"Oe",ß:"ss"}[m]}))+' '+z2h(t.won+t.draw+t.lost)+' '+z2h(t.goals_shot)+':'+z2t(t.goals_got)+' '+z3h(goals)+' '+z2h(t.won*3+t.draw)+'\n';
	}
	return out.toUpperCase();
}

Liga.prototype.print_matches = function (MatchDayId) {
	var res='';
	if (!MatchDayId) {MatchDayId=this.active_matchday};
	var matchday=this.get_matchday_by_searchstring(MatchDayId);
	if (matchday) {
		res=matchday.MatchDayId+'. Spieltag\n';
		matchday.matches
		.sort((a,b)=>{if (a.MatchDateTime>b.MatchDateTime){return 1} else if (a.MatchDateTime<b.MatchDateTime){return -1} else {return 0}})
		.forEach((m)=>{
			res+=z10t(this.get_team_by_searchstring(m.Team1).TeamName.replace(/[äüöÄÜÖß]/g,function(m){return {ä:"ae",ü:"ue",ö:"oe",Ä:"Ae",Ü:"Ue",Ö:"Oe",ß:"ss"}[m]}))+' '+z10t(this.get_team_by_searchstring(m.Team2).TeamName.replace(/[äüöÄÜÖß]/g,function(m){return {ä:"ae",ü:"ue",ö:"oe",Ä:"Ae",Ü:"Ue",Ö:"Oe",ß:"ss"}[m]}))+' ';
			if (m.MatchIsFinished) {res+=m.GoalsTeam1+':'+m.GoalsTeam2} 
			else {
				var d = new Date(m.MatchDateTime); //! + 2 Stunden
				res+=['SO','MO','DI','MI','DO','FR','SA'][d.getDay()]+' '+m.MatchDateTime.substring(11,16)
			}
			res+='\n';		
		})
	}
	return res.toUpperCase();
}

function z2h(string) {return string.toString().length>=2?string:' '+string}
function z3h(string) {while (string.toString().length<3) {string=' '+string}; return string}
function z2t(string) {return string.toString().length>=2?string:string+' '}
function z10t(string) {while (string.toString().length<10) {string+=' '}; return string.substring(0,10)}

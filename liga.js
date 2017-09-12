var Liga = function (teamlist,matchdatapath) {
	this.teamlist=teamlist;
	this.matchdatapath=matchdatapath;
}
module.exports = Liga;

function Team(TeamId,TeamName,ShortName) {
	this.TeamId=TeamId;
	this.TeamName=TeamName;
	this.ShortName=ShortName;
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
	this.MatchDateTime=MatchDateTime;
	this.Team1=Team1;
	this.Team2=Team2;
	this.MatchIsFinished=MatchIsFinished;
	this.GoalsTeam1=GoalsTeam1;
	this.GoalsTeam2=GoalsTeam2;
}

Liga.prototype.load = function(callback) {
	var liga=this;
	liga.teams=[];
	liga.teamlist.forEach((t)=>{liga.teams.push(new Team(t.TeamId,t.TeamName,t.ShortName))});
	liga.matchdays=[];
	liga.active_matchday=false;
	liga.last_update=false;
	require('https').get({host:'www.openligadb.de', path:liga.matchdatapath}, function(r) {
		var res=""; 
		r.on('data', function(d) {res+=d}); 
		r.on('end', function() { 

			JSON.parse(res).forEach((m)=>{

				if (m.MatchIsFinished && m.hasOwnProperty('MatchResults') && m.Team1.TeamId>=0 && m.Team2.TeamId>=0) {
					if (m.MatchResults.length>0) {
						var team1=liga.get_team_by_searchstring(m.Team1.TeamId);
						var team2=liga.get_team_by_searchstring(m.Team2.TeamId);
						team1.goals_shot+=m.MatchResults[1].PointsTeam1;
						team1.goals_got+=m.MatchResults[1].PointsTeam2;
						team2.goals_shot+=m.MatchResults[1].PointsTeam2;
						team2.goals_got+=m.MatchResults[1].PointsTeam1;
						if (m.MatchResults[1].PointsTeam1>m.MatchResults[1].PointsTeam2) {team1.won++; team2.lost++}
						else if (m.MatchResults[1].PointsTeam1<m.MatchResults[1].PointsTeam2) {team1.lost++; team2.won++}
						else {team1.draw++; team2.draw++}
						if (!liga.active_matchday||liga.active_matchday<m.Group.GroupOrderID) {liga.active_matchday=m.Group.GroupOrderID}
					};
				}

				if (!liga.last_update||liga.last_update<m.LastUpdateDateTime) {liga.last_update=m.LastUpdateDateTime}
				
				var matchday=liga.get_matchday_by_searchstring(m.Group.GroupOrderID);
				if (matchday==undefined) {
					matchday=new MatchDay(m.Group.GroupOrderID);
					liga.matchdays.push(matchday);
				}
				if (m.MatchIsFinished && m.hasOwnProperty('MatchResults')) {
					matchday.matches.push(new Match(m.MatchDateTime,m.Team1.TeamId,m.Team2.TeamId,m.MatchIsFinished,m.MatchResults[1].PointsTeam1,m.MatchResults[1].PointsTeam2));
				} else {
					matchday.matches.push(new Match(m.MatchDateTime,m.Team1.TeamId,m.Team2.TeamId,m.MatchIsFinished,undefined,undefined));
				}

			});

			liga.teams.sort((a,b)=>liga.liga_order(a,b));
			callback();

		});
	}).on('error',(e)=>{console.log(e)})
}

Liga.prototype.get_team_by_searchstring = function (s) {
	var res;
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
	if ( a_goals < b_goals ) {return 1} else    if ( a_goals > b_goals ) {return -1}
	// 3. goals more
	if ( a.goals_shot < b.goals_shot ) {return 1} else if ( a.goals_shot > b.goals_shot ) {return -1}
	return 0;
}

Liga.prototype.print_liga_table = function () {
	var out='', position=0, last_update=false;
	while (position<this.teams.length) {
		position++;
		var t=this.teams[position-1];
		if ( (position==1) || (this.liga_order(t,this.teams[position-2])!=0) ) {out+=z2h(position)} else {out+='  '};
		var goals=t.goals_shot-t.goals_got; if (goals>0) {goals='+'+goals}
		out+=' '+z10t(t.TeamName)+' '+z2h(t.won+t.draw+t.lost)+' '+z2h(t.goals_shot)+':'+z2t(t.goals_got)+' '+z3h(goals)+' '+z2h(t.won*3+t.draw)+'\n';
	}
	return out;
}

Liga.prototype.print_matches = function (MatchDayId) {
	if (!MatchDayId) {MatchDayId=this.active_matchday};
	var matchday=this.get_matchday_by_searchstring(MatchDayId);
	var res=matchday.MatchDayId+'. Spieltag\n';
	matchday.matches
	.sort((a,b)=>{if (a.MatchDateTime>b.MatchDateTime){return 1} else if (a.MatchDateTime<b.MatchDateTime){return -1} else {return 0}})
	.forEach((m)=>{
		res+=z10t(this.get_team_by_searchstring(m.Team1).TeamName)+' '+z10t(this.get_team_by_searchstring(m.Team2).TeamName)+' ';
		if (m.MatchIsFinished) {res+=m.GoalsTeam1+':'+m.GoalsTeam2} 
		else {
			var d=new Date(m.MatchDateTime+'+02:00');
			res+=['SO','MO','DI','MI','DO','FR','SA'][d.getDay()]+' '+m.MatchDateTime.substring(11,16)
		}
		res+='\n';		
	})
	return res;
}

function z2h(string) {return string.toString().length>=2?string:' '+string}
function z3h(string) {while (string.toString().length<3) {string=' '+string}; return string}
function z2t(string) {return string.toString().length>=2?string:string+' '}
function z10t(string) {while (string.toString().length<10) {string+=' '}; return string}

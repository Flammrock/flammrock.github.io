
if (!String.prototype.padStart) {
	String.prototype.padStart = function padStart(targetLength,padString) {
		targetLength = targetLength>>0; //truncate if number or convert non-number to 0;
		padString = String((typeof padString !== 'undefined' ? padString : ' '));
		if (this.length > targetLength) {
			return String(this);
		}
		else {
			targetLength = targetLength-this.length;
			if (targetLength > padString.length) {
				padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
			}
			return padString.slice(0,targetLength) + String(this);
		}
	};
}

Date.prototype.getWeek = function () {
    var target  = new Date(this.valueOf());
    var dayNr   = (this.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    var firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() != 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000);
}

var getZeroBasedIsoWeekDay = function(date) { return (date.getDay() + 6) % 7;};
var getIsoWeekDay = function(date) { return getZeroBasedIsoWeekDay(date) + 1;};

function weekDateToDate(year, week, weekDay) {
  var zeroBasedWeek = week - 1;
  var zeroBasedWeekDay = weekDay - 1;
  var days = (zeroBasedWeek * 7) + zeroBasedWeekDay;
  days += 1;
  var firstDayOfYear = new Date(year, 0, 1);
  var firstIsoWeekDay = getIsoWeekDay(firstDayOfYear);
  var zeroBasedFirstIsoWeekDay = getZeroBasedIsoWeekDay(firstDayOfYear);
  if (firstIsoWeekDay > 4) { days += 8 - firstIsoWeekDay; }
  else { days -= zeroBasedFirstIsoWeekDay; }
  return new Date(year, 0, days);
}


var getDaysInMonth = function(month,year) {
    return new Date(year, month, 0).getDate();
};





if (WScript.Arguments(0)==1) {
    var data=WScript.Arguments(1).split('/');
    var d = new Date(parseInt(data[2],10),parseInt(data[1],10)-1,parseInt(data[0],10));
    var n = getDaysInMonth(d.getMonth()+1,d.getFullYear());
    if (n!=WScript.Arguments(2)) {
        WScript.Echo('Error: '+[d.getMonth()+1,d.getFullYear()].join('/')+' - '+'"'+n+'" != "'+WScript.Arguments(2)+'"');
        WScript.Quit(1);
    }
    if (WScript.Arguments(3)==1) WScript.Echo('    '+[data[1].padStart(2,'0'),data[2].padStart(4,'0')].join('/')+' : '+'"'+n+'" == "'+WScript.Arguments(2)+'"');
    WScript.Quit(0);
}



if (WScript.Arguments(0)==2) {
    var data=WScript.Arguments(1).split('/');
    var d = new Date(parseInt(data[2],10),parseInt(data[1],10)-1,parseInt(data[0],10));
    var n = d.getWeek();
    if (n!=WScript.Arguments(2)) {
        WScript.Echo('Error: '+[d.getDate(),d.getMonth()+1,d.getFullYear()].join('/')+' - '+'"'+n+'" != "'+WScript.Arguments(2)+'"');
        WScript.Quit(1);
    }
    if (WScript.Arguments(3)==1) WScript.Echo('    '+[data[0].padStart(2,'0'),data[1].padStart(2,'0'),data[2].padStart(4,'0')].join('/')+' : '+'"'+n+'" == "'+WScript.Arguments(2)+'"');
    WScript.Quit(0);
}



if (WScript.Arguments(0)==3) {
    var data=WScript.Arguments(1).split('/');
    var d = weekDateToDate(parseInt(data[2]), parseInt(data[1]), parseInt(data[0]));
    var n = [d.getDate(),d.getMonth()+1,d.getFullYear()].join('/');
    if (n!=WScript.Arguments(2)) {
        WScript.Echo('Error: '+WScript.Arguments(1)+' - '+'"'+n+'" != "'+WScript.Arguments(2)+'"');
        WScript.Quit(1);
    }
    if (WScript.Arguments(3)==1) WScript.Echo('    '+WScript.Arguments(1)+' : '+'"'+n+'" == "'+WScript.Arguments(2)+'"');
    WScript.Quit(0);
}




// Compare A and B
// Formula from Wikipedia

var RESULT = {
	"FUMBLE": 0,
	"FAILURE": 1,
	"SUCCESS": 2,
	"CRITICAL": 3
};

var VICTORY = {
	"COMPLETE_DEFEAT": 101,
	"MAJOR_DEFEAT": 102,
	"MINOR_DEFEAT": 103,
	"MARGINAL_DEFEAT": 104,
	"TIE": 105,
	"MARGINAL_VICTORY": 106,
	"MINOR_VICTORY": 107,
	"MAJOR_VICTORY": 108,
	"COMPLETE_VICTORY": 109
};

var VICTORY_TEXT = {
	101: "Complete Defeat",
	102: "Major Defeat",
	103: "Minor Defeat",
	104: "Marginal Defeat",
	105: "Tie",
	106: "Marginal Victory",
	107: "Minor Victory",
	108: "Major Victory",
	109: "Complete Victory"
}

// Identical results are handled in code, not by lookup
var VICTORY_LOOKUP = {
	"01" : VICTORY.MINOR_DEFEAT,
	"02" : VICTORY.MAJOR_DEFEAT,
	"03" : VICTORY.COMPLETE_DEFEAT,
	"10" : VICTORY.MINOR_VICTORY,
	"12" : VICTORY.MINOR_DEFEAT,
	"13" : VICTORY.MAJOR_DEFEAT,
	"20" : VICTORY.MAJOR_VICTORY,
	"21" : VICTORY.MINOR_VICTORY,
	"23" : VICTORY.MINOR_DEFEAT,
	"30" : VICTORY.COMPLETE_VICTORY,
	"31" : VICTORY.MAJOR_VICTORY,
	"32" : VICTORY.MINOR_VICTORY
};

function run_simulation(a_rating, a_mastery, b_rating, b_mastery) {
	
	var victory;
	var results = [];
	var i;
	var res = "";

	for (i = 101; i <= 109; i++) { results[i] = 0; }

	// alert(a_rating + " " + a_mastery + " versus " + b_rating + " " + b_mastery);

	for (a_die = 1; a_die <= 20; a_die++) {
		for (b_die = 1; b_die <= 20; b_die++) {
			victory = find_victory(a_rating, a_mastery, a_die, b_rating, b_mastery, b_die);
			
			// alert("Result is "+victory);
			results[victory] += 1;
		}
	}

	res += '<div class="results_caption">';
	res += 'Comparison of A (' + a_rating + (a_mastery > 0 ? 'W' + a_mastery : '') + ') versus B (' + b_rating + (b_mastery > 0 ? 'W' + b_mastery : '') + ')';
	res += '</div>';

	res += '<table class="results">';
	res += '<tr><th>Victory Level for A</th><th>Number</th><th>Percent</th><th>Cumulative</th></tr>';
	for (i = 101; i <= 109; i++) {
		res += '<tr>'
		res += '<td>' + VICTORY_TEXT[i] + '</td>';
		res += '<td class="num">' + results[i] + "</td>";
		res += '<td class="percent">' + format(results[i]) + '</td>';
		if (i == 101) {
			res += '<td class="cumul" rowspan="4">' + format(results[101]+results[102]+results[103]+results[104])+ '</td>';
		}
		if (i == 105) {
			res += '<td class="percent">' + format(results[i]) + '</td>';
		}
		if (i == 106) {
			res += '<td class="cumul" rowspan="4">' + format(results[106]+results[107]+results[108]+results[109])+ '</td>';
		}
		res += '</tr>'
	}
	res += '</table>';
	return res;
}

function format(n) {
	var percent = n / 400 * 100;
	return String(percent.toFixed(2)) + '%';
}

// Function to return the victory level of A vs. B for a given combo of die rolls
function find_victory(a_rating, a_mastery, a_die, b_rating, b_mastery, b_die) {

	var rv;

	// Normalize the masteries so only one has a non-zero value
	if (a_mastery > b_mastery) {
		a_mastery -= b_mastery;
		b_mastery = 0;
	} else if (a_mastery < b_mastery) {
		b_mastery -= a_mastery;
		a_mastery = 0;
	} else {
		a_mastery = 0;
		b_mastery = 0;
	}
		
	// Get the raw die roll result
	var a_result = what_result(a_rating, a_die);
	var b_result = what_result(b_rating, b_die);

	// If there are remaining masteries, adjust the results
	if (a_mastery > 0) {
		rv = bump_up(a_result, a_mastery);
		a_result = rv.new_result;
		b_result = bump_down(b_result, rv.remainder);
	} else if (b_mastery > 0) {
		rv = bump_up(b_result, b_mastery);
		b_result = rv.new_result;
		a_result = bump_down(a_result, rv.remainder);
	} else {
		// Both normalized masteries are 0, do not adjust
	}

	victory_level = what_victory(a_result, a_die, b_result, b_die);

	return victory_level;
}

function what_result(rating, die) {
	
	if (die == 20) {
		return RESULT.FUMBLE;
	} else if (die == 1) {
		return RESULT.CRITICAL;
	} else if (die <= rating) {
		return RESULT.SUCCESS;
	} else {
		return RESULT.FAILURE;
	}
}

function bump_up(result, mastery) {

	// No masteries, no change
	if (mastery == 0) {
		return ({"new_result": result, "remainder": mastery});
	}
	// If we would go higher than a critical, only bump up to a
	// critical, and return masteries to bump down our opponent
	if (result + mastery > RESULT.CRITICAL) {
		return({"new_result": RESULT.CRITICAL,
			"remainder": (result + mastery - RESULT.CRITICAL)});
	}
	// If I had true enums that could do arithmetic...
	return({"new_result": result + mastery, "remainder": 0});
}

function bump_down(result, mastery) {
	// return new_result;

	// Nothing worse than a fumble
	if (result - mastery < RESULT.FUMBLE) {
		return RESULT.FUMBLE;
	}

	// If I had true enums that could do arithmetic...
	return result - mastery;
}

function what_victory(a_result, a_die, b_result, b_die) {
	
	var key;

	if ( (a_result == b_result) && (a_result == RESULT.FUMBLE) ) {
		// Fumble versus fumble is always a tie
		return VICTORY.TIE;
	} else if (a_result == b_result) {
		if (a_die < b_die) {
			return VICTORY.MARGINAL_VICTORY;
		} else if (a_die > b_die) {
			return VICTORY.MARGINAL_DEFEAT;
		} else {
			return VICTORY.TIE;
		}
	} else {
		// Use the object like an associative array
		key = String(a_result) + String(b_result);
		return VICTORY_LOOKUP[key];
	}
}

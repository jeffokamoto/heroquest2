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
	var source   = $("#result-template").html();
	var template = Handlebars.compile(source);
	var results_html = '';


	for (i = 101; i <= 109; i++) { results[i] = 0; }

	for (a_die = 1; a_die <= 20; a_die++) {
		for (b_die = 1; b_die <= 20; b_die++) {
			victory = find_victory(a_rating, a_mastery, a_die, b_rating, b_mastery, b_die);
			
			results[victory] += 1;
		}
	}

	var context = {
		a_value: '' + a_rating + (a_mastery > 0 ? 'W' + a_mastery : ''),
		b_value: '' + b_rating + (b_mastery > 0 ? 'W' + b_mastery : ''),

		com_d_text: VICTORY_TEXT[101],
		com_d_num: results[101],
		com_d_percent: format(results[101]),

		maj_d_text: VICTORY_TEXT[102],
		maj_d_num: results[102],
		maj_d_percent: format(results[102]),

		min_d_text: VICTORY_TEXT[103],
		min_d_num: results[103],
		min_d_percent: format(results[103]),

		mar_d_text: VICTORY_TEXT[104],
		mar_d_num: results[104],
		mar_d_percent: format(results[104]),

		cum_d_percent: format(results[101]+results[102]+results[103]+results[104]),

		tie_text: VICTORY_TEXT[105],
		tie_num: results[105],
		tie_percent: format(results[105]),

		mar_v_text: VICTORY_TEXT[106],
		mar_v_num: results[106],
		mar_v_percent: format(results[106]),

		min_v_text: VICTORY_TEXT[107],
		min_v_num: results[107],
		min_v_percent: format(results[107]),

		maj_v_text: VICTORY_TEXT[108],
		maj_v_num: results[108],
		maj_v_percent: format(results[108]),

		com_v_text: VICTORY_TEXT[109],
		com_v_num: results[109],
		com_v_percent: format(results[109]),

		cum_v_percent: format(results[106]+results[107]+results[108]+results[109]),
	};

	results_html = template(context);
	return results_html;
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

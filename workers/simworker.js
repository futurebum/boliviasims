'use strict';

const MSG_TYPE = { // different types of messages
	NOTIFICATION: 0,
	REAL_TOTALS: 1,
	EXCLUSIONS: 2,
	SIM: 3,
	COMPLETED: 4
};

const SIM_TYPE = { // different ways to count actas.
	ONLY_UNSIM_ACTAS: 0,
	ONLY_SIM_ACTAS: 1,
	ALL_ACTAS: 2
};

// from: https://en.wikipedia.org/wiki/Poisson_distribution#Generating_Poisson-distributed_random_variables
const STEP = 500;
function poisson_large(rate) {
	let left = rate;
	let k = 0;
	let p = 1;
	
	do {
		let u = Math.random();
		while (u == 0) { u = Math.random(); } // (0,1) eh
		p *= u;
		
		while (p < 1 && left > 0) {
			if (left > STEP) {
				p *= Math.exp(STEP);
				left -= STEP;
			}
			else {
				p *= Math.exp(left);
				left = 0;
			}
		}
	} while (p > 1);
	
	return k - 1;
}

// from: https://en.wikipedia.org/wiki/Poisson_distribution#Generating_Poisson-distributed_random_variables
function poisson_small(rate) { // caps out around rate=700
	let x = 0;
	let p = Math.exp(-rate);
	let s = p;
	let u = Math.random(); // doesn't include 1, but uh who cares.
	
	while (u > s) {
		p *= (rate / ++x);
		s += p;
	}
	
	return x;
}

// takes some weights, then returns randomly selected index.
function weighted_random(weights) {
	let total = 0;
	for (const weight of weights) {
		total += weight;
	}
	
	let random = Math.random() * total;
	let index = -1;
	let cumulative = 0;
	do { // would it be better to create cumulative array in first loop, then binary search? guess it depends on how large array is.
		cumulative += weights[++index];
	} while (random > cumulative); // could there be precision issues near 1? '&& index + 1 < weights.length'
	
	return index;
}

// generates maps which will recreate geography of the election. might use inscritos for possible weighting of decision paths.
function GeographicMap(name, level, gm_parent) {
	this.children = {};
	this.imp_children = {};
	this.inscritos = 0;
	this.imp_inscritos = 0;
	this.name = name;
	this.gm_parent = gm_parent;
	this.level = level;
	this.mesas = 0;
	this.imp_mesas = 0;
	/*this.min_id = undefined; // for later. gonna guess that geography correlated with number ordering.??
	this.max_id = undefined;
	this.min_imp_id = undefined;
	this.max_imp_id = undefined;*/
}

GeographicMap.prototype.toString = function() { // just to have around.
	return "Name: "+this.name+", Level: "+this.level+", Inscritos: "+this.inscritos+(this.gm_parent !== null && this.gm_parent !== undefined ? " | Parent: "+this.gm_parent : "");
}

// IDEA: calculate id range at each level, then give min-max and weight selections towards numerically closer ones. (possibly geographically closer too.)
	// this is mostly because i struck out with finding lat-lon coordinates for all the precincts. (eh, concept doesn't really work.)
// IDEA: some kind of var for trep progression. places with more mesas are more likely to report early. would weight away from these for novel areas.

// ARGUMENTS
// headers: {}
	// id: String
	// registered: String
	// valids: [] // any order
	// invalids: [] // any order
	// geo: [] // in order from least specific to most specific
// actas: {key=id: val={key=header: val=val}
// actas_to_project: [] // id numbers
// options {}
	// simulation_type: UseMyEnum
	// simulation_count: x (Default: 1000)
	// least_specific_match: StringCorrespondsToGeoHeader (default: Best Match)
	// chumacero: true/false (Default: false)
	// MB?? chumacero_max_distance: x
onmessage = function(e) {
	postMessage( {type: MSG_TYPE.NOTIFICATION, data: "Iniciando proceso."} );
	
	const headers = e.data[0];
	const actas = e.data[1];
	const to_project = {}; // e.data[2];
	const options = e.data[3];
	
	//console.debug("Options => " + Object.entries(options));
	
	{ // prefer a map for to_project.
		for (const id of e.data[2]) {
			to_project[id] = actas[id];
		}
	}
	
	// process headers
	const ID_HEADER = headers["id"];
	const REGISTERED_VOTERS_HEADER = headers["registered"];
	const VALID_VOTE_HEADERS = headers["valids"];
	const INVALID_VOTE_HEADERS = headers["invalids"];
	const VOTE_HEADERS = VALID_VOTE_HEADERS.concat(INVALID_VOTE_HEADERS);
	const GEO_HEADERS = headers["geo"]; // array format: [less specific ... more specific]
	
	// process options
	const COUNT_KEY = options["count_key"];
	const MY_SIM_TYPE = options["simulation_type"] || SIM_TYPE.ALL_ACTAS;
	const SIMULATION_COUNT = options["simulation_count"];
	const LEAST_SPECIFIC_MATCH = options["least_specific_match"]; // -1 means Best Match ... (geo_length - 1) means Precinct.
	const ALLOW_CHUMACERO = options["chumacero"];
	const CHUMACERO_MAX_DISTANCE = Number.MAX_SAFE_INTEGER; // will figure this one out later. (for some kind of chumacero variation...)
	
	// me messing around (will do smth real later)
	const GEO_ACCEPTED = new Array(GEO_HEADERS.length); // copy
	for (let i=0; i<GEO_ACCEPTED.length; i++) {
		GEO_ACCEPTED[i] = (i >= LEAST_SPECIFIC_MATCH);
	}
	
	// ok, time to do the projection
	let make_adjustable_total = function() { // allows me to keep multiple counts, so i can mix and match projected and non-projected actas.
		return {
			mesas: 0,
			registered: 0,
			votes: new Array(VOTE_HEADERS.length).fill(0),
			add_acta: function(id) {
				++this.mesas;
				this.registered += actas[id][REGISTERED_VOTERS_HEADER];
				for (let i=0; i<VOTE_HEADERS.length; i++) { this.votes[i] += actas[id][VOTE_HEADERS[i]]; }
				return this;
			},
			remove_acta: function(id) {
				--this.mesas;
				this.registered -= actas[id][REGISTERED_VOTERS_HEADER];
				for (let i=0; i<VOTE_HEADERS.length; i++) { this.votes[i] -= actas[id][VOTE_HEADERS[i]]; }
				return this;
			},
			add_total: function(other_total) {
				this.mesas += other_total.mesas;
				this.registered += other_total.registered;
				for (let i=0; i<VOTE_HEADERS.length; i++) { this.votes[i] += other_total.votes[i]; }
				return this;
			},
			add_imputation: function(target_acta, imp_vote_table, imp_reg) {
				let our_votes = this.votes;
				let reg_to_scale = target_acta[REGISTERED_VOTERS_HEADER];
				for (let i=0; i<VOTE_HEADERS.length; i++) { our_votes[i] += (reg_to_scale * (imp_vote_table[i] / imp_reg)); }
				++this.mesas; // assuming it's only one mesa...
				this.registered += reg_to_scale;
				return this;
			},
			add_poisson: function(target_acta, imp_vote_table, imp_reg) {
				let our_votes = this.votes;
				let reg_to_scale = target_acta[REGISTERED_VOTERS_HEADER];
				// note: possible to get more votes than voters, but sims should even out in the end, so doesn't matter.
				for (let i=0; i<VOTE_HEADERS.length; i++) { our_votes[i] += (reg_to_scale * (poisson_small(imp_vote_table[i]) / imp_reg)); }
				++this.mesas; // assuming it's only one mesa...
				this.registered += reg_to_scale;
				return this;
			},
			get_response_map: function() {
				let response = {};
				for (let i=0; i<VOTE_HEADERS.length; i++) {
					response[VOTE_HEADERS[i]] = this.votes[i];
				}
				response[REGISTERED_VOTERS_HEADER] = this.registered;
				response[COUNT_KEY] = this.mesas;
				return response;
			}
		};
	};
	
	// maps to hold different totals.
	let base_totals = make_adjustable_total(); // only non-projected actas.
	let real_totals = make_adjustable_total(); // recreating official vote total.
	let acta_map = new GeographicMap("BASE", null, null); // a tree to recreate the geography of (non-projected) voting precincts.
	
	// populate the maps!
	postMessage( {type: MSG_TYPE.NOTIFICATION, data: "Construyendo árbol geográfico."} );
	for (const [id, acta] of Object.entries(actas)) {
		const reg_voters = acta[REGISTERED_VOTERS_HEADER];
		const is_control = (to_project[id] === undefined);
		if (is_control && MY_SIM_TYPE == SIM_TYPE.ALL_ACTAS) {
			base_totals.add_acta(id);
		}
		
		// it's maps all the way down...
		let last_map = acta_map;
		let current_map;
		for (let j=0; j<GEO_HEADERS.length; j++) {
			let geo = acta[GEO_HEADERS[j]];
			
			// for regular map
			last_map.inscritos += reg_voters;
			last_map.mesas += 1;
			current_map = last_map.children[geo];
			if (current_map === undefined) {
				last_map.children[geo] = current_map = new GeographicMap(geo, GEO_HEADERS[j], last_map);
			}
			
			// for imputation map
			if (is_control) {
				last_map.imp_inscritos += reg_voters;
				last_map.imp_mesas += 1;
				if (last_map.imp_children[geo] === undefined) {
					last_map.imp_children[geo] = current_map; // NOTE: grabbing REGULAR map from earlier.
				}
			}
			
			// prepare for next iteration.
			last_map = current_map;
		}
		
		// after loop, current_map is actually a precinct.
		acta.gm_parent = current_map;
		current_map.inscritos += reg_voters;
		current_map.mesas += 1;
		current_map.children[id] = acta;
		if (is_control) {
			current_map.imp_inscritos += reg_voters;
			current_map.imp_mesas += 1;
			current_map.imp_children[id] = acta;
		}
		
		// do some stuff for counting totals.
		//                    unsim (base)      sim (base)       unsim(real)     sim(real)
		// only unsims:           no               no               yes            no   
		// only sims:             no               no               no             yes
		// all:                   yes              no               yes            yes
		if (MY_SIM_TYPE === SIM_TYPE.ALL_ACTAS
			|| (MY_SIM_TYPE === SIM_TYPE.ONLY_UNSIM_ACTAS && is_control)
			|| (MY_SIM_TYPE === SIM_TYPE.ONLY_SIM_ACTAS && !is_control)) {
			real_totals.add_acta(id);
		}
	}
	
	// pre-processing for simulations.
	let traversal_lookup = {}; // lookup hash to save starting point for random selection process.
	let excluded = []; // array of actas which got excluded for insufficient geographic precision.
	let unproject = function (id) { // convenience function to remove acta from projections if insufficient geo precision.
		delete to_project[id];
		switch (MY_SIM_TYPE) {
			case SIM_TYPE.ALL_ACTAS:
				base_totals.add_acta(id);
				break;
			case SIM_TYPE.ONLY_SIM_ACTAS:
				real_totals.remove_acta(id);
				break;
			case SIM_TYPE.ONLY_UNSIM_ACTAS:
				real_totals.add_acta(id);
				break;
			default:
		}
	};
	
	// look for matches!
	postMessage( {type: MSG_TYPE.NOTIFICATION, data: "Buscando coincidencias geográficas."} );
	specificity_check: for (const [id, acta] of Object.entries(to_project)) {
		let best_match;
		match_search: for (let i=GEO_HEADERS.length-1, map = acta.gm_parent; i >= LEAST_SPECIFIC_MATCH; --i) {
			if (GEO_ACCEPTED[i] && Object.keys(map.imp_children).length > 0) {
				best_match = map;
				break match_search;
			}
			
			map = map.gm_parent;
		}
		
		// if no match, then save to exclude later and jump to next iteration of loop.
		if (best_match === undefined) {
			// are we accepting base matches? if not, then exclude. else, create a fake precompute from base map then continue loop.
			if (LEAST_SPECIFIC_MATCH >= 0) {
				excluded.push(id);
			}
			else { // create a fake pre-compute value that starts at base.
				traversal_lookup[id] = {
					geo_index: -1,
					map: acta_map
				};
			}
				
			continue specificity_check;
		}
		
		// check to see if we're doing chumacero (requires precinct match).
		let geo_index = GEO_HEADERS.indexOf(best_match.level);
		if (ALLOW_CHUMACERO && geo_index == GEO_HEADERS.length - 1) {
			// my actual opinion on this, though, is that it's probably worthless and just adds noise to the predictions.
			//const MAX_DISTANCE = 5;
			/*const N_CLOSEST_MESAS = 4;
			let c_arr = [];
			for (let other_id in map.imp_children) {
				let diff = Math.abs(id - other_id);
				if (c_arr.length == 0) {
					c_arr[0] = other_id;
				}
				else if (diff < Math.abs(c_arr[0] - other_id)) {
					if (c_arr.length < N_CLOSEST_MESAS) {
						c_arr.push(other_id);
					}
					else {
						c_arr[0] = other_id;
					}
					
					place_in_order: for (let i=1; i<c_arr.length; i++) { // o(n), i know...
						let other_diff = Math.abs(id - c_arr[i]);
						if (diff < other_diff || (diff == other_diff && Math.random() > 0.5)) {
							let temp = c_arr[i];
							c_arr[i] = other_id;
							c_arr[i-1] = temp;
						}
						else {
							break place_in_order;
						}
					}
				}
			}*/
			
			// generalized chumacero (find closest 1-2 mesas in precinct) [could take all and then weight selex toward closer ones?]
			let best = CHUMACERO_MAX_DISTANCE;
			let c_arr = [];
			for (let precinct_mesa_id in best_match.imp_children) {
				let diff = Math.abs(id - precinct_mesa_id);
				if (diff < best) {
					c_arr.length = 0;
					c_arr.push(precinct_mesa_id);
					best = diff;
				}
				else if (diff == best) {
					c_arr.push(precinct_mesa_id);
				}
			}
			
			best_match = new GeographicMap(id, "CHUMACERO", best_match.gm_parent);
			geo_index = GEO_HEADERS.length - 1; // fake mini-precinct.
			for (let chumacero_id of c_arr) {
				best_match.imp_children[chumacero_id] = actas[chumacero_id];
			}
		}
		
		// add to precompute object.
		traversal_lookup[id] = {
			geo_index: geo_index,
			map: best_match
		};
	}
	
	// clean up exclusions. (didn't want to do while iterating over to_project earlier.)
	for (const id of excluded) {
		unproject(id);
	}
	
	// debug report on matches.
	let counts = new Array(GEO_HEADERS.length);
	let base_count = 0;
	counts.fill(0);
	for (const [id, obj] of Object.entries(traversal_lookup)) {
		obj.geo_index >= 0 ? counts[obj.geo_index]++ : base_count++;
	}
	console.debug("Match report:");
	for (let idx = 0; idx<GEO_HEADERS.length; idx++) {
		console.debug(GEO_HEADERS[idx] + " => " + counts[idx]);
	}
	console.debug("Base => "+base_count);
	console.debug("Excluded => "+excluded.length);
	
	// exclusions post-processing and send out real totals.
	postMessage( {type: MSG_TYPE.EXCLUSIONS, data: excluded} ); // post exclusions.
	postMessage( {type: MSG_TYPE.REAL_TOTALS, data: real_totals.get_response_map()} ); // post real totals.
	
	// SIMULATION.
	let saved_imp_vote_tables = {}; // lookup hash. key: numero_mesa. value: vote table for given acta. (as an array, to speed processing a little)
	for (let i=0; i< SIMULATION_COUNT; i++) {
		let sim = make_adjustable_total().add_total(base_totals);
		for (const [id, acta] of Object.entries(to_project)) {
			// do the random selection process to get an acta.
			let lookup_data = traversal_lookup[id];
			let current_map = lookup_data.map;
			let rand_key;
			for (let j=lookup_data.geo_index; j<GEO_HEADERS.length; j++) { // do random down to mesa level.
				let rand_keys = Object.keys(current_map.imp_children);
				let rand_index = Math.floor(Math.random() * rand_keys.length);
				
				// one day i'll figure a scheme for this, i suppose.
				/*let weights = Array(rand_keys.length);
				switch (j) {
					default:
						weights.fill(1);
				}
				rand_index = weighted_random(weights);*/
				
				rand_key = rand_keys[rand_index];
				current_map = current_map.imp_children[rand_key];
			}
			
			// ok, now we've got an acta.
			let rand_acta = current_map; // for clarity, since current_map is a random acta. (also, rand_key is really an acta id.)
			let imp_vote_table = saved_imp_vote_tables[rand_key];
			if (imp_vote_table === undefined) {
				imp_vote_table = [];
				for (let j=0; j<VOTE_HEADERS.length; j++) {
					imp_vote_table[j] = rand_acta[VOTE_HEADERS[j]];
				}
				saved_imp_vote_tables[rand_key] = imp_vote_table;
			}
			
			sim.add_poisson(acta, imp_vote_table, rand_acta[REGISTERED_VOTERS_HEADER]);
		}
		
		// post simulation!
		postMessage( {type: MSG_TYPE.SIM, data: sim.get_response_map()} );
	}
	
	postMessage( {type: MSG_TYPE.COMPLETED} );
		
	// giving firefox's gc a hand. doubt it matters.
	base_totals = null;
	real_totals = null;
	acta_map = null;
	excluded = null;
	traversal_lookup = null;
	saved_imp_vote_tables = null;
	unproject = null;
};
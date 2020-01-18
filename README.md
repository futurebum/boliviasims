<h3>A program for the simulation of vote tally sheets in the 2019 Bolivian General Election.</h3>

Uses the method described here:

http://cepr.net/publications/reports/bolivia-elections-2019-11

However, any arbitrary grouping of tally sheets can be simulated. I also provide a few pre-defined groups of tally sheets that have captured particular interest in the reports about the election.

(Note: My treatment of tally sheets from unfamiliar countries is very slightly different than the one from CEPR's report. Since CEPR's simulations were done on a single defined set of tally sheets - those verified after the TREP suspension - they knew about the one tally sheet from an unfamiliar country and, in effect, manually controlled for it. However, because my program simulates for any potential combination of tally sheets, it's not possible to manually handle those cases, so I simply chose to do the same random selection procedure, except on the whole tree of non-projected tally sheets.)

All the real vote totals are taken from the final cómputo spreadsheet, which is available here:

https://computo.oep.org.bo/PubResul/acta.2019.10.25.21.09.30.xlsx

<h4>Clarifications of Options</h4>

'Geographic Precision' => Only actas which will be simulated are those for which there are matching non-simulated actas at at least the specified level of greographic precision. For example, if there's a simulated acta from the precinct (<i>recinto</i>) 'Escuela #3 de 10' in the locality (<i>localidad</i>) 'Barrio de Fulano' in the municipality (<i>municipio</i>) 'Ciudad de Fulano' and the 'Geographic Precision' level is set to 'Only Recinto Matches' ('Only <i>Precinct</i> Matches'), then this acta will only be simulated if there are non-simulated actas from the same precinct ('Escuela #3 de 10'). If there aren't any, then the acta will not be simulated. This feature might be useful to get an idea of how much the simulation numbers are being skewed by imprecise, high-level matches, such as those simulated based on actas from the same país, which would make for extremely crude estimates.

'Imputation By' => If this is set to 'Acta' (<i>vote tally sheet</i>), then the simulator will use a random non-simulated acta from a random matching precinct and perform the simulation based on that. However, if it's set to 'Recinto' (<i>precinct</i>), then it will perform the simulation based on the total of all the votes from non-simulated actas in the random matching precinct, not just one of them.

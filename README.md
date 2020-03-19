<h3>A program for the simulation of vote tally sheets in the 2019 Bolivian General Election.</h3>

<h4>Method</h4>

Uses the naive 'random' method described here:

https://www.cepr.net/report/bolivia-elections-2019-11/

However, any arbitrary grouping of tally sheets can be simulated. I also provide a few pre-defined groups of tally sheets that have captured particular interest in the reports about the election.

<h4>Data</h4>

All the real vote totals are taken from the final cómputo spreadsheet, which is available here:

https://computo.oep.org.bo/PubResul/acta.2019.10.25.21.09.30.xlsx

<h4>Clarifications of Options</h4>

'Geographic Precision' => The only actas (<i>vote tally sheets</i>) which will be simulated are those for which there are matching non-simulated actas at at least the specified level of geographic precision. For example, if there's a simulated acta from the precinct (<i>recinto</i>) 'Escuela #3 de 10' in the locality (<i>localidad</i>) 'Barrio de Fulano' and the 'Geographic Precision' level is set to 'Only Recinto Matches' ('Only <i>Precinct</i> Matches'), then this acta will only be simulated if there are non-simulated actas from the same precinct ('Escuela #3 de 10'). If there aren't any, then the acta will not be simulated. This feature might be useful to get an idea of how much the simulation numbers are being skewed by imprecise matches, such as those done only at the country level, which would make for extremely crude estimates. In general, the 'Any Level' setting will attempt to perform all the simulations, no matter how crude the best matches are, whereas 'Only Recinto Matches' will only simulate the precinct-level matches, which will result in a more accurate estimate but it will only be an estimate of the actas with precinct-level matches. All other options are some intermediate point between these two extremes.

'Imputation By' => If this is set to 'Acta' (<i>vote tally sheet</i>), then after the simulator selects a random matching precinct, it will then randomly select an unsimulated acta from that precinct and impute the simulated acta's vote totals based on it. However, if it's set to 'Recinto' (<i>precinct</i>), then it will perform the imputation using the total of all the votes from non-simulated actas in that precinct, instead of using just one of them.

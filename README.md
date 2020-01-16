<h3>A program for the simulation of vote tally sheets in the 2019 Bolivian General Election.</h3>

Uses the method described here:

http://cepr.net/publications/reports/bolivia-elections-2019-11

However, any arbitrary grouping of tally sheets can be simulated. I also provide a few pre-defined groups of tally sheets that have captured particular interest in the reports about the election.

(Note: My treatment of tally sheets from unfamiliar countries is very slightly different than the one from CEPR's report. Since CEPR's simulations were done on a single defined set of tally sheets - those verified after the TREP suspension - they knew about the one tally sheet from an unfamiliar country [Colombia] and, in effect, manually controlled for it. However, because my program simulates for any potential combination of tally sheets, it's not possible to manually handle those cases, so I simply chose to do the same random precinct procedure, except on the whole tree of non-projected tally sheets.) 

All the real vote totals are taken from the final cómputo spreadsheet, which is available here:

https://computo.oep.org.bo/PubResul/acta.2019.10.25.21.09.30.xlsx

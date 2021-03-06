<h3>Programa para la proyección de actas de escrutinio de las elecciones generales bolivianas de 2019</h3>

<i>Página de simulacros <a href="https://futurebum.github.io/boliviasims/">aquí</a>.</i>

<h4>Método</h4>

Se utiliza el método aleatorio de este estudio:

https://www.cepr.net/report/que-sucedio-en-el-recuento-de-votos-de-las-elecciones-de-bolivia-de-2019/

Los valores de los simulacros son generados con base en <a href="https://en.wikipedia.org/wiki/Poisson_distribution#Generating_Poisson-distributed_random_variables">la distribución de Poisson</a>. Además, se puede proyectar cualquier agrupación de actas, aunque el campo de texto tiene límite de caracteres. También están predefinidos algunos grupos de actas que han captado especial interés en los análisis de las elecciones.

<h4>Datos</h4>

Todos los totales de votos reales son de la hoja de cálculo final del cómputo oficial que antes estaba disponible aquí:

<s>https://computo.oep.org.bo/PubResul/acta.2019.10.25.21.09.30.xlsx</s>

Sin embargo, hay una copia del mismo archivo en archive.org:

https://archive.org/download/election_bolivia_2019/reports_computo.zip/acta.2019.10.25.21.09.30.xlsx

<h4>Configuración</h4>

<i>Precisión Geográfica</i>: Las únicas actas que se proyectarán son aquellas que coincidan con actas no proyectadas del nivel especificado de precisión geográfica o mejor. Por ejemplo, si hay un acta proyectada del recinto 'Escuela #3 de 10' y el nivel de precisión geográfica está de 'Sólo Coincidencias de Recinto', entonces este acta sólo será proyectada si hay actas no proyectadas del mismo recinto, o sea 'Escuela #3 de 10'. De igual manera, si el nivel de precisión geográfica está de 'Sólo Coincidencias de Localidad o Mejor' y existen actas no simuladas de la misma localidad pero no hay ninguna del mismo recinto, este acta sí será proyectada con base en las actas no simuladas de la misma localidad. Esta opción podría ser útil para darse una idea del efecto de coincidencias imprecisas, como las a nivel de país, lo que produciría estimaciones extremadamente crudas. En general, con "Mejor Coincidencia" se intentará realizar todas las proyecciones, aunque sean de niveles muy altos, mientras que con "Sólo Coincidencias de Recinto" se limitará a proyectar las actas con coincidencias a nivel de recinto, lo que dará como resultado una estimación más precisa, pero será nomás una estimación de las actas con coincidencias a nivel de recinto. Todas las demás opciones representan puntos intermedios entre estos dos extremos.

<i>Prioritizar Mesas Cercanas</i>: En efecto, coincidencias a nivel de recinto se convertirán en coincidencias de las mesas más cercanas del mismo recinto. Esta cercanía será determinada en base al número de identificación de las mesas. Por ejemplo, si la mesa en cuestión es #51140 y las otras mesas no simuladas del mismo recinto son #51130, #51141, #51142, y #51150, entonces se elegirá la mesa #51141 (distancia: 1) como base para la proyección de #51140. De no haber #51141, entonces #51142 (distancia: 2) será escogida. Si existen dos mesas a la misma distancia de la mesa en cuestión, como ocurriría en el caso de #51130 y #51150 respecto a #51140, se elegirá al azar entre estas dos mesas para cada simulacro. Es una forma generalizada del concepto de 'mesas vecinas' de <a href=http://rchumace.econ.uchile.cl/papers/cmh.pdf>Rómulo Chumacero</a>, pero a decir verdad, quizá sería mejor ponderar por la distancia, en lugar de limitar las coincidencias a las 1-2 mesas más cercanas.

#!/usr/bin/env bash
set -euo pipefail
mkdir -p reports
bearer='.tools/bearer/bearer'
"$bearer" version > reports/bearer-version.txt
# Solo en la baseline se espera una salida distinta de cero por los hallazgos.
set +e
"$bearer" scan examples/vulnerable --format json --output reports/bearer-before.json --disable-version-check --hide-progress-bar
baseline_status=$?
set -e
if [[ "$baseline_status" != 1 ]]; then echo "Baseline: se esperaba código 1, recibido $baseline_status"; exit 1; fi
# La versión publicable debe pasar sin forzar el código de salida.
"$bearer" scan app --format json --output reports/bearer-after.json --disable-version-check --hide-progress-bar
"$bearer" scan app --format sarif --output reports/bearer-after.sarif --disable-version-check --hide-progress-bar

#!/usr/bin/env bash
set -euo pipefail
mkdir -p .tools/bearer
cd .tools/bearer
base='https://github.com/Bearer/bearer/releases/download/v2.1.1'
curl --fail --location --silent --show-error "$base/bearer_2.1.1_linux_amd64.tar.gz" -o bearer.tar.gz
curl --fail --location --silent --show-error "$base/checksums.txt" -o checksums.txt
grep 'bearer_2.1.1_linux_amd64.tar.gz$' checksums.txt | sed 's/bearer_2.1.1_linux_amd64.tar.gz/bearer.tar.gz/' | sha256sum --check -
tar -xzf bearer.tar.gz bearer
chmod +x bearer
./bearer version

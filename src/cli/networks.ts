#!/usr/bin/env node
/**
 * CLI for listing supported networks
 * Usage: crypto-networks
 */

export {}; // Make this a module

const { listNetworks } = require('../networks');

function run() {
  const networks = listNetworks();
  console.log(JSON.stringify(networks, null, 2));
}

run();

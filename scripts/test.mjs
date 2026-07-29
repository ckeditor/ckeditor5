#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * A minimal wrapper for running automated tests of the CKEditor 5 packages.
 *
 * It translates the shorthand package selection into pnpm filters and spawns the package
 * scripts with inherited standard streams:
 *
 *   pnpm test                        # Run tests of all packages in `packages/`.
 *   pnpm test -f core                # Run tests of the `ckeditor5-core` package.
 *   pnpm test -f editor-*,core       # Run tests of multiple packages (globs are allowed).
 *   pnpm test -c -f core             # Run the `coverage` script instead of `test`.
 *   pnpm test --attempts 3           # Retry each package's failed test run (used on CI).
 *   pnpm test -f core tests/editor   # Remaining arguments are passed to Vitest.
 *
 * The script is relative to the current working directory: the default (no `-f`) selection
 * covers the `packages/` directory of the repository it is executed in, while the `-f` option
 * selects packages by name across the whole pnpm workspace.
 *
 * The `ckeditor5` and `ckeditor5-premium-features` aggregate packages provide no tests for the
 * modules they re-export, so they always run the `test` script, even when `-c` is set.
 */

import { parseArgs } from 'node:util';
import { spawn, spawnSync } from 'node:child_process';

const USE_SHELL = process.platform === 'win32';

const KNOWN_OPTIONS = {
	filter: { type: 'string', short: 'f', multiple: true },
	coverage: { type: 'boolean', short: 'c' },
	attempts: { type: 'string' },
	help: { type: 'boolean', short: 'h' }
};

const args = process.argv.slice( 2 );

// The `strict` mode is disabled, as all options not defined in `KNOWN_OPTIONS` are passed to Vitest.
const { values, tokens } = parseArgs( {
	args,
	options: KNOWN_OPTIONS,
	strict: false,
	tokens: true,
	allowPositionals: true
} );

if ( values.help ) {
	printUsage();
	process.exit( 0 );
}

if ( ( values.filter || [] ).some( value => typeof value !== 'string' ) ) {
	console.error( 'Missing value for the "--filter" option. Usage: pnpm test -f <package>[,<package>...]' );
	process.exit( 1 );
}

const filters = ( values.filter || [] ).flatMap( value => value.split( ',' ) );
const packageScript = values.coverage ? 'coverage' : 'test';
const attempts = Number( values.attempts ) || 1;

// Arguments not consumed by the known options are passed to Vitest.
const consumedIndexes = new Set(
	tokens
		.filter( token => token.kind === 'option' && token.name in KNOWN_OPTIONS )
		.flatMap( token => token.inlineValue === false ? [ token.index, token.index + 1 ] : [ token.index ] )
);
const forwardedArgs = args.filter( ( arg, index ) => !consumedIndexes.has( index ) );

// The aggregate packages are published without the `@ckeditor` scope and provide no tests for
// the modules they re-export, so they are always run with the `test` script.
const AGGREGATE_PACKAGES = [ 'ckeditor5', 'ckeditor5-premium-features' ];

// Unscoped package names are resolved by pnpm, but name globs are matched against
// full names, so the selection is normalized to the `@ckeditor/ckeditor5-*` form.
const filterArgs = filters.length ?
	filters.map( value => {
		const packageName = value === 'ckeditor5' || value.startsWith( 'ckeditor5-' ) ? value : `ckeditor5-${ value }`;

		return AGGREGATE_PACKAGES.includes( packageName ) ? `--filter=${ packageName }` : `--filter=@ckeditor/${ packageName }`;
	} ) :
	[ '--filter=./packages/**' ];

// A selection matching no packages would otherwise succeed without running any tests
// (e.g. for a package name with a typo), so it is verified before spawning the test runs.
const selectedProjects = resolveSelectedPackages( filterArgs );
const selectedPackages = selectedProjects.map( project => project.name );
const packageDirs = new Map( selectedProjects.map( project => [ project.name, project.path ] ) );

if ( !selectedPackages.length ) {
	console.error( `No packages match the selection (${ filterArgs.join( ' ' ) }). Check the "--filter" values for typos.` );
	process.exit( 1 );
}

if ( attempts === 1 ) {
	runSpawnGroups( createSpawnGroups() );
} else {
	// With the retry mechanism enabled, each selected package is executed separately,
	// so a failure retries only the affected package instead of the whole selection.
	const failedPackages = [];

	for ( const packageName of selectedPackages ) {
		if ( !runPackageWithRetries( packageName ) ) {
			failedPackages.push( packageName );
		}
	}

	if ( failedPackages.length ) {
		console.error( `\nTests failed in the following packages:\n${ failedPackages.map( name => `- ${ name }` ).join( '\n' ) }` );
		process.exit( 1 );
	}
}

// A coverage run of a selection containing an aggregate package is split into separate `pnpm`
// runs, so the aggregate packages fall back to the plain `test` script.
function createSpawnGroups() {
	const aggregatePackages = selectedPackages.filter( name => AGGREGATE_PACKAGES.includes( name ) );

	if ( packageScript === 'test' || !aggregatePackages.length ) {
		return [ { script: packageScript, filterArgs } ];
	}

	const coveragePackages = selectedPackages.filter( name => !AGGREGATE_PACKAGES.includes( name ) );
	const groups = [ { script: 'test', filterArgs: aggregatePackages.map( name => `--filter=${ name }` ) } ];

	if ( coveragePackages.length ) {
		groups.unshift( { script: 'coverage', filterArgs: coveragePackages.map( name => `--filter=${ name }` ) } );
	}

	return groups;
}

function runSpawnGroups( groups, worstExitCode = 0 ) {
	if ( !groups.length ) {
		return process.exit( worstExitCode );
	}

	const [ group, ...remainingGroups ] = groups;

	const child = spawn( 'pnpm', [ '--workspace-concurrency=1', '--no-bail', ...group.filterArgs, 'run', group.script, ...forwardedArgs ], {
		stdio: 'inherit',
		shell: USE_SHELL
	} );

	child.on( 'error', error => {
		console.error( error.message );
		process.exit( 1 );
	} );

	child.on( 'close', exitCode => {
		runSpawnGroups( remainingGroups, worstExitCode || ( exitCode ?? 1 ) );
	} );
}

function resolveSelectedPackages( filterArgs ) {
	const result = spawnSync( 'pnpm', [ ...filterArgs, 'ls', '--depth', '-1', '--json' ], {
		encoding: 'utf-8',
		shell: USE_SHELL
	} );

	if ( result.status !== 0 ) {
		console.error( result.stderr || 'Could not resolve the selected packages.' );
		process.exit( 1 );
	}

	return JSON.parse( result.stdout )
		.map( ( { name, path } ) => ( { name, path } ) )
		.sort( ( a, b ) => a.name.localeCompare( b.name ) );
}

function runPackageWithRetries( packageName ) {
	const script = AGGREGATE_PACKAGES.includes( packageName ) ? 'test' : packageScript;

	const runArgs = [ '--run', script, ...( forwardedArgs.length ? [ '--', ...forwardedArgs ] : [] ) ];

	for ( let attempt = 1; attempt <= attempts; attempt++ ) {
		const result = spawnSync( 'node', runArgs, {
			cwd: packageDirs.get( packageName ),
			stdio: 'inherit',
			shell: USE_SHELL
		} );

		if ( result.status === 0 ) {
			return true;
		}

		if ( attempt < attempts ) {
			console.warn( `\n⚠️ Retrying tests of "${ packageName }". Remaining attempts: ${ attempts - attempt }.` );
		}
	}

	return false;
}

function printUsage() {
	console.log( [
		'Usage: pnpm test [options] [Vitest arguments]',
		'',
		'Options:',
		'  -f, --filter <packages>  Comma-separated short package names selecting the packages to test. Globs are allowed.',
		'  -c, --coverage           Run the "coverage" script of the selected packages instead of "test".',
		'      --attempts <number>  The number of attempts for each package\'s test run. Defaults to 1.',
		'  -h, --help               Show this help message.',
		'',
		'All remaining arguments are passed to Vitest (e.g. test file filters).'
	].join( '\n' ) );
}

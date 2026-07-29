/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { spawn, spawnSync } from 'node:child_process';

vi.mock( 'node:child_process' );

// Thrown by the `process.exit()` stub, so the script stops executing like in production.
class ExitError extends Error {
	constructor( exitCode ) {
		super( `Process exited with code ${ exitCode }.` );

		this.exitCode = exitCode;
	}
}

describe( 'scripts/test', () => {
	const originalArgv = process.argv;

	let spawnedProcess, consoleLogStub, consoleErrorStub, consoleWarnStub, processExitStub;

	beforeEach( () => {
		spawnedProcess = {
			callbacks: {},
			on( eventName, callback ) {
				this.callbacks[ eventName ] = callback;
			},
			emit( eventName, ...args ) {
				this.callbacks[ eventName ]( ...args );
			}
		};

		vi.mocked( spawn ).mockReturnValue( spawnedProcess );

		// The selection is verified with a `pnpm ls` call before spawning the test runs.
		vi.mocked( spawnSync ).mockReturnValue( {
			status: 0,
			stdout: JSON.stringify( [ { name: '@ckeditor/ckeditor5-core' } ] )
		} );

		consoleLogStub = vi.spyOn( console, 'log' ).mockImplementation( () => {} );
		consoleErrorStub = vi.spyOn( console, 'error' ).mockImplementation( () => {} );
		consoleWarnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
		processExitStub = vi.spyOn( process, 'exit' ).mockImplementation( exitCode => {
			throw new ExitError( exitCode );
		} );
	} );

	afterEach( () => {
		process.argv = originalArgv;
	} );

	async function runScript( cliArgs ) {
		process.argv = [ 'node', 'scripts/test.mjs', ...cliArgs ];

		vi.resetModules();

		await import( '../scripts/test.mjs' );
	}

	function getSpawnArgs() {
		return vi.mocked( spawn ).mock.calls[ 0 ][ 1 ];
	}

	it( 'runs the `test` script of all packages by default', async () => {
		await runScript( [] );

		expect( vi.mocked( spawn ) ).toHaveBeenCalledExactlyOnceWith(
			'pnpm',
			[ '--workspace-concurrency=1', '--no-bail', '--filter=./packages/**', 'run', 'test' ],
			expect.objectContaining( { stdio: 'inherit' } )
		);
	} );

	it( 'translates short package names into scoped pnpm filters', async () => {
		await runScript( [ '-f', 'core' ] );

		expect( getSpawnArgs() ).toContain( '--filter=@ckeditor/ckeditor5-core' );
		expect( getSpawnArgs() ).not.toContain( '--filter=./packages/**' );
	} );

	it( 'does not add the scope to the names of the aggregate packages', async () => {
		await runScript( [ '-f', 'ckeditor5,ckeditor5-premium-features,premium-features' ] );

		const spawnArgs = getSpawnArgs();

		expect( spawnArgs ).toContain( '--filter=ckeditor5' );
		expect( spawnArgs ).toContain( '--filter=ckeditor5-premium-features' );
		expect( spawnArgs ).not.toContain( '--filter=@ckeditor/ckeditor5-ckeditor5' );
		expect( spawnArgs ).not.toContain( '--filter=@ckeditor/ckeditor5-premium-features' );
	} );

	it( 'supports comma-separated values, globs, and full package names in the `--filter` option', async () => {
		await runScript( [ '--filter', 'editor-*,ckeditor5-core' ] );

		expect( getSpawnArgs() ).toContain( '--filter=@ckeditor/ckeditor5-editor-*' );
		expect( getSpawnArgs() ).toContain( '--filter=@ckeditor/ckeditor5-core' );
	} );

	it( 'runs the `coverage` script when the `--coverage` option is set', async () => {
		await runScript( [ '-c', '-f', 'core' ] );

		expect( getSpawnArgs() ).toContain( 'coverage' );
		expect( getSpawnArgs() ).not.toContain( 'test' );
	} );

	it( 'runs the `test` script of the aggregate packages even when the `--coverage` option is set', async () => {
		vi.mocked( spawnSync ).mockReturnValue( {
			status: 0,
			stdout: JSON.stringify( [ { name: 'ckeditor5' } ] )
		} );

		await runScript( [ '-c', '-f', 'ckeditor5' ] );

		expect( getSpawnArgs() ).toContain( 'test' );
		expect( getSpawnArgs() ).not.toContain( 'coverage' );
	} );

	it( 'splits a coverage run of a mixed selection and combines the exit codes', async () => {
		vi.mocked( spawnSync ).mockReturnValue( {
			status: 0,
			stdout: JSON.stringify( [ { name: '@ckeditor/ckeditor5-core' }, { name: 'ckeditor5' } ] )
		} );

		await runScript( [ '-c', '-f', 'core,ckeditor5' ] );

		// The feature packages run first with the `coverage` script.
		expect( vi.mocked( spawn ) ).toHaveBeenCalledTimes( 1 );
		expect( getSpawnArgs() ).toContain( '--filter=@ckeditor/ckeditor5-core' );
		expect( getSpawnArgs() ).toContain( 'coverage' );
		expect( getSpawnArgs() ).not.toContain( '--filter=ckeditor5' );

		spawnedProcess.emit( 'close', 4 );

		// Then the aggregate packages run with the `test` script.
		expect( vi.mocked( spawn ) ).toHaveBeenCalledTimes( 2 );

		const secondSpawnArgs = vi.mocked( spawn ).mock.calls[ 1 ][ 1 ];

		expect( secondSpawnArgs ).toContain( '--filter=ckeditor5' );
		expect( secondSpawnArgs ).toContain( 'test' );
		expect( secondSpawnArgs ).not.toContain( 'coverage' );

		// The worst exit code of both runs is propagated.
		expect( () => spawnedProcess.emit( 'close', 0 ) ).toThrow( ExitError );
		expect( processExitStub ).toHaveBeenCalledWith( 4 );
	} );

	it( 'passes remaining arguments to Vitest', async () => {
		await runScript( [ '-f', 'core', 'tests/editor', '--coverage.enabled=false' ] );

		const spawnArgs = getSpawnArgs();

		expect( spawnArgs.slice( -2 ) ).toEqual( [ 'tests/editor', '--coverage.enabled=false' ] );
	} );

	it( 'supports combined short flags', async () => {
		await runScript( [ '-cf', 'core' ] );

		expect( getSpawnArgs() ).toContain( 'coverage' );
		expect( getSpawnArgs() ).toContain( '--filter=@ckeditor/ckeditor5-core' );
	} );

	it( 'prints usage and exits when the `--help` option is set', async () => {
		await expect( runScript( [ '-h' ] ) ).rejects.toThrow( ExitError );

		expect( processExitStub ).toHaveBeenCalledWith( 0 );
		expect( consoleLogStub.mock.calls[ 0 ][ 0 ] ).toContain( 'Usage: pnpm test' );
		expect( vi.mocked( spawn ) ).not.toHaveBeenCalled();
	} );

	it( 'prints an error and exits when the `--filter` option has no value', async () => {
		await expect( runScript( [ '-f' ] ) ).rejects.toThrow( ExitError );

		expect( processExitStub ).toHaveBeenCalledWith( 1 );
		expect( consoleErrorStub.mock.calls[ 0 ][ 0 ] ).toContain( 'Missing value' );
		expect( vi.mocked( spawn ) ).not.toHaveBeenCalled();
	} );

	it( 'prints an error and exits when the selection matches no packages', async () => {
		vi.mocked( spawnSync ).mockReturnValue( { status: 0, stdout: '[]' } );

		await expect( runScript( [ '-f', 'coree' ] ) ).rejects.toThrow( ExitError );

		expect( processExitStub ).toHaveBeenCalledWith( 1 );
		expect( consoleErrorStub.mock.calls[ 0 ][ 0 ] ).toContain( 'No packages match the selection (--filter=@ckeditor/ckeditor5-coree)' );
		expect( vi.mocked( spawn ) ).not.toHaveBeenCalled();
	} );

	it( 'propagates the exit code of the spawned process', async () => {
		await runScript( [] );

		expect( () => spawnedProcess.emit( 'close', 3 ) ).toThrow( ExitError );
		expect( processExitStub ).toHaveBeenCalledWith( 3 );
	} );

	it( 'exits with an error when the spawned process emits an error', async () => {
		await runScript( [] );

		expect( () => spawnedProcess.emit( 'error', new Error( 'spawn ENOENT' ) ) ).toThrow( ExitError );
		expect( processExitStub ).toHaveBeenCalledWith( 1 );
		expect( consoleErrorStub.mock.calls[ 0 ][ 0 ] ).toContain( 'spawn ENOENT' );
	} );

	describe( 'retry mechanism (`--attempts`)', () => {
		function stubPackages( packageResults ) {
			vi.mocked( spawnSync ).mockImplementation( ( command, args, options ) => {
				if ( args.includes( 'ls' ) ) {
					return {
						status: 0,
						stdout: JSON.stringify(
							Object.keys( packageResults ).map( name => ( { name, path: `/workspace/${ name }` } ) )
						)
					};
				}

				const packageName = Object.keys( packageResults ).find( name => options.cwd === `/workspace/${ name }` );
				const results = packageResults[ packageName ];

				return { status: results.shift() };
			} );
		}

		it( 'executes each selected package separately', async () => {
			stubPackages( {
				'@ckeditor/ckeditor5-core': [ 0 ],
				'@ckeditor/ckeditor5-engine': [ 0 ]
			} );

			await runScript( [ '--attempts', '2' ] );

			// One `pnpm ls` call and one `node --run test` call per package.
			expect( vi.mocked( spawnSync ) ).toHaveBeenCalledTimes( 3 );
			expect( vi.mocked( spawn ) ).not.toHaveBeenCalled();
			expect( processExitStub ).not.toHaveBeenCalled();
		} );

		it( 'retries only the failed package and reports it when all attempts fail', async () => {
			stubPackages( {
				'@ckeditor/ckeditor5-core': [ 1, 1 ],
				'@ckeditor/ckeditor5-engine': [ 0 ]
			} );

			await expect( runScript( [ '--attempts', '2' ] ) ).rejects.toThrow( ExitError );

			// One `pnpm ls` call, two attempts for `core`, and a single attempt for `engine`.
			expect( vi.mocked( spawnSync ) ).toHaveBeenCalledTimes( 4 );
			expect( consoleWarnStub.mock.calls[ 0 ][ 0 ] ).toContain( 'Retrying tests of "@ckeditor/ckeditor5-core"' );
			expect( consoleErrorStub.mock.calls[ 0 ][ 0 ] ).toContain( '- @ckeditor/ckeditor5-core' );
			expect( consoleErrorStub.mock.calls[ 0 ][ 0 ] ).not.toContain( '- @ckeditor/ckeditor5-engine' );
			expect( processExitStub ).toHaveBeenCalledWith( 1 );
		} );

		it( 'exits with an error when the selection matches no packages', async () => {
			stubPackages( {} );

			await expect( runScript( [ '--attempts', '2', '-f', 'coree' ] ) ).rejects.toThrow( ExitError );

			expect( processExitStub ).toHaveBeenCalledWith( 1 );
			expect( consoleErrorStub.mock.calls[ 0 ][ 0 ] ).toContain( 'No packages match the selection' );
		} );

		it( 'runs the `test` script of the aggregate packages even when the `--coverage` option is set', async () => {
			stubPackages( {
				'@ckeditor/ckeditor5-core': [ 0 ],
				'ckeditor5': [ 0 ]
			} );

			await runScript( [ '--attempts', '2', '-c' ] );

			const runCalls = vi.mocked( spawnSync ).mock.calls
				.filter( ( [ , args ] ) => !args.includes( 'ls' ) )
				.map( ( [ command, args, options ] ) => [ command, ...args, options.cwd ] );

			expect( runCalls ).toEqual( [
				[ 'node', '--run', 'coverage', '/workspace/@ckeditor/ckeditor5-core' ],
				[ 'node', '--run', 'test', '/workspace/ckeditor5' ]
			] );
		} );

		it( 'passes when a retry succeeds', async () => {
			stubPackages( {
				'@ckeditor/ckeditor5-core': [ 1, 0 ]
			} );

			await runScript( [ '--attempts', '2' ] );

			expect( consoleWarnStub.mock.calls[ 0 ][ 0 ] ).toContain( 'Remaining attempts: 1' );
			expect( processExitStub ).not.toHaveBeenCalled();
		} );
	} );
} );

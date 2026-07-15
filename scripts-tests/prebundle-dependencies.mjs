/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import {
	collectPrebundledDependencies,
	prebundleDependencies
} from '../scripts/vitest/prebundle-dependencies.ts';

describe( 'prebundleDependencies', () => {
	let packageDir;
	let originalPrebundleFlag;

	beforeEach( () => {
		packageDir = mkdtempSync( join( tmpdir(), 'ckeditor5-prebundle-' ) );
		originalPrebundleFlag = process.env.CK_PREBUNDLE;
		process.env.CK_PREBUNDLE = '1';

		writePackage( packageDir, '@ckeditor/ckeditor5-tested', {
			dependencies: {
				'@ckeditor/ckeditor5-unused': 'workspace:*'
			},
			source: [
				'import \'@ckeditor/ckeditor5-used\';',
				'import type { TypeOnly } from \'@ckeditor/ckeditor5-type-only\';',
				'import \'third-party\';'
			].join( '\n' )
		} );
		writePackage( packageDir, '@ckeditor/ckeditor5-used', {
			dependencies: {
				'@ckeditor/ckeditor5-transitive': 'workspace:*'
			}
		} );
		writePackage( packageDir, '@ckeditor/ckeditor5-transitive' );
		writePackage( packageDir, '@ckeditor/ckeditor5-unused' );
		writePackage( packageDir, '@ckeditor/ckeditor5-type-only' );
		writePackage( packageDir, '@ckeditor/ckeditor5-test-only' );
		writePackage( packageDir, '@ckeditor/ckeditor5-utils' );
		writePackage( packageDir, 'third-party', { main: './index.js' } );

		mkdirSync( join( packageDir, 'tests', 'manual' ), { recursive: true } );
		writeFileSync( join( packageDir, 'tests', 'plugin.js' ), [
			'import \'@ckeditor/ckeditor5-test-only\';',
			'import \'@ckeditor/ckeditor5-utils/tests/_utils/utils.js\';'
		].join( '\n' ) );
		writeFileSync(
			join( packageDir, 'tests', 'manual', 'plugin.js' ),
			'import \'@ckeditor/ckeditor5-unused\';'
		);
	} );

	afterEach( () => {
		rmSync( packageDir, { recursive: true, force: true } );

		if ( originalPrebundleFlag === undefined ) {
			delete process.env.CK_PREBUNDLE;
		} else {
			process.env.CK_PREBUNDLE = originalPrebundleFlag;
		}
	} );

	it( 'starts the dependency graph from runtime imports in source and tests', () => {
		const dependencies = collectPrebundledDependencies(
			packageDir,
			JSON.parse( readPackageJson( packageDir ) )
		);

		expect( dependencies ).toEqual( {
			exclude: [ '@ckeditor/ckeditor5-tested' ],
			include: [
				'@ckeditor/ckeditor5-test-only',
				'@ckeditor/ckeditor5-transitive',
				'@ckeditor/ckeditor5-used',
				'@ckeditor/ckeditor5-utils',
				'@ckeditor/ckeditor5-utils/tests/_utils/utils.js',
				'third-party'
			]
		} );
	} );

	it( 'makes package-level exclusions take precedence over generated includes', () => {
		const plugin = prebundleDependencies( packageDir );
		const svgPlugin = { name: 'ckeditor5-raw-svg' };
		const config = {
			optimizeDeps: {
				exclude: [ '@ckeditor/ckeditor5-utils' ],
				rolldownOptions: {
					plugins: [ svgPlugin ]
				}
			}
		};

		expect( plugin.config.order ).toBe( 'pre' );

		plugin.config.handler( config );

		expect( config.optimizeDeps.exclude ).toContain( '@ckeditor/ckeditor5-utils' );
		expect( config.optimizeDeps.include ).not.toContain( '@ckeditor/ckeditor5-utils' );
		expect( config.optimizeDeps.include ).not.toContain( '@ckeditor/ckeditor5-utils/tests/_utils/utils.js' );
		expect( config.optimizeDeps.rolldownOptions.plugins ).toEqual( [ svgPlugin ] );
	} );

	it( 'reports parser errors with the affected file', () => {
		writeFileSync( join( packageDir, 'src', 'invalid.ts' ), 'import {' );

		expect( () => collectPrebundledDependencies(
			packageDir,
			JSON.parse( readPackageJson( packageDir ) )
		) ).toThrow( /invalid\.ts/ );
	} );
} );

function writePackage( testedPackageDir, name, options = {} ) {
	const packagePath = name === '@ckeditor/ckeditor5-tested' ?
		testedPackageDir :
		join( testedPackageDir, 'node_modules', ...name.split( '/' ) );
	const main = options.main ?? './src/index.ts';
	const mainPath = join( packagePath, main );

	mkdirSync( join( packagePath, 'src' ), { recursive: true } );
	mkdirSync( dirname( mainPath ), { recursive: true } );
	writeFileSync( mainPath, options.source ?? '' );
	writeFileSync( join( packagePath, 'package.json' ), JSON.stringify( {
		name,
		main,
		dependencies: options.dependencies
	} ) );
}

function readPackageJson( dir ) {
	return readFileSync( join( dir, 'package.json' ), 'utf-8' );
}

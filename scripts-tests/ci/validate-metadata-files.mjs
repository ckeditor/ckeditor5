/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock( 'fs-extra' );
vi.mock( 'glob' );
vi.mock( 'minimist' );

vi.mock( 'chalk', () => {
	const passthrough = text => text;

	return {
		default: {
			red: passthrough,
			green: passthrough,
			magenta: passthrough
		}
	};
} );

const ICONS_INDEX_CONTENT = [
	'export { default as IconBold } from \'../theme/icons/bold.svg\';',
	'export { default as IconItalic } from \'../theme/icons/italic.svg\';',
	'export { default as IconTable } from \'../theme/icons/table.svg\';'
].join( '\n' );

describe( 'scripts/ci/validate-metadata-files (iconName validation)', () => {
	let fs, glob, minimist;

	beforeEach( async () => {
		vi.resetModules();

		fs = await import( 'fs-extra' );
		glob = await import( 'glob' );
		minimist = ( await import( 'minimist' ) ).default;

		vi.mocked( minimist ).mockReturnValue( { cwd: '/repo' } );

		vi.spyOn( console, 'log' ).mockImplementation( () => {} );
		vi.spyOn( process, 'exit' ).mockImplementation( () => {} );
	} );

	function setupPackage( { packageName, metadata, indexContent } ) {
		vi.mocked( glob.glob ).mockResolvedValue( [ `/repo/packages/${ packageName }` ] );

		vi.mocked( fs.default.readJSON ).mockImplementation( async path => {
			if ( path.endsWith( 'package.json' ) ) {
				return { main: 'src/index.ts' };
			}

			if ( path.endsWith( 'ckeditor5-metadata.json' ) ) {
				return metadata;
			}
		} );

		vi.mocked( fs.default.exists ).mockResolvedValue( true );

		vi.mocked( fs.default.readFile ).mockImplementation( async path => {
			if ( path.includes( 'index.ts' ) || path.includes( 'index.js' ) ) {
				return indexContent || `export { default as ${ metadata.plugins[ 0 ].className } } from './plugin';`;
			}
		} );

		vi.mocked( fs.default.readFileSync ).mockImplementation( path => {
			if ( path.includes( 'ckeditor5-icons' ) ) {
				return ICONS_INDEX_CONTENT;
			}
		} );
	}

	it( 'should pass when iconName matches a valid export from ckeditor5-icons', async () => {
		setupPackage( {
			packageName: 'ckeditor5-basic-styles',
			metadata: {
				plugins: [ {
					name: 'Bold',
					className: 'Bold',
					uiComponents: [ {
						type: 'Button',
						name: 'bold',
						iconName: 'IconBold'
					} ]
				} ]
			}
		} );

		await import( '../../scripts/ci/validate-metadata-files.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'Validation successful' ) );
	} );

	it( 'should fail when iconName is not a valid export from ckeditor5-icons', async () => {
		setupPackage( {
			packageName: 'ckeditor5-basic-styles',
			metadata: {
				plugins: [ {
					name: 'Bold',
					className: 'Bold',
					uiComponents: [ {
						type: 'Button',
						name: 'bold',
						iconName: 'IconNonExistent'
					} ]
				} ]
			}
		} );

		await import( '../../scripts/ci/validate-metadata-files.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith(
			expect.stringContaining( 'Invalid icon names' )
		);
		expect( console.log ).toHaveBeenCalledWith(
			expect.stringContaining( 'IconNonExistent' )
		);
	} );

	it( 'should fail when iconName is an empty string', async () => {
		setupPackage( {
			packageName: 'ckeditor5-basic-styles',
			metadata: {
				plugins: [ {
					name: 'Bold',
					className: 'Bold',
					uiComponents: [ {
						type: 'Button',
						name: 'bold',
						iconName: ''
					} ]
				} ]
			}
		} );

		await import( '../../scripts/ci/validate-metadata-files.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith(
			expect.stringContaining( 'empty `iconName` value' )
		);
	} );

	it( 'should pass when uiComponent has no iconName (undefined)', async () => {
		setupPackage( {
			packageName: 'ckeditor5-basic-styles',
			metadata: {
				plugins: [ {
					name: 'Bold',
					className: 'Bold',
					uiComponents: [ {
						type: 'Button',
						name: 'bold'
					} ]
				} ]
			}
		} );

		await import( '../../scripts/ci/validate-metadata-files.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'Validation successful' ) );
	} );

	it( 'should pass when plugin has no uiComponents array', async () => {
		setupPackage( {
			packageName: 'ckeditor5-image',
			metadata: {
				plugins: [ {
					name: 'ImageUtils',
					className: 'ImageUtils'
				} ]
			}
		} );

		await import( '../../scripts/ci/validate-metadata-files.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'Validation successful' ) );
	} );
} );

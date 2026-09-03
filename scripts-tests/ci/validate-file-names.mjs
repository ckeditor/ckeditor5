/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const COMMERCIAL_PATH = '/home/user/ckeditor5-commercial';
const CKEDITOR5_PATH = `${ COMMERCIAL_PATH }/external/ckeditor5`;

vi.mock( 'node:child_process' );

// Read through getters from a mutable holder, so a test can point the script at another checkout layout.
// A per-test module mock would not do: its registration survives `vi.resetModules()` and leaks onward.
const { constants } = vi.hoisted( () => ( {
	constants: {}
} ) );

vi.mock( '../../scripts/constants.mjs', () => ( {
	get CKEDITOR5_ROOT_PATH() {
		return constants.CKEDITOR5_ROOT_PATH;
	},
	get CKEDITOR5_COMMERCIAL_PATH() {
		return constants.CKEDITOR5_COMMERCIAL_PATH;
	},
	get IS_ISOLATED_REPOSITORY() {
		return constants.IS_ISOLATED_REPOSITORY;
	}
} ) );

// Only `styleText()` is replaced, so the rest of `node:util` keeps working. Bold text is wrapped in
// asterisks, so the assertions can pin down which part of a reported path the script highlights.
vi.mock( 'node:util', async importOriginal => ( {
	...await importOriginal(),

	styleText: ( format, text ) => [ format ].flat().includes( 'bold' ) ? `**${ text }**` : text
} ) );

const SCRIPT_PATH = '../../scripts/ci/validate-file-names.mjs';

describe( 'scripts/ci/validate-file-names', () => {
	let execFileSync;

	beforeEach( async () => {
		vi.resetModules();

		( { execFileSync } = await import( 'node:child_process' ) );

		setTrackedFilePaths( [] );

		setConstants( {
			CKEDITOR5_ROOT_PATH: CKEDITOR5_PATH,
			CKEDITOR5_COMMERCIAL_PATH: COMMERCIAL_PATH,
			IS_ISOLATED_REPOSITORY: false
		} );

		vi.spyOn( console, 'log' ).mockImplementation( () => {} );
		vi.spyOn( process, 'exit' ).mockImplementation( () => {} );
	} );

	// Everything the script printed, so one assertion can cover a list of reported paths.
	function getOutput() {
		return vi.mocked( console.log ).mock.calls.map( ( [ message ] ) => message ).join( '\n' );
	}

	// `git ls-files -z` separates paths with NUL and terminates the last one with it.
	function setTrackedFilePaths( filePaths ) {
		vi.mocked( execFileSync ).mockReturnValue( filePaths.map( filePath => `${ filePath }\0` ).join( '' ) );
	}

	function setConstants( values ) {
		Object.assign( constants, values );
	}

	describe( 'the validated repository', () => {
		it( 'should list the files of the commercial repository when nested in its "external" directory', async () => {
			await import( SCRIPT_PATH );

			expect( execFileSync ).toHaveBeenCalledWith(
				'git',
				[ 'ls-files', '-z' ],
				expect.objectContaining( { cwd: COMMERCIAL_PATH } )
			);
		} );

		it( 'should list the files of this repository when it is checked out on its own', async () => {
			setConstants( {
				CKEDITOR5_ROOT_PATH: '/home/user/ckeditor5',
				CKEDITOR5_COMMERCIAL_PATH: '/home/user',
				IS_ISOLATED_REPOSITORY: true
			} );

			await import( SCRIPT_PATH );

			expect( execFileSync ).toHaveBeenCalledWith(
				'git',
				[ 'ls-files', '-z' ],
				expect.objectContaining( { cwd: '/home/user/ckeditor5' } )
			);
		} );
	} );

	describe( 'names that follow the convention', () => {
		it( 'should pass when every tracked name is safe', async () => {
			setTrackedFilePaths( [
				'docs/features/images.md',
				'packages/ckeditor5-image/src/image.ts',
				'docs/assets/img/sample_image-1.v2.png'
			] );

			await import( SCRIPT_PATH );

			expect( process.exit ).not.toHaveBeenCalled();
			expect( getOutput() ).toContain( 'Validation successful.' );
		} );

		it( 'should pass when the repository has no tracked files', async () => {
			setTrackedFilePaths( [] );

			await import( SCRIPT_PATH );

			expect( process.exit ).not.toHaveBeenCalled();
			expect( getOutput() ).toContain( 'Validation successful.' );
		} );

		it( 'should allow dot files and dot directories', async () => {
			setTrackedFilePaths( [
				'.github/workflows/sync-to-core.yml',
				'.circleci/config.yml',
				'.gitignore'
			] );

			await import( SCRIPT_PATH );

			expect( process.exit ).not.toHaveBeenCalled();
			expect( getOutput() ).toContain( 'Validation successful.' );
		} );
	} );

	describe( 'names that break the convention', () => {
		it( 'should report a file name containing a space', async () => {
			setTrackedFilePaths( [ 'docs/assets/sample image.png' ] );

			await import( SCRIPT_PATH );

			expect( process.exit ).toHaveBeenCalledWith( 1 );
			expect( getOutput() ).toContain( ' - docs/assets/**sample image.png**' );
		} );

		it( 'should report a file name containing a typographic dash', async () => {
			setTrackedFilePaths( [
				'docs/features/en–dash.md',
				'docs/features/em—dash.md'
			] );

			await import( SCRIPT_PATH );

			expect( process.exit ).toHaveBeenCalledWith( 1 );
			expect( getOutput() ).toContain( ' - docs/features/**en–dash.md**' );
			expect( getOutput() ).toContain( ' - docs/features/**em—dash.md**' );
		} );

		// Also guards the order of `ALLOWED_CHARACTERS`: the short dash must stay first or last, or it
		// becomes a character range that silently accepts most of these.
		it( 'should report a file name containing a character reserved in a URL', async () => {
			const names = [
				'a#b', 'a?b', 'a%b', 'a&b', 'a=b', 'a;b', 'a:b', 'a+b', 'a,b',
				'a|b', 'a<b', 'a>b', 'a[b', 'a]b', 'a^b', 'a@b', 'a b'
			];

			setTrackedFilePaths( names.map( name => `docs/${ name }.md` ) );

			await import( SCRIPT_PATH );

			expect( process.exit ).toHaveBeenCalledWith( 1 );

			for ( const name of names ) {
				expect( getOutput() ).toContain( ` - docs/**${ name }.md**` );
			}
		} );

		it( 'should report a file name containing a national character', async () => {
			setTrackedFilePaths( [ 'docs/features/zażółć.md' ] );

			await import( SCRIPT_PATH );

			expect( process.exit ).toHaveBeenCalledWith( 1 );
			expect( getOutput() ).toContain( ' - docs/features/**zażółć.md**' );
		} );

		// A backslash is a legal character in a name on a POSIX file system. Normalizing the paths would
		// rewrite it into a separator, which splits one invalid name into two valid segments.
		it( 'should report a file name containing a backslash', async () => {
			setTrackedFilePaths( [ 'docs/features/back\\slash.md' ] );

			await import( SCRIPT_PATH );

			expect( process.exit ).toHaveBeenCalledWith( 1 );
			expect( getOutput() ).toContain( ' - docs/features/**back\\slash.md**' );
		} );

		it( 'should report a directory name once when several files share it', async () => {
			setTrackedFilePaths( [
				'docs/my assets/first.png',
				'docs/my assets/second.png',
				'docs/my assets/third.png'
			] );

			await import( SCRIPT_PATH );

			expect( process.exit ).toHaveBeenCalledWith( 1 );
			expect( getOutput().match( /- docs\/\*\*my assets\*\*$/gm ) ).toHaveLength( 1 );
		} );

		it( 'should report both the directory and the file when both break the convention', async () => {
			setTrackedFilePaths( [ 'docs/my assets/sample image.png' ] );

			await import( SCRIPT_PATH );

			expect( process.exit ).toHaveBeenCalledWith( 1 );
			expect( getOutput() ).toContain( ' - docs/**my assets**\n' );
			expect( getOutput() ).toContain( ' - docs/my assets/**sample image.png**' );
		} );

		it( 'should report the names as not meeting the naming guidelines', async () => {
			setTrackedFilePaths( [ 'docs/assets/sample image.png' ] );

			await import( SCRIPT_PATH );

			expect( getOutput() ).toContain( 'The following files and directories do not meet the naming guidelines:' );
		} );

		it( 'should list the allowed characters', async () => {
			setTrackedFilePaths( [ 'docs/assets/sample image.png' ] );

			await import( SCRIPT_PATH );

			expect( getOutput() ).toContain( 'Allowed characters: a-z A-Z 0-9 . _ -' );
		} );

		it( 'should highlight only the offending name, not the directories leading to it', async () => {
			setTrackedFilePaths( [ 'docs/features/assets/sample image.png' ] );

			await import( SCRIPT_PATH );

			expect( getOutput() ).toContain( ' - docs/features/assets/**sample image.png**' );
		} );

		it( 'should highlight a name that has no directories above it', async () => {
			setTrackedFilePaths( [ 'sample image.png' ] );

			await import( SCRIPT_PATH );

			expect( getOutput() ).toContain( ' - **sample image.png**' );
		} );

		it( 'should not report the successful validation message', async () => {
			setTrackedFilePaths( [ 'docs/assets/sample image.png' ] );

			await import( SCRIPT_PATH );

			expect( getOutput() ).not.toContain( 'Validation successful.' );
		} );
	} );

	describe( 'failures', () => {
		it( 'should fail when the tracked files cannot be listed', async () => {
			vi.mocked( execFileSync ).mockImplementation( () => {
				throw new Error( 'not a git repository' );
			} );

			await expect( import( SCRIPT_PATH ) ).rejects.toThrow( 'not a git repository' );
		} );
	} );
} );

/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, beforeEach, afterEach */

'use strict';

const chai = require( 'chai' );
const sinon = require( 'sinon' );
const expect = chai.expect;
const tools = require( '../../lib/tools' );
const path = require( 'path' );
const fs = require( 'fs' );
let sandbox;

describe( 'utils', () => {
	beforeEach( () => {
		sandbox = sinon.sandbox.create();
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	describe( 'tools', () => {
		describe( 'shExec', () => {
			it( 'should be defined', () => expect( tools.shExec ).to.be.a( 'function' ) );

			it( 'should execute command', () => {
				const sh = require( 'shelljs' );
				const execStub = sandbox.stub( sh, 'exec' ).returns( { code: 0 } );

				tools.shExec( 'command' );

				sinon.assert.calledOnce( execStub );
			} );

			it( 'should throw error on unsuccessful call', () => {
				const sh = require( 'shelljs' );
				const execStub = sandbox.stub( sh, 'exec' ).returns( { code: 1 } );

				expect( () => {
					tools.shExec( 'command' );
				} ).to.throw();
				sinon.assert.calledOnce( execStub );
			} );

			it( 'should output using log functions', () => {
				const sh = require( 'shelljs' );
				const execStub = sandbox.stub( sh, 'exec' ).returns( { code: 0, stdout: 'out', stderr: 'err' } );

				sandbox.stub( console, 'log' );

				tools.shExec( 'command' );

				sinon.assert.calledOnce( execStub );
				sinon.assert.calledTwice( console.log );
			} );

			it( 'should not log when in silent mode', () => {
				const sh = require( 'shelljs' );
				const execStub = sandbox.stub( sh, 'exec' ).returns( { code: 0, stdout: 'out', stderr: 'err' } );
				const log = require( '../../lib/log' );
				const outFn = sandbox.spy();
				const errFn = sandbox.spy();
				log.configure( outFn, errFn );

				tools.shExec( 'command', false );

				sinon.assert.calledOnce( execStub );
				sinon.assert.notCalled( outFn );
				sinon.assert.notCalled( errFn );
			} );

			it( 'should not log if no output from executed command', () => {
				const sh = require( 'shelljs' );
				const execStub = sandbox.stub( sh, 'exec' ).returns( { code: 0, stdout: '', stderr: '' } );
				const log = require( '../../lib/log' );
				const outFn = sandbox.spy();
				const errFn = sandbox.spy();
				log.configure( outFn, errFn );

				tools.shExec( 'command' );

				sinon.assert.calledOnce( execStub );
				sinon.assert.notCalled( outFn );
				sinon.assert.notCalled( errFn );
			} );
		} );

		describe( 'linkDirectories', () => {
			it( 'should be defined', () => expect( tools.linkDirectories ).to.be.a( 'function' ) );

			it( 'should link directories', () => {
				const isSymlinkStub = sandbox.stub( tools, 'isSymlink' ).returns( false );
				const isDirectoryStub = sandbox.stub( tools, 'isDirectory' ).returns( false );
				const symlinkStub = sandbox.stub( fs, 'symlinkSync' );
				const source = '/source/dir';
				const destination = '/destination/dir';

				tools.linkDirectories( source, destination );

				expect( isDirectoryStub.calledOnce ).to.equal( true );
				expect( isSymlinkStub.calledOnce ).to.equal( true );
				expect( symlinkStub.calledOnce ).to.equal( true );
				expect( symlinkStub.firstCall.args[ 0 ] ).to.equal( source );
				expect( symlinkStub.firstCall.args[ 1 ] ).to.equal( destination );
			} );

			it( 'should remove destination directory before linking', () => {
				const shExecStub = sandbox.stub( tools, 'shExec' );
				const isSymlinkStub = sandbox.stub( tools, 'isSymlink' ).returns( false );
				const isDirectoryStub = sandbox.stub( tools, 'isDirectory' ).returns( true );
				const symlinkStub = sandbox.stub( fs, 'symlinkSync' );
				const source = '/source/dir';
				const destination = '/destination/dir';

				tools.linkDirectories( source, destination );

				expect( isDirectoryStub.calledOnce ).to.equal( true );
				expect( isSymlinkStub.calledOnce ).to.equal( true );
				expect( shExecStub.calledOnce ).to.equal( true );
				expect( symlinkStub.firstCall.args[ 0 ] ).to.equal( source );
				expect( symlinkStub.firstCall.args[ 1 ] ).to.equal( destination );
			} );

			it( 'should unlink destination directory if symlink', () => {
				const shExecStub = sandbox.stub( tools, 'shExec' );
				const isSymlinkStub = sandbox.stub( tools, 'isSymlink' ).returns( true );
				const removeSymlinkStub = sandbox.stub( tools, 'removeSymlink' );
				const isDirectoryStub = sandbox.stub( tools, 'isDirectory' ).returns( true );
				const symlinkStub = sandbox.stub( fs, 'symlinkSync' );
				const source = '/source/dir';
				const destination = '/destination/dir';

				tools.linkDirectories( source, destination );

				expect( isDirectoryStub.notCalled ).to.equal( true );
				expect( isSymlinkStub.calledOnce ).to.equal( true );
				expect( shExecStub.notCalled ).to.equal( true );
				expect( removeSymlinkStub.calledOnce ).to.equal( true );
				expect( removeSymlinkStub.firstCall.args[ 0 ] ).to.equal( destination );
				expect( symlinkStub.firstCall.args[ 0 ] ).to.equal( source );
				expect( symlinkStub.firstCall.args[ 1 ] ).to.equal( destination );
			} );
		} );

		describe( 'getCKEditorDependencies', () => {
			it( 'should be defined', () => expect( tools.getCKEditorDependencies ).to.be.a( 'function' ) );

			it( 'should return null if no CKEditor5 repository is found', () => {
				const dependencies = {
					'plugin1': '',
					'plugin2': '',
					'plugin3': ''
				};
				expect( tools.getCKEditorDependencies( dependencies ) ).to.equal( null );
				expect( tools.getCKEditorDependencies() ).to.equal( null );
			} );

			it( 'should return only ckeditor5- dependencies', () => {
				const dependencies = {
					'plugin1': '',
					'ckeditor5-plugin-image': 'ckeditor/ckeditor5-plugin-image',
					'plugin2': '',
					'ckeditor5-core': 'ckeditor/ckeditor5-core'
				};
				const ckeditorDependencies = tools.getCKEditorDependencies( dependencies );

				expect( ckeditorDependencies ).to.be.an( 'object' );
				expect( ckeditorDependencies.plugin1 ).to.be.a( 'undefined' );
				expect( ckeditorDependencies.plugin2 ).to.be.a( 'undefined' );
				expect( ckeditorDependencies[ 'ckeditor5-plugin-image' ] ).to.be.a( 'string' );
				expect( ckeditorDependencies[ 'ckeditor5-core' ] ).to.be.a( 'string' );
			} );
		} );

		describe( 'getDirectories', () => {
			it( 'should be defined', () => expect( tools.getDirectories ).to.be.a( 'function' ) );

			it( 'should get directories in specified path', () => {
				const fs = require( 'fs' );
				const directories = [ 'dir1', 'dir2', 'dir3' ];
				const readdirSyncStub = sandbox.stub( fs, 'readdirSync', () => directories );
				const isDirectoryStub = sandbox.stub( tools, 'isDirectory' ).returns( true );
				const dirPath = 'path';

				tools.getDirectories( dirPath );

				expect( readdirSyncStub.calledOnce ).to.equal( true );
				expect( isDirectoryStub.calledThrice ).to.equal( true );
				expect( isDirectoryStub.firstCall.args[ 0 ] ).to.equal( path.join( dirPath, directories[ 0 ] ) );
				expect( isDirectoryStub.secondCall.args[ 0 ] ).to.equal( path.join( dirPath, directories[ 1 ] ) );
				expect( isDirectoryStub.thirdCall.args[ 0 ] ).to.equal( path.join( dirPath, directories[ 2 ] ) );
			} );
		} );

		describe( 'isDirectory', () => {
			it( 'should be defined', () => expect( tools.isDirectory ).to.be.a( 'function' ) );

			it( 'should return true if path points to directory', () => {
				const fs = require( 'fs' );
				const statSyncStub = sandbox.stub( fs, 'statSync', () => ( { isDirectory: () => true } ) );
				const path = 'path';

				const result = tools.isDirectory( path );

				expect( statSyncStub.calledOnce ).to.equal( true );
				expect( statSyncStub.firstCall.args[ 0 ] ).to.equal( path );
				expect( result ).to.equal( true );
			} );

			it( 'should return false if path does not point to directory', () => {
				const fs = require( 'fs' );
				const statSyncStub = sandbox.stub( fs, 'statSync', () => ( { isDirectory: () => false } ) );
				const path = 'path';

				const result = tools.isDirectory( path );

				expect( statSyncStub.calledOnce ).to.equal( true );
				expect( statSyncStub.firstCall.args[ 0 ] ).to.equal( path );
				expect( result ).to.equal( false );
			} );

			it( 'should return false if statSync method throws', () => {
				const fs = require( 'fs' );
				const statSyncStub = sandbox.stub( fs, 'statSync' ).throws();
				const path = 'path';

				const result = tools.isDirectory( path );

				expect( statSyncStub.calledOnce ).to.equal( true );
				expect( statSyncStub.firstCall.args[ 0 ] ).to.equal( path );
				expect( result ).to.equal( false );
			} );
		} );

		describe( 'isFile', () => {
			it( 'should be defined', () => expect( tools.isFile ).to.be.a( 'function' ) );

			it( 'should return true if path points to file', () => {
				const fs = require( 'fs' );
				const statSyncStub = sandbox.stub( fs, 'statSync', () => ( { isFile: () => true } ) );
				const path = 'path';

				const result = tools.isFile( path );

				expect( statSyncStub.calledOnce ).to.equal( true );
				expect( statSyncStub.firstCall.args[ 0 ] ).to.equal( path );
				expect( result ).to.equal( true );
			} );

			it( 'should return false if path does not point to directory', () => {
				const fs = require( 'fs' );
				const statSyncStub = sandbox.stub( fs, 'statSync', () => ( { isFile: () => false } ) );
				const path = 'path';

				const result = tools.isFile( path );

				expect( statSyncStub.calledOnce ).to.equal( true );
				expect( statSyncStub.firstCall.args[ 0 ] ).to.equal( path );
				expect( result ).to.equal( false );
			} );

			it( 'should return false if statSync method throws', () => {
				const fs = require( 'fs' );
				const statSyncStub = sandbox.stub( fs, 'statSync' ).throws();
				const path = 'path';

				const result = tools.isFile( path );

				expect( statSyncStub.calledOnce ).to.equal( true );
				expect( statSyncStub.firstCall.args[ 0 ] ).to.equal( path );
				expect( result ).to.equal( false );
			} );
		} );

		describe( 'isSymlink', () => {
			it( 'should return true if path points to symbolic link', () => {
				const path = 'path/to/file';
				const fs = require( 'fs' );
				sandbox.stub( fs, 'lstatSync' ).returns( {
					isSymbolicLink: () => true
				} );

				expect( tools.isSymlink( path ) ).to.equal( true );
			} );

			it( 'should return false if lstatSync throws', () => {
				const path = 'path/to/file';
				const fs = require( 'fs' );
				sandbox.stub( fs, 'lstatSync' ).throws();

				expect( tools.isSymlink( path ) ).to.equal( false );
			} );
		} );

		describe( 'getCKE5Directories', () => {
			it( 'should be defined', () => expect( tools.getCKE5Directories ).to.be.a( 'function' ) );

			it( 'should return only ckeditor5 directories', () => {
				const workspacePath = '/workspace/path';
				const sourceDirectories = [ 'tools', 'ckeditor5', 'ckeditor5-core', '.bin', 'ckeditor5-plugin-image' ];
				sandbox.stub( tools, 'getDirectories', () => sourceDirectories );
				const directories = tools.getCKE5Directories( workspacePath );

				expect( directories.length ).equal( 2 );
				expect( directories[ 0 ] ).equal( 'ckeditor5-core' );
				expect( directories[ 1 ] ).equal( 'ckeditor5-plugin-image' );
			} );
		} );

		describe( 'updateJSONFile', () => {
			it( 'should be defined', () => expect( tools.updateJSONFile ).to.be.a( 'function' ) );
			it( 'should read, update and save JSON file', () => {
				const path = 'path/to/file.json';
				const fs = require( 'fs' );
				const readFileStub = sandbox.stub( fs, 'readFileSync', () => '{}' );
				const modifiedJSON = { modified: true };
				const writeFileStub = sandbox.stub( fs, 'writeFileSync' );

				tools.updateJSONFile( path, () => {
					return modifiedJSON;
				} );

				expect( readFileStub.calledOnce ).to.equal( true );
				expect( readFileStub.firstCall.args[ 0 ] ).to.equal( path );
				expect( writeFileStub.calledOnce ).to.equal( true );
				expect( writeFileStub.firstCall.args[ 0 ] ).to.equal( path );
				expect( writeFileStub.firstCall.args[ 1 ] ).to.equal( JSON.stringify( modifiedJSON, null, 2 ) + '\n' );
			} );
		} );

		describe( 'sortObject', () => {
			it( 'should be defined', () => expect( tools.sortObject ).to.be.a( 'function' ) );
			it( 'should reinsert object properties in alphabetical order', () => {
				let obj = {
					c: '', d: '', a: '', z: ''
				};

				const sorted = {
					a: '', c: '', d: '', z: ''
				};

				obj = tools.sortObject( obj );

				expect( JSON.stringify( obj ) ).to.equal( JSON.stringify( sorted ) );
			} );
		} );

		describe( 'readPackageName', () => {
			const modulePath = 'path/to/module';
			it( 'should read package name from NPM module', () => {
				sandbox.stub( tools, 'isFile' ).returns( true );
				const fs = require( 'fs' );
				const name = 'module-name';
				sandbox.stub( fs, 'readFileSync' ).returns( JSON.stringify( { name: name } ) );

				const result = tools.readPackageName( modulePath );

				expect( result ).to.equal( name );
			} );

			it( 'should return null if no package.json is found', () => {
				sandbox.stub( tools, 'isFile' ).returns( false );

				const result = tools.readPackageName( modulePath );

				expect( result ).to.equal( null );
			} );

			it( 'should return null if no name in package.json is provided', () => {
				sandbox.stub( tools, 'isFile' ).returns( true );
				const fs = require( 'fs' );
				sandbox.stub( fs, 'readFileSync' ).returns( JSON.stringify( { } ) );

				const result = tools.readPackageName( modulePath );

				expect( result ).to.equal( null );
			} );
		} );

		describe( 'npmInstall', () => {
			it( 'should be defined', () => expect( tools.npmInstall ).to.be.a( 'function' ) );
			it( 'should execute npm install command', () => {
				const shExecStub = sandbox.stub( tools, 'shExec' );
				const path = '/path/to/repository';

				tools.npmInstall( path );

				expect( shExecStub.calledOnce ).to.equal( true );
				expect( shExecStub.firstCall.args[ 0 ] ).to.equal( `cd ${ path } && npm install` );
			} );
		} );

		describe( 'npmUpdate', () => {
			it( 'should be defined', () => expect( tools.npmUpdate ).to.be.a( 'function' ) );
			it( 'should execute npm update command', () => {
				const shExecStub = sandbox.stub( tools, 'shExec' );
				const path = '/path/to/repository';

				tools.npmUpdate( path );

				expect( shExecStub.calledOnce ).to.equal( true );
				expect( shExecStub.firstCall.args[ 0 ] ).to.equal( `cd ${ path } && npm update --dev` );
			} );
		} );

		describe( 'npmUninstall', () => {
			it( 'should be defined', () => expect( tools.npmUninstall ).to.be.a( 'function' ) );
			it( 'should execute npm uninstall command', () => {
				const shExecStub = sandbox.stub( tools, 'shExec' );
				const path = '/path/to/repository';
				const moduleName = 'module-name';

				tools.npmUninstall( path, moduleName );

				expect( shExecStub.calledOnce ).to.equal( true );
				expect( shExecStub.firstCall.args[ 0 ] ).to.equal( `cd ${ path } && npm uninstall ${ moduleName }` );
			} );
		} );

		describe( 'copyTemplateFiles', () => {
			it( 'should be defined', () => expect( tools.copyTemplateFiles ).to.be.a( 'function' ) );
			it( 'should copy files and replace provided texts', () => {
				const path = require( 'path' );
				const fs = require( 'fs-extra' );

				const readFileStub = sandbox.stub( fs, 'readFileSync' );
				readFileStub.onFirstCall().returns( 'file data {{var1}}, {{var2}}' );
				readFileStub.onSecondCall().returns( '{{var1}}, {{var2}}, {{var2}}{{var1}}' );

				const writeFileStub = sandbox.stub( fs, 'writeFileSync' );
				const ensureDirStub = sandbox.stub( fs, 'ensureDirSync' );
				const sources = [ '/path/to/file1.md', '/path/to/file2.md' ];
				const destination = '/destination/path';

				tools.copyTemplateFiles( sources, destination, {
					'{{var1}}': 'foo',
					'{{var2}}': 'bar'
				} );

				sinon.assert.calledWithExactly( ensureDirStub, destination );
				sinon.assert.calledTwice( readFileStub );
				sinon.assert.calledWithExactly( readFileStub.firstCall, sources[ 0 ], 'utf8' );
				sinon.assert.calledWithExactly( readFileStub.secondCall, sources[ 1 ], 'utf8' );
				sinon.assert.calledTwice( writeFileStub );
				let savePath = path.join( destination, path.basename( sources[ 0 ] ) );
				sinon.assert.calledWithExactly( writeFileStub.firstCall, savePath, 'file data foo, bar', 'utf8' );
				savePath = path.join( destination, path.basename( sources[ 1 ] ) );
				sinon.assert.calledWithExactly( writeFileStub.secondCall, savePath, 'foo, bar, barfoo', 'utf8' );
			} );
		} );

		describe( 'getGitUrlFromNpm', () => {
			const repository = {
				type: 'git',
				url: 'git@github.com:ckeditor/ckeditor5-core'
			};
			const moduleName = 'ckeditor5-core';

			it( 'should be defined', () => expect( tools.getGitUrlFromNpm ).to.be.a( 'function' ) );
			it( 'should call npm view command', () => {
				const shExecStub = sandbox.stub( tools, 'shExec', () => {
					return JSON.stringify( repository );
				} );
				const url = tools.getGitUrlFromNpm( moduleName );

				expect( shExecStub.calledOnce ).to.equal( true );
				expect( shExecStub.firstCall.args[ 0 ] ).to.equal( `npm view ${ moduleName } repository --json` );
				expect( url ).to.equal( repository.url );
			} );

			it( 'should return null if module is not found', () => {
				sandbox.stub( tools, 'shExec' ).throws( new Error( 'npm ERR! code E404' ) );
				const url = tools.getGitUrlFromNpm( moduleName );
				expect( url ).to.equal( null );
			} );

			it( 'should return null if module has no repository information', () => {
				sandbox.stub( tools, 'shExec' ).returns( JSON.stringify( {} ) );
				const url = tools.getGitUrlFromNpm( moduleName );
				expect( url ).to.equal( null );
			} );

			it( 'should throw on other errors', () => {
				const error = new Error( 'Random error.' );
				sandbox.stub( tools, 'shExec' ).throws( error );
				const getUrlSpy = sandbox.spy( tools, 'getGitUrlFromNpm' );

				try {
					tools.getGitUrlFromNpm( moduleName );
				} catch ( e ) {}

				expect( getUrlSpy.threw( error ) ).to.equal( true );
			} );
		} );

		describe( 'getCKE5Symlinks', () => {
			it( 'should return CKE5 symlinks from provided path', () => {
				const fs = require( 'fs' );
				const path = 'path/to/dir';
				sandbox.stub( fs, 'readdirSync' ).returns( [ 'ckeditor5-core', 'ckeditor5-image', 'other-dependency' ] );
				sandbox.stub( tools, 'isSymlink' ).returns( true );

				const symlinks = tools.getCKE5Symlinks( path );
				expect( symlinks.length ).to.equal( 2 );
				expect( symlinks[ 0 ] ).to.equal( 'ckeditor5-core' );
				expect( symlinks[ 1 ] ).to.equal( 'ckeditor5-image' );
			} );
		} );

		describe( 'removeSymlink', () => {
			it( 'should unlink provided symlink', () => {
				const fs = require( 'fs' );
				const unlinkStub = sandbox.stub( fs, 'unlinkSync' );
				const path = 'path/to/symlink';

				tools.removeSymlink( path );

				expect( unlinkStub.calledOnce ).to.equal( true );
				expect( unlinkStub.firstCall.args[ 0 ] ).to.equal( path );
			} );
		} );
	} );
} );

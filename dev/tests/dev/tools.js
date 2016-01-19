/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, beforeEach, afterEach */

'use strict';

const chai = require( 'chai' );
const sinon = require( 'sinon' );
const expect = chai.expect;
const tools = require( '../../tasks/dev/utils/tools' );
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
		} );

		describe( 'linkDirectories', () => {
			it( 'should be defined', () => expect( tools.linkDirectories ).to.be.a( 'function' ) );

			it( 'should link directories', () => {
				const isDirectoryStub = sandbox.stub( tools, 'isDirectory' ).returns( false );
				const symlinkStub = sandbox.stub( fs, 'symlinkSync' );
				const source = '/source/dir';
				const destination = '/destination/dir';

				tools.linkDirectories( source, destination );

				expect( isDirectoryStub.calledOnce ).to.equal( true );
				expect( symlinkStub.calledOnce ).to.equal( true );
				expect( symlinkStub.firstCall.args[ 0 ] ).to.equal( source );
				expect( symlinkStub.firstCall.args[ 1 ] ).to.equal( destination );
			} );

			it( 'should remove destination directory before linking', () => {
				const shExecStub = sandbox.stub( tools, 'shExec' );
				const isDirectoryStub = sandbox.stub( tools, 'isDirectory' ).returns( true );
				const symlinkStub = sandbox.stub( fs, 'symlinkSync' );
				const source = '/source/dir';
				const destination = '/destination/dir';

				tools.linkDirectories( source, destination );

				expect( isDirectoryStub.calledOnce ).to.equal( true );
				expect( shExecStub.calledOnce ).to.equal( true );
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
				expect( writeFileStub.firstCall.args[ 1 ] ).to.equal( JSON.stringify( modifiedJSON, null, 2 ) );
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
				expect( shExecStub.firstCall.args[ 0 ] ).to.equal( `cd ${ path } && npm update` );
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

		describe( 'copy', () => {
			it( 'should be defined', () => expect( tools.copy ).to.be.a( 'function' ) );
			it( 'should copy files', () => {
				const fs = require( 'fs-extra' );
				const path = require( 'path' );
				let destination = 'destination';
				let file = 'file.js';
				sandbox.stub( fs, 'ensureDirSync' );
				const copyStub = sandbox.stub( fs, 'copySync' );
				sandbox.stub( tools, 'isFile', () => true );
				sandbox.stub( tools, 'isDirectory', () => false );

				tools.copy( [ file ], destination );

				file = path.resolve( file );
				destination = path.join( path.resolve( destination ), path.basename( file ) );

				sinon.assert.calledOnce( copyStub );
				sinon.assert.calledWithExactly( copyStub.firstCall, file, destination );
			} );

			it( 'should copy directories', () => {
				const fs = require( 'fs-extra' );
				const path = require( 'path' );
				let destination = 'destination';
				let dir = 'source';
				sandbox.stub( fs, 'ensureDirSync' );
				const copyStub = sandbox.stub( fs, 'copySync' );
				sandbox.stub( tools, 'isFile', () => false );
				sandbox.stub( tools, 'isDirectory', () => true );

				tools.copy( [ dir ], destination );

				dir = path.resolve( dir );
				destination = path.resolve( destination );

				sinon.assert.calledOnce( copyStub );
				sinon.assert.calledWithExactly( copyStub.firstCall, dir, destination );
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
	} );
} );

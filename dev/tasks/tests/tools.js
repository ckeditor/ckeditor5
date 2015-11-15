/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';
/* global describe, it, beforeEach, afterEach */

const chai = require( 'chai' );
const sinon = require( 'sinon' );
const expect = chai.expect;
const tools = require( '../utils/tools' );
const path = require( 'path' );
let toRestore;

describe( 'utils', () => {
	beforeEach( () => toRestore = [] );

	afterEach( () => {
		toRestore.forEach( item => item.restore() );
	} );

	describe( 'tools', () => {
		describe( 'linkDirectories', () => {
			it( 'should be defined', () => expect( tools.linkDirectories ).to.be.a( 'function' ) );

			it( 'should run link commands', () => {
				const shExecStub = sinon.stub( tools, 'shExec' );
				const isDirectoryStub = sinon.stub( tools, 'isDirectory' ).returns( false );
				const source = '/source/dir';
				const destination = '/destination/dir';
				toRestore.push( shExecStub, isDirectoryStub );

				tools.linkDirectories( source, destination );

				expect( isDirectoryStub.calledOnce ).to.equal( true );
				expect( shExecStub.calledOnce ).to.equal( true );
				expect( shExecStub.firstCall.args[ 0 ] ).to.equal( `ln -s ${ source } ${ destination }` );
			} );

			it( 'should remove destination directory before linking', () => {
				const shExecStub = sinon.stub( tools, 'shExec' );
				const isDirectoryStub = sinon.stub( tools, 'isDirectory' ).returns( true );
				const source = '/source/dir';
				const destination = '/destination/dir';
				toRestore.push( shExecStub, isDirectoryStub );

				tools.linkDirectories( source, destination );

				expect( isDirectoryStub.calledOnce ).to.equal( true );
				expect( shExecStub.calledTwice ).to.equal( true );
				expect( shExecStub.firstCall.args[ 0 ] ).to.equal( `rm -rf ${ destination }` );
				expect( shExecStub.secondCall.args[ 0 ] ).to.equal( `ln -s ${ source } ${ destination }` );
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
				const readdirSyncStub = sinon.stub( fs, 'readdirSync', () => directories );
				const isDirectoryStub = sinon.stub( tools, 'isDirectory' ).returns( true );
				const dirPath = 'path';
				toRestore.push( readdirSyncStub, isDirectoryStub );

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
				const statSyncStub = sinon.stub( fs, 'statSync', () => ( { isDirectory: () => true } ) );
				const path = 'path';
				toRestore.push( statSyncStub );

				const result = tools.isDirectory( path );

				expect( statSyncStub.calledOnce ).to.equal( true );
				expect( statSyncStub.firstCall.args[ 0 ] ).to.equal( path );
				expect( result ).to.equal( true );
			} );

			it( 'should return false if path does not point to directory', () => {
				const fs = require( 'fs' );
				const statSyncStub = sinon.stub( fs, 'statSync', () => ( { isDirectory: () => false } ) );
				const path = 'path';
				toRestore.push( statSyncStub );

				const result = tools.isDirectory( path );

				expect( statSyncStub.calledOnce ).to.equal( true );
				expect( statSyncStub.firstCall.args[ 0 ] ).to.equal( path );
				expect( result ).to.equal( false );
			} );

			it( 'should return false if statSync method throws', () => {
				const fs = require( 'fs' );
				const statSyncStub = sinon.stub( fs, 'statSync' ).throws();
				const path = 'path';
				toRestore.push( statSyncStub );

				const result = tools.isDirectory( path );

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
				const getDirectoriesStub = sinon.stub( tools, 'getDirectories', () => sourceDirectories );
				toRestore.push( getDirectoriesStub );
				const directories = tools.getCKE5Directories( workspacePath );

				expect( directories.length ).equal( 2 );
				expect( directories[ 0 ] ).equal( 'ckeditor5-core' );
				expect( directories[ 1 ] ).equal( 'ckeditor5-plugin-image' );
			} );
		} );
	} );
} );

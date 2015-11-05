/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';
/* global describe, it, beforeEach, afterEach */

var chai = require( 'chai' );
var sinon = require( 'sinon' );
var expect = chai.expect;
var tools = require( '../utils/tools' );
var toRestore;

describe( 'utils', function() {
	beforeEach( function() {
		toRestore = [];
	} );

	afterEach( function() {
		toRestore.forEach( function( item ) {
			item.restore();
		} );
	} );

	describe( 'tools', function() {
		describe( 'cloneRepository', function() {
			it( 'should be defined', function() {
				expect( tools.cloneRepository ).to.be.a( 'function' );
			} );

			it( 'should run clone repository commands', function( ) {
				var shExecStub = sinon.stub( tools, 'shExec' );
				var name = 'test';
				var gitHubUrl = 'ckeditor/test';
				var destination = '/destination/dir';
				toRestore.push( shExecStub );

				tools.cloneRepository( name, gitHubUrl, destination );
				expect( shExecStub.calledOnce ).to.equal( true );
				expect( shExecStub.firstCall.args[ 0 ] ).to.equal( 'cd ' + destination + ' && git clone git@github.com:' + gitHubUrl );
			} );

			it( 'should checkout proper commit/branch if provided', function() {
				var shExecStub = sinon.stub( tools, 'shExec' );
				var name = 'test';
				var url = 'ckeditor/test';
				var branch = 'branch';
				var gitHubUrl = url + '#' + branch;
				var destination = '/destination/dir';
				toRestore.push( shExecStub );

				tools.cloneRepository( name, gitHubUrl, destination );
				expect( shExecStub.calledOnce ).to.equal( true );
				expect( shExecStub.firstCall.args[ 0 ] ).to.equal(
					'cd ' + destination + ' && ' +
					'git clone git@github.com:' + url + ' && ' +
					'cd ' + name + ' && ' +
					'git checkout ' + branch
				);
			} );
		} );

		describe( 'npmLink', function() {
			it( 'should be defined', function() {
				expect( tools.cloneRepository ).to.be.a( 'function' );
			} );

			it( 'should run npm link commands', function( ) {
				var shExecStub = sinon.stub( tools, 'shExec' );
				var source = '/source/dir';
				var destination = '/destination/dir';
				var pluginName = 'ckeditor5-plugin-name';
				var isWin = process.platform == 'win32';
				var linkCommands = [
					'cd ' + source,
					( !isWin ? 'sudo ' : '' ) + 'npm link',
					'cd ' + destination,
					'npm link ' + pluginName
				];
				toRestore.push( shExecStub );

				tools.npmLink( source, destination, pluginName );
				expect( shExecStub.calledOnce ).to.equal( true );
				expect( shExecStub.firstCall.args[ 0 ] ).to.equal( linkCommands.join( ' && ' ) );
			} );
		} );

		describe( 'getCKEditorDependencies', function() {
			it( 'should be defined', function() {
				expect( tools.getCKEditorDependencies ).to.be.a( 'function' );
			} );

			it( 'should return null if no CKEditor5 repository is found', function() {
				var dependencies = {
					'plugin1': '',
					'plugin2': '',
					'plugin3': ''
				};
				expect( tools.getCKEditorDependencies( dependencies ) ).to.equal( null );
			} );

			it( 'should return only ckeditor5- dependencies', function() {
				var dependencies = {
					'plugin1': '',
					'ckeditor5-plugin-image': 'ckeditor/ckeditor5-plugin-image',
					'plugin2': '',
					'ckeditor5-core': 'ckeditor/ckeditor5-core'
				};

				var ckeditorDependencies = tools.getCKEditorDependencies( dependencies );

				expect( ckeditorDependencies ).to.be.an( 'object' );
				expect( ckeditorDependencies.plugin1 ).to.be.a( 'undefined' );
				expect( ckeditorDependencies.plugin2 ).to.be.a( 'undefined' );
				expect( ckeditorDependencies[ 'ckeditor5-plugin-image' ] ).to.be.a( 'string' );
				expect( ckeditorDependencies[ 'ckeditor5-core' ] ).to.be.a( 'string' );
			} );
		} );

		describe( 'getCKE5Directories', function() {
			it( 'should return only ckeditor5 directories', function() {
				var workspacePath = '/workspace/path';
				var getDirectoriesStub = sinon.stub( tools, 'getDirectories', function() {
					return [ 'tools', 'ckeditor5', 'ckeditor5-core', '.bin', 'ckeditor5-plugin-image' ];
				} );
				toRestore.push( getDirectoriesStub );
				var directories = tools.getCKE5Directories( workspacePath );

				expect( directories.length ).equal( 3 );
				expect( directories[ 0 ] ).equal( 'ckeditor5' );
				expect( directories[ 1 ] ).equal( 'ckeditor5-core' );
				expect( directories[ 2 ] ).equal( 'ckeditor5-plugin-image' );
			} );
		} );

		describe( 'initDevWorkspace', function() {
			it( 'should get ckeditor5- dependencies, clone repositories and link them', function() {
				var path = require( 'path' );
				var getDependenciesSpy = sinon.spy( tools, 'getCKEditorDependencies' );
				var cloneRepositoryStub = sinon.stub( tools, 'cloneRepository' );
				var npmLinkStub = sinon.stub( tools, 'npmLink' );
				var ckeditor5Path = process.cwd();
				var workspacePath = path.join( ckeditor5Path, '..' );
				var dependencies, keys;
				toRestore.push( getDependenciesSpy, cloneRepositoryStub, npmLinkStub );

				tools.initDevWorkspace( workspacePath, ckeditor5Path, function() {} );
				expect( getDependenciesSpy.calledOnce ).to.equal( true );
				dependencies = getDependenciesSpy.firstCall.returnValue;

				if ( dependencies ) {
					keys = Object.keys( dependencies );

					// All repositories were cloned.
					expect( cloneRepositoryStub.callCount ).to.equal( keys.length );

					// All repositories were linked.
					expect( npmLinkStub.callCount ).to.equal( keys.length );

					// Check clone and link parameters.
					keys.forEach( function( key, i ) {
						expect( cloneRepositoryStub.getCall( i ).args[0] ).equal( key );
						expect( cloneRepositoryStub.getCall( i ).args[1] ).equal( dependencies[ key ] );
						expect( cloneRepositoryStub.getCall( i ).args[2] ).equal( workspacePath );

						expect( npmLinkStub.getCall( i ).args[0] ).equal( path.join( workspacePath, key ) );
						expect( npmLinkStub.getCall( i ).args[1] ).equal( ckeditor5Path );
						expect( npmLinkStub.getCall( i ).args[2] ).equal( key );
					} );
				}
			} );
		} );

		describe( 'getWorkspaceStatus', function() {
			it( 'should get all repositories status', function() {
				var path = require( 'path' );
				var workspacePath = '/workspace/path/';
				var directories = [ 'ckeditor5', 'ckeditor5-core' ];
				var log = sinon.spy();

				// Stub methods for test purposes.
				var getCKE5DirectoriesStub = sinon.stub( tools, 'getCKE5Directories', function() {
					return directories;
				} );
				var getGitStatusStub = sinon.stub( tools, 'getGitStatus', function() {
					return 'status';
				} );
				toRestore.push( getCKE5DirectoriesStub, getGitStatusStub );

				tools.getWorkspaceStatus( workspacePath, log );
				expect( getCKE5DirectoriesStub.calledOnce ).equal( true );
				expect( log.callCount ).equal( directories.length );
				expect( getGitStatusStub.callCount ).equal( directories.length );

				// Check if status was called for proper directory.
				for ( var i = 0; i < getGitStatusStub.callCount; i++ ) {
					expect( getGitStatusStub.getCall( i ).args[0] ).equals( path.join( workspacePath, directories[ i ] ) );
				}
			} );
		} );
	} );
} );

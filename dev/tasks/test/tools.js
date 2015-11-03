/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';
/* global describe, it */

var chai = require( 'chai' );
var sinon = require( 'sinon' );
var expect = chai.expect;
var tools = require( '../utils/tools' );

describe( 'utils', function() {
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

				tools.cloneRepository( name, gitHubUrl, destination );
				shExecStub.restore();

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

				tools.cloneRepository( name, gitHubUrl, destination );
				shExecStub.restore();

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

				tools.npmLink( source, destination, pluginName );
				shExecStub.restore();

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
	} );
} );

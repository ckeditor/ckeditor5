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
const inquiries = require( '../../tasks/dev/utils/inquiries' );
const git = require( '../../tasks/dev/utils/git' );
const path = require( 'path' );

describe( 'dev-plugin-create', () => {
	const emptyFn = () => { };
	let spies;

	const mainRepositoryPath = '/path/to/repository';
	const workspaceRoot = '..';
	const workspacePath = path.join( mainRepositoryPath, workspaceRoot );
	const pluginName = 'plugin-name';
	const pluginVersion = '0.0.1';
	const gitHubUrl = 'ckeditor5/plugin-name';

	beforeEach( () => createSpies() );
	afterEach( () => restoreSpies() );

	function createSpies() {
		spies = {
			linkDirectories: sinon.stub( tools, 'linkDirectories' ),
			npmInstall: sinon.stub( tools, 'npmInstall' ),
			getPluginName: sinon.stub( inquiries, 'getPluginName' ).returns( new Promise( ( r ) => r( pluginName ) ) ),
			getPluginVersion: sinon.stub( inquiries, 'getPluginVersion' ).returns( new Promise( ( r ) => r( pluginVersion ) ) ),
			getPluginGitHubUrl: sinon.stub( inquiries, 'getPluginGitHubUrl' ).returns( new Promise( ( r ) => r( gitHubUrl ) ) ),
			initializeRepository: sinon.stub( git, 'initializeRepository' ),
			updateJSONFile: sinon.stub( tools, 'updateJSONFile' ),
			copy: sinon.stub( tools, 'copy' ),
			initialCommit: sinon.stub( git, 'initialCommit' )
		};
	}

	function restoreSpies() {
		for ( let spy in spies ) {
			spies[ spy ].restore();
		}
	}

	const pluginCreateTask = require( '../../tasks/dev/tasks/dev-plugin-create' );
	const repositoryPath = path.join( workspacePath, pluginName );

	it( 'should exist', () => expect( pluginCreateTask ).to.be.a( 'function' ) );

	it( 'should create a plugin', () => {
		return pluginCreateTask( mainRepositoryPath, workspaceRoot, emptyFn ).then( () => {
			expect( spies.getPluginName.calledOnce ).to.equal( true );
			expect( spies.getPluginVersion.calledOnce ).to.equal( true );
			expect( spies.getPluginGitHubUrl.calledOnce ).to.equal( true );
			expect( spies.initializeRepository.calledOnce ).to.equal( true );
			expect( spies.initializeRepository.firstCall.args[ 0 ] ).to.equal( repositoryPath );
			expect( spies.copy.called ).to.equal( true );
			expect( spies.updateJSONFile.calledTwice ).to.equal( true );
			expect( spies.updateJSONFile.firstCall.args[ 0 ] ).to.equal( path.join( repositoryPath, 'package.json' ) );
			let updateFn = spies.updateJSONFile.firstCall.args[ 1 ];
			let json = updateFn( {} );
			expect( json.name ).to.equal( pluginName );
			expect( json.version ).to.equal( pluginVersion );
			expect( spies.updateJSONFile.secondCall.args[ 0 ] ).to.equal( path.join( mainRepositoryPath, 'package.json' ) );
			updateFn = spies.updateJSONFile.secondCall.args[ 1 ];
			json = updateFn( {} );
			expect( json.dependencies ).to.be.an( 'object' );
			expect( json.dependencies[ pluginName ] ).to.equal( gitHubUrl );
			expect( spies.initialCommit.calledOnce ).to.equal( true );
			expect( spies.initialCommit.firstCall.args[ 0 ] ).to.equal( pluginName );
			expect( spies.initialCommit.firstCall.args[ 1 ] ).to.equal( repositoryPath );
			expect( spies.linkDirectories.calledOnce ).to.equal( true );
			expect( spies.linkDirectories.firstCall.args[ 0 ] ).to.equal( repositoryPath );
			expect( spies.linkDirectories.firstCall.args[ 1 ] ).to.equal( path.join( mainRepositoryPath, 'node_modules', pluginName ) );
			expect( spies.npmInstall.calledOnce ).to.equal( true );
			expect( spies.npmInstall.firstCall.args[ 0 ] ).to.equal( repositoryPath );
		} );
	} );
} );

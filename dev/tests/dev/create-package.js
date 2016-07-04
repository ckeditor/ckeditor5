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
const inquiries = require( '../../tasks/dev/utils/inquiries' );
const git = require( '../../lib/git' );
const path = require( 'path' );

describe( 'dev-create-package', () => {
	let spies;

	const mainRepositoryPath = '/path/to/repository';
	const workspaceRoot = '..';
	const workspacePath = path.join( mainRepositoryPath, workspaceRoot );
	const packageName = 'package-name';
	const applicationName = 'Full application name';
	const packageVersion = '0.0.1';
	const gitHubPath = 'ckeditor5/package-name';
	const packageDescription = 'Package description.';

	beforeEach( () => createSpies() );
	afterEach( () => restoreSpies() );

	function createSpies() {
		spies = {
			linkDirectories: sinon.stub( tools, 'linkDirectories' ),
			npmInstall: sinon.stub( tools, 'npmInstall' ),
			getPackageName: sinon.stub( inquiries, 'getPackageName' ).returns( new Promise( ( r ) => r( packageName ) ) ),
			getApplicationName: sinon.stub( inquiries, 'getApplicationName' ).returns( new Promise( ( r ) => r( applicationName ) ) ),
			getPackageVersion: sinon.stub( inquiries, 'getPackageVersion' ).returns( new Promise( ( r ) => r( packageVersion ) ) ),
			getPackageGitHubPath: sinon.stub( inquiries, 'getPackageGitHubPath' ).returns( new Promise( ( r ) => r( gitHubPath ) ) ),
			getPackageDescription: sinon.stub( inquiries, 'getPackageDescription' ).returns( new Promise( ( r ) => r( packageDescription ) ) ),
			initializeRepository: sinon.stub( git, 'initializeRepository' ),
			updateJSONFile: sinon.stub( tools, 'updateJSONFile' ),
			copy: sinon.stub( tools, 'copyTemplateFiles' ),
			initialCommit: sinon.stub( git, 'initialCommit' ),
			addRemote: sinon.stub( git, 'addRemote' )
		};
	}

	function restoreSpies() {
		for ( let spy in spies ) {
			spies[ spy ].restore();
		}
	}

	const packageCreateTask = require( '../../tasks/dev/tasks/create-package' );
	const repositoryPath = path.join( workspacePath, packageName );

	it( 'should exist', () => expect( packageCreateTask ).to.be.a( 'function' ) );

	it( 'should create a package', () => {
		return packageCreateTask( mainRepositoryPath, workspaceRoot ).then( () => {
			expect( spies.getPackageName.calledOnce ).to.equal( true );
			expect( spies.getApplicationName.calledOnce ).to.equal( true );
			expect( spies.getPackageVersion.calledOnce ).to.equal( true );
			expect( spies.getPackageGitHubPath.calledOnce ).to.equal( true );
			expect( spies.getPackageDescription.calledOnce ).to.equal( true );
			expect( spies.initializeRepository.calledOnce ).to.equal( true );
			expect( spies.initializeRepository.firstCall.args[ 0 ] ).to.equal( repositoryPath );
			expect( spies.addRemote.calledOnce ).to.equal( true );
			expect( spies.addRemote.firstCall.args[ 0 ] ).to.equal( repositoryPath );
			expect( spies.addRemote.firstCall.args[ 1 ] ).to.equal( gitHubPath );
			expect( spies.copy.called ).to.equal( true );
			expect( spies.updateJSONFile.calledTwice ).to.equal( true );
			expect( spies.updateJSONFile.firstCall.args[ 0 ] ).to.equal( path.join( repositoryPath, 'package.json' ) );
			let updateFn = spies.updateJSONFile.firstCall.args[ 1 ];
			let json = updateFn( {} );
			expect( json.name ).to.equal( packageName );
			expect( json.version ).to.equal( packageVersion );
			expect( spies.updateJSONFile.secondCall.args[ 0 ] ).to.equal( path.join( mainRepositoryPath, 'package.json' ) );
			updateFn = spies.updateJSONFile.secondCall.args[ 1 ];
			json = updateFn( {} );
			expect( json.dependencies ).to.be.an( 'object' );
			expect( json.dependencies[ packageName ] ).to.equal( gitHubPath );
			expect( spies.initialCommit.calledOnce ).to.equal( true );
			expect( spies.initialCommit.firstCall.args[ 0 ] ).to.equal( packageName );
			expect( spies.initialCommit.firstCall.args[ 1 ] ).to.equal( repositoryPath );
			expect( spies.linkDirectories.calledOnce ).to.equal( true );
			expect( spies.linkDirectories.firstCall.args[ 0 ] ).to.equal( repositoryPath );
			expect( spies.linkDirectories.firstCall.args[ 1 ] ).to.equal( path.join( mainRepositoryPath, 'node_modules', packageName ) );
			expect( spies.npmInstall.calledOnce ).to.equal( true );
			expect( spies.npmInstall.firstCall.args[ 0 ] ).to.equal( repositoryPath );
		} );
	} );
} );

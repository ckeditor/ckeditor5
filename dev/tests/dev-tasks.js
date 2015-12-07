/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, beforeEach, afterEach */

'use strict';

const chai = require( 'chai' );
const sinon = require( 'sinon' );
const expect = chai.expect;
const tools = require( '../tasks/utils/tools' );
const inquiries = require( '../tasks/utils/inquiries' );
const git = require( '../tasks/utils/git' );
const path = require( 'path' );
const emptyFn = () => { };
let spies;

describe( 'dev-tasks', () => {
	const mainRepositoryPath = '/path/to/repository';
	const workspaceRoot = '..';
	const workspacePath = path.join( mainRepositoryPath, workspaceRoot );
	const pluginName = 'plugin-name';
	const repositoryPath = path.join( workspacePath, pluginName );
	const pluginVersion = '0.0.1';
	const gitHubUrl = 'ckeditor5/plugin-name';

	beforeEach( () => createSpies() );
	afterEach( () => restoreSpies() );

	function createSpies() {
		spies = {
			getDependencies: sinon.spy( tools, 'getCKEditorDependencies' ),
			getDirectories: sinon.stub( tools, 'getCKE5Directories', () => [] ),
			parseRepositoryUrl: sinon.spy( git, 'parseRepositoryUrl' ),
			cloneRepository: sinon.stub( git, 'cloneRepository' ),
			linkDirectories: sinon.stub( tools, 'linkDirectories' ),
			pull: sinon.stub( git, 'pull' ),
			checkout: sinon.stub( git, 'checkout' ),
			npmInstall: sinon.stub( tools, 'npmInstall' ),
			installGitHooks: sinon.stub( tools, 'installGitHooks' ),
			getPluginName: sinon.stub( inquiries, 'getPluginName' ).returns( new Promise( ( r ) => r( pluginName ) ) ),
			getPluginVersion: sinon.stub( inquiries, 'getPluginVersion' ).returns( new Promise( ( r ) => r( pluginVersion ) ) ),
			getPluginGitHubUrl: sinon.stub( inquiries, 'getPluginGitHubUrl' ).returns( new Promise( ( r ) => r( gitHubUrl ) ) ),
			initializeRepository: sinon.stub( git, 'initializeRepository' ),
			updateJSONFile: sinon.stub( tools, 'updateJSONFile' ),
			getStatus: sinon.stub( git, 'getStatus' ),
			updateBoilerplate: sinon.stub( git, 'updateBoilerplate' ),
			copyTemplateFiles: sinon.stub( tools, 'copyTemplateFiles' ),
			initialCommit: sinon.stub( git, 'initialCommit' )
		};
	}

	function restoreSpies() {
		for ( let spy in spies ) {
			spies[ spy ].restore();
		}
	}

	describe( 'dev-plugin-create', () => {
		const pluginCreateTask = require( '../tasks/utils/dev-plugin-create' );
		const repositoryPath = path.join( workspacePath, pluginName );

		it( 'should exist', () => expect( pluginCreateTask ).to.be.a( 'function' ) );

		it( 'should create a plugin', () => {
			return pluginCreateTask( mainRepositoryPath, workspaceRoot, emptyFn ).then( () => {
				expect( spies.getPluginName.calledOnce ).to.equal( true );
				expect( spies.getPluginVersion.calledOnce ).to.equal( true );
				expect( spies.getPluginGitHubUrl.calledOnce ).to.equal( true );
				expect( spies.initializeRepository.calledOnce ).to.equal( true );
				expect( spies.initializeRepository.firstCall.args[ 0 ] ).to.equal( repositoryPath );
				expect( spies.copyTemplateFiles.calledOnce ).to.equal( true );
				expect( spies.copyTemplateFiles.firstCall.args[ 0 ] ).to.equal( repositoryPath );
				expect( spies.updateJSONFile.calledTwice ).to.equal( true );
				expect( spies.updateJSONFile.firstCall.args[ 0 ] ).to.equal( path.join( repositoryPath, 'package.json' ) );
				expect( spies.updateJSONFile.secondCall.args[ 0 ] ).to.equal( path.join( mainRepositoryPath, 'package.json' ) );
				expect( spies.initialCommit.calledOnce ).to.equal( true );
				expect( spies.initialCommit.firstCall.args[ 0 ] ).to.equal( pluginName );
				expect( spies.initialCommit.firstCall.args[ 1 ] ).to.equal( repositoryPath );
				expect( spies.linkDirectories.calledOnce ).to.equal( true );
				expect( spies.linkDirectories.firstCall.args[ 0 ] ).to.equal( repositoryPath );
				expect( spies.linkDirectories.firstCall.args[ 1 ] ).to.equal( path.join( mainRepositoryPath, 'node_modules', pluginName ) );
				expect( spies.npmInstall.calledOnce ).to.equal( true );
				expect( spies.npmInstall.firstCall.args[ 0 ] ).to.equal( repositoryPath );
				expect( spies.installGitHooks.calledOnce ).to.equal( true );
				expect( spies.installGitHooks.firstCall.args[ 0 ] ).to.equal( repositoryPath );
			} );
		} );
	} );

	describe( 'dev-plugin-install', () => {
		const pluginInstallTask = require( '../tasks/utils/dev-plugin-install' );

		it( 'should exist', () => expect( pluginInstallTask ).to.be.a( 'function' ) );

		it( 'should install a plugin', () => {
			return pluginInstallTask( mainRepositoryPath, workspaceRoot, emptyFn ).then( () => {
				expect( spies.getPluginName.calledOnce ).to.equal( true );
				expect( spies.getPluginGitHubUrl.calledOnce ).to.equal( true );
				expect( spies.parseRepositoryUrl.calledOnce ).to.equal( true );
				const urlInfo = spies.parseRepositoryUrl.firstCall.returnValue;
				expect( spies.parseRepositoryUrl.firstCall.args[ 0 ] ).to.equal( gitHubUrl );
				expect( spies.cloneRepository.calledOnce ).to.equal( true );
				expect( spies.cloneRepository.firstCall.args[ 0 ] ).to.equal( urlInfo );
				expect( spies.cloneRepository.firstCall.args[ 1 ] ).to.equal( workspacePath );
				expect( spies.checkout.calledOnce ).to.equal( true );
				expect( spies.checkout.firstCall.args[ 0 ] ).to.equal( repositoryPath );
				expect( spies.checkout.firstCall.args[ 1 ] ).to.equal( urlInfo.branch );
				expect( spies.updateJSONFile.calledOnce ).to.equal( true );
				expect( spies.updateJSONFile.firstCall.args[ 0 ] ).to.equal( path.join( mainRepositoryPath, 'package.json' ) );
				expect( spies.linkDirectories.calledOnce ).to.equal( true );
				expect( spies.linkDirectories.firstCall.args[ 0 ] ).to.equal( repositoryPath );
				expect( spies.linkDirectories.firstCall.args[ 1 ] ).to.equal( path.join( mainRepositoryPath, 'node_modules', pluginName ) );
				expect( spies.npmInstall.calledOnce ).to.equal( true );
				expect( spies.npmInstall.firstCall.args[ 0 ] ).to.equal( repositoryPath );
				expect( spies.installGitHooks.calledOnce ).to.equal( true );
				expect( spies.installGitHooks.firstCall.args[ 0 ] ).to.equal( repositoryPath );
			} );
		} );
	} );

	describe( 'dev-relink', () => {
		const devRelinkTask = require( '../tasks/utils/dev-relink' );

		it( 'should exist', () => expect( devRelinkTask ).to.be.a( 'function' ) );

		it( 'should relink repositories', () => {
			const packageJSON = {
				dependencies: {
					'ckeditor5-core': 'ckeditor/ckeditor5-core',
					'ckeditor5-plugin-devtest': 'ckeditor/ckeditor5-plugin-devtest',
					'non-ckeditor-plugin': 'other/plugin'
				}
			};

			spies.getDirectories.restore();
			const dirs = [ 'ckeditor5-core', 'ckeditor5-plugin-devtest' ];
			spies.getDirectories = sinon.stub( tools, 'getCKE5Directories', () => dirs );

			devRelinkTask( mainRepositoryPath, packageJSON, workspaceRoot, emptyFn, emptyFn );

			expect( spies.getDependencies.calledOnce ).to.equal( true );
			expect( spies.getDependencies.firstCall.args[ 0 ] ).to.equal( packageJSON.dependencies );
			expect( spies.linkDirectories.calledTwice ).to.equal( true );
			expect( spies.linkDirectories.firstCall.args[ 0 ] ).to.equal( path.join( workspacePath, dirs[ 0 ] ) );
			expect( spies.linkDirectories.firstCall.args[ 1 ] ).to.equal( path.join( mainRepositoryPath, 'node_modules', dirs[ 0 ] ) );
			expect( spies.linkDirectories.secondCall.args[ 0 ] ).to.equal( path.join( workspacePath, dirs[ 1 ] ) );
			expect( spies.linkDirectories.secondCall.args[ 1 ] ).to.equal( path.join( mainRepositoryPath, 'node_modules', dirs[ 1 ] ) );
		} );
	} );

	describe( 'dev-status', () => {
		const devStatusTask = require( '../tasks/utils/dev-status' );

		it( 'should exist', () => expect( devStatusTask ).to.be.a( 'function' ) );

		it( 'should show repositories status', () => {
			const packageJSON = {
				dependencies: {
					'ckeditor5-core': 'ckeditor/ckeditor5-core',
					'ckeditor5-plugin-devtest': 'ckeditor/ckeditor5-plugin-devtest',
					'non-ckeditor-plugin': 'other/plugin'
				}
			};

			const dirs = [ 'ckeditor5-core', 'ckeditor5-plugin-devtest' ];
			spies.getDirectories.restore();
			spies.getDirectories = sinon.stub( tools, 'getCKE5Directories', () => dirs );

			devStatusTask( mainRepositoryPath, packageJSON, workspaceRoot, emptyFn, emptyFn );

			expect( spies.getDependencies.calledOnce ).to.equal( true );
			expect( spies.getDependencies.firstCall.args[ 0 ] ).to.equal( packageJSON.dependencies );
			expect( spies.getStatus.calledTwice ).to.equal( true );
			expect( spies.getStatus.firstCall.args[ 0 ] ).to.equal( path.join( workspacePath, dirs[ 0 ] ) );
			expect( spies.getStatus.secondCall.args[ 0 ] ).to.equal( path.join( workspacePath, dirs[ 1 ] ) );
		} );
	} );

	describe( 'dev-update', () => {
		const devUpdateTask = require( '../tasks/utils/dev-update' );

		it( 'should exist', () => expect( devUpdateTask ).to.be.a( 'function' ) );

		it( 'should show repositories status', () => {
			const packageJSON = {
				dependencies: {
					'ckeditor5-core': 'ckeditor/ckeditor5-core',
					'ckeditor5-plugin-devtest': 'ckeditor/ckeditor5-plugin-devtest',
					'non-ckeditor-plugin': 'other/plugin'
				}
			};

			const dirs = [ 'ckeditor5-core', 'ckeditor5-plugin-devtest' ];
			spies.getDirectories.restore();
			spies.getDirectories = sinon.stub( tools, 'getCKE5Directories', () => dirs );

			devUpdateTask( mainRepositoryPath, packageJSON, workspaceRoot, emptyFn, emptyFn );

			expect( spies.getDependencies.calledOnce ).to.equal( true );
			expect( spies.getDependencies.firstCall.args[ 0 ] ).to.equal( packageJSON.dependencies );
			expect( spies.parseRepositoryUrl.calledTwice ).to.equal( true );
			expect( spies.pull.calledTwice ).to.equal( true );

			let urlInfo = spies.parseRepositoryUrl.firstCall.returnValue;
			expect( spies.pull.firstCall.args[ 0 ] ).to.equal( path.join( workspacePath, dirs[ 0 ] ) );
			expect( spies.pull.firstCall.args[ 1 ] ).to.equal( urlInfo.branch );

			urlInfo = spies.parseRepositoryUrl.secondCall.returnValue;
			expect( spies.pull.secondCall.args[ 0 ] ).to.equal( path.join( workspacePath, dirs[ 1 ] ) );
			expect( spies.pull.secondCall.args[ 1 ] ).to.equal( urlInfo.branch );
		} );
	} );

	describe( 'dev-boilerplate-update', () => {
		const devBoilerplateTask = require( '../tasks/utils/dev-boilerplate-update' );

		it( 'should exist', () => expect( devBoilerplateTask ).to.be.a( 'function' ) );

		it( 'should update boilerplate in repositories', () => {
			const packageJSON = {
				dependencies: {
					'ckeditor5-core': 'ckeditor/ckeditor5-core',
					'ckeditor5-plugin-devtest': 'ckeditor/ckeditor5-plugin-devtest',
					'non-ckeditor-plugin': 'other/plugin'
				}
			};

			const dirs = [ 'ckeditor5-core', 'ckeditor5-plugin-devtest' ];
			spies.getDirectories.restore();
			spies.getDirectories = sinon.stub( tools, 'getCKE5Directories', () => dirs );

			devBoilerplateTask( mainRepositoryPath, packageJSON, workspaceRoot, emptyFn, emptyFn );

			expect( spies.getDependencies.calledOnce ).to.equal( true );
			expect( spies.getDependencies.firstCall.args[ 0 ] ).to.equal( packageJSON.dependencies );
			expect( spies.updateBoilerplate.calledTwice ).to.equal( true );
			expect( spies.updateBoilerplate.firstCall.args[ 0 ] ).to.equal( path.join( workspacePath, dirs[ 0 ] ) );
			expect( spies.updateBoilerplate.secondCall.args[ 0 ] ).to.equal( path.join( workspacePath, dirs[ 1 ] ) );
		} );
	} );
} );

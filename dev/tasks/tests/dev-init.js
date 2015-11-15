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
const git = require( '../utils/git' );
const path = require( 'path' );
const emptyFn = () => { };
let spies;

describe( 'dev-tasks', () => {
	describe( 'dev-init', () => {
		const initTask = require( '../utils/dev-init' );
		const mainRepositoryPath = '/path/to/repository';
		const options = {
			workspaceRoot: '..'
		};
		const workspacePath = path.join( mainRepositoryPath, options.workspaceRoot );

		beforeEach( () => createSpies() );
		afterEach( () => restoreSpies() );

		it( 'task should exists', () => expect( initTask ).to.be.a( 'function' ) );

		it( 'performs no action when no ckeditor dependencies are found', () => {
			const packageJSON = {
				dependencies: {
					'non-ckeditor-plugin': 'other/plugin'
				}
			};

			initTask( mainRepositoryPath, packageJSON, options, emptyFn, emptyFn );
			expect( spies.getDependencies.calledOnce ).to.equal( true );
			expect( spies.getDependencies.firstCall.args[ 0 ] ).to.equal( packageJSON.dependencies );
			expect( spies.getDirectories.called ).to.equal( false );
			expect( spies.parseRepositoryUrl.called ).to.equal( false );
			expect( spies.cloneRepository.called ).to.equal( false );
			expect( spies.checkout.called ).to.equal( false );
			expect( spies.linkDirectories.called ).to.equal( false );
		} );

		it( 'clones repositories if no directories are found', () => {
			const packageJSON = {
				dependencies: {
					'ckeditor5-core': 'ckeditor/ckeditor5-core',
					'ckeditor5-plugin-devtest': 'ckeditor/ckeditor5-plugin-devtest',
					'non-ckeditor-plugin': 'other/plugin'
				}
			};

			initTask( mainRepositoryPath, packageJSON, options, emptyFn, emptyFn );
			expect( spies.getDependencies.calledOnce ).to.equal( true );
			expect( spies.getDependencies.firstCall.args[ 0 ] ).to.equal( packageJSON.dependencies );
			expect( spies.getDirectories.calledOnce ).to.equal( true );
			expect( spies.getDirectories.firstCall.args[ 0 ] ).to.equal( path.join( mainRepositoryPath, options.workspaceRoot ) );
			expect( spies.parseRepositoryUrl.calledTwice ).to.equal( true );
			expect( spies.cloneRepository.calledTwice ).to.equal( true );
			expect( spies.cloneRepository.firstCall.args[ 0 ] ).to.equal( spies.parseRepositoryUrl.firstCall.returnValue );
			expect( spies.cloneRepository.firstCall.args[ 1 ] ).to.equal( workspacePath );
			expect( spies.cloneRepository.secondCall.args[ 0 ] ).to.equal( spies.parseRepositoryUrl.secondCall.returnValue );
			expect( spies.cloneRepository.secondCall.args[ 1 ] ).to.equal( workspacePath );
			expect( spies.checkout.calledTwice ).to.equal( true );
			expect( spies.linkDirectories.calledTwice ).to.equal( true );
		} );

		it( 'only checks out repositories if directories are found', () => {
			const packageJSON = {
				dependencies: {
					'ckeditor5-core': 'ckeditor/ckeditor5-core',
					'ckeditor5-plugin-devtest': 'ckeditor/ckeditor5-plugin-devtest',
					'non-ckeditor-plugin': 'other/plugin'
				}
			};

			spies.getDirectories.restore();
			spies.getDirectories = sinon.stub( tools, 'getCKE5Directories', () => [ 'ckeditor5-core', 'ckeditor5-plugin-devtest' ] );

			initTask( mainRepositoryPath, packageJSON, options, emptyFn, emptyFn );
			expect( spies.getDependencies.calledOnce ).to.equal( true );
			expect( spies.getDependencies.firstCall.args[ 0 ] ).to.equal( packageJSON.dependencies );
			expect( spies.getDirectories.calledOnce ).to.equal( true );
			expect( spies.getDirectories.firstCall.args[ 0 ] ).to.equal( path.join( mainRepositoryPath, options.workspaceRoot ) );
			expect( spies.parseRepositoryUrl.calledTwice ).to.equal( true );
			expect( spies.cloneRepository.called ).to.equal( false );
			expect( spies.checkout.calledTwice ).to.equal( true );
			expect( spies.linkDirectories.calledTwice ).to.equal( true );
		} );
	} );

	function createSpies() {
		spies = {
			getDependencies: sinon.spy( tools, 'getCKEditorDependencies' ),
			getDirectories: sinon.stub( tools, 'getCKE5Directories', () => [] ),
			parseRepositoryUrl: sinon.spy( git, 'parseRepositoryUrl' ),
			cloneRepository: sinon.stub( git, 'cloneRepository' ),
			linkDirectories: sinon.stub( tools, 'linkDirectories' ),
			checkout: sinon.stub( git, 'checkout' )
		};
	}

	function restoreSpies() {
		for ( let spy in spies ) {
			spies[ spy ].restore();
		}
	}
} );

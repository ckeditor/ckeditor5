/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, beforeEach, afterEach */

'use strict';

const chai = require( 'chai' );
const sinon = require( 'sinon' );
const git = require( '../tasks/utils/git' );
const tools = require( '../tasks/utils/tools' );
const installTask = require( '../tasks/utils/dev-install' );
const expect = chai.expect;
const path = require( 'path' );

describe( 'dev-install', () => {
	const moduleName = 'ckeditor5-core';
	const repositoryUrl = 'git@github.com:ckeditor/ckeditor5-core';
	const ckeditor5Path = '/path/to/ckeditor';
	const workspacePath = '..';
	const workspaceAbsolutePath = path.join( ckeditor5Path, workspacePath );

	let toRestore;
	beforeEach( () => toRestore = [] );

	afterEach( () => {
		toRestore.forEach( item => item.restore() );
	} );

	it( 'should use GitHub url if provided', () => {
		const parseUrlSpy = sinon.spy( git, 'parseRepositoryUrl' );
		const isDirectoryStub = sinon.stub( tools, 'isDirectory' ).returns( false );
		const cloneRepositoryStub = sinon.stub( git, 'cloneRepository' );
		const linkDirectoriesStub = sinon.stub( tools, 'linkDirectories' );
		const updateJSONstub = sinon.stub( tools, 'updateJSONFile' );
		const npmInstallStub = sinon.stub( tools, 'npmInstall' );
		const checkoutStub = sinon.stub( git, 'checkout' );

		toRestore.push( parseUrlSpy, isDirectoryStub, cloneRepositoryStub, linkDirectoriesStub, updateJSONstub,
						npmInstallStub, checkoutStub );

		installTask( ckeditor5Path, workspacePath, repositoryUrl, () => {}, () => {} );

		sinon.assert.calledOnce( parseUrlSpy );
		sinon.assert.calledWithExactly( parseUrlSpy, repositoryUrl );

		const urlInfo = parseUrlSpy.firstCall.returnValue;
		const repositoryPath = path.join( workspaceAbsolutePath, urlInfo.name );

		sinon.assert.calledOnce( isDirectoryStub );
		sinon.assert.calledWithExactly( isDirectoryStub, repositoryPath );

		sinon.assert.calledOnce( cloneRepositoryStub );
		sinon.assert.calledWithExactly( cloneRepositoryStub, urlInfo, workspaceAbsolutePath );

		sinon.assert.calledOnce( checkoutStub );
		sinon.assert.calledWithExactly( checkoutStub, repositoryPath, urlInfo.branch );

		const linkPath = path.join( ckeditor5Path, 'node_modules', urlInfo.name );

		sinon.assert.calledOnce( linkDirectoriesStub );
		sinon.assert.calledWithExactly( linkDirectoriesStub, repositoryPath, linkPath );

		const packageJsonPath = path.join( ckeditor5Path, 'package.json' );
		sinon.assert.calledOnce( updateJSONstub );
		expect( updateJSONstub.firstCall.args[ 0 ] ).to.equal( packageJsonPath );
		const updateFn = updateJSONstub.firstCall.args[ 1 ];
		const json = updateFn( {} );
		expect( json.dependencies ).to.be.a( 'object' );
		expect( json.dependencies[ urlInfo.name ] ).to.equal( repositoryPath );

		sinon.assert.calledOnce( npmInstallStub );
		sinon.assert.calledWithExactly( npmInstallStub, ckeditor5Path );
	} );

	it( 'should use npm module name if provided', () => {
		const parseUrlSpy = sinon.spy( git, 'parseRepositoryUrl' );
		const isDirectoryStub = sinon.stub( tools, 'isDirectory' ).returns( true );
		const getUrlFromNpmSpy = sinon.stub( tools, 'getGitUrlFromNpm' ).returns( repositoryUrl );
		const cloneRepositoryStub = sinon.stub( git, 'cloneRepository' );
		const linkDirectoriesStub = sinon.stub( tools, 'linkDirectories' );
		const updateJSONstub = sinon.stub( tools, 'updateJSONFile' );
		const npmInstallStub = sinon.stub( tools, 'npmInstall' );
		const checkoutStub = sinon.stub( git, 'checkout' );

		toRestore.push( parseUrlSpy, isDirectoryStub, getUrlFromNpmSpy, cloneRepositoryStub, linkDirectoriesStub,
						updateJSONstub, npmInstallStub, checkoutStub );

		installTask( ckeditor5Path, workspacePath, moduleName, () => {}, () => {} );

		sinon.assert.calledTwice( parseUrlSpy );
		sinon.assert.calledWithExactly( parseUrlSpy.firstCall, moduleName );
		expect( parseUrlSpy.firstCall.returnValue ).to.equal( null );

		sinon.assert.calledOnce( getUrlFromNpmSpy );
		sinon.assert.calledWithExactly( getUrlFromNpmSpy, moduleName );

		sinon.assert.calledWithExactly( parseUrlSpy.secondCall, repositoryUrl );
		const urlInfo = parseUrlSpy.secondCall.returnValue;
		const repositoryPath = path.join( workspaceAbsolutePath, urlInfo.name );

		sinon.assert.calledOnce( isDirectoryStub );
		sinon.assert.calledWithExactly( isDirectoryStub, repositoryPath );

		sinon.assert.notCalled( cloneRepositoryStub );
	} );

	it( 'should throw an exception when invalid name is provided', () => {
		const parseUrlSpy = sinon.spy( git, 'parseRepositoryUrl' );
		const isDirectoryStub = sinon.stub( tools, 'isDirectory' ).returns( true );
		const getUrlFromNpmSpy = sinon.stub( tools, 'getGitUrlFromNpm' ).returns( null );
		const cloneRepositoryStub = sinon.stub( git, 'cloneRepository' );
		const linkDirectoriesStub = sinon.stub( tools, 'linkDirectories' );
		const updateJSONstub = sinon.stub( tools, 'updateJSONFile' );
		const npmInstallStub = sinon.stub( tools, 'npmInstall' );
		const checkoutStub = sinon.stub( git, 'checkout' );

		toRestore.push( parseUrlSpy, isDirectoryStub, getUrlFromNpmSpy, cloneRepositoryStub, linkDirectoriesStub,
			updateJSONstub, npmInstallStub, checkoutStub );

		expect( () => {
			installTask( ckeditor5Path, workspacePath, moduleName, () => {}, () => {} );
		} ).to.throw();

		sinon.assert.calledOnce( parseUrlSpy );
		sinon.assert.calledWithExactly( parseUrlSpy.firstCall, moduleName );
		expect( parseUrlSpy.firstCall.returnValue ).to.equal( null );
	} );
} );

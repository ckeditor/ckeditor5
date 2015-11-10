/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';
/* global describe, it, beforeEach, afterEach */

let toRestore;
const git = require( '../utils/git' );
const chai = require( 'chai' );
const sinon = require( 'sinon' );
const tools = require( '../utils/tools' );
const expect = chai.expect;

describe( 'utils', () => {
	beforeEach( () => toRestore = [] );

	afterEach( () => {
		toRestore.forEach( item => item.restore() );
	} );

	describe( 'git', () => {
		describe( 'parseRepositoryUrl', () => {
			it( 'should be defined', () => expect( git.parseRepositoryUrl ).to.be.a( 'function' ) );

			it( 'should parse short GitHub URL ', () => {
				const urlInfo = git.parseRepositoryUrl( 'ckeditor/ckeditor5-core' );

				expect( urlInfo.server ).to.equal( 'https://github.com/' );
				expect( urlInfo.branch ).to.equal( 'master' );
				expect( urlInfo.repository ).to.equal( 'ckeditor/ckeditor5-core' );
			} );

			it( 'should parse short GitHub URL with provided branch ', () => {
				const urlInfo = git.parseRepositoryUrl( 'ckeditor/ckeditor5-core#experimental' );

				expect( urlInfo.server ).to.equal( 'https://github.com/' );
				expect( urlInfo.branch ).to.equal( 'experimental' );
				expect( urlInfo.repository ).to.equal( 'ckeditor/ckeditor5-core' );
			} );

			it( 'should parse full GitHub URL (http)', () => {
				const urlInfo = git.parseRepositoryUrl( 'http://github.com/ckeditor/ckeditor5-core' );

				expect( urlInfo.server ).to.equal( 'http://github.com/' );
				expect( urlInfo.branch ).to.equal( 'master' );
				expect( urlInfo.repository ).to.equal( 'ckeditor/ckeditor5-core' );
			} );

			it( 'should parse full GitHub URL (http) with provided branch', () => {
				const urlInfo = git.parseRepositoryUrl( 'http://github.com/ckeditor/ckeditor5-core#experimental' );

				expect( urlInfo.server ).to.equal( 'http://github.com/' );
				expect( urlInfo.branch ).to.equal( 'experimental' );
				expect( urlInfo.repository ).to.equal( 'ckeditor/ckeditor5-core' );
			} );

			it( 'should parse full GitHub URL (https)', () => {
				const urlInfo = git.parseRepositoryUrl( 'https://github.com/ckeditor/ckeditor5-core' );

				expect( urlInfo.server ).to.equal( 'https://github.com/' );
				expect( urlInfo.branch ).to.equal( 'master' );
				expect( urlInfo.repository ).to.equal( 'ckeditor/ckeditor5-core' );
			} );

			it( 'should parse full GitHub URL (https) with provided branch', () => {
				const urlInfo = git.parseRepositoryUrl( 'https://github.com/ckeditor/ckeditor5-core#t/122' );

				expect( urlInfo.server ).to.equal( 'https://github.com/' );
				expect( urlInfo.branch ).to.equal( 't/122' );
				expect( urlInfo.repository ).to.equal( 'ckeditor/ckeditor5-core' );
			} );

			it( 'should parse full GitHub URL (git)', () => {
				const urlInfo = git.parseRepositoryUrl( 'git@github.com:ckeditor/ckeditor5-core' );

				expect( urlInfo.server ).to.equal( 'git@github.com:' );
				expect( urlInfo.branch ).to.equal( 'master' );
				expect( urlInfo.repository ).to.equal( 'ckeditor/ckeditor5-core' );
			} );

			it( 'should parse full GitHub URL (git) with provided branch', () => {
				const urlInfo = git.parseRepositoryUrl( 'git@github.com:ckeditor/ckeditor5-core#new-feature' );

				expect( urlInfo.server ).to.equal( 'git@github.com:' );
				expect( urlInfo.branch ).to.equal( 'new-feature' );
				expect( urlInfo.repository ).to.equal( 'ckeditor/ckeditor5-core' );
			} );
		} );

		describe( 'cloneRepository', () => {
			it( 'should be defined', () => expect( git.cloneRepository ).to.be.a( 'function' ) );

			it( 'should call clone commands', () => {
				const shExecStub = sinon.stub( tools, 'shExec' );
				const workspacePath = '/path/to/workspace/';
				const urlInfo = git.parseRepositoryUrl( 'git@github.com:ckeditor/ckeditor5-core#new-feature' );
				const cloneCommands = `cd ${ workspacePath } && git clone ${ urlInfo.server + urlInfo.repository }`;
				toRestore.push( shExecStub );

				git.cloneRepository( urlInfo, workspacePath );

				expect( shExecStub.calledOnce ).to.equal( true );
				expect( shExecStub.firstCall.args[ 0 ] ).to.equal( cloneCommands );
			} );
		} );

		describe( 'checkout', () => {
			it( 'should be defined', () => expect( git.checkout ).to.be.a( 'function' ) );

			it( 'should call checkout commands', () => {
				const shExecStub = sinon.stub( tools, 'shExec' );
				const repositoryLocation = 'path/to/repository';
				const branchName = 'branch-to-checkout';
				const checkoutCommands = `cd ${ repositoryLocation } && git checkout ${ branchName }`;
				toRestore.push( shExecStub );

				git.checkout( repositoryLocation, branchName );

				expect( shExecStub.calledOnce ).to.equal( true );
				expect( shExecStub.firstCall.args[ 0 ] ).to.equal( checkoutCommands );
			} );
		} );
	} );
} );

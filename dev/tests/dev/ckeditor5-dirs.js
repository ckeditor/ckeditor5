/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, beforeEach, afterEach */

'use strict';

const chai = require( 'chai' );
const sinon = require( 'sinon' );
const expect = chai.expect;
const ckeditor5Dirs = require( '../../utils/ckeditor5-dirs' );
const tools = require( '../../utils/tools' );
let sandbox;

describe( 'utils', () => {
	beforeEach( () => {
		sandbox = sinon.sandbox.create();
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	describe( 'ckeditor5dirs', () => {
		describe( 'getDependencies', () => {
			it( 'should be defined', () => expect( ckeditor5Dirs.getDependencies ).to.be.a( 'function' ) );

			it( 'should return null if no CKEditor5 repository is found', () => {
				const dependencies = {
					'plugin1': '',
					'plugin2': '',
					'plugin3': ''
				};
				expect( ckeditor5Dirs.getDependencies( dependencies ) ).to.equal( null );
				expect( ckeditor5Dirs.getDependencies() ).to.equal( null );
			} );

			it( 'should return only ckeditor5- dependencies', () => {
				const dependencies = {
					'plugin1': '',
					'ckeditor5-plugin-image': 'ckeditor/ckeditor5-plugin-image',
					'plugin2': '',
					'ckeditor5-core': 'ckeditor/ckeditor5-core'
				};
				const ckeditorDependencies = ckeditor5Dirs.getDependencies( dependencies );

				expect( ckeditorDependencies ).to.be.an( 'object' );
				expect( ckeditorDependencies.plugin1 ).to.be.a( 'undefined' );
				expect( ckeditorDependencies.plugin2 ).to.be.a( 'undefined' );
				expect( ckeditorDependencies[ 'ckeditor5-plugin-image' ] ).to.be.a( 'string' );
				expect( ckeditorDependencies[ 'ckeditor5-core' ] ).to.be.a( 'string' );
			} );
		} );

		describe( 'getDirectories', () => {
			it( 'should be defined', () => expect( ckeditor5Dirs.getDirectories ).to.be.a( 'function' ) );

			it( 'should return only ckeditor5 directories', () => {
				const workspacePath = '/workspace/path';
				const sourceDirectories = [ 'tools', 'ckeditor5', 'ckeditor5-core', '.bin', 'ckeditor5-plugin-image' ];
				sandbox.stub( tools, 'getDirectories', () => sourceDirectories );
				const directories = ckeditor5Dirs.getDirectories( workspacePath );

				expect( directories.length ).equal( 2 );
				expect( directories[ 0 ] ).equal( 'ckeditor5-core' );
				expect( directories[ 1 ] ).equal( 'ckeditor5-plugin-image' );
			} );
		} );

		describe( 'getSymlinks', () => {
			it( 'should return CKE5 symlinks from provided path', () => {
				const fs = require( 'fs' );
				const path = 'path/to/dir';
				sandbox.stub( fs, 'readdirSync' ).returns( [ 'ckeditor5-core', 'ckeditor5-image', 'other-dependency' ] );
				sandbox.stub( tools, 'isSymlink' ).returns( true );

				const symlinks = ckeditor5Dirs.getSymlinks( path );
				expect( symlinks.length ).to.equal( 2 );
				expect( symlinks[ 0 ] ).to.equal( 'ckeditor5-core' );
				expect( symlinks[ 1 ] ).to.equal( 'ckeditor5-image' );
			} );
		} );
	} );
} );

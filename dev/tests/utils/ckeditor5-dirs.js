/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, beforeEach, afterEach */

'use strict';

const chai = require( 'chai' );
const sinon = require( 'sinon' );
const expect = chai.expect;
const path = require( 'path' );
const ckeditor5Dirs = require( '../../utils/ckeditor5-dirs' );
const tools = require( '../../utils/tools' );
const git = require( '../../utils/git' );
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
				const packageJSONDependencies = {
					'plugin1': '',
					'plugin2': '',
					'plugin3': ''
				};
				expect( ckeditor5Dirs.getDependencies( packageJSONDependencies ) ).to.equal( null );
				expect( ckeditor5Dirs.getDependencies() ).to.equal( null );
			} );

			it( 'should return only ckeditor5- dependencies', () => {
				const packageJSONDependencies = {
					'plugin1': '',
					'ckeditor5-plugin-image': 'ckeditor/ckeditor5-plugin-image',
					'plugin2': '',
					'ckeditor5-core': 'ckeditor/ckeditor5-core'
				};
				const ckeditorDependencies = ckeditor5Dirs.getDependencies( packageJSONDependencies );

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

		describe( 'getDevDirectories', () => {
			const packageJSONDependencies = {};
			const workspacePath = '/workspace/path';
			const ckeditor5Path = path.join( workspacePath, 'ckeditor5' );
			const dependencies = {
				'ckeditor5-plugin-image': 'ckeditor/ckeditor5-plugin-image',
				'ckeditor5-core': 'ckeditor/ckeditor5-core'
			};
			const sourceDirectories = [ 'tools', 'ckeditor5', 'ckeditor5-core', '.bin', 'ckeditor5-plugin-image' ];
			const repositoryInfo = { name: 'ckeditor5-core' };

			it( 'should be defined', () => expect( ckeditor5Dirs.getDevDirectories ).to.be.a( 'function' ) );

			it( 'should return empty array if no dev directories were found - because of missing ckeditor5-* repos', () => {
				const wrongRepositoryInfo = { name: 'plugins/plugin' };

				sandbox.stub( ckeditor5Dirs, 'getDirectories', () => sourceDirectories );
				sandbox.stub( ckeditor5Dirs, 'getDependencies', () => dependencies );
				sandbox.stub( git, 'parseRepositoryUrl' ).returns( wrongRepositoryInfo );

				const directories = ckeditor5Dirs.getDevDirectories( workspacePath, packageJSONDependencies, ckeditor5Path );

				expect( directories ).to.be.a( 'array' );
				expect( directories.length ).to.equal( 0 );
			} );

			it( 'should return empty array if no dev directories were found - because of missing ckeditor5-* dirs', () => {
				const wrongDirectories = [ 'tools', 'ckeditor5', '.bin' ];

				sandbox.stub( ckeditor5Dirs, 'getDirectories', () => wrongDirectories );
				sandbox.stub( ckeditor5Dirs, 'getDependencies', () => dependencies );
				sandbox.stub( git, 'parseRepositoryUrl' ).returns( repositoryInfo );

				const directories = ckeditor5Dirs.getDevDirectories( workspacePath, packageJSONDependencies, ckeditor5Path );

				expect( directories ).to.be.a( 'array' );
				expect( directories.length ).to.equal( 0 );
			} );

			it( 'should return only ckeditor5 directories in development mode', () => {
				sandbox.stub( ckeditor5Dirs, 'getDirectories', () => sourceDirectories );
				sandbox.stub( ckeditor5Dirs, 'getDependencies', () => dependencies );
				sandbox.stub( git, 'parseRepositoryUrl' ).returns( repositoryInfo );

				const directories = ckeditor5Dirs.getDevDirectories( workspacePath, packageJSONDependencies, ckeditor5Path );

				expect( directories.length ).equal( 2 );
				expect( directories[ 0 ] ).eql( {
						repositoryURL: 'ckeditor/ckeditor5-plugin-image',
						repositoryPath: '/workspace/path/ckeditor5/node_modules/ckeditor5-plugin-image'
					} );
				expect( directories[ 1 ] ).eql( {
						repositoryURL: 'ckeditor/ckeditor5-core',
						repositoryPath: '/workspace/path/ckeditor5/node_modules/ckeditor5-core'
					} );
			} );

			it( 'should return only ckeditor5 directories in development mode, including root directory', () => {
				sandbox.stub( ckeditor5Dirs, 'getDirectories', () => sourceDirectories );
				sandbox.stub( ckeditor5Dirs, 'getDependencies', () => dependencies );
				sandbox.stub( git, 'parseRepositoryUrl' ).returns( repositoryInfo );
				const includeRoot = true;

				const directories = ckeditor5Dirs.getDevDirectories( workspacePath, packageJSONDependencies, ckeditor5Path, includeRoot );

				expect( directories.length ).equal( 3 );
				expect( directories[ 0 ] ).eql( {
						repositoryURL: 'ckeditor/ckeditor5-plugin-image',
						repositoryPath: '/workspace/path/ckeditor5/node_modules/ckeditor5-plugin-image'
					} );
				expect( directories[ 1 ] ).eql( {
						repositoryURL: 'ckeditor/ckeditor5-core',
						repositoryPath: '/workspace/path/ckeditor5/node_modules/ckeditor5-core'
					} );
				expect( directories[ 2 ] ).eql( {
						repositoryURL: 'ckeditor/ckeditor5',
						repositoryPath: '/workspace/path/ckeditor5'
					} );
			} );
		} );
	} );
} );

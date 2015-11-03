/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';
/* global describe, it */

var chai = require( 'chai' );
var tools = require( '../utils/tools' );
var sinon = require( 'sinon' );
var path = require( 'path' );
var expect = chai.expect;
var dev = require( './../dev' );
var grunt = {
	tasks: {},
	registerTask: function( taskName, fn ) {
		this.tasks[ taskName ] = fn;
	},
	log: {
		writeln: function() {}
	}
};

dev( grunt );

describe( 'tasks', function() {
	describe( 'dev:init', function() {
		it( 'should get ckeditor5- dependencies, clone repositories and link them', function() {
			var getDepsSpy = sinon.spy( tools, 'getCKEditorDependencies' );
			var cloneRepositoryStub = sinon.stub( tools, 'cloneRepository' );
			var npmLinkStub = sinon.stub( tools, 'npmLink' );
			var regexp = /^ckeditor\//;
			var ckeditor5Path = process.cwd();
			var location = path.join( ckeditor5Path, '..' );
			var dependencies, keys;

			grunt.tasks.dev( 'init' );

			getDepsSpy.restore();
			cloneRepositoryStub.restore();
			npmLinkStub.restore();

			expect( getDepsSpy.calledOnce ).to.equal( true );
			dependencies = getDepsSpy.firstCall.returnValue;

			if ( dependencies ) {
				keys = Object.keys( dependencies ).filter( key => regexp.test( dependencies[ key ] ) );

				expect( cloneRepositoryStub.callCount ).to.equal( keys.length );
				expect( npmLinkStub.callCount ).to.equal( keys.length );

				keys.forEach( function( key, i ) {
					expect( cloneRepositoryStub.getCall( i ).args[0] ).equal( dependencies[ key ] );
					expect( cloneRepositoryStub.getCall( i ).args[1] ).equal( location );

					expect( npmLinkStub.getCall( i ).args[0] ).equal( path.join( location, key ) );
					expect( npmLinkStub.getCall( i ).args[1] ).equal( ckeditor5Path );
					expect( npmLinkStub.getCall( i ).args[2] ).equal( key );
				} );
			}
		} );
	} );
} );

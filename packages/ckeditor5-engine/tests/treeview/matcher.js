/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Matcher from '/ckeditor5/engine/treeview/matcher.js';
import Element from '/ckeditor5/engine/treeview/element.js';

describe( 'Matcher', () => {
	describe( 'match', () => {
		it( 'should match element name', () => {
			const matcher = new Matcher( 'p' );
			const el = new Element( 'p' );
			const el2 = new Element( 'div' );

			const result = matcher.match( el );

			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).and.equal( el );
			expect( result ).to.have.property( 'pattern' );
			expect( result.pattern.name ).to.equal( 'p' );
			expect( result ).to.have.property( 'match' );
			expect( result.match.name ).to.be.true;
			expect( matcher.match( el2 ) ).to.be.null;
		} );

		it( 'should match element name with RegExp', () => {
			const pattern = { name: /^text...a$/ };
			const matcher = new Matcher( pattern );
			const el1 = new Element( 'textarea' );
			const el2 = new Element( 'div' );

			const result = matcher.match( el1 );

			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.has.property( 'name' ).that.equal( pattern.name );
			expect( result ).to.have.property( 'match' ).that.has.property( 'name' ).that.is.true;
			expect( matcher.match( el2 ) ).to.be.null;
		} );

		it( 'should match element attributes', () => {
			const pattern = {
				attribute: {
					title: 'foobar'
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( 'p', { title: 'foobar'	} );
			const el2 = new Element( 'p', { title: 'foobaz'	} );

			const result = matcher.match( el1 );

			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).and.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );

			expect( result ).to.have.property( 'match' ).that.has.property( 'attribute' ).that.is.an( 'array' );

			expect( result.match.attribute[ 0 ] ).equal( 'title' );
			expect( matcher.match( el2 ) ).to.be.null;
		} );

		it( 'should match element attributes using RegExp', () => {
			const pattern =  {
				attribute: {
					title: /fooba./
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( 'p', { title: 'foobar'	} );
			const el2 = new Element( 'p', { title: 'foobaz'	} );

			let result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'attribute' ).that.is.an( 'array' );
			expect( result.match.attribute[ 0 ] ).equal( 'title' );

			result = matcher.match( el2 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'attribute' ).that.is.an( 'array' );
			expect( result.match.attribute[ 0 ] ).equal( 'title' );
		} );

		it( 'should match element class names', () => {
			const pattern = { class: 'foobar' };
			const matcher = new Matcher( pattern );
			const el1 = new Element( 'p', { class: 'foobar' } );

			const result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'class' ).that.is.an( 'array' );
			expect( result.match.class[ 0 ] ).equal( 'foobar' );
		} );

		it( 'should match element class names using RegExp', () => {
			const pattern = { class: /fooba./ };
			const matcher = new Matcher( pattern );
			const el1 = new Element( 'p', { class: 'foobar'	} );
			const el2 = new Element( 'p', { class: 'foobaz'	} );

			let result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'class' ).that.is.an( 'array' );
			expect( result.match.class[ 0 ] ).equal( 'foobar' );

			result = matcher.match( el2 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'class' ).that.is.an( 'array' );
			expect( result.match.class[ 0 ] ).equal( 'foobaz' );
		} );

		it( 'should match element styles', () => {
			const pattern = {
				style: {
					color: 'red'
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( 'p', { style: 'color: red' } );

			const result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'style' ).that.is.an( 'array' );
			expect( result.match.style[ 0 ] ).equal( 'color' );
		} );

		it( 'should match element styles using RegExp', () => {
			const pattern =  {
				style: {
					color: /^.*blue$/
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( 'p', { style: 'color: blue' } );
			const el2 = new Element( 'p', { style: 'color: darkblue' } );

			let result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'style' ).that.is.an( 'array' );
			expect( result.match.style[ 0 ] ).to.equal( 'color' );

			result = matcher.match( el2 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'style' ).that.is.an( 'array' );
			expect( result.match.style[ 0 ] ).to.equal( 'color' );
		} );
	} );
} );
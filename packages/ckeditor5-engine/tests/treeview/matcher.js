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

			const match = matcher.match( el );

			expect( match ).to.be.an( 'object' );
			expect( match ).to.have.property( 'element' );
			expect( match.element ).to.equal( el );
			expect( matcher.match( el2 ) ).to.be.null;
		} );

		it( 'should match element name with RegExp', () => {
			const matcher = new Matcher( { name: /^text...a$/ } );
			const el1 = new Element( 'textarea' );
			const el2 = new Element( 'div' );

			const match = matcher.match( el1 );

			expect( match ).to.be.an( 'object' );
			expect( match ).to.have.property( 'element' );
			expect( match.element ).to.equal( el1 );
			expect( matcher.match( el2 ) ).to.be.null;
		} );

		it( 'should match element attributes', () => {
			const matcher = new Matcher( {
				attribute: {
					title: 'foobar'
				}
			} );
			const el1 = new Element( 'p', { title: 'foobar'	} );
			const el2 = new Element( 'p', { title: 'foobaz'	} );

			const match = matcher.match( el1 );

			expect( match ).to.be.an( 'object' );
			expect( match ).to.have.property( 'element' );
			expect( match.element ).to.equal( el1 );
			expect( matcher.match( el2 ) ).to.be.null;
		} );

		it( 'should match element attributes using RegExp', () => {
			const matcher = new Matcher( {
				attribute: {
					title: /fooba./
				}
			} );
			const el1 = new Element( 'p', { title: 'foobar'	} );
			const el2 = new Element( 'p', { title: 'foobaz'	} );

			let match = matcher.match( el1 );
			expect( match ).to.be.an( 'object' );
			expect( match ).to.have.property( 'element' );
			expect( match.element ).to.equal( el1 );

			match = matcher.match( el2 );
			expect( match ).to.be.an( 'object' );
			expect( match ).to.have.property( 'element' );
			expect( match.element ).to.equal( el2 );
		} );

		it( 'should match element class names', () => {
			const matcher = new Matcher( { class: 'foobar' } );
			const el1 = new Element( 'p', { class: 'foobar' } );

			const match = matcher.match( el1 );
			expect( match ).to.be.an( 'object' );
			expect( match ).to.have.property( 'element' );
			expect( match.element ).to.equal( el1 );
		} );

		it( 'should match element class names using RegExp', () => {
			const matcher = new Matcher( { class: /fooba./ } );
			const el1 = new Element( 'p', { class: 'foobar'	} );
			const el2 = new Element( 'p', { class: 'foobaz'	} );

			let match = matcher.match( el1 );
			expect( match ).to.be.an( 'object' );
			expect( match ).to.have.property( 'element' );
			expect( match.element ).to.equal( el1 );

			match = matcher.match( el2 );
			expect( match ).to.be.an( 'object' );
			expect( match ).to.have.property( 'element' );
			expect( match.element ).to.equal( el2 );
		} );

		it( 'should match element styles', () => {
			const matcher = new Matcher( {
				style: {
					color: 'red'
				}
			} );
			const el1 = new Element( 'p', { style: 'color: red' } );

			const match = matcher.match( el1 );
			expect( match ).to.be.an( 'object' );
			expect( match ).to.have.property( 'element' );
			expect( match.element ).to.equal( el1 );
		} );

		it( 'should match element styles using RegExp', () => {
			const matcher = new Matcher( {
				style: {
					color: /^.*blue$/
				}
			} );
			const el1 = new Element( 'p', { style: 'color: blue' } );
			const el2 = new Element( 'p', { style: 'color: darkblue' } );

			let match = matcher.match( el1 );
			expect( match ).to.be.an( 'object' );
			expect( match ).to.have.property( 'element' );
			expect( match.element ).to.equal( el1 );

			match = matcher.match( el2 );
			expect( match ).to.be.an( 'object' );
			expect( match ).to.have.property( 'element' );
			expect( match.element ).to.equal( el2 );
		} );
	} );
} );
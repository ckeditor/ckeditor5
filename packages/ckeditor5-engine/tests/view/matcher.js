/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global console */

import Matcher from '../../src/view/matcher';
import Element from '../../src/view/element';
import Document from '../../src/view/document';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { StylesProcessor } from '../../src/view/stylesmap';
import { addMarginRules } from '../../src/view/styles/margin';
import { addBorderRules } from '../../src/view/styles/border';
import { addBackgroundRules } from '../../src/view/styles/background';

describe( 'Matcher', () => {
	let document;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		document = new Document( new StylesProcessor() );

		addMarginRules( document.stylesProcessor );
		addBorderRules( document.stylesProcessor );
		addBackgroundRules( document.stylesProcessor );
	} );

	describe( 'add', () => {
		it( 'should allow to add pattern to matcher', () => {
			const matcher = new Matcher( 'div' );
			const el = new Element( document, 'p', { title: 'foobar' } );

			expect( matcher.match( el ) ).to.be.null;
			const pattern = { name: 'p', attributes: { title: 'foobar' } };
			matcher.add( pattern );
			const result = matcher.match( el );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'element' ).that.equal( el );
			expect( result ).to.have.property( 'match' ).that.has.property( 'name' ).that.is.true;
			expect( result.match ).to.have.property( 'attributes' ).that.is.an( 'array' );
			expect( result.match.attributes[ 0 ] ).to.equal( 'title' );
			expect( result ).to.be.an( 'object' );
		} );

		it( 'should allow to add more than one pattern', () => {
			const matcher = new Matcher();
			const el1 = new Element( document, 'p' );
			const el2 = new Element( document, 'div' );

			matcher.add( 'p', 'div' );

			let result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.have.property( 'name' ).that.equal( 'p' );

			result = matcher.match( el2 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.have.property( 'name' ).that.equal( 'div' );
		} );
	} );

	describe( 'match', () => {
		it( 'should match element name', () => {
			const matcher = new Matcher( 'p' );
			const el = new Element( document, 'p' );
			const el2 = new Element( document, 'div' );

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
			const pattern = /^text...a$/;
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'textarea' );
			const el2 = new Element( document, 'div' );

			const result = matcher.match( el1 );

			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.has.property( 'name' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'name' ).that.is.true;
			expect( matcher.match( el2 ) ).to.be.null;
		} );

		it( 'should match all element attributes', () => {
			const pattern = {
				attributes: true
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { title: 'foobar' } );
			const el2 = new Element( document, 'p', { title: '', alt: 'alternative'	} );
			const el3 = new Element( document, 'p' );

			let result = matcher.match( el1 );

			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).and.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'attributes' ).that.is.an( 'array' );
			expect( result.match.attributes ).to.deep.equal( [ 'title' ] );

			result = matcher.match( el2 );

			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).and.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'attributes' ).that.is.an( 'array' );
			expect( result.match.attributes ).to.deep.equal( [ 'title', 'alt' ] );

			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should not match style and class attributes using "attributes: true" pattern', () => {
			const pattern = {
				attributes: true
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { style: 'color:red;' } );
			const el2 = new Element( document, 'p', { class: 'foobar' } );
			const el3 = new Element( document, 'p', { style: 'color:red;', class: 'foobar' } );

			expect( matcher.match( el1 ) ).to.be.null;
			expect( matcher.match( el2 ) ).to.be.null;
			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should not match style and class attributes using "attributes: Array" pattern', () => {
			const pattern = {
				attributes: [ 'style', 'class' ]
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { style: 'color:red;' } );
			const el2 = new Element( document, 'p', { class: 'foobar' } );
			const el3 = new Element( document, 'p', { style: 'color:red;', class: 'foobar' } );

			expect( matcher.match( el1 ) ).to.be.null;
			expect( matcher.match( el2 ) ).to.be.null;
			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should not match style and class attributes using "attributes: RegExp" pattern', () => {
			const pattern = {
				attributes: /.*/
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { style: 'color:red;' } );
			const el2 = new Element( document, 'p', { class: 'foobar' } );
			const el3 = new Element( document, 'p', { style: 'color:red;', class: 'foobar' } );

			expect( matcher.match( el1 ) ).to.be.null;
			expect( matcher.match( el2 ) ).to.be.null;
			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should match style and class attributes using "attributes: key->value" pattern', () => {
			// Stub console, otherwise it will break test coverage.
			sinon.stub( console, 'warn' );
			const pattern = {
				attributes: {
					style: true,
					class: true
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { style: 'color:red;', class: 'foobar' } );

			const result = matcher.match( el1 );

			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).and.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'attributes' ).that.is.an( 'array' );
			expect( result.match.attributes.length ).equal( 2 );
			expect( result.match.attributes ).to.deep.equal( [ 'style', 'class' ] );
		} );

		it( 'should display warning when using deprecated style attribute with key->value pattern', () => {
			const pattern = {
				attributes: {
					style: true
				}
			};
			const warnStub = sinon.stub( console, 'warn' );
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { style: 'color:red;' } );

			matcher.match( el1 );

			sinon.assert.calledOnceWithMatch(
				warnStub,
				'matcher-pattern-deprecated-attributes-style-key',
				pattern.attributes
			);
		} );

		it( 'should display warning when using deprecated class attribute with key->value pattern', () => {
			const pattern = {
				attributes: {
					class: true
				}
			};
			const warnStub = sinon.stub( console, 'warn' );
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { class: 'foobar' } );

			matcher.match( el1 );

			sinon.assert.calledOnceWithMatch(
				warnStub,
				'matcher-pattern-deprecated-attributes-class-key',
				pattern.attributes
			);
		} );

		it( 'should match style and class attributes using mixed pattern', () => {
			const pattern = {
				attributes: true,
				classes: true,
				styles: true
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { style: 'color:red;', class: 'foobar', 'data-foo': 'foo' } );

			const result = matcher.match( el1 );

			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).and.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );

			expect( result ).to.have.property( 'match' ).that.has.property( 'attributes' ).that.is.an( 'array' );
			expect( result.match.attributes.length ).equal( 1 );
			expect( result.match.attributes ).to.deep.equal( [ 'data-foo' ] );

			expect( result ).to.have.property( 'match' ).that.has.property( 'styles' ).that.is.an( 'array' );
			expect( result.match.styles.length ).equal( 1 );
			expect( result.match.styles ).to.deep.equal( [ 'color' ] );

			expect( result ).to.have.property( 'match' ).that.has.property( 'classes' ).that.is.an( 'array' );
			expect( result.match.classes.length ).equal( 1 );
			expect( result.match.classes ).to.deep.equal( [ 'foobar' ] );
		} );

		it( 'should match all element attributes using RegExp', () => {
			const pattern = {
				attributes: /data-.*/
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { 'data-foo': 'foo', 'data-bar': 'bar', title: 'other' } );
			const el2 = new Element( document, 'p', { title: 'foobar' } );
			const el3 = new Element( document, 'p' );

			const result = matcher.match( el1 );

			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).and.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'attributes' ).that.is.an( 'array' );
			expect( result.match.attributes.length ).equal( 2 );
			expect( result.match.attributes ).to.deep.equal( [ 'data-foo', 'data-bar' ] );

			expect( matcher.match( el2 ) ).to.be.null;
			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should match all element attributes using key->value, where key is a RegExp object and value is a boolean', () => {
			const pattern = {
				attributes: [
					{ key: /data-b.*/, value: true }
				]
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { 'data-foo': 'foo', 'data-bar': 'bar', title: 'other' } );
			const el2 = new Element( document, 'p', { title: 'foobar' } );
			const el3 = new Element( document, 'p' );

			const result = matcher.match( el1 );

			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).and.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'attributes' ).that.is.an( 'array' );
			expect( result.match.attributes.length ).equal( 1 );
			expect( result.match.attributes ).to.deep.equal( [ 'data-bar' ] );

			expect( matcher.match( el2 ) ).to.be.null;
			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should match all element attributes using key->value, where key is a RegExp object and value is a string', () => {
			const pattern = {
				attributes: [
					{ key: /data-.*/, value: 'bar' }
				]
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { 'data-foo': 'foo', 'data-bar': 'bar', title: 'other' } );
			const el2 = new Element( document, 'p', { title: 'foobar' } );
			const el3 = new Element( document, 'p' );

			const result = matcher.match( el1 );

			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).and.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'attributes' ).that.is.an( 'array' );
			expect( result.match.attributes.length ).equal( 1 );
			expect( result.match.attributes ).to.deep.equal( [ 'data-bar' ] );

			expect( matcher.match( el2 ) ).to.be.null;
			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should match all element attributes using key->value, where both are RegExp objects', () => {
			const pattern = {
				attributes: [
					{ key: /data-.*/, value: /b.*?r/ }
				]
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { 'data-foo': 'foo', 'data-bar': 'bar', title: 'other' } );
			const el2 = new Element( document, 'p', { title: 'foobar' } );
			const el3 = new Element( document, 'p' );

			const result = matcher.match( el1 );

			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).and.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'attributes' ).that.is.an( 'array' );
			expect( result.match.attributes.length ).equal( 1 );
			expect( result.match.attributes ).to.deep.equal( [ 'data-bar' ] );

			expect( matcher.match( el2 ) ).to.be.null;
			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should match nothing if pattern is incorrect', () => {
			const pattern = {
				// A stub for a non-plain object.
				attributes: 1
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { 'data-foo': 'foo', 'data-bar': 'bar', title: 'other' } );

			expect( matcher.match( el1 ) ).to.be.null;
		} );

		it( 'should match element attributes using String', () => {
			const pattern = {
				attributes: {
					title: 'foobar'
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { title: 'foobar'	} );
			const el2 = new Element( document, 'p', { title: 'foobaz'	} );
			const el3 = new Element( document, 'p', { name: 'foobar' } );

			const result = matcher.match( el1 );

			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).and.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );

			expect( result ).to.have.property( 'match' ).that.has.property( 'attributes' ).that.is.an( 'array' );

			expect( result.match.attributes ).to.deep.equal( [ 'title' ] );
			expect( matcher.match( el2 ) ).to.be.null;
			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should match element attributes using RegExp', () => {
			const pattern = {
				attributes: {
					title: /fooba./
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { title: 'foobar'	} );
			const el2 = new Element( document, 'p', { title: 'foobaz'	} );
			const el3 = new Element( document, 'p', { title: 'qux' } );

			let result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'attributes' ).that.is.an( 'array' );
			expect( result.match.attributes ).to.deep.equal( [ 'title' ] );

			result = matcher.match( el2 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'attributes' ).that.is.an( 'array' );
			expect( result.match.attributes ).to.deep.equal( [ 'title' ] );
			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should match if element has given attribute', () => {
			const pattern = {
				attributes: {
					title: true
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { title: 'foobar'	} );
			const el2 = new Element( document, 'p', { title: '' } );
			const el3 = new Element( document, 'p' );

			let result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'attributes' ).that.is.an( 'array' );
			expect( result.match.attributes ).to.deep.equal( [ 'title' ] );

			result = matcher.match( el2 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'attributes' ).that.is.an( 'array' );
			expect( result.match.attributes ).to.deep.equal( [ 'title' ] );

			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should match element class names', () => {
			const pattern = { classes: 'foobar' };
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { class: 'foobar' } );

			const result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'classes' ).that.is.an( 'array' );
			expect( result.match.classes ).to.deep.equal( [ 'foobar' ] );
			expect( new Matcher( { classes: 'baz' } ).match( el1 ) ).to.be.null;
		} );

		it( 'should match element class names using an array', () => {
			const pattern = { classes: [ 'foo', 'bar' ] };
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { class: 'foo bar' } );
			const el2 = new Element( document, 'p', { class: 'bar'	} );
			const el3 = new Element( document, 'p', { class: 'qux'	} );

			const result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'classes' ).that.is.an( 'array' );
			expect( result.match.classes.length ).equal( 2 );
			expect( result.match.classes ).to.deep.equal( [ 'foo', 'bar' ] );

			expect( matcher.match( el2 ) ).to.be.null;
			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should match element class names using an object', () => {
			const pattern = {
				classes: {
					foo: true,
					bar: true
				}
			};

			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { class: 'foo bar' } );
			const el2 = new Element( document, 'p', { class: 'bar'	} );
			const el3 = new Element( document, 'p', { class: 'qux'	} );

			const result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'classes' ).that.is.an( 'array' );
			expect( result.match.classes.length ).equal( 2 );
			expect( result.match.classes ).to.deep.equal( [ 'foo', 'bar' ] );

			expect( matcher.match( el2 ) ).to.be.null;
			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should match element class names using key->value pairs', () => {
			const pattern = {
				classes: [
					{ key: 'foo', value: true },
					{ key: /^b.*$/, value: true }
				]
			};

			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { class: 'foo bar' } );
			const el2 = new Element( document, 'p', { class: 'bar'	} );
			const el3 = new Element( document, 'p', { class: 'qux'	} );

			const result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'classes' ).that.is.an( 'array' );
			expect( result.match.classes.length ).equal( 2 );
			expect( result.match.classes ).to.deep.equal( [ 'foo', 'bar' ] );

			expect( matcher.match( el2 ) ).to.be.null;
			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should match element class names using RegExp', () => {
			const pattern = { classes: /fooba./ };
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { class: 'foobar'	} );
			const el2 = new Element( document, 'p', { class: 'foobaz'	} );
			const el3 = new Element( document, 'p', { class: 'qux'	} );

			let result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'classes' ).that.is.an( 'array' );
			expect( result.match.classes ).to.deep.equal( [ 'foobar' ] );

			result = matcher.match( el2 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'classes' ).that.is.an( 'array' );
			expect( result.match.classes ).to.deep.equal( [ 'foobaz' ] );
			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should match element styles', () => {
			const pattern = {
				styles: {
					color: 'red'
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { style: 'color: red' } );
			const el2 = new Element( document, 'p', { style: 'position: absolute' } );

			const result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'styles' ).that.is.an( 'array' );
			expect( result.match.styles ).to.deep.equal( [ 'color' ] );
			expect( matcher.match( el2 ) ).to.be.null;
			expect( new Matcher( { styles: { color: 'blue' } } ).match( el1 ) ).to.be.null;
		} );

		it( 'should match element styles using boolean', () => {
			const pattern = {
				styles: {
					color: true
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { style: 'color: blue' } );
			const el2 = new Element( document, 'p', { style: 'color: darkblue' } );
			const el3 = new Element( document, 'p', { style: 'border: 1px solid' } );

			let result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'styles' ).that.is.an( 'array' );
			expect( result.match.styles ).to.deep.equal( [ 'color' ] );

			result = matcher.match( el2 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'styles' ).that.is.an( 'array' );
			expect( result.match.styles ).to.deep.equal( [ 'color' ] );

			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should match element styles when CSS shorthand is used', () => {
			const pattern = {
				styles: {
					'margin-left': /.*/
				}
			};
			const matcher = new Matcher( pattern );

			const el1 = new Element( document, 'p', { style: 'margin: 1px' } );
			const el2 = new Element( document, 'p', { style: 'margin-left: 10px' } );
			const el3 = new Element( document, 'p', { style: 'border: 1px solid' } );

			let result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'styles' ).that.is.an( 'array' );
			expect( result.match.styles ).to.deep.equal( [ 'margin-left' ] );

			result = matcher.match( el2 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'styles' ).that.is.an( 'array' );
			expect( result.match.styles ).to.deep.equal( [ 'margin-left' ] );

			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should match element expanded styles', () => {
			const pattern = {
				styles: {
					'border-left-style': /.*/
				}
			};
			const matcher = new Matcher( pattern );

			const el1 = new Element( document, 'p', { style: 'border: 1px solid' } );
			const el2 = new Element( document, 'p', { style: 'border-style: solid' } );
			const el3 = new Element( document, 'p', { style: 'margin-left: darkblue' } );

			let result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'styles' ).that.is.an( 'array' );
			expect( result.match.styles ).to.deep.equal( [ 'border-left-style' ] );

			result = matcher.match( el2 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'styles' ).that.is.an( 'array' );
			expect( result.match.styles ).to.deep.equal( [ 'border-left-style' ] );

			expect( matcher.match( el3 ) ).to.be.null;
		} );

		// With current way the style reducers work, this test is passing when it shouldn't.
		// The problem is described in https://github.com/ckeditor/ckeditor5/issues/10399.
		// Until the proper fix is ready, this test should be skipped.
		it.skip( 'should match element expanded styles when CSS shorthand is used', () => {
			const pattern = {
				styles: {
					'border-left': /.*/
				}
			};
			const matcher = new Matcher( pattern );

			const el1 = new Element( document, 'p', { style: 'border: 1px solid' } );
			const el2 = new Element( document, 'p', { style: 'border-style: solid' } );
			const el3 = new Element( document, 'p', { style: 'margin-left: darkblue' } );

			let result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'styles' ).that.is.an( 'array' );
			expect( result.match.styles ).to.deep.equal( [ 'border-left' ] );

			result = matcher.match( el2 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'styles' ).that.is.an( 'array' );
			expect( result.match.styles ).to.deep.equal( [ 'border-left' ] );

			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should match element styles using an array', () => {
			const pattern = {
				styles: [ 'color' ]
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { style: 'color: blue' } );
			const el2 = new Element( document, 'p', { style: 'color: darkblue' } );
			const el3 = new Element( document, 'p', { style: 'border: 1px solid' } );

			let result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'styles' ).that.is.an( 'array' );
			expect( result.match.styles ).to.deep.equal( [ 'color' ] );

			result = matcher.match( el2 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'styles' ).that.is.an( 'array' );
			expect( result.match.styles ).to.deep.equal( [ 'color' ] );

			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should match element styles using RegExp', () => {
			const pattern = {
				styles: {
					color: /^.*blue$/
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { style: 'color: blue' } );
			const el2 = new Element( document, 'p', { style: 'color: darkblue' } );
			const el3 = new Element( document, 'p', { style: 'color: red' } );

			let result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'styles' ).that.is.an( 'array' );
			expect( result.match.styles ).to.deep.equal( [ 'color' ] );

			result = matcher.match( el2 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'styles' ).that.is.an( 'array' );
			expect( result.match.styles ).to.deep.equal( [ 'color' ] );
			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should match element styles using key->value, where both are RegExp objects', () => {
			const pattern = {
				styles: [
					{ key: /border-.*/, value: /.*/ }
				]
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { style: 'border-top: 1px solid blue' } );
			const el2 = new Element( document, 'p', { style: 'border-top-width: 3px' } );
			const el3 = new Element( document, 'p', { style: 'color: red' } );

			let result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'styles' ).that.is.an( 'array' );
			expect( result.match.styles ).to.deep.equal( [
				'border-color',
				'border-style',
				'border-width',
				'border-top',
				'border-top-color',
				'border-top-style',
				'border-top-width'
			] );

			result = matcher.match( el2 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'styles' ).that.is.an( 'array' );
			expect( result.match.styles ).to.deep.equal( [
				'border-width',
				'border-top',
				'border-top-width'
			] );

			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should display warning when key->value pattern is missing key', () => {
			const pattern = {
				styles: [
					{ key: /border-.*/ }
				]
			};
			const warnStub = sinon.stub( console, 'warn' );
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { style: 'border-top: 1px solid blue' } );

			matcher.match( el1 );

			sinon.assert.calledOnceWithMatch(
				warnStub,
				'matcher-pattern-missing-key-or-value',
				pattern.styles[ 0 ]
			);
		} );

		it( 'should display warning when key->value pattern is missing value', () => {
			const pattern = {
				styles: [
					{ value: 'red' }
				]
			};
			const warnStub = sinon.stub( console, 'warn' );
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { style: 'border-top: 1px solid blue' } );

			matcher.match( el1 );

			sinon.assert.calledOnceWithMatch(
				warnStub,
				'matcher-pattern-missing-key-or-value',
				pattern.styles[ 0 ]
			);
		} );

		it( 'should allow to use function as a pattern', () => {
			const match = { name: true };
			const pattern = element => {
				if ( element.name === 'div' && element.childCount > 0 ) {
					return match;
				}

				return null;
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p' );
			const el2 = new Element( document, 'div', null, [ el1 ] );

			expect( matcher.match( el1 ) ).to.be.null;
			const result = matcher.match( el2 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'match' ).that.equal( match );
		} );

		it( 'should return first matched element', () => {
			const pattern = {
				name: 'p'
			};
			const el1 = new Element( document, 'div' );
			const el2 = new Element( document, 'p' );
			const el3 = new Element( document, 'span' );
			const matcher = new Matcher( pattern );

			const result = matcher.match( el1, el2, el3 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.is.an( 'object' );
			expect( result.match ).to.have.property( 'name' ).that.is.true;
		} );

		it( 'should match multiple attributes', () => {
			const pattern = {
				name: 'a',
				attributes: {
					name: 'foo',
					title: 'bar'
				}
			};
			const matcher = new Matcher( pattern );
			const el = new Element( document, 'a', {
				name: 'foo',
				title: 'bar'
			} );

			const result = matcher.match( el );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.is.an( 'object' );
			expect( result.match ).to.have.property( 'attributes' ).that.is.an( 'array' );
			expect( result.match.attributes ).to.deep.equal( [ 'name', 'title' ] );
		} );

		it( 'should match multiple classes', () => {
			const pattern = {
				name: 'a',
				classes: [ 'foo', 'bar' ]
			};
			const matcher = new Matcher( pattern );
			const el = new Element( document, 'a' );
			el._addClass( [ 'foo', 'bar', 'baz' ] );

			const result = matcher.match( el );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.is.an( 'object' );
			expect( result.match ).to.have.property( 'classes' ).that.is.an( 'array' );
			expect( result.match.classes ).to.deep.equal( [ 'foo', 'bar' ] );
		} );

		it( 'should match multiple styles', () => {
			const pattern = {
				name: 'a',
				styles: {
					color: 'red',
					position: 'relative'
				}
			};
			const matcher = new Matcher( pattern );
			const el = new Element( document, 'a' );
			el._setStyle( {
				color: 'red',
				position: 'relative'
			} );

			const result = matcher.match( el );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.is.an( 'object' );
			expect( result.match ).to.have.property( 'styles' ).that.is.an( 'array' );
			expect( result.match.styles ).to.deep.equal( [ 'color', 'position' ] );
		} );
	} );

	describe( 'matchAll', () => {
		it( 'should return all matched elements with correct patterns', () => {
			const matcher = new Matcher( 'p', 'div' );
			const el1 = new Element( document, 'p' );
			const el2 = new Element( document, 'div' );
			const el3 = new Element( document, 'span' );

			const result = matcher.matchAll( el1, el2, el3 );
			expect( result ).to.be.an( 'array' );
			expect( result.length ).to.equal( 2 );
			expect( result[ 0 ] ).to.have.property( 'element' ).that.equal( el1 );
			expect( result[ 0 ] ).to.have.property( 'pattern' ).that.is.an( 'object' );
			expect( result[ 0 ].pattern ).to.have.property( 'name' ).that.is.equal( 'p' );
			expect( result[ 0 ] ).to.have.property( 'match' ).that.is.an( 'object' );
			expect( result[ 0 ].match ).to.have.property( 'name' ).that.is.true;

			expect( result[ 1 ] ).to.have.property( 'element' ).that.equal( el2 );
			expect( result[ 1 ] ).to.have.property( 'pattern' ).that.is.an( 'object' );
			expect( result[ 1 ].pattern ).to.have.property( 'name' ).that.is.equal( 'div' );
			expect( result[ 1 ] ).to.have.property( 'match' ).that.is.an( 'object' );
			expect( result[ 1 ].match ).to.have.property( 'name' ).that.is.true;

			expect( matcher.matchAll( el3 ) ).to.be.null;
		} );

		it( 'should return all matched elements when using RegExp pattern', () => {
			const pattern = { classes: /^red-.*/ };
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p' );
			const el2 = new Element( document, 'p' );
			const el3 = new Element( document, 'p' );

			el1._addClass( 'red-foreground' );
			el2._addClass( 'red-background' );
			el3._addClass( 'blue-text' );

			const result = matcher.matchAll( el1, el2, el3 );
			expect( result ).to.be.an( 'array' );
			expect( result.length ).to.equal( 2 );
			expect( result[ 0 ] ).to.have.property( 'element' ).that.equal( el1 );
			expect( result[ 0 ] ).to.have.property( 'pattern' ).that.is.equal( pattern );
			expect( result[ 0 ] ).to.have.property( 'match' ).that.is.an( 'object' );
			expect( result[ 0 ].match ).to.have.property( 'classes' ).that.is.an( 'array' );
			expect( result[ 0 ].match.classes[ 0 ] ).to.equal( 'red-foreground' );

			expect( result[ 1 ] ).to.have.property( 'element' ).that.equal( el2 );
			expect( result[ 1 ] ).to.have.property( 'pattern' ).that.is.equal( pattern );
			expect( result[ 1 ] ).to.have.property( 'match' ).that.is.an( 'object' );
			expect( result[ 1 ].match ).to.have.property( 'classes' ).that.is.an( 'array' );
			expect( result[ 1 ].match.classes[ 0 ] ).to.equal( 'red-background' );

			expect( matcher.matchAll( el3 ) ).to.be.null;
		} );

		it( 'should match classes when using global flag in matcher pattern', () => {
			const pattern = { classes: /foo/g };
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p' );
			const el2 = new Element( document, 'p' );

			el1._addClass( 'foobar' );
			el2._addClass( 'foobaz' );

			const result = matcher.matchAll( el1, el2 );

			expect( result ).to.be.an( 'array' );
			expect( result.length ).to.equal( 2 );

			expect( result[ 0 ] ).to.have.property( 'pattern' ).that.is.equal( pattern );
			expect( result[ 0 ] ).to.have.property( 'match' ).that.is.an( 'object' );
			expect( result[ 0 ].match ).to.have.property( 'classes' ).that.is.an( 'array' );
			expect( result[ 0 ].match.classes[ 0 ] ).to.equal( 'foobar' );

			expect( result[ 1 ] ).to.have.property( 'element' ).that.equal( el2 );
			expect( result[ 1 ] ).to.have.property( 'pattern' ).that.is.equal( pattern );
			expect( result[ 1 ] ).to.have.property( 'match' ).that.is.an( 'object' );
			expect( result[ 1 ].match ).to.have.property( 'classes' ).that.is.an( 'array' );
			expect( result[ 1 ].match.classes[ 0 ] ).to.equal( 'foobaz' );
		} );

		it( 'should match many classes on single element when using global flag in matcher pattern', () => {
			const pattern = { classes: /foo/g };
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p' );

			el1._addClass( 'foobar' );
			el1._addClass( 'foobaz' );

			const result = matcher.matchAll( el1 );

			expect( result ).to.be.an( 'array' );
			expect( result.length ).to.equal( 1 );

			expect( result[ 0 ] ).to.have.property( 'pattern' ).that.is.equal( pattern );
			expect( result[ 0 ] ).to.have.property( 'match' ).that.is.an( 'object' );
			expect( result[ 0 ].match ).to.have.property( 'classes' ).that.is.an( 'array' );
			expect( result[ 0 ].match.classes[ 0 ] ).to.equal( 'foobar' );
			expect( result[ 0 ].match.classes[ 1 ] ).to.equal( 'foobaz' );
		} );

		it( 'should match attributes when using global flag in matcher pattern', () => {
			const pattern = {
				attributes: {
					'data-attribute': /foo/g
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p' );
			const el2 = new Element( document, 'p' );

			el1._setAttribute( 'data-attribute', 'foobar' );
			el2._setAttribute( 'data-attribute', 'foobaz' );

			const result = matcher.matchAll( el1, el2 );

			expect( result ).to.be.an( 'array' );
			expect( result.length ).to.equal( 2 );

			expect( result[ 0 ] ).to.have.property( 'pattern' ).that.is.equal( pattern );
			expect( result[ 0 ] ).to.have.property( 'match' ).that.is.an( 'object' );
			expect( result[ 0 ].match ).to.have.property( 'attributes' ).that.is.an( 'array' );
			expect( result[ 0 ].match.attributes[ 0 ] ).to.equal( 'data-attribute' );

			expect( result[ 1 ] ).to.have.property( 'element' ).that.equal( el2 );
			expect( result[ 1 ] ).to.have.property( 'pattern' ).that.is.equal( pattern );
			expect( result[ 1 ] ).to.have.property( 'match' ).that.is.an( 'object' );
			expect( result[ 1 ].match ).to.have.property( 'attributes' ).that.is.an( 'array' );
			expect( result[ 1 ].match.attributes[ 0 ] ).to.equal( 'data-attribute' );
		} );
	} );

	describe( 'getElementName', () => {
		it( 'should return null if there are no patterns in the matcher instance', () => {
			const matcher = new Matcher();

			expect( matcher.getElementName() ).to.be.null;
		} );

		it( 'should return null if pattern has no name property', () => {
			const matcher = new Matcher( { classes: 'foo' } );

			expect( matcher.getElementName() ).to.be.null;
		} );

		it( 'should return null if pattern has name property specified as RegExp', () => {
			const matcher = new Matcher( { name: /foo.*/ } );

			expect( matcher.getElementName() ).to.be.null;
		} );

		it( 'should return element name if matcher has one patter with name property specified as string', () => {
			const matcher = new Matcher( { name: 'div' } );

			expect( matcher.getElementName() ).to.equal( 'div' );
		} );

		it( 'should return null if matcher has more than one pattern', () => {
			const matcher = new Matcher( { name: 'div' }, { classes: 'foo' } );

			expect( matcher.getElementName() ).to.be.null;
		} );

		it( 'should return null for matching function', () => {
			const matcher = new Matcher( () => {} );

			expect( matcher.getElementName() ).to.be.null;
		} );

		it( 'should return null for matching named function', () => {
			const matcher = new Matcher( function matchFunction() {} );

			expect( matcher.getElementName() ).to.be.null;
		} );
	} );
} );

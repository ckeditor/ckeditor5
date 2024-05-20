/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor.js';
import ComponentFactory from '../src/componentfactory.js';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { View } from '../src/index.js';

class SpanView extends View {
	constructor( locale, text ) {
		super( locale );

		this.setTemplate( {
			tag: 'span',
			children: [ text ]
		} );
	}
}

describe( 'ComponentFactory', () => {
	let editor, factory;

	beforeEach( () => {
		editor = new Editor();
		factory = new ComponentFactory( editor );
	} );

	describe( 'constructor()', () => {
		it( 'sets all the properties', () => {
			expect( factory ).to.have.property( 'editor', editor );
		} );
	} );

	describe( 'names()', () => {
		it( 'returns iterator', () => {
			const names = factory.names();

			expect( names.next ).to.be.a( 'function' );
		} );

		it( 'returns iterator of command names', () => {
			factory.add( 'foo', () => {} );
			factory.add( 'bar', () => {} );
			factory.add( 'Baz', () => {} );

			expect( Array.from( factory.names() ) ).to.have.members( [ 'foo', 'bar', 'Baz' ] );
		} );
	} );

	describe( 'add()', () => {
		it( 'does not normalize component names', () => {
			factory.add( 'FoO', () => {} );

			expect( Array.from( factory.names() ) ).to.have.members( [ 'FoO' ] );
		} );

		it( 'should allow overriding already registered components', () => {
			factory.add( 'foo', () => 'old' );
			factory.add( 'foo', () => 'new' );

			expect( factory.create( 'foo' ) ).to.equal( 'new' );
		} );

		it( 'should allow overriding already registered components (same name, different case)', () => {
			factory.add( 'foo', () => 'old' );
			factory.add( 'Foo', () => 'new' );

			expect( factory.create( 'foo' ) ).to.equal( 'new' );
		} );
	} );

	describe( 'create()', () => {
		it( 'throws when trying to create a component which has not been registered', () => {
			expectToThrowCKEditorError( () => {
				factory.create( 'foo' );
			}, /^componentfactory-item-missing/, editor );
		} );

		it( 'creates an instance', () => {
			class View {
				constructor( locale ) {
					this.locale = locale;
				}
			}

			const locale = editor.locale = {};

			factory.add( 'foo', locale => new View( locale ) );

			const instance = factory.create( 'foo' );

			expect( instance ).to.be.instanceof( View );
			expect( instance.locale ).to.equal( locale );
		} );

		it( 'creates an instance even with different case', () => {
			class View {
				constructor( locale ) {
					this.locale = locale;
				}
			}

			const locale = editor.locale = {};

			factory.add( 'Foo', locale => new View( locale ) );

			const instance = factory.create( 'foo' );

			expect( instance ).to.be.instanceof( View );
			expect( instance.locale ).to.equal( locale );
		} );

		it( 'attaches the UI component name as a data attribute ([data-cke-component-name])', () => {
			factory.add( 'foo', locale => new SpanView( locale, 'foo' ) );

			const instance = factory.create( 'foo' );
			instance.render();

			expect( instance.element.outerHTML ).to.contains( 'data-cke-component-name="foo"' );
		} );

		// See: https://github.com/ckeditor/ckeditor5/pull/16388#issuecomment-2121026178.
		it( 'returns null if a factory callback does not return an instance of View', () => {
			factory.add( 'foo', () => null );

			const instance = factory.create( 'foo' );

			expect( instance ).to.equal( null );
		} );
	} );

	describe( 'has()', () => {
		it( 'checks if the factory contains a component of a given name', () => {
			factory.add( 'foo', () => {} );
			factory.add( 'bar', () => {} );

			expect( factory.has( 'foo' ) ).to.be.true;
			expect( factory.has( 'bar' ) ).to.be.true;
			expect( factory.has( 'baz' ) ).to.be.false;
			expect( factory.has( 'Foo' ) ).to.be.true;
			expect( factory.has( 'fOO' ) ).to.be.true;
		} );
	} );
} );

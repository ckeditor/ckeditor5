/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import ComponentFactory from '../src/componentfactory';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

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
		it( 'throws when trying to override already registered component', () => {
			factory.add( 'foo', () => {} );

			expectToThrowCKEditorError( () => {
				factory.add( 'foo', () => {} );
			}, /^componentfactory-item-exists/, editor );
		} );

		it( 'throws when trying to override already registered component added with different case', () => {
			factory.add( 'Foo', () => {} );

			expectToThrowCKEditorError( () => {
				factory.add( 'foo', () => {} );
			}, /^componentfactory-item-exists/, editor );
		} );

		it( 'does not normalize component names', () => {
			factory.add( 'FoO', () => {} );

			expect( Array.from( factory.names() ) ).to.have.members( [ 'FoO' ] );
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

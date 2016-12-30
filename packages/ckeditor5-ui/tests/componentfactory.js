/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Editor from 'ckeditor5-core/src/editor/editor';
import ComponentFactory from 'ckeditor5-ui/src/componentfactory';
import CKEditorError from 'ckeditor5-utils/src/ckeditorerror';

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

	describe( 'add', () => {
		it( 'throws when trying to override already registered component', () => {
			factory.add( 'foo', () => {} );

			expect( () => {
				factory.add( 'foo', () => {} );
			} ).to.throw( CKEditorError, /^componentfactory-item-exists/ );
		} );
	} );

	describe( 'create', () => {
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
	} );
} );

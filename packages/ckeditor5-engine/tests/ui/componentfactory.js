/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui */

'use strict';

import Editor from '/ckeditor5/core/editor.js';
import ComponentFactory from '/ckeditor5/core/ui/componentfactory.js';
import CKEditorError from '/ckeditor5/core/ckeditorerror.js';

describe( 'ComponentFactory', () => {
	let editor, factory;

	beforeEach( () => {
		editor = new Editor();
		factory = new ComponentFactory( editor );
	} );

	describe( 'constructor', () => {
		it( 'sets all the properties', () => {
			expect( factory ).to.have.property( 'editor', editor );
		} );
	} );

	describe( 'add', () => {
		it( 'throws when trying to override already registered component', () => {
			factory.add( 'foo', class {}, class {}, {} );

			expect( () => {
				factory.add( 'foo', class {}, class {}, {} );
			} ).to.throw( CKEditorError, /^componentfactory-item-exists/ );
		} );
	} );

	describe( 'create', () => {
		it( 'creates an instance', () => {
			class View {}

			class Controller {
				constructor( model, view, ed ) {
					expect( model ).to.equal( model );
					expect( view ).to.be.instanceof( View );
					expect( ed ).to.equal( editor );
				}
			}

			const model = {};

			factory.add( 'foo', Controller, View, model );

			const instance = factory.create( 'foo' );

			expect( instance ).to.be.instanceof( Controller );
		} );
	} );
} );

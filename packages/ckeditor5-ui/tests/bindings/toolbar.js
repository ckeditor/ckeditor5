/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, toolbar */

'use strict';

import Editor from '/ckeditor5/editor.js';
import Model from '/ckeditor5/ui/model.js';
import View from '/ckeditor5/ui/view.js';
import Controller from '/ckeditor5/ui/controller.js';
import Toolbar from '/ckeditor5/ui/bindings/toolbar.js';

describe( 'Toolbar', () => {
	let toolbar, view, model, editor;

	beforeEach( () => {
		editor = new Editor();
		model = new Model();
		view = new View( model );
		toolbar = new Toolbar( view, model, editor );
	} );

	describe( 'constructor', () => {
		it( 'sets all the properties', () => {
			expect( toolbar ).to.have.property( 'editor', editor );
		} );
	} );

	describe( 'addButtons', () => {
		it( 'creates buttons for each button name', () => {
			const createSpy = sinon.spy( () => new Controller() );

			editor.ui = {
				featureComponents: {
					create: createSpy
				}
			};

			toolbar.addButtons( [ 'foo', 'bar' ] );

			expect( createSpy.callCount ).to.equal( 2 );
			expect( createSpy.firstCall.calledWith( 'foo' ) ).to.be.true;
			expect( createSpy.secondCall.calledWith( 'bar' ) ).to.be.true;
		} );

		it( 'adds created compoments to the collection of buttons', () => {
			const component = new Controller();
			const createSpy = sinon.spy( () => component );

			editor.ui = {
				featureComponents: {
					create: createSpy
				}
			};

			toolbar.addButtons( [ 'foo' ] );

			expect( toolbar.collections.get( 'buttons' ).get( 0 ) ).to.equal( component );
		} );
	} );
} );

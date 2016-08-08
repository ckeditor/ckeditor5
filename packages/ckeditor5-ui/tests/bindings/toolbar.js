/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, bindings, toolbar */

import Editor from '/ckeditor5/core/editor/editor.js';
import Model from '/ckeditor5/ui/model.js';
import View from '/ckeditor5/ui/view.js';
import Controller from '/ckeditor5/ui/controller.js';
import Toolbar from '/ckeditor5/ui/bindings/toolbar.js';

import testUtils from '/tests/core/_utils/utils.js';
testUtils.createSinonSandbox();

describe( 'Toolbar', () => {
	let toolbar, model;

	const editor = new Editor();

	editor.ui = {
		featureComponents: {
			create: () => new Controller()
		}
	};

	beforeEach( () => {
		model = new Model( {
			isActive: false,
			config: [ 'bold', 'italic' ]
		} );

		toolbar = new Toolbar( model, new View(), editor );
	} );

	describe( 'constructor', () => {
		it( 'sets all the properties', () => {
			expect( toolbar ).to.have.property( 'editor', editor );
		} );
	} );

	describe( 'init', () => {
		it( 'calls bindToolbarItems', () => {
			const spy = testUtils.sinon.spy( toolbar, 'bindToolbarItems' );

			return toolbar.init().then( () => {
				expect( spy.calledOnce ).to.be.true;
			} );
		} );
	} );
} );

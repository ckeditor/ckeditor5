/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, button */

'use strict';

import Button from '/ckeditor5/core/ui/button/button.js';
import View from '/ckeditor5/core/ui/view.js';
import Model from '/ckeditor5/core/ui/model.js';

describe( 'Button', () => {
	let model, button, view;

	beforeEach( () => {
		model = new Model();
		view = new View();
		button = new Button( model, view );
	} );

	describe( 'constructor', () => {
		it( 'creates view#click -> model#execute binding', () => {
			const spy = sinon.spy();

			model.on( 'execute', spy );

			view.fire( 'click' );

			expect( spy.calledOnce ).to.be.true;
		} );
	} );
} );

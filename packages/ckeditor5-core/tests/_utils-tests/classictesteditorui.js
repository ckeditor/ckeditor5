/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ComponentFactory from '@ckeditor/ckeditor5-ui/src/componentfactory';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import ClassicTestEditorUI from '../../tests/_utils/classictesteditorui';
import View from '@ckeditor/ckeditor5-ui/src/view';

describe( 'ClassicTestEditorUI', () => {
	let editor, view, ui;

	beforeEach( () => {
		editor = {};
		view = new View();
		ui = new ClassicTestEditorUI( editor, view );
	} );

	describe( 'constructor()', () => {
		it( 'sets #editor', () => {
			expect( ui.editor ).to.equal( editor );
		} );

		it( 'sets #view', () => {
			expect( ui.view ).to.equal( view );
		} );

		it( 'creates #componentFactory factory', () => {
			expect( ui.componentFactory ).to.be.instanceOf( ComponentFactory );
		} );

		it( 'creates #focusTracker', () => {
			expect( ui.focusTracker ).to.be.instanceOf( FocusTracker );
		} );
	} );

	describe( 'init()', () => {
		it( 'initializes the #view', () => {
			const spy = sinon.spy( view, 'init' );

			ui.init();
			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'destroys the #view', () => {
			const spy = sinon.spy( view, 'destroy' );

			ui.init();
			ui.destroy();
			sinon.assert.calledOnce( spy );
		} );
	} );
} );

/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ComponentFactory from 'ckeditor5-ui/src/componentfactory';
import FocusTracker from 'ckeditor5-utils/src/focustracker';
import ClassicTestEditorUI from 'ckeditor5-core/tests/_utils/classictesteditorui';
import View from 'ckeditor5-ui/src/view';

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
		it( 'returns a promise', () => {
			expect( ui.init() ).to.be.instanceof( Promise );
		} );

		it( 'initializes the #view', () => {
			const spy = sinon.spy( view, 'init' );

			return ui.init().then( () => {
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'returns a promise', () => {
			return ui.init().then( () => {
				expect( ui.destroy() ).to.be.instanceof( Promise );
			} );
		} );

		it( 'destroys the #view', () => {
			const spy = sinon.spy( view, 'destroy' );

			return ui.init()
				.then( () => ui.destroy() )
				.then( () => {
					sinon.assert.calledOnce( spy );
				} );
		} );
	} );
} );

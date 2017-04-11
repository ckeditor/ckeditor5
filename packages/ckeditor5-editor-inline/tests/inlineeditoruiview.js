/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import InlineEditorUIView from '../src/inlineeditoruiview';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';

describe( 'InlineEditorUIView', () => {
	let locale, view;

	beforeEach( () => {
		locale = new Locale( 'en' );
		view = new InlineEditorUIView( locale );
	} );

	describe( 'constructor()', () => {
		describe( '#toolbar', () => {
			it( 'is created', () => {
				expect( view.toolbar ).to.be.instanceof( ToolbarView );
			} );

			it( 'is given a locale object', () => {
				expect( view.toolbar.locale ).to.equal( locale );
			} );
		} );

		describe( '#panel', () => {
			it( 'is created', () => {
				expect( view.panel ).to.be.instanceof( BalloonPanelView );
			} );

			it( 'is given a locale object', () => {
				expect( view.panel.locale ).to.equal( locale );
			} );

			it( 'is given the right CSS class', () => {
				expect( view.panel.element.classList.contains( 'ck-toolbar__container' ) ).to.be.true;
			} );

			it( 'is put into the #body collection', () => {
				expect( view.body.get( 0 ) ).to.equal( view.panel );
			} );

			it( 'gets view.panel#withArrow set', () => {
				expect( view.panel.withArrow ).to.be.false;
			} );
		} );

		describe( '#editable', () => {
			it( 'is created', () => {
				expect( view.editable ).to.be.instanceof( InlineEditableUIView );
			} );

			it( 'is given a locate object', () => {
				expect( view.editable.locale ).to.equal( locale );
			} );

			it( 'is registered as a child', () => {
				const spy = sinon.spy( view.editable, 'destroy' );

				return view.init()
					.then( () => view.destroy() )
					.then( () => {
						sinon.assert.calledOnce( spy );
					} );
			} );
		} );
	} );

	describe( 'init()', () => {
		it( 'appends #toolbar to panel#content', () => {
			expect( view.panel.content ).to.have.length( 0 );

			return view.init()
				.then( () => {
					expect( view.panel.content.get( 0 ) ).to.equal( view.toolbar );
				} )
				.then( () => view.destroy() );
		} );
	} );

	describe( 'editableElement', () => {
		it( 'returns editable\'s view element', () => {
			return view.init()
				.then( () => {
					expect( view.editableElement.getAttribute( 'contentEditable' ) ).to.equal( 'true' );
				} )
				.then( () => view.destroy() );
		} );
	} );

	describe( 'panelPositions', () => {
		it( 'returns the right positions in the right order', () => {
			const positions = view.panelPositions;
			const editableRect = {
				top: 100,
				bottom: 200,
				left: 100,
				right: 100,
				width: 100,
				height: 100
			};
			const panelRect = {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				width: 50,
				height: 50
			};

			expect( positions ).to.have.length( 4 );

			expect( positions[ 0 ]( editableRect, panelRect ) ).to.deep.equal( {
				name: 'toolbar_nw',
				left: 100,
				top: 50
			} );

			expect( positions[ 1 ]( editableRect, panelRect ) ).to.deep.equal( {
				name: 'toolbar_sw',
				left: 100,
				top: 200
			} );

			expect( positions[ 2 ]( editableRect, panelRect ) ).to.deep.equal( {
				name: 'toolbar_ne',
				left: 150,
				top: 50
			} );

			expect( positions[ 3 ]( editableRect, panelRect ) ).to.deep.equal( {
				name: 'toolbar_se',
				left: 150,
				top: 200
			} );
		} );
	} );
} );

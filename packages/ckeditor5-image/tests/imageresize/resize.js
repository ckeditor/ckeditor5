/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, window */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ImagePlugin from '../../src/image';

import {
	getData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'Image resizer', () => {
	const FIXTURE_WIDTH = 100;
	const FIXTURE_HEIGHT = 50;
	const MOUSE_BUTTON_MAIN = 0; // Id of left mouse button.
	// 60x30 black png image
	const imageFixture = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAQAAAAAPLY1AAAAQklEQVR42u3PQREAAAgDoK1/' +
		'aM3g14MGNJMXKiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiJysRFNMgH0RpujAAAAAElFTkSuQmCC';
	let editor, view, viewDocument, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		editorElement.innerHTML = `<p>foo</p><figure><img src="${ imageFixture }"></figure>`;

		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ ImagePlugin, ParagraphPlugin ]
			} )
			.then( newEditor => {
				editor = newEditor;
				view = editor.editing.view;
				viewDocument = view.document;
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	describe( 'visual resizers', () => {
		it( 'correct amount is added by default', () => {
			const resizers = document.querySelectorAll( '.ck-widget__resizer' );

			expect( resizers.length ).to.be.equal( 4 );
		} );

		describe( 'visibility', () => {
			it( 'is hidden by default', () => {
				const allResizers = document.querySelectorAll( '.ck-widget__resizer' );

				for ( const resizer of allResizers ) {
					expect( isVisible( resizer ) ).to.be.false;
				}
			} );

			it( 'is shown when image is focused', () => {
				const widget = viewDocument.getRoot().getChild( 1 );
				const allResizers = document.querySelectorAll( '.ck-widget__resizer' );
				const domEventDataMock = {
					target: widget,
					preventDefault: sinon.spy()
				};

				viewDocument.fire( 'mousedown', domEventDataMock );

				for ( const resizer of allResizers ) {
					expect( isVisible( resizer ) ).to.be.true;
				}
			} );
		} );
	} );

	describe( 'standard image', () => {
		let widget;

		beforeEach( async () => {
			await editor.setData( `<p>foo</p><figure class="image image-style-side"><img src="${ imageFixture }"></figure>` );

			widget = viewDocument.getRoot().getChild( 1 );
			const domEventDataMock = {
				target: widget,
				preventDefault: sinon.spy()
			};

			viewDocument.fire( 'mousedown', domEventDataMock );
		} );
	} );

	describe( 'side image', () => {
		let widget;

		beforeEach( async () => {
			await editor.setData( `<p>foo</p><figure class="image image-style-side"><img src="${ imageFixture }"></figure>` );

			widget = viewDocument.getRoot().getChild( 1 );
			const domEventDataMock = {
				target: widget,
				preventDefault: sinon.spy()
			};

			viewDocument.fire( 'mousedown', domEventDataMock );
		} );

		it( 'shrinks correctly with left-bottom handler', () => {
			const expectedWidth = 80;

			const domResizeWrapper = view.domConverter.mapViewToDom( widget.getChild( 1 ) );
			const domBottomLeftResizer = domResizeWrapper.querySelector( '.ck-widget__resizer-bottom-left' );
			const domImage = view.domConverter.mapViewToDom( widget ).querySelector( 'img' );
			const imageTopLeftPosition = getElementPosition( domImage );

			const initialPointerPosition = {
				pageX: imageTopLeftPosition.x,
				pageY: imageTopLeftPosition.y + FIXTURE_HEIGHT
			};

			const finishPointerPosition = {
				pageX: imageTopLeftPosition.x + 20,
				pageY: imageTopLeftPosition.y + FIXTURE_HEIGHT - 10
			};

			fireMouseEvent( domBottomLeftResizer, 'mousedown', initialPointerPosition );
			fireMouseEvent( domBottomLeftResizer, 'mousemove', initialPointerPosition );

			// We need to wait as mousemove events are throttled.
			return wait( 30 )
				.then( () => {
					fireMouseEvent( domBottomLeftResizer, 'mousemove', finishPointerPosition );

					expect( domImage.width ).to.be.closeTo( 80, 1, 'View width check' );

					fireMouseEvent( domBottomLeftResizer, 'mouseup', finishPointerPosition );

					expect( getData( editor.model, {
						withoutSelection: true
					} ) ).to.match( /<paragraph>foo<\/paragraph><image src=".+?" width="(\d+)"><\/image>/ );

					const modelItem = editor.model.document.getRoot().getChild( 1 );

					expect( modelItem.getAttribute( 'width' ) ).to.be.closeTo( expectedWidth, 1, 'Model check' );
				} );
		} );

		it( 'shrinks correctly with right-bottom handler', () => {
			const expectedWidth = 80;

			const domResizeWrapper = view.domConverter.mapViewToDom( widget.getChild( 1 ) );
			const domBottomLeftResizer = domResizeWrapper.querySelector( '.ck-widget__resizer-bottom-left' );
			const domImage = view.domConverter.mapViewToDom( widget ).querySelector( 'img' );
			const imageTopLeftPosition = getElementPosition( domImage );

			const initialPointerPosition = {
				pageX: imageTopLeftPosition.x + FIXTURE_WIDTH,
				pageY: imageTopLeftPosition.y + FIXTURE_HEIGHT
			};

			const finishPointerPosition = {
				pageX: imageTopLeftPosition.x + FIXTURE_WIDTH - 20,
				pageY: imageTopLeftPosition.y + FIXTURE_HEIGHT - 10
			};

			fireMouseEvent( domBottomLeftResizer, 'mousedown', initialPointerPosition );
			fireMouseEvent( domBottomLeftResizer, 'mousemove', initialPointerPosition );

			// We need to wait as mousemove events are throttled.
			return wait( 30 )
				.then( () => {
					fireMouseEvent( domBottomLeftResizer, 'mousemove', finishPointerPosition );

					expect( domImage.width ).to.be.closeTo( expectedWidth, 1 );

					fireMouseEvent( domBottomLeftResizer, 'mouseup', finishPointerPosition );

					expect( getData( editor.model, {
						withoutSelection: true
					} ) ).to.equal( `<paragraph>foo</paragraph><image src="${ imageFixture }" width="${ expectedWidth }"></image>` );
				} );
		} );
	} );

	function isVisible( element ) {
		// Checks if the DOM element is visible to the end user.
		return element.offsetParent !== null;
	}

	function fireMouseEvent( target, eventType, eventData ) {
		// Using initMouseEvent instead of MouseEvent constructor, as MouseEvent constructor doesn't support passing pageX
		// and pageY. See https://stackoverflow.com/questions/45843458/setting-click-events-pagex-and-pagey-always-reverts-to-0
		// However there's still a problem, that events created with `initMouseEvent` have **floored** pageX, pageY numbers.
		const event = document.createEvent( 'MouseEvent' );
		event.initMouseEvent( eventType, true, true, window, null, 0, 0, eventData.pageX, eventData.pageY, false, false, false, false,
			MOUSE_BUTTON_MAIN, null );

		target.dispatchEvent( event );
	}

	function getElementPosition( element ) {
		// Returns top left corner point.
		const viewportPosition = element.getBoundingClientRect();

		return {
			x: viewportPosition.left + window.scrollX,
			y: viewportPosition.top + window.scrollY
		};
	}

	function wait( delay ) {
		return new Promise( resolve => window.setTimeout( () => resolve(), delay ) );
	}
} );

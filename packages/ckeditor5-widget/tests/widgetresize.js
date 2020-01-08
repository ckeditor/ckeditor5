/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

import WidgetResize from '../src/widgetresize';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

describe( 'WidgetResize', () => {
	let editor, editorElement;

	before( async () => {
		editorElement = createEditorElement();
		editor = await createEditor( editorElement );
	} );

	after( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	describe( 'plugin', () => {
		it( 'is loaded', () => {
			expect( editor.plugins.get( WidgetResize ) ).to.be.instanceOf( WidgetResize );
		} );
	} );

	describe( 'mouse listeners', () => {
		it( 'doesnt break when called with unexpected element', () => {
			const unrelatedElement = document.createElement( 'div' );

			editor.plugins.get( WidgetResize )._mouseDownListener( {}, {
				target: unrelatedElement
			} );
		} );
	} );

	describe( 'mouse listeners (stubbed)', () => {
		let mouseListenerStubs, localEditor, localElement;

		beforeEach( async () => {
			mouseListenerStubs = {
				down: sinon.stub( WidgetResize.prototype, '_mouseDownListener' ),
				move: sinon.stub( WidgetResize.prototype, '_mouseMoveListener' ),
				up: sinon.stub( WidgetResize.prototype, '_mouseUpListener' )
			};

			localElement = createEditorElement();
			localEditor = await createEditor( localElement );
		} );

		afterEach( () => {
			for ( const stub of Object.values( mouseListenerStubs ) ) {
				stub.restore();
			}

			localElement.remove();

			return localEditor.destroy();
		} );

		it( 'are detached when plugin is destroyed', async () => {
			await localEditor.destroy();

			// Trigger mouse event.
			fireMouseEvent( document.body, 'mousedown', {} );
			// Ensure nothing got called.
			expect( mouseListenerStubs.down.callCount ).to.be.equal( 0 );
		} );
	} );

	function createEditor( element ) {
		return new Promise( ( resolve, reject ) => {
			ClassicTestEditor
				.create( element, {
					plugins: [
						ArticlePluginSet, WidgetResize
					]
				} )
				.then( newEditor => {
					resolve( newEditor );
				} )
				.catch( reject );
		} );
	}

	function createEditorElement() {
		const element = document.createElement( 'div' );
		document.body.appendChild( element );
		return element;
	}

	function fireMouseEvent( target, eventType, eventData ) {
		// Id of the left mouse button.
		const MOUSE_BUTTON_MAIN = 0;

		// Using initMouseEvent instead of MouseEvent constructor, as MouseEvent constructor doesn't support passing pageX
		// and pageY. See https://stackoverflow.com/questions/45843458/setting-click-events-pagex-and-pagey-always-reverts-to-0
		// However there's still a problem, that events created with `initMouseEvent` have **floored** pageX, pageY numbers.
		const event = document.createEvent( 'MouseEvent' );
		event.initMouseEvent( eventType, true, true, window, null, 0, 0, eventData.pageX, eventData.pageY, false, false, false, false,
			MOUSE_BUTTON_MAIN, null );

		target.dispatchEvent( event );
	}
} );

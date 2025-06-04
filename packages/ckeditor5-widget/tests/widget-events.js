/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import KeyObserver from '@ckeditor/ckeditor5-engine/src/view/observer/keyobserver.js';

import { toWidget } from '../src/utils.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'Widget - Events', () => {
	const EVENT_NAME = 'keyup';
	let editor, editorElement, eventCallback, buttonIgnored, buttonRegular;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = createEditorElement();
		editor = await createEditor( editorElement );
	} );

	afterEach( () => {
		editorElement.remove();

		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'should not ignore events from child inside parent without the `data-cke-ignore-events` attribute', () => {
		buttonRegular.dispatchEvent( new Event( EVENT_NAME, { bubbles: true } ) );

		expect( eventCallback.callCount ).to.equal( 1 );
	} );

	it( 'should ignore events from child inside parent with the `data-cke-ignore-events` attribute', () => {
		buttonIgnored.dispatchEvent( new Event( EVENT_NAME, { bubbles: true } ) );

		expect( eventCallback.callCount ).to.equal( 0 );
	} );

	function createEditorElement() {
		return document.body.appendChild( document.createElement( 'div' ) );
	}

	async function createEditor( element ) {
		const editor = await ClassicEditor.create( element, { plugins: [ simpleWidgetPlugin ] } );

		setModelData( editor.model, '[<simpleWidgetElement></simpleWidgetElement>]' );

		const container = Array
			.from( editor.editing.view.document.getRoot().getChildren() )
			.find( element => element.hasClass( 'simple-widget-container' ) );

		const domFragment = editor.editing.view.domConverter.mapViewToDom( container );

		buttonIgnored = domFragment.querySelector( '#ignored-button' );
		buttonRegular = domFragment.querySelector( '#regular-button' );

		return editor;
	}

	function simpleWidgetPlugin( editor ) {
		defineSchema( editor );
		defineConverters( editor );
		addObserver( editor );

		function defineSchema( editor ) {
			editor.model.schema.register( 'simpleWidgetElement', {
				allowIn: '$root',
				isObject: true
			} );
		}

		function defineConverters( editor ) {
			editor.conversion.for( 'editingDowncast' )
				.elementToStructure( {
					model: 'simpleWidgetElement',
					view: ( modelElement, { writer } ) => {
						const widgetElement = createWidgetView( modelElement, { writer } );

						return toWidget( widgetElement, writer );
					}
				} );

			editor.conversion.for( 'dataDowncast' )
				.elementToStructure( {
					model: 'simpleWidgetElement',
					view: createWidgetView
				} );

			editor.conversion.for( 'upcast' )
				.elementToElement( {
					model: 'simpleWidgetElement',
					view: {
						name: 'section',
						classes: 'simple-widget-container'
					}
				} );

			function createWidgetView( modelElement, { writer } ) {
				const simpleWidgetContainer = writer.createContainerElement( 'section', { class: 'simple-widget-container' } );
				const simpleWidgetElement = writer.createRawElement( 'div', { class: 'simple-widget-element' }, domElement => {
					domElement.innerHTML = `
						<div data-cke-ignore-events="true">
							<button id="ignored-button">Click!</button>
						</div>
						<div>
							<button id="regular-button">Click!</button>
						</div>
					`;
				} );

				writer.insert( writer.createPositionAt( simpleWidgetContainer, 0 ), simpleWidgetElement );

				return simpleWidgetContainer;
			}
		}

		function addObserver( editor ) {
			eventCallback = sinon.fake();

			editor.editing.view.addObserver( KeyObserver );
			editor.editing.view.document.on( EVENT_NAME, eventCallback );
		}
	}
} );

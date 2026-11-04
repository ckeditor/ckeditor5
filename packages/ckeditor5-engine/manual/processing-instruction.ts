/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Undo } from '@ckeditor/ckeditor5-undo';

import type { UpcastElementEvent } from '../src/conversion/upcastdispatcher.js';

declare global {
	interface Window { editor: any }
}

// Kept as a string rather than in the page markup on purpose. Whether `<?target data?>` in the page
// source is parsed into a processing instruction depends on the browser, and the converters below are
// registered only after `create()` resolves - so the initial content has to be set explicitly anyway.
const INITIAL_DATA =
	'<p>Paired markers: <?marker start?>between the markers<?marker end?> and done.</p>' +
	'<p>A list marker follows: <?if !supportLists?>1.</p>' +
	'<p>An instruction with no data part: <?endif?></p>';

/**
 * Custom properties come back as `unknown`, and a processing instruction ends at the first `>`
 * with no way to escape it - so anything that would not survive a round trip is dropped here.
 */
function readProperty( viewElement: { getCustomProperty( name: string ): unknown }, name: string ): string {
	const value = viewElement.getCustomProperty( name );

	if ( typeof value !== 'string' || value.includes( '>' ) ) {
		return '';
	}

	return value;
}

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ) as HTMLElement,
		plugins: [ Enter, Typing, Paragraph, Bold, Italic, Undo ],
		toolbar: [ 'bold', 'italic', '|', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;

		// By default the data processor drops processing instructions, exactly like comments.
		// They have to reach the view before any converter can see them.
		editor.data.processor.skipProcessingInstructions = false;

		editor.model.schema.register( 'processingInstruction', {
			inheritAllFrom: '$inlineObject',
			allowAttributes: [ 'piTarget', 'piData' ]
		} );

		// View `$processingInstruction` UI element -> model element.
		editor.conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on<UpcastElementEvent>( 'element:$processingInstruction', ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.viewItem, { name: true } ) ) {
					return;
				}

				const target = readProperty( data.viewItem, '$processingTarget' );

				if ( !target ) {
					return;
				}

				const modelElement = conversionApi.writer.createElement( 'processingInstruction', {
					piTarget: target,
					piData: readProperty( data.viewItem, '$processingData' )
				} );

				if ( !conversionApi.safeInsert( modelElement, data.modelCursor ) ) {
					return;
				}

				conversionApi.updateConversionResult( modelElement, data );
			} );
		} );

		// Model element -> a real processing instruction node in the output data. The UI element name
		// is what makes the DOM converter call `createProcessingInstruction()` instead of `createElement()`.
		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'processingInstruction',
			view: ( modelElement, { writer } ) => {
				const viewElement = writer.createUIElement( '$processingInstruction' );

				writer.setCustomProperty( '$processingTarget', modelElement.getAttribute( 'piTarget' ), viewElement );
				writer.setCustomProperty( '$processingData', modelElement.getAttribute( 'piData' ), viewElement );

				return viewElement;
			}
		} );

		// Model element -> something visible, so the instruction can be located and deleted.
		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'processingInstruction',
			view: ( modelElement, { writer } ) => {
				const target = modelElement.getAttribute( 'piTarget' );
				const data = modelElement.getAttribute( 'piData' );
				const label = data ? `<?${ target } ${ data }?>` : `<?${ target }?>`;

				return writer.createUIElement( 'span', { class: 'processing-instruction' }, function( domDocument ) {
					const domElement = this.toDomElement( domDocument );

					domElement.textContent = label;

					return domElement;
				} );
			}
		} );

		editor.setData( INITIAL_DATA );
		printData();

		document.getElementById( 'print-data' )!.addEventListener( 'click', printData );

		document.getElementById( 'reset-data' )!.addEventListener( 'click', () => {
			editor.setData( INITIAL_DATA );
			printData();
		} );

		function printData() {
			document.getElementById( 'data-output' )!.textContent = editor.getData();
		}
	} )
	.catch( err => {
		console.error( err.stack );
	} );

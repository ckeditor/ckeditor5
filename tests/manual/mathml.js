/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ViewDocumentFragment from '@ckeditor/ckeditor5-engine/src/view/documentfragment';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import XmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/xmldataprocessor';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

class MathMLEditing extends Plugin {
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;

		// Configure the schema.
		schema.register( 'mathml', {
			allowWhere: '$text',
			isObject: true,
			isInline: true,
			allowAttributes: [ 'formula' ]
		} );

		// View -> Model
		editor.data.upcastDispatcher.on( 'element:math', ( evt, data, conversionApi ) => {
			const { consumable, writer } = conversionApi;
			const viewItem = data.viewItem;

			// When element was already consumed then skip it.
			if ( !consumable.test( viewItem, { name: true } ) ) {
				return;
			}

			// Get the formula of the <math> (which is all its children).
			const processor = new XmlDataProcessor();
			const viewDocumentFragment = new ViewDocumentFragment( viewItem.getChildren() );
			const formula = processor.toData( viewDocumentFragment ) || '';

			// Create the <mathml> model element.
			const modelElement = writer.createElement( 'mathml', { formula } );

			// Find allowed parent for element that we are going to insert.
			// If current parent does not allow to insert element but one of the ancestors does
			// then split nodes to allowed parent.
			const splitResult = conversionApi.splitToAllowedParent( modelElement, data.modelCursor );

			// When there is no split result it means that we can't insert element to model tree, so let's skip it.
			if ( !splitResult ) {
				return;
			}

			// Insert element on allowed position.
			conversionApi.writer.insert( modelElement, splitResult.position );

			// Consume appropriate value from consumable values list.
			consumable.consume( viewItem, { name: true } );

			const parts = conversionApi.getSplitParts( modelElement );

			// Set conversion result range.
			data.modelRange = writer.createRange(
				conversionApi.writer.createPositionBefore( modelElement ),
				conversionApi.writer.createPositionAfter( parts[ parts.length - 1 ] )
			);

			// Now we need to check where the `modelCursor` should be.
			if ( splitResult.cursorParent ) {
				// If we split parent to insert our element then we want to continue conversion in the new part of the split parent.
				//
				// before: <allowed><notAllowed>foo[]</notAllowed></allowed>
				// after:  <allowed><notAllowed>foo</notAllowed><converted></converted><notAllowed>[]</notAllowed></allowed>

				data.modelCursor = conversionApi.writer.createPositionAt( splitResult.cursorParent, 0 );
			} else {
				// Otherwise just continue after inserted element.
				data.modelCursor = data.modelRange.end;
			}
		} );

		// Model -> Editing view
		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'mathml',
			view: ( modelItem, viewWriter ) => {
				const widgetElement = createMathMLView( modelItem, viewWriter );

				return toWidget( widgetElement, viewWriter );
			}
		} );

		// Model -> Data view
		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'mathml',
			view: createMathMLView
		} );

		function createMathMLView( modelItem, viewWriter ) {
			const widgetElement = viewWriter.createContainerElement( 'span', {
				class: 'ck-math-widget'
			} );

			const mathContainer = viewWriter.createUIElement( 'span', {}, function( domDocument ) {
				const containerDOMElement = this.toDomElement( domDocument );
				const mathDOMElement = document.createElementNS( 'http://www.w3.org/1998/Math/MathML', 'math' );
				mathDOMElement.innerHTML = modelItem.getAttribute( 'formula' );

				containerDOMElement.appendChild( mathDOMElement );

				return containerDOMElement;
			} );

			viewWriter.insert( viewWriter.createPositionAt( widgetElement, 0 ), mathContainer );

			return widgetElement;
		}
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, MathMLEditing ],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		],
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

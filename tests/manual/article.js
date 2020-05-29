/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';

class RawHtml extends Plugin {
	init() {
		const editor = this.editor;

		editor.model.schema.register( 'rawHtml', {
			allowWhere: '$block',
			allowAttributes: [ 'rawHtmlContent' ],
			isObject: true
		} );

		// We need to use an event-based converter to be able to consume the content
		// of that element (so nothing tries to convert it).
		editor.conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on( 'element:raw-html', ( evt, data, conversionApi ) => {
				const writer = conversionApi.writer;
				const viewItem = data.viewItem;
				const viewItemContent = stringifyViewItem( viewItem );

				const modelElement = conversionApi.writer.createElement( 'rawHtml', { rawHtmlContent: viewItemContent } );

				//
				// Everything below is a 1:1 copy from
				// https://github.com/ckeditor/ckeditor5/blob/79221ae/packages/ckeditor5-engine/src/conversion/upcasthelpers.js#L541
				//
				// Ticket to track: https://github.com/ckeditor/ckeditor5/issues/7336
				//

				// Let's see if the codeBlock can be inserted the current modelCursor.
				const splitResult = conversionApi.splitToAllowedParent( modelElement, data.modelCursor );

				// When there is no split result it means that we can't insert element to model tree,
				// so let's skip it.
				if ( !splitResult ) {
					return;
				}

				// Insert element on allowed position.
				writer.insert( modelElement, splitResult.position );

				conversionApi.consumable.consume( viewItem, { name: true } );

				const parts = conversionApi.getSplitParts( modelElement );

				// Set conversion result range.
				data.modelRange = writer.createRange(
					conversionApi.writer.createPositionBefore( modelElement ),
					conversionApi.writer.createPositionAfter( parts[ parts.length - 1 ] )
				);

				// If we had to split parent to insert our element then we want to continue conversion inside
				// the split parent.
				//
				// before split:
				//
				//		<allowed><notAllowed>[]</notAllowed></allowed>
				//
				// after split:
				//
				//		<allowed>
				//			<notAllowed></notAllowed>
				//			<converted></converted>
				//			<notAllowed>[]</notAllowed>
				//		</allowed>
				if ( splitResult.cursorParent ) {
					data.modelCursor = writer.createPositionAt( splitResult.cursorParent, 0 );
				} else {
					// Otherwise just continue after the inserted element.
					data.modelCursor = data.modelRange.end;
				}
			} );
		} );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'rawHtml',
			view: ( modelElement, viewWriter ) => {
				const viewContainer = toWidget( viewWriter.createContainerElement( 'div', { class: 'raw-html' } ), viewWriter );
				const viewUIElement = viewWriter.createUIElement( 'div', { class: 'raw-html-content' }, function( domDocument ) {
					const domElement = this.toDomElement( domDocument );

					domElement.innerHTML = modelElement.getAttribute( 'rawHtmlContent' );

					return domElement;
				} );

				viewWriter.insert( viewWriter.createPositionAt( viewContainer, 0 ), viewUIElement );

				return viewContainer;
			}
		} );

		// It's ugly, but we cannot produce this:
		// <raw-html>
		//		... the raw HTML content...
		// </raw-html>
		//
		// Because <raw-html> would have to be a UIElement and that's not allowed.
		// Hence, we need another wrapper so we have the usual ContainerElement>UIElement structure.
		//
		// Ticket to follow https://github.com/ckeditor/ckeditor5/issues/4469.
		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'rawHtml',
			view: ( modelElement, viewWriter ) => {
				const viewContainer = viewWriter.createContainerElement( 'raw-html' );
				const viewUIElement = viewWriter.createUIElement( 'raw-html-content', null, function( domDocument ) {
					const domElement = this.toDomElement( domDocument );

					domElement.innerHTML = modelElement.getAttribute( 'rawHtmlContent' );

					return domElement;
				} );

				viewWriter.insert( viewWriter.createPositionAt( viewContainer, 0 ), viewUIElement );

				return viewContainer;
			}
		} );

		function stringifyViewItem( viewItem ) {
			const contentContainer = Array.from( viewItem.getChildren() ).find( node => node.is( 'raw-html-content' ) );

			return editor.data.processor.toData( new UpcastWriter().createDocumentFragment( contentContainer.getChildren() ) );
		}
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, RawHtml ],
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


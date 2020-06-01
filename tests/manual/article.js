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

		// We need to use an event-based converter to be able to stop conversion of this element
		// children. That's not possible by using `elementToElement()`.
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

		// Setup content delete restrictions. Either as:

		// a) Restricting what is allowed to be removed (using model.deleteContent() decorator).
		this.listenTo( editor.model, 'deleteContent', restrictDeleteContent( editor ), { priority: 'high' } );

		// b) Restoring removed items from the $graveyard (using model post-fixer).
		// editor.model.document.registerPostFixer( writer => restoreRemovedRawHtml( writer, editor.model ) );
	}
}

// Naive example of blocking `model.deleteContent()` if it contains
function restrictDeleteContent() {
	return ( evt, args ) => {
		const [ selection ] = args;

		for ( const { item } of selection.getFirstRange() ) {
			// Prevent delete content if it contains rawHtml element.
			if ( item.is( 'rawHtml' ) ) {
				// Block the delete content.
				evt.stop();

				return;

				// However if anything more than a `rawHtml` is selected you might want to set selection to a range
				// that excludes that element (to remove part of content before or after it) and allow `model.deleteContent()
				// operate on that modified selection.
			}
		}
	};
}

// Restore a removed rawHtml.
function restoreRemovedRawHtml( writer, model ) {
	// Differ offers a simplified list of changes and is not optimize for this kind of operations.
	// However we could extract pairs of removed RawHtml element in the graveyard and location from where it was removed.
	const changes = model.document.differ.getChanges( { includeChangesInGraveyard: true } );

	const removedRawHtmlElements = [];
	const removePositions = [];

	let wasFixed = false;

	for ( const entry of changes ) {
		// The "insert" to "$graveyard" hold information about element removed from "main" content.
		if ( entry.name == 'rawHtml' && entry.type == 'insert' && entry.position.root.rootName == '$graveyard' ) {
			removedRawHtmlElements.push( entry.position.nodeAfter );
		}

		// The "insert" to "$graveyard" hold information about element removed from "main" content.
		if ( entry.name == 'rawHtml' && entry.type == 'remove' ) {
			removePositions.push( entry.position );
		}
	}

	if ( removedRawHtmlElements.length ) {
		wasFixed = true;

		for ( let i = 0; i < removedRawHtmlElements.length; i++ ) {
			const removedRawHtmlElement = removedRawHtmlElements[ i ];
			const removePosition = removePositions[ i ];

			writer.move( writer.createRangeOn( removedRawHtmlElement ), removePosition );
		}
	}

	return wasFixed;
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


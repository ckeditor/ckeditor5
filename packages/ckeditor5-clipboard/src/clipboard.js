/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module clipboard/clipboard
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import PastePlainText from './pasteplaintext';

import ClipboardObserver from './clipboardobserver';

import plainTextToHtml from './utils/plaintexttohtml';
import normalizeClipboardHtml from './utils/normalizeclipboarddata';
import viewToPlainText from './utils/viewtoplaintext.js';

import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';

/**
 * The clipboard feature. It is responsible for intercepting the `paste` and `drop` events and
 * passing the pasted content through the clipboard pipeline in order to insert it into the editor's content.
 * It also handles the `cut` and `copy` events to fill the native clipboard with serialized editor's data.
 *
 * Read more about the clipboard integration in {@glink framework/guides/deep-dive/clipboard "Clipboard" deep dive} guide.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Clipboard extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Clipboard';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ PastePlainText ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const modelDocument = editor.model.document;
		const view = editor.editing.view;
		const viewDocument = view.document;

		view.addObserver( ClipboardObserver );

		// The clipboard paste pipeline.

		// Pasting and dropping is disabled when editor is read-only.
		// See: https://github.com/ckeditor/ckeditor5-clipboard/issues/26.
		this.listenTo( viewDocument, 'clipboardInput', evt => {
			if ( editor.isReadOnly ) {
				evt.stop();
			}
		}, { priority: 'highest' } );

		this.listenTo( viewDocument, 'clipboardInput', ( evt, data ) => {
			const dataTransfer = data.dataTransfer;
			let content = '';

			if ( dataTransfer.getData( 'text/html' ) ) {
				content = normalizeClipboardHtml( dataTransfer.getData( 'text/html' ) );
			} else if ( dataTransfer.getData( 'text/plain' ) ) {
				content = plainTextToHtml( dataTransfer.getData( 'text/plain' ) );
			}

			content = this.editor.data.htmlProcessor.toView( content );

			const eventInfo = new EventInfo( this, 'inputTransformation' );
			this.fire( eventInfo, {
				content,
				dataTransfer,
				asPlainText: data.asPlainText
			} );

			// If CKEditor handled the input, do not bubble the original event any further.
			// This helps external integrations recognize that fact and act accordingly.
			// https://github.com/ckeditor/ckeditor5-upload/issues/92
			if ( eventInfo.stop.called ) {
				evt.stop();
			}

			view.scrollToTheSelection();
		}, { priority: 'low' } );

		this.listenTo( this, 'inputTransformation', ( evt, data ) => {
			if ( !data.content.isEmpty ) {
				const dataController = this.editor.data;
				const model = this.editor.model;

				// Convert the pasted content to a model document fragment.
				// The conversion is contextual, but in this case we need an "all allowed" context
				// and for that we use the $clipboardHolder item.
				const modelFragment = dataController.toModel( data.content, '$clipboardHolder' );

				if ( modelFragment.childCount == 0 ) {
					return;
				}

				model.change( writer => {
					const selection = model.document.selection;

					// Plain text can be determined based on event flag (#7799) or auto-detection (#1006). If detected,
					// preserve selection attributes on pasted items.
					if ( data.asPlainText || isPlainTextFragment( modelFragment, model.schema ) ) {
						// Formatting attributes should be preserved.
						const textAttributes = Array.from( selection.getAttributes() )
							.filter( ( [ key ] ) => model.schema.getAttributeProperties( key ).isFormatting );

						if ( !selection.isCollapsed ) {
							model.deleteContent( selection, { doNotAutoparagraph: true } );
						}

						// Also preserve other attributes if they survived the content deletion (because they were not fully selected).
						// For example linkHref is not a formatting attribute but it should be preserved if pasted text was in the middle
						// of a link.
						textAttributes.push( ...selection.getAttributes() );

						const range = writer.createRangeIn( modelFragment );

						for ( const item of range.getItems() ) {
							if ( item.is( '$text' ) || item.is( '$textProxy' ) ) {
								writer.setAttributes( textAttributes, item );
							}
						}
					}

					model.insertContent( modelFragment );
				} );

				evt.stop();
			}
		}, { priority: 'low' } );

		// The clipboard copy/cut pipeline.

		function onCopyCut( evt, data ) {
			const dataTransfer = data.dataTransfer;

			data.preventDefault();

			const content = editor.data.toView( editor.model.getSelectedContent( modelDocument.selection ) );

			viewDocument.fire( 'clipboardOutput', { dataTransfer, content, method: evt.name } );
		}

		this.listenTo( viewDocument, 'copy', onCopyCut, { priority: 'low' } );
		this.listenTo( viewDocument, 'cut', ( evt, data ) => {
			// Cutting is disabled when editor is read-only.
			// See: https://github.com/ckeditor/ckeditor5-clipboard/issues/26.
			if ( editor.isReadOnly ) {
				data.preventDefault();
			} else {
				onCopyCut( evt, data );
			}
		}, { priority: 'low' } );

		this.listenTo( viewDocument, 'clipboardOutput', ( evt, data ) => {
			if ( !data.content.isEmpty ) {
				data.dataTransfer.setData( 'text/html', this.editor.data.htmlProcessor.toData( data.content ) );
				data.dataTransfer.setData( 'text/plain', viewToPlainText( data.content ) );
			}

			if ( data.method == 'cut' ) {
				editor.model.deleteContent( modelDocument.selection );
			}
		}, { priority: 'low' } );
	}
}

/**
 * Fired with a `content` and `dataTransfer` objects. The `content` which comes from the clipboard (was pasted or dropped)
 * should be processed in order to be inserted into the editor. The `dataTransfer` object is available
 * in case the transformation functions need access to raw clipboard data.
 *
 * It is a part of the {@glink framework/guides/deep-dive/clipboard#input-pipeline "clipboard input pipeline"}.
 *
 * @see module:clipboard/clipboardobserver~ClipboardObserver
 * @see module:clipboard/clipboard~Clipboard
 * @event module:clipboard/clipboard~Clipboard#event:inputTransformation
 * @param {Object} data Event data.
 * @param {module:engine/view/documentfragment~DocumentFragment} data.content Event data. Content to be inserted into the editor.
 * It can be modified by the event listeners. Read more about the clipboard pipelines in
 * {@glink framework/guides/deep-dive/clipboard "Clipboard" deep dive}.
 * @param {module:clipboard/datatransfer~DataTransfer} data.dataTransfer Data transfer instance.
 * @param {Boolean} data.asPlainText If set to `true`, the content is pasted as plain text.
 */

/**
 * Fired on {@link module:engine/view/document~Document#event:copy} and {@link module:engine/view/document~Document#event:cut}
 * with a copy of selected content. The content can be processed before it ends up in the clipboard.
 *
 * It is a part of the {@glink framework/guides/deep-dive/clipboard#output-pipeline "clipboard output pipeline"}.
 *
 * @see module:clipboard/clipboardobserver~ClipboardObserver
 * @see module:clipboard/clipboard~Clipboard
 * @event module:engine/view/document~Document#event:clipboardOutput
 * @param {module:clipboard/clipboard~ClipboardOutputEventData} data Event data.
 */

/**
 * The value of the {@link module:engine/view/document~Document#event:clipboardOutput} event.
 *
 * @class module:clipboard/clipboard~ClipboardOutputEventData
 */

/**
 * Data transfer instance.
 *
 * @readonly
 * @member {module:clipboard/datatransfer~DataTransfer} module:clipboard/clipboard~ClipboardOutputEventData#dataTransfer
 */

/**
 * Content to be put into the clipboard. It can be modified by the event listeners.
 * Read more about the clipboard pipelines in {@glink framework/guides/deep-dive/clipboard "Clipboard" deep dive}.
 *
 * @member {module:engine/view/documentfragment~DocumentFragment} module:clipboard/clipboard~ClipboardOutputEventData#content
 */

/**
 * Whether the event was triggered by a copy or cut operation.
 *
 * @member {'copy'|'cut'} module:clipboard/clipboard~ClipboardOutputEventData#method
 */

// Returns true if specified `documentFragment` represents a plain text.
//
// @param {module:engine/view/documentfragment~DocumentFragment} documentFragment
// @param {module:engine/model/schema~Schema} schema
// @returns {Boolean}
function isPlainTextFragment( documentFragment, schema ) {
	if ( documentFragment.childCount > 1 ) {
		return false;
	}

	const child = documentFragment.getChild( 0 );

	if ( schema.isObject( child ) ) {
		return false;
	}

	return [ ...child.getAttributeKeys() ].length == 0;
}

/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module clipboard/pasteplaintext
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import ClipboardObserver from './clipboardobserver';
import ClipboardPipeline from './clipboardpipeline';

/**
 * The plugin detects the user's intention to paste plain text.
 *
 * For example, it detects the <kbd>Ctrl/Cmd</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> keystroke.
 *
 * @extends module:core/plugin~Plugin
 */
export default class PastePlainText extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'PastePlainText';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ClipboardPipeline ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const model = editor.model;
		const view = editor.editing.view;
		const viewDocument = view.document;
		const selection = model.document.selection;

		let shiftPressed = false;

		view.addObserver( ClipboardObserver );

		this.listenTo( viewDocument, 'keydown', ( evt, data ) => {
			shiftPressed = data.shiftKey;
		} );

		editor.plugins.get( ClipboardPipeline ).on( 'contentInsertion', ( evt, data ) => {
			// Plain text can be determined based on the event flag (#7799) or auto-detection (#1006). If detected,
			// preserve selection attributes on pasted items.
			if ( !shiftPressed && !isPlainTextFragment( data.content, model.schema ) ) {
				return;
			}

			model.change( writer => {
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

				const range = writer.createRangeIn( data.content );

				for ( const item of range.getItems() ) {
					if ( item.is( '$textProxy' ) ) {
						writer.setAttributes( textAttributes, item );
					}
				}
			} );
		} );
	}
}

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

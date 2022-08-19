/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/input
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import InsertTextCommand from './inserttextcommand';
import InsertTextObserver from './inserttextobserver';

/**
 * Handles text input coming from the keyboard or other input methods.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Input extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Input';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const model = editor.model;
		const view = editor.editing.view;
		const modelSelection = model.document.selection;

		view.addObserver( InsertTextObserver );

		// TODO The above default configuration value should be defined using editor.config.define() once it's fixed.
		const insertTextCommand = new InsertTextCommand( editor, editor.config.get( 'typing.undoStep' ) || 20 );

		// Register `insertText` command and add `input` command as an alias for backward compatibility.
		editor.commands.add( 'insertText', insertTextCommand );
		editor.commands.add( 'input', insertTextCommand );

		this.listenTo( view.document, 'insertText', ( evt, data ) => {
			if ( !view.document.isComposing ) {
				data.preventDefault();
			}

			const { text, selection: viewSelection, resultRange: viewResultRange } = data;

			// If view selection was specified, translate it to model selection.
			const modelRanges = Array.from( viewSelection.getRanges() ).map( viewRange => {
				return editor.editing.mapper.toModelRange( viewRange );
			} );

			const selectedText = Array.from( modelRanges[ 0 ].getItems() ).reduce( ( rangeText, node ) => {
				return rangeText + ( node.is( '$textProxy' ) ? node.data : '' );
			}, '' );

			let insertText = text;

			if ( selectedText ) {
				if ( selectedText.length <= insertText.length ) {
					if ( insertText.startsWith( selectedText ) ) {
						insertText = insertText.substring( selectedText.length );
						modelRanges[ 0 ].start = modelRanges[ 0 ].start.getShiftedBy( selectedText.length );
					}
				} else {
					if ( selectedText.startsWith( insertText ) ) {
						// TODO this should be mapped as delete?
						modelRanges[ 0 ].start = modelRanges[ 0 ].start.getShiftedBy( insertText.length );
						insertText = '';
					}
				}
			}

			const insertTextCommandData = {
				text: insertText,
				selection: model.createSelection( modelRanges )
			};

			// @if CK_DEBUG_TYPING // if ( window.logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.log( '%c[Input]%c Execute insertText:',
			// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green;', '',
			// @if CK_DEBUG_TYPING // 		insertText,
			// @if CK_DEBUG_TYPING // 		`[${ modelRanges[ 0 ].start.path }]-[${ modelRanges[ 0 ].end.path }]`
			// @if CK_DEBUG_TYPING // 	);
			// @if CK_DEBUG_TYPING // }

			if ( viewResultRange ) {
				insertTextCommandData.resultRange = editor.editing.mapper.toModelRange( viewResultRange );
			}

			editor.execute( 'insertText', insertTextCommandData );
		} );

		// Note: The priority must precede the CompositionObserver handler to call it before
		// the renderer is blocked, because we want to render this change.
		this.listenTo( view.document, 'compositionstart', () => {
			if ( modelSelection.isCollapsed ) {
				return;
			}

			// @if CK_DEBUG_TYPING // if ( window.logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.log( '%c[Input]%c Composition start -> model.deleteContent()',
			// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green;', '',
			// @if CK_DEBUG_TYPING // 		`[${ modelSelection.getFirstPosition().path }]-[${ modelSelection.getLastPosition().path }]`
			// @if CK_DEBUG_TYPING // 	);
			// @if CK_DEBUG_TYPING // }

			model.deleteContent( modelSelection );
		} );
	}
}

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
import env from '@ckeditor/ckeditor5-utils/src/env';

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

		let lastCompositionPosition = null;
		let lastCompositionLength = 0;

		this.listenTo( view.document, 'insertText', ( evt, data ) => {
			data.preventDefault();

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

			console.log( '--- insertText', insertText, modelRanges[ 0 ] );

			if ( viewResultRange ) {
				insertTextCommandData.resultRange = editor.editing.mapper.toModelRange( viewResultRange );
			}

			lastCompositionPosition = viewSelection.getFirstPosition();
			lastCompositionLength = text.length;
			// @if CK_DEBUG_TYPING // if ( window.logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.info( '%c[Input]%c save last composition position:',
			// @if CK_DEBUG_TYPING // 		'color: green;font-weight: bold', 'font-weight:bold',
			// @if CK_DEBUG_TYPING // 		lastCompositionPosition, lastCompositionLength
			// @if CK_DEBUG_TYPING // 	);
			// @if CK_DEBUG_TYPING // }

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

		// if ( env.isAndroid ) {
		// 	view.document.selection.on( 'change', () => {
		// 		if ( !view.document.isComposing ) {
		// 			return;
		// 		}
		//
		// 		const selectionPosition = view.document.selection.getLastPosition();
		//
		// 		if ( !selectionPosition ) {
		// 			return;
		// 		}
		//
		// 		// @if CK_DEBUG_TYPING // if ( window.logCKETyping ) {
		// 		// @if CK_DEBUG_TYPING // 	console.info( '%c[Input]%c check last composition position:',
		// 		// @if CK_DEBUG_TYPING // 		'color: green;font-weight: bold', 'font-weight:bold',
		// 		// @if CK_DEBUG_TYPING // 		'last', lastCompositionPosition, 'length', lastCompositionLength, 'new', selectionPosition
		// 		// @if CK_DEBUG_TYPING // 	);
		// 		// @if CK_DEBUG_TYPING // }
		//
		// 		if (
		// 			!lastCompositionPosition ||
		// 			!lastCompositionPosition.getShiftedBy( lastCompositionLength ).isEqual( selectionPosition )
		// 		) {
		// 			// @if CK_DEBUG_TYPING // if ( window.logCKETyping ) {
		// 			// @if CK_DEBUG_TYPING // 	console.info( '%c[Input]%c resetting composition',
		// 			// @if CK_DEBUG_TYPING // 		'color: green;font-weight: bold', 'font-weight:bold',
		// 			// @if CK_DEBUG_TYPING // 	);
		// 			// @if CK_DEBUG_TYPING // }
		// 			view.document.isComposing = false;
		//
		// 			if ( !view.document.selection.isFake ) {
		// 				view.document.isComposing = true;
		// 			}
		// 		}
		// 	} );
		//
		// 	view.document.on( 'change:isComposing', () => {
		// 		if ( !view.document.isComposing ) {
		// 			lastCompositionPosition = null;
		// 			// @if CK_DEBUG_TYPING // if ( window.logCKETyping ) {
		// 			// @if CK_DEBUG_TYPING // 	console.info( '%c[Input]%c clear last composition position',
		// 			// @if CK_DEBUG_TYPING // 		'color: green;font-weight: bold', 'font-weight:bold'
		// 			// @if CK_DEBUG_TYPING // 	);
		// 			// @if CK_DEBUG_TYPING // }
		// 		}
		// 	} );
		// }
	}
}

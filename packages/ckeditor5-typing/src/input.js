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

		this.listenTo( view.document, 'insertText', ( evt, data ) => {
			data.preventDefault();

			const { text, selection: viewSelection, resultRange: viewResultRange } = data;

			// If view selection was specified, translate it to model selection.
			const modelRanges = Array.from( viewSelection.getRanges() ).map( viewRange => {
				return editor.editing.mapper.toModelRange( viewRange );
			} );

			const insertTextCommandData = {
				text,
				selection: model.createSelection( modelRanges )
			};

			if ( viewResultRange ) {
				insertTextCommandData.resultRange = editor.editing.mapper.toModelRange( viewResultRange );
			}

			lastCompositionPosition = viewSelection.getFirstPosition().getShiftedBy( text.length );
			// @if CK_DEBUG_TYPING // if ( window.logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.info( '%c[Input]%c save last composition position:',
			// @if CK_DEBUG_TYPING // 		'color: green;font-weight: bold', 'font-weight:bold', lastCompositionPosition
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

		if ( env.isAndroid ) {
			view.document.selection.on( 'change', () => {
				if ( !view.document.isComposing ) {
					return;
				}

				const selectionPosition = view.document.selection.getLastPosition();

				if ( !selectionPosition ) {
					return;
				}

				// @if CK_DEBUG_TYPING // if ( window.logCKETyping ) {
				// @if CK_DEBUG_TYPING // 	console.info( '%c[Input]%c check last composition position:',
				// @if CK_DEBUG_TYPING // 		'color: green;font-weight: bold', 'font-weight:bold',
				// @if CK_DEBUG_TYPING // 		lastCompositionPosition, selectionPosition
				// @if CK_DEBUG_TYPING // 	);
				// @if CK_DEBUG_TYPING // }

				if ( !lastCompositionPosition || !lastCompositionPosition.isEqual( selectionPosition ) ) {
					// @if CK_DEBUG_TYPING // if ( window.logCKETyping ) {
					// @if CK_DEBUG_TYPING // 	console.info( '%c[Input]%c resetting composition',
					// @if CK_DEBUG_TYPING // 		'color: green;font-weight: bold', 'font-weight:bold',
					// @if CK_DEBUG_TYPING // 	);
					// @if CK_DEBUG_TYPING // }
					view.document.isComposing = false;

					if ( !view.document.selection.isFake ) {
						view.document.isComposing = true;
					}
				}
			} );

			view.document.on( 'change:isComposing', () => {
				if ( !view.document.isComposing ) {
					lastCompositionPosition = null;
					// @if CK_DEBUG_TYPING // if ( window.logCKETyping ) {
					// @if CK_DEBUG_TYPING // 	console.info( '%c[Input]%c clear last composition position',
					// @if CK_DEBUG_TYPING // 		'color: green;font-weight: bold', 'font-weight:bold'
					// @if CK_DEBUG_TYPING // 	);
					// @if CK_DEBUG_TYPING // }
				}
			} );
		}
	}
}

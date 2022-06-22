/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/input
 */

/* globals window, console */

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

		view.addObserver( InsertTextObserver );

		// TODO The above default configuration value should be defined using editor.config.define() once it's fixed.
		const insertTextCommand = new InsertTextCommand( editor, editor.config.get( 'typing.undoStep' ) || 20 );

		// Register `insertText` command and add `input` command as an alias for backward compatibility.
		editor.commands.add( 'insertText', insertTextCommand );
		editor.commands.add( 'input', insertTextCommand );

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

			editor.execute( 'insertText', insertTextCommandData );
		} );

		this.listenTo( view.document, 'change:isComposing', () => {
			if ( view.document.isComposing && !model.document.selection.isCollapsed ) {
				if ( window.logCKEEvents ) {
					console.log( '[EditingController] Composition start -> delete content',
						`[${ model.document.selection.getFirstPosition().path }]-[${ model.document.selection.getLastPosition().path }]`
					);
				}

				model.deleteContent( model.document.selection );
			}
		}, { priority: 'high' } );
		// 👆 High priority to call it before the renderer is blocked, because we want to render this change.

		this.listenTo( view.document, 'change:isComposing', () => {
			if ( window.logCKEEvents && view.document.isComposing ) {
				console.log(
					'%c┌───────────────────────────── isComposing = true ─────────────────────────────┐',
					'font-weight: bold; color: green'
				);
			}
		}, { priority: 'highest' } );
		this.listenTo( view.document, 'change:isComposing', () => {
			if ( window.logCKEEvents && !view.document.isComposing ) {
				console.log(
					'%c└───────────────────────────── isComposing = false ─────────────────────────────┘',
					'font-weight: bold; color: green'
				);
			}
		}, { priority: 'lowest' } );
	}
}

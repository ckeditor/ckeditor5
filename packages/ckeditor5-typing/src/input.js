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
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import { LiveRange } from '@ckeditor/ckeditor5-engine';
import SelectionObserver from '@ckeditor/ckeditor5-engine/src/view/observer/selectionobserver';

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
		const view = editor.editing.view;
		const viewDocument = view.document;

		this._compositionModelRange = null;
		this._compositionText = '';

		view.addObserver( InsertTextObserver );

		// TODO The above default configuration value should be defined using editor.config.define() once it's fixed.
		const insertTextCommand = new InsertTextCommand( editor, editor.config.get( 'typing.undoStep' ) || 20 );

		// Register `insertText` command and add `input` command as an alias for backward compatibility.
		editor.commands.add( 'insertText', insertTextCommand );
		editor.commands.add( 'input', insertTextCommand );

		this.listenTo( viewDocument, 'insertText', ( evt, data ) => {
			data.preventDefault();

			const { text, selection: viewSelection, resultRange: viewResultRange } = data;

			// If view selection was specified, translate it to model selection.
			const modelRanges = Array.from( viewSelection.getRanges() ).map( viewRange => {
				return editor.editing.mapper.toModelRange( viewRange );
			} );

			const insertTextCommandData = {
				text,
				selection: editor.model.createSelection( modelRanges )
			};

			if ( viewResultRange ) {
				insertTextCommandData.resultRange = editor.editing.mapper.toModelRange( viewResultRange );
			}

			editor.execute( 'insertText', insertTextCommandData );
		} );

		const compositionUpdate = ( evt, data ) => {
			console.group( '[Input] composition', evt.name );
			console.log( '[Input] target ranges:', data.targetRangeStart );

			if ( !this._compositionModelRange ) {
				console.log( '[Input] composition ignore - no composition model range' );
				console.groupEnd();
				return;
			}

			const compositionModelPosition = data.targetRangeStart ? editor.editing.mapper.toModelPosition( data.targetRangeStart ) : null;

			if (
				evt.name == 'compositionupdate' &&
				compositionModelPosition &&
				this._compositionModelRange.start.isEqual( compositionModelPosition )
			) {
				console.log( '[Input] composition ignore - same composition model range start' );
				console.groupEnd();
				return;
			}

			console.log( '[Input] composition commit', evt.name,
				`[${ this._compositionModelRange.start.path }]-[${ this._compositionModelRange.end.path }]`,
				compositionModelPosition
			);

			const compositionModelRange = this._compositionModelRange.toRange();

			const selectedText = Array.from( compositionModelRange.getItems() ).reduce( ( rangeText, node ) => {
				return rangeText + ( node.is( '$textProxy' ) ? node.data : '' );
			}, '' );

			let insertText = this._compositionText;

			if ( selectedText ) {
				if ( selectedText.length <= this._compositionText.length ) {
					if ( this._compositionText.startsWith( selectedText ) ) {
						insertText = this._compositionText.substring( selectedText.length );
						compositionModelRange.start = compositionModelRange.start.getShiftedBy( selectedText.length );
					}
				} else {
					if ( selectedText.startsWith( this._compositionText ) ) {
						// TODO this should be mapped as delete?
						insertText = '';
						compositionModelRange.start = compositionModelRange.start.getShiftedBy( this._compositionText.length );
					}
				}
			}

			this._compositionModelRange.detach();
			this._compositionModelRange = null;
			this._compositionText = '';

			const viewRange = editor.editing.mapper.toViewRange( compositionModelRange );

			// Enable rendering before inserting the text.
			viewDocument.isComposing = false;

			if ( insertText || !viewRange.isCollapsed ) {
				// TODO maybe we should not pass the DOM event and only translate what we could need in the view/model
				viewDocument.fire( 'insertText', new DomEventData( viewDocument, data.domEvent, {
					text: insertText,
					selection: view.createSelection( viewRange )
				} ) );

				view.getObserver( SelectionObserver ).flush( data.domEvent.target.ownerDocument );
			}

			console.groupEnd();
		};

		this.listenTo( viewDocument, 'compositionupdate', compositionUpdate );
		this.listenTo( viewDocument, 'compositionend', compositionUpdate );

		// TODO how can we commit composition if local user triggers some model change,
		//  for example undo - changes model and composition must commit before it happens

		this.listenTo( viewDocument, 'compositionend', () => {
			// Additional case to make sure that the isComposing flag is not lost.
			viewDocument.isComposing = false;
		} );

		this.listenTo( viewDocument, 'insertCompositionText', ( evt, data ) => {
			const { text, selection } = data;
			const firstViewPosition = selection.getFirstPosition();
			const compositionModelPosition = editor.editing.mapper.toModelPosition( firstViewPosition );

			console.group( '[Input] insertCompositionText' );

			this._compositionText = text || '';

			if ( this._compositionModelRange ) {
				if ( !this._compositionModelRange.start.isEqual( compositionModelPosition ) ) {
					console.warn( '[Input] insertCompositionText - fake composition end',
						this._compositionModelRange, compositionModelPosition, text );
				}
			} else {
				const firstRange = editor.editing.mapper.toModelRange( selection.getFirstRange() );

				console.log( '[Input] insertCompositionText - start composing on', firstRange );

				viewDocument.isComposing = true;
				this._compositionModelRange = LiveRange.fromRange( firstRange );
			}

			console.groupEnd();
		} );
	}
}

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

		this.listenTo( viewDocument, 'compositionupdate', ( evt, data ) => {
			console.log( '----- compositionupdate', data.targetRangeStart );

			if ( !this._compositionModelRange ) {
				return;
			}

			const compoositionModelPosition = editor.editing.mapper.toModelPosition( data.targetRangeStart );

			if ( this._compositionModelRange.start.isEqual( compoositionModelPosition ) ) {
				return;
			}

			console.log( '---------- stop composition (on update)', this._compositionModelRange, compoositionModelPosition );

			const viewRange = editor.editing.mapper.toViewRange( this._compositionModelRange );

			// TODO maybe we should not pass the DOM event and only translate what we could need in the view/model
			if ( this._compositionText ) {
				viewDocument.fire( 'insertText', new DomEventData( viewDocument, data.domEvent, {
					text: this._compositionText,
					selection: view.createSelection( viewRange )
				} ) );
			}

			this._compositionModelRange.detach();
			this._compositionModelRange = null;
			this._compositionText = '';
		} );

		this.listenTo( viewDocument, 'compositionend', ( evt, data ) => {
			console.log( '----- compositionend', data.targetRangeStart );

			if ( !this._compositionModelRange ) {
				return;
			}

			console.log( '---------- stop composition (on end)', this._compositionModelRange );

			const viewRange = editor.editing.mapper.toViewRange( this._compositionModelRange );

			// TODO maybe we should not pass the DOM event and only translate what we could need in the view/model
			if ( this._compositionText ) {
				viewDocument.fire( 'insertText', new DomEventData( viewDocument, data.domEvent, {
					text: this._compositionText,
					selection: view.createSelection( viewRange )
				} ) );
			}

			this._compositionModelRange.detach();
			this._compositionModelRange = null;
			this._compositionText = '';
		} );

		this.listenTo( viewDocument, 'insertCompositionText', ( evt, data ) => {
			const { text, selection } = data;
			const firstViewPosition = selection.getFirstPosition();
			const compositionModelPosition = editor.editing.mapper.toModelPosition( firstViewPosition );

			this._compositionText = text;

			// TODO this should probably be in the view document and should map to model live range and maybe be converted in a way that selection does
			//  or maybe it could use the selection?
			if ( this._compositionModelRange ) {
				if ( !this._compositionModelRange.start.isEqual( compositionModelPosition ) ) {
					console.log( '-- fake composition end (on insert composition)', this._compositionModelRange, compositionModelPosition, text );
				}
			} else {
				const firstRange = editor.editing.mapper.toModelRange( selection.getFirstRange() );

				console.log( '------ start composing on', firstRange );
				this._compositionModelRange = LiveRange.fromRange( firstRange );
			}
		} );
	}
}

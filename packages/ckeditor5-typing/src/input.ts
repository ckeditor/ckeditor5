/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/input
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { env } from '@ckeditor/ckeditor5-utils';

import InsertTextCommand from './inserttextcommand.js';
import InsertTextObserver, { type ViewDocumentInsertTextEvent } from './inserttextobserver.js';

import {
	LivePosition,
	type Model,
	type Position,
	type ViewDocumentCompositionStartEvent,
	type ViewDocumentInputEvent,
	type ViewDocumentKeyDownEvent
} from '@ckeditor/ckeditor5-engine';

/**
 * Handles text input coming from the keyboard or other input methods.
 */
export default class Input extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Input' as const;
	}

	/**
	 * TODO
	 */
	private _compositionRangeStart: LivePosition | null = null;

	/**
	 * TODO
	 */
	private _compositionRangeEnd: LivePosition | null = null;

	/**
	 * @inheritDoc
	 */
	public init(): void {
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

		this.listenTo<ViewDocumentInsertTextEvent>( view.document, 'insertText', ( evt, data ) => {
			// Rendering is disabled while composing so prevent events that will be rendered by the engine
			// and should not be applied by the browser.
			if ( !view.document.isComposing ) {
				data.preventDefault();
			}

			const { text, selection: viewSelection, resultRange: viewResultRange } = data;

			let modelRanges;

			// If view selection was specified, translate it to model selection.
			if ( viewSelection ) {
				modelRanges = Array.from( viewSelection.getRanges() ).map( viewRange => {
					return editor.editing.mapper.toModelRange( viewRange );
				} );
			}
			else if ( this._compositionRangeStart && this._compositionRangeEnd ) {
				modelRanges = [ model.createRange( this._compositionRangeStart, this._compositionRangeEnd ) ];
				this._compositionRangeStart.detach();
				this._compositionRangeEnd.detach();
				this._compositionRangeStart = null;
				this._compositionRangeEnd = null;
			}
			else {
				modelRanges = Array.from( modelSelection.getRanges() );
			}

			let insertText = text;

			// Typing in English on Android is firing composition events for the whole typed word.
			// We need to check the target range text to only apply the difference.
			if ( env.isAndroid ) {
				const selectedText = Array.from( modelRanges[ 0 ].getItems() ).reduce( ( rangeText, node ) => {
					return rangeText + ( node.is( '$textProxy' ) ? node.data : '' );
				}, '' );

				if ( selectedText ) {
					if ( selectedText.length <= insertText.length ) {
						if ( insertText.startsWith( selectedText ) ) {
							insertText = insertText.substring( selectedText.length );
							( modelRanges[ 0 ] as any ).start = modelRanges[ 0 ].start.getShiftedBy( selectedText.length );
						}
					} else {
						if ( selectedText.startsWith( insertText ) ) {
							// TODO this should be mapped as delete?
							( modelRanges[ 0 ] as any ).start = modelRanges[ 0 ].start.getShiftedBy( insertText.length );
							insertText = '';
						}
					}
				}
			}

			const insertTextCommandData: Parameters<InsertTextCommand[ 'execute' ]>[ 0 ] = {
				text: insertText,
				selection: model.createSelection( modelRanges )
			};

			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
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

			view.scrollToTheSelection();
		} );

		if ( env.isAndroid ) {
			// On Android with English keyboard, the composition starts just by putting caret
			// at the word end or by selecting a table column. This is not a real composition started.
			// Trigger delete content on first composition key pressed.
			this.listenTo<ViewDocumentKeyDownEvent>( view.document, 'keydown', ( evt, data ) => {
				if ( modelSelection.isCollapsed || data.keyCode != 229 || !view.document.isComposing ) {
					return;
				}

				// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
				// @if CK_DEBUG_TYPING // 	const firstPositionPath = modelSelection.getFirstPosition()!.path;
				// @if CK_DEBUG_TYPING // 	const lastPositionPath = modelSelection.getLastPosition()!.path;

				// @if CK_DEBUG_TYPING // 	console.log( '%c[Input]%c KeyDown 229 -> model.deleteContent()',
				// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green;', '',
				// @if CK_DEBUG_TYPING // 		`[${ firstPositionPath }]-[${ lastPositionPath }]`
				// @if CK_DEBUG_TYPING // 	);
				// @if CK_DEBUG_TYPING // }

				deleteSelectionContent( model, insertTextCommand );
			} );
		} else {
			// Note: The priority must precede the CompositionObserver handler to call it before
			// the renderer is blocked, because we want to render this change.
			this.listenTo<ViewDocumentCompositionStartEvent>( view.document, 'compositionstart', () => {
				this._updateCompositionRange( modelSelection.getFirstPosition()!, modelSelection.getLastPosition()! );

				if ( modelSelection.isCollapsed ) {
					return;
				}

				// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
				// @if CK_DEBUG_TYPING // 	const firstPositionPath = modelSelection.getFirstPosition()!.path;
				// @if CK_DEBUG_TYPING // 	const lastPositionPath = modelSelection.getLastPosition()!.path;

				// @if CK_DEBUG_TYPING // 	console.log( '%c[Input]%c Composition start -> model.deleteContent()',
				// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green;', '',
				// @if CK_DEBUG_TYPING // 		`[${ firstPositionPath }]-[${ lastPositionPath }]`
				// @if CK_DEBUG_TYPING // 	);
				// @if CK_DEBUG_TYPING // }

				deleteSelectionContent( model, insertTextCommand );
			} );

			this.listenTo<ViewDocumentInputEvent>( view.document, 'beforeinput', ( evt, data ) => {
				const { targetRanges, inputType } = data;

				if ( ![ 'deleteCompositionText', 'insertCompositionText', 'insertFromComposition' ].includes( inputType ) ) {
					return;
				}

				if ( !this._compositionRangeStart || !this._compositionRangeEnd || !targetRanges.length ) {
					return;
				}

				const modelTargetRange = editor.editing.mapper.toModelRange( targetRanges[ 0 ] );

				if ( modelTargetRange.start.isBefore( this._compositionRangeStart.toPosition() ) ) {
					this._updateCompositionRange( modelTargetRange.start, this._compositionRangeEnd.toPosition() );
				}
			}, { priority: 'high' } );
		}
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		if ( this._compositionRangeStart ) {
			this._compositionRangeStart.detach();
		}

		if ( this._compositionRangeEnd ) {
			this._compositionRangeEnd.detach();
		}
	}

	/**
	 * TODO
	 */
	private _updateCompositionRange( start: Position, end: Position ): void {
		if ( this._compositionRangeStart ) {
			this._compositionRangeStart.detach();
		}

		if ( this._compositionRangeEnd ) {
			this._compositionRangeEnd.detach();
		}

		// Using LivePosition-s so it adjusts to the changes in the model.
		// Stickiness to the outside so deleted range content won't make it a graveyard positions.
		this._compositionRangeStart = LivePosition.fromPosition( start, 'toPrevious' );
		this._compositionRangeEnd = LivePosition.fromPosition( end, 'toNext' );
	}
}

function deleteSelectionContent( model: Model, insertTextCommand: InsertTextCommand ): void {
	// By relying on the state of the input command we allow disabling the entire input easily
	// by just disabling the input command. We could’ve used here the delete command but that
	// would mean requiring the delete feature which would block loading one without the other.
	// We could also check the editor.isReadOnly property, but that wouldn't allow to block
	// the input without blocking other features.
	if ( !insertTextCommand.isEnabled ) {
		return;
	}

	const buffer = insertTextCommand.buffer;

	buffer.lock();

	model.enqueueChange( buffer.batch, () => {
		model.deleteContent( model.document.selection );
	} );

	buffer.unlock();
}

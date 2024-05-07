/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/input
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { env } from '@ckeditor/ckeditor5-utils';

import InsertTextCommand, { type InsertTextCommandOptions } from './inserttextcommand.js';
import InsertTextObserver, { type ViewDocumentInsertTextEvent } from './inserttextobserver.js';

import {
	LiveRange,
	type Model,
	type Range,
	type ViewDocumentCompositionStartEvent,
	type ViewDocumentKeyDownEvent,
	type ViewDocumentMutationsEvent
} from '@ckeditor/ckeditor5-engine';

import { debounce } from 'lodash-es';

/**
 * Handles text input coming from the keyboard or other input methods.
 */
export default class Input extends Plugin {
	/**
	 * The queue of `insertText` command executions that are waiting for the DOM to get updated after beforeinput event.
	 */
	private _queue: Array<InsertTextCommandLiveOptions> = [];

	/**
	 * Debounced queue flush as a safety mechanism for cases of mutation observer not triggering.
	 */
	private _flushQueueDebounced = debounce( () => this._flushQueue( 'timeout' ), 500 );

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Input' as const;
	}

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
			else {
				modelRanges = Array.from( modelSelection.getRanges() );
			}

			let insertText = text;

			// TODO this needs a better implementation
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

			const commandData: InsertTextCommandOptions = {
				text: insertText,
				selection: model.createSelection( modelRanges )
			};

			if ( viewResultRange ) {
				commandData.resultRange = editor.editing.mapper.toModelRange( viewResultRange );
			}

			// This is a composition event and those are not cancellable, so we need to wait until browser updates the DOM
			// and we could apply changes to the model and verify if the DOM is valid.
			// The browser applies changes to the DOM not immediately on beforeinput event.
			// We just wait for mutation observer to notice changes or as a fallback a timeout.
			if ( env.isAndroid && view.document.isComposing ) {
				// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
				// @if CK_DEBUG_TYPING // 	console.log( '%c[Input]%c Queue insertText:',
				// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green;', '',
				// @if CK_DEBUG_TYPING // 		`"${ commandData.text }"`,
				// @if CK_DEBUG_TYPING // 		`[${ commandData.selection.getFirstPosition().path }]-` +
				// @if CK_DEBUG_TYPING // 		`[${ commandData.selection.getLastPosition().path }]` +
				// @if CK_DEBUG_TYPING // 		` queue size: ${ this._queue.length + 1 }`
				// @if CK_DEBUG_TYPING // 	);
				// @if CK_DEBUG_TYPING // }

				this._pushQueue( commandData );
				this._flushQueueDebounced();
			} else {
				// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
				// @if CK_DEBUG_TYPING // 	console.log( '%c[Input]%c Execute insertText:',
				// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green;', '',
				// @if CK_DEBUG_TYPING // 		`"${ commandData.text }"`,
				// @if CK_DEBUG_TYPING // 		`[${ commandData.selection.getFirstPosition().path }]-` +
				// @if CK_DEBUG_TYPING // 		`[${ commandData.selection.getLastPosition().path }]`
				// @if CK_DEBUG_TYPING // 	);
				// @if CK_DEBUG_TYPING // }

				editor.execute( 'insertText', commandData );
				view.scrollToTheSelection();
			}
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
		}

		// Apply changes to the model as they are applied to the DOM by the browser.
		// On beforeinput event, the DOM is not yet modified. We wait for detected mutations to apply model changes.
		if ( env.isAndroid ) {
			this.listenTo<ViewDocumentMutationsEvent>( view.document, 'mutations', () => this._flushQueue( 'mutations' ) );
		}
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this._flushQueueDebounced.cancel();

		while ( this._queue.length ) {
			this._shiftQueue();
		}
	}

	/**
	 * TODO
	 */
	private _pushQueue( commandData: InsertTextCommandOptions ): void {
		const commandLiveData: InsertTextCommandLiveOptions = {
			text: commandData.text
		};

		if ( commandData.selection ) {
			commandLiveData.selectionRanges = Array.from( commandData.selection.getRanges() ).map( range => LiveRange.fromRange( range ) );
		}

		if ( commandData.resultRange ) {
			commandLiveData.resultRange = LiveRange.fromRange( commandData.resultRange );
		}

		this._queue.push( commandLiveData );
	}

	/**
	 * TODO
	 */
	private _shiftQueue(): InsertTextCommandOptions {
		const commandLiveData = this._queue.shift()!;
		const commandData: InsertTextCommandOptions = {
			text: commandLiveData.text
		};

		if ( commandLiveData.selectionRanges ) {
			const ranges = commandLiveData.selectionRanges
				.map( liveRange => detachLiveRange( liveRange ) )
				.filter( ( range ): range is Range => !!range );

			commandData.selection = this.editor.model.createSelection( ranges );
		}

		const resultRange = detachLiveRange( commandLiveData.resultRange );

		if ( resultRange ) {
			commandData.resultRange = resultRange;
		}

		return commandData;
	}

	/**
	 * Applies all queued insertText command executions.
	 *
	 * @param reason Used only for debugging.
	 */
	private _flushQueue( reason: string ): void { // eslint-disable-line @typescript-eslint/no-unused-vars
		const editor = this.editor;
		const model = editor.model;
		const view = editor.editing.view;

		this._flushQueueDebounced.cancel();

		if ( !this._queue.length ) {
			return;
		}

		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.group( `%c[Input]%c Flush insertText queue on ${ reason }`,
		// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green;', ''
		// @if CK_DEBUG_TYPING // 	);
		// @if CK_DEBUG_TYPING // }

		const insertTextCommand = editor.commands.get( 'insertText' )!;
		const buffer = insertTextCommand.buffer;

		model.enqueueChange( buffer.batch, () => {
			buffer.lock();

			while ( this._queue.length ) {
				const commandData = this._shiftQueue();

				// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
				// @if CK_DEBUG_TYPING // 	console.log( '%c[Input]%c Execute queued insertText:',
				// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green;', '',
				// @if CK_DEBUG_TYPING // 		`"${ commandData.text }"`,
				// @if CK_DEBUG_TYPING // 		`[${ commandData.selection.getFirstPosition().path }]-` +
				// @if CK_DEBUG_TYPING // 		`[${ commandData.selection.getLastPosition().path }]`
				// @if CK_DEBUG_TYPING // 	);
				// @if CK_DEBUG_TYPING // }

				editor.execute( 'insertText', commandData );
			}

			buffer.unlock();
		} );

		view.scrollToTheSelection();

		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.groupEnd();
		// @if CK_DEBUG_TYPING // }
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

/**
 * TODO
 */
function detachLiveRange( liveRange?: LiveRange ): Range | null {
	if ( !liveRange ) {
		return null;
	}

	const range = liveRange.toRange();

	liveRange.detach();

	if ( range.root.rootName == '$graveyard' ) {
		return null;
	}

	return range;
}

/**
 * TODO
 */
type InsertTextCommandLiveOptions = {
	text?: string;

	selectionRanges?: Array<LiveRange>;

	resultRange?: LiveRange;
};

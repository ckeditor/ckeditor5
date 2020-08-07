/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/delete
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import DeleteCommand from './deletecommand';
import DeleteObserver from './deleteobserver';
import env from '@ckeditor/ckeditor5-utils/src/env';

/**
 * The delete and backspace feature. Handles the <kbd>Delete</kbd> and <kbd>Backspace</kbd> keys in the editor.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Delete extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Delete';
	}

	init() {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;

		view.addObserver( DeleteObserver );

		editor.commands.add( 'forwardDelete', new DeleteCommand( editor, 'forward' ) );
		editor.commands.add( 'delete', new DeleteCommand( editor, 'backward' ) );

		viewDocument.on( 'beforeinput', ( evt, data ) => {
			const domEvent = data.domEvent;
			const { inputType } = domEvent;

			if ( !inputType.startsWith( 'delete' ) ) {
				return;
			}

			let wasHandled;

			// This happens in Safari on Mac when a widget is selected and Ctrl + K is pressed.
			if ( inputType === 'deleteContent' ) {
				editor.execute( 'delete', { unit: 'codePoint' } );
				wasHandled = true;
			}
			// On Mac: Backspace or Ctrl + H
			else if ( inputType === 'deleteContentBackward' ) {
				editor.execute( 'delete', { unit: 'codePoint' } );
				wasHandled = true;
			}
			// On Mac: Fn + Backspace or Ctrl + D
			else if ( inputType === 'deleteContentForward' ) {
				editor.execute( 'forwardDelete', { unit: 'character' } );
				wasHandled = true;
			}
			// On Mac: Option + Backspace.
			// On iOS: Hold the backspace for a while and whole words will start to disappear.
			else if ( inputType === 'deleteWordBackward' ) {
				editor.execute( 'delete', { unit: 'word' } );
				wasHandled = true;
			}
			// On Mac: Fn + Option + Backspace.
			else if ( inputType === 'deleteWordForward' ) {
				editor.execute( 'forwardDelete', { unit: 'word' } );
				wasHandled = true;
			}
			// Chrome on Mac: Ctrl + K (you have to disable the Link plugin first, though, because it uses the same keystroke)
			// This is weird that it does not work in Safari on Mac despite being listed in the official shortcuts listing
			// on Apple's webpage.
			else if ( inputType === 'deleteHardLineForward' ) {
				const model = editor.model;

				model.change( writer => {
					for ( const range of model.document.selection.getRanges() ) {
						if ( range.isCollapsed ) {
							// <paragraph>Fo[]o bar baz</paragraph> -> <paragraph>Fo[o bar baz]</paragraph>
							const deleteRange = writer.createRange( range.start, writer.createPositionAt( range.start.parent, 'end' ) );

							if ( model.hasContent( deleteRange ) ) {
								model.deleteContent( writer.createSelection( deleteRange ) );
							}
							// It could be there's no content in the range, for instance when executed for this selection:
							//
							// 		<paragraph>Foo bar baz[]</paragraph>
							//
							// Act like a regular delete then.
							else {
								editor.execute( 'forwardDelete' );
							}
						}
						// When the range is not collapsed, it should act as a regular delete.
						// For instance, VSCode does this.
						else {
							editor.execute( 'forwardDelete' );
						}
					}
				} );
				// TODO
				// wasHandled = true;
			}
			// On Mac: Cmd + Backspace.
			else if ( inputType === 'deleteSoftLineBackward' ) {
				// TODO
				// wasHandled = true;
			}

			if ( wasHandled ) {
				evt.stop();

				// Without it, typing accented characters on Chrome does not work – the second beforeInput event
				// comes with a collapsed targetRange (should be expanded instead).
				data.preventDefault();
			}
		} );

		// this.listenTo( viewDocument, 'delete', ( evt, data ) => {
		// 	const deleteCommandParams = { unit: data.unit, sequence: data.sequence };

		// 	// If a specific (view) selection to remove was set, convert it to a model selection and set as a parameter for `DeleteCommand`.
		// 	if ( data.selectionToRemove ) {
		// 		const modelSelection = editor.model.createSelection();
		// 		const ranges = [];

		// 		for ( const viewRange of data.selectionToRemove.getRanges() ) {
		// 			ranges.push( editor.editing.mapper.toModelRange( viewRange ) );
		// 		}

		// 		modelSelection.setTo( ranges );

		// 		deleteCommandParams.selection = modelSelection;
		// 	}

		// 	editor.execute( data.direction == 'forward' ? 'forwardDelete' : 'delete', deleteCommandParams );

		// 	data.preventDefault();

		// 	view.scrollToTheSelection();
		// } );

		// // Android IMEs have a quirk - they change DOM selection after the input changes were performed by the browser.
		// // This happens on `keyup` event. Android doesn't know anything about our deletion and selection handling. Even if the selection
		// // was changed during input events, IME remembers the position where the selection "should" be placed and moves it there.
		// //
		// // To prevent incorrect selection, we save the selection after deleting here and then re-set it on `keyup`. This has to be done
		// // on DOM selection level, because on `keyup` the model selection is still the same as it was just after deletion, so it
		// // wouldn't be changed and the fix would do nothing.
		// //
		// if ( env.isAndroid ) {
		// 	let domSelectionAfterDeletion = null;

		// 	this.listenTo( viewDocument, 'delete', ( evt, data ) => {
		// 		const domSelection = data.domTarget.ownerDocument.defaultView.getSelection();

		// 		domSelectionAfterDeletion = {
		// 			anchorNode: domSelection.anchorNode,
		// 			anchorOffset: domSelection.anchorOffset,
		// 			focusNode: domSelection.focusNode,
		// 			focusOffset: domSelection.focusOffset
		// 		};
		// 	}, { priority: 'lowest' } );

		// 	this.listenTo( viewDocument, 'keyup', ( evt, data ) => {
		// 		if ( domSelectionAfterDeletion ) {
		// 			const domSelection = data.domTarget.ownerDocument.defaultView.getSelection();

		// 			domSelection.collapse( domSelectionAfterDeletion.anchorNode, domSelectionAfterDeletion.anchorOffset );
		// 			domSelection.extend( domSelectionAfterDeletion.focusNode, domSelectionAfterDeletion.focusOffset );

		// 			domSelectionAfterDeletion = null;
		// 		}
		// 	} );
		// }
	}
}

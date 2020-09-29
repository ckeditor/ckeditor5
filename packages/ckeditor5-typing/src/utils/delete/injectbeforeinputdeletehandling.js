/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/utils/delete/injectbeforeinputdeletehandling
 */

import env from '@ckeditor/ckeditor5-utils/src/env';

/**
 * A handler that responds to the {@link TODO `delete`} event fired on view document and executes
 * the `delete` or `forwardDelete` commands in web browsers that support Input Events (`beforeinput`).
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 */
export default function injectBeforeInputDeleteHandling( editor ) {
	const editingView = editor.editing.view;
	const viewDocument = editingView.document;

	viewDocument.on( 'delete', ( evt, data ) => {
		const { direction, sequence, selectionToRemove, inputType, unit } = data;

		// Both "deleteContentBackward" and "deleteContentForward" must operate on the unit-level despite the
		// editing view range available and, in case of other input types, used efficiently to delete content.
		// This is related to the multi-byte characters decomposition (like complex emojis). Check out
		// the comments in DeleteObserver's DELETE_EVENT_TYPES to learn more.
		if ( inputType === 'deleteContentBackward' ) {
			const deleteCommandData = {
				sequence,
				unit
			};

			// Android IMEs have a quirk which is addressed by passing a complete selection in case of
			// the 'deleteContentBackward' event type. See DeleteObserver#_enableBeforeInputBasedObserver()
			// to learn more.
			if ( env.isAndroid ) {
				deleteCommandData.selection = selectionToRemove;
			}

			editor.execute( 'delete', deleteCommandData );
		} else if ( inputType === 'deleteContentForward' ) {
			editor.execute( 'forwardDelete', {
				unit,
				sequence
			} );
		}
		// In case of other delete (beforeinput) types, use the range provided by the beforeinput event.
		else {
			const modelRanges = [ ...selectionToRemove.getRanges() ].map( viewRange => {
				return editor.editing.mapper.toModelRange( viewRange );
			} );
			const selection = editor.model.createSelection( modelRanges );
			const isForwardDelete = direction === 'forward';

			editor.execute( isForwardDelete ? 'forwardDelete' : 'delete', {
				selection,
				sequence
			} );
		}

		editingView.scrollToTheSelection();
	} );

	// Android IMEs have a quirk - they change DOM selection after the input changes were performed by the browser.
	// This happens on `keyup` event. Android doesn't know anything about our deletion and selection handling.
	// Even if the selection was changed during input events, IME remembers the position where the selection "should"
	// be placed and moves it there.
	//
	// To prevent incorrect selection, we save the selection after deleting here and then re-set it on `keyup`.
	// This has to be done on DOM selection level, because on `keyup` the model selection is still the same as it was
	// just after deletion, so it wouldn't be changed and the fix would do nothing.
	//
	// **Note**: See DeleteObserver#_enableBeforeInputBasedObserver() for the first part of this quirk.
	if ( env.isAndroid ) {
		let domSelectionAfterDeletion = null;

		// This listener records the native DOM selection after deleting (note the lowest listener priority).
		viewDocument.on( 'delete', ( evt, data ) => {
			const domSelection = data.domTarget.ownerDocument.defaultView.getSelection();

			domSelectionAfterDeletion = {
				anchorNode: domSelection.anchorNode,
				anchorOffset: domSelection.anchorOffset,
				focusNode: domSelection.focusNode,
				focusOffset: domSelection.focusOffset
			};
		}, { priority: 'lowest' } );

		// This listener fixes the native DOM selection after deleting.
		viewDocument.on( 'keyup', ( evt, data ) => {
			if ( domSelectionAfterDeletion ) {
				const domSelection = data.domTarget.ownerDocument.defaultView.getSelection();

				domSelection.collapse( domSelectionAfterDeletion.anchorNode, domSelectionAfterDeletion.anchorOffset );
				domSelection.extend( domSelectionAfterDeletion.focusNode, domSelectionAfterDeletion.focusOffset );

				domSelectionAfterDeletion = null;
			}
		} );
	}
}

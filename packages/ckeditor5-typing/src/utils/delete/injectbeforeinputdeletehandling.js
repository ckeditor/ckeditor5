/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/utils/delete/injectbeforeinputdeletehandling
 */

import env from '@ckeditor/ckeditor5-utils/src/env';

/**
 * A handler that responds to the {@link module:engine/view/document~Document#event:delete `delete`} event fired
 * on {@link module:engine/view/document~Document view document} and executes the `delete` or `forwardDelete` commands
 * in web browsers that support Input Events (`beforeinput`).
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 */
export default function injectBeforeInputDeleteHandling( editor ) {
	const editingView = editor.editing.view;
	const viewDocument = editingView.document;

	viewDocument.on( 'delete', ( evt, data ) => {
		const { direction, sequence, selectionToRemove, unit } = data;
		const commandName = direction === 'forward' ? 'forwardDelete' : 'delete';
		const commandData = { unit, sequence };

		// * First of all, make sure that the "selectionToRemove" is used only for units other than "codePoint" or
		//   "character". This is related to the multi-byte characters decomposition (like complex emojis) and
		//   in these two cases, it is expected that the command will figure everything out from the unit type only
		//   even though the selection could be provided. Check out comments in DeleteObserver's DELETE_EVENT_TYPES
		//   to learn more.
		// * Android IMEs have a quirk which is addressed by passing a complete selection in case of
		//   the "codePoint" unit. See DeleteObserver#_enableBeforeInputBasedObserver() to learn more.
		if ( ( unit !== 'codePoint' && unit !== 'character' ) || ( env.isAndroid && unit === 'codePoint' ) ) {
			const modelRanges = [ ...selectionToRemove.getRanges() ].map( viewRange => {
				return editor.editing.mapper.toModelRange( viewRange );
			} );

			commandData.unit = 'selection';
			commandData.selection = editor.model.createSelection( modelRanges );
		}

		editor.execute( commandName, commandData );

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

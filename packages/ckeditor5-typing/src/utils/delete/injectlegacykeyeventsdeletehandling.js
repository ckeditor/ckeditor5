/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/utils/delete/injectlegacykeyeventsdeletehandling
 */

/**
 * A handler that responds to the {@link module:engine/view/document~Document#event:delete `delete`} event fired on
 * {@link module:engine/view/document~Document view document} and executes the `delete` or `forwardDelete` commands
 * in web browsers that fall back to the legacy `keydown` delete handling (as opposed to
 * {@link module:typing/utils/delete/injectbeforeinputdeletehandling~injectBeforeInputDeleteHandling delete
 * handling based on `beforeinput`}).
 *
 * **Note**: This is a legacy handler for browsers that do **not** support Input Events. Others use
 * {@link module:typing/utils/delete/injectbeforeinputdeletehandling~injectBeforeInputDeleteHandling} instead.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 */
export default function injectLegacyKeyEventsDeleteHandling( editor ) {
	const editingView = editor.editing.view;
	const viewDocument = editingView.document;

	viewDocument.on( 'delete', ( evt, data ) => {
		const { unit, sequence, direction } = data;
		const isForwardDelete = direction === 'forward';
		const deleteCommandParams = {
			unit,
			sequence
		};

		// If a specific (view) selection to remove was set, convert it to a model selection and set as a parameter for `DeleteCommand`.
		if ( data.selectionToRemove ) {
			const modelSelection = editor.model.createSelection();
			const modelRanges = [];

			for ( const viewRange of data.selectionToRemove.getRanges() ) {
				modelRanges.push( editor.editing.mapper.toModelRange( viewRange ) );
			}

			modelSelection.setTo( modelRanges );
			deleteCommandParams.selection = modelSelection;
		}

		editor.execute( isForwardDelete ? 'forwardDelete' : 'delete', deleteCommandParams );

		data.preventDefault();
		editingView.scrollToTheSelection();
	} );
}

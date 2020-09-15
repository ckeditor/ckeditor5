/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/utils/delete/injectbeforeinputhandling
 */

/**
 * TODO
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 */
export default function injectKeyEventsDeleteHandling( editor ) {
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

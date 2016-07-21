/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Contains {@link engine.view.Selection view selection} to {@link engine.model.Selection model selection} conversion
 * helper.
 *
 * @namespace engine.conversion.viewSelectionToModel
 */

/**
 * Function factory, creates a callback function which converts a {@link engine.view.Selection view selection} taken
 * from the {@link engine.view.Document#selectionChange} event and sets in on the {@link engine.model.Document#selection model}.
 *
 * **Note**: because there is no view selection change dispatcher nor any other advanced view selection to model
 * conversion mechanism, the callback should be set directly on view document.
 *
 *		view.document.on( 'selectionChange', convertSelectionChange( modelDocument, mapper ) );
 *
 * @function engine.conversion.viewSelectionToModel.convertSelectionChange
 * @param {engine.model.Document} modelDocument Model document on which selection should be updated.
 * @param {engine.conversion.Mapper} mapper Conversion mapper.
 * @returns {Function} {@link engine.view.Document#selectionChange} callback function.
 */
export function convertSelectionChange( modelDocument, mapper ) {
	return ( evt, data ) => {
		modelDocument.enqueueChanges( () => {
			const viewSelection = data.newSelection;

			modelDocument.selection.removeAllRanges();

			for ( let viewRange of viewSelection.getRanges() ) {
				const modelRange = mapper.toModelRange( viewRange );
				modelDocument.selection.addRange( modelRange, viewSelection.isBackward );
			}
		} );
	};
}

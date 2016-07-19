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
 * from the {@link engine.view.Document#selectionChange} event and set in on the
 * {@link engine.model.Document#selection model}.
 *
 * Note that because there is not view selection change dispatcher nor any other advance view selection to model
 * conversion mechanism, this method is simple event listener.
 *
 *		view.document.on( 'selectionChange', convertSelectionChange( model, mapper ) );
 *
 * @function engine.conversion.viewSelectionToModel.convertSelectionChange
 * @param {engine.model.Document} model Document model on which selection should be updated.
 * @param {engine.conversion.Mapper} mapper Conversion mapper.
 * @returns {Function} {@link engine.view.Document#selectionChange} callback function.
 */
export function convertSelectionChange( model, mapper ) {
	return ( evt, data ) => {
		model.enqueueChanges( () => {
			const viewSelection = data.newSelection;

			model.selection.removeAllRanges();

			for ( let viewRange of viewSelection.getRanges() ) {
				const modelRange = mapper.toModelRange( viewRange );
				model.selection.addRange( modelRange, viewSelection.isBackward );
			}
		} );
	};
}

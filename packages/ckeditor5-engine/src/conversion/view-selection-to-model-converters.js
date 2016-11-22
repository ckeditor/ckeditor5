/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/conversion/view-selection-to-model-converters
 */

/**
 * Contains {@link module:engine/view/selection~Selection view selection}
 * to {@link module:engine/model/selection~Selection model selection} conversion
 * helper.
 *
 * @namespace viewSelectionToModel
 */

import ModelSelection from '../model/selection.js';

/**
 * Function factory, creates a callback function which converts a {@link module:engine/view/selection~Selection view selection} taken
 * from the {@link module:engine/view/document~Document#selectionChange} event
 * and sets in on the {@link module:engine/model/document~Document#selection model}.
 *
 * **Note**: because there is no view selection change dispatcher nor any other advanced view selection to model
 * conversion mechanism, the callback should be set directly on view document.
 *
 *		view.document.on( 'selectionChange', convertSelectionChange( modelDocument, mapper ) );
 *
 * @param {module:engine/model/document~Document} modelDocument Model document on which selection should be updated.
 * @param {module:engine/conversion/mapper~Mapper} mapper Conversion mapper.
 * @returns {Function} {@link module:engine/view/document~Document#selectionChange} callback function.
 */
export function convertSelectionChange( modelDocument, mapper ) {
	return ( evt, data ) => {
		const viewSelection = data.newSelection;
		const modelSelection = new ModelSelection();

		const ranges = [];

		for ( let viewRange of viewSelection.getRanges() ) {
			ranges.push( mapper.toModelRange( viewRange ) );
		}

		modelSelection.setRanges( ranges, viewSelection.isBackward );

		if ( !modelSelection.isEqual( modelDocument.selection ) ) {
			modelDocument.enqueueChanges( () => {
				modelDocument.selection.setTo( modelSelection );
			} );
		}
	};
}

/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Contains {@link module:engine/view/selection~Selection view selection}
 * to {@link module:engine/model/selection~Selection model selection} conversion helpers.
 *
 * @module engine/conversion/upcast-selection-converters
 */

import ModelSelection from '../model/selection';

/**
 * Function factory, creates a callback function which converts a {@link module:engine/view/selection~Selection view selection} taken
 * from the {@link module:engine/view/document~Document#event:selectionChange} event
 * and sets in on the {@link module:engine/model/document~Document#selection model}.
 *
 * **Note**: because there is no view selection change dispatcher nor any other advanced view selection to model
 * conversion mechanism, the callback should be set directly on view document.
 *
 *		view.document.on( 'selectionChange', convertSelectionChange( modelDocument, mapper ) );
 *
 * @param {module:engine/model/model~Model} model Data model.
 * @param {module:engine/conversion/mapper~Mapper} mapper Conversion mapper.
 * @returns {Function} {@link module:engine/view/document~Document#event:selectionChange} callback function.
 */
export function convertSelectionChange( model, mapper ) {
	return ( evt, data ) => {
		const viewSelection = data.newSelection;
		const modelSelection = new ModelSelection();

		const ranges = [];

		for ( const viewRange of viewSelection.getRanges() ) {
			ranges.push( mapper.toModelRange( viewRange ) );
		}

		modelSelection.setTo( ranges, { backward: viewSelection.isBackward } );

		if ( !modelSelection.isEqual( model.document.selection ) ) {
			model.change( writer => {
				writer.setSelection( modelSelection );
			} );
		}
	};
}

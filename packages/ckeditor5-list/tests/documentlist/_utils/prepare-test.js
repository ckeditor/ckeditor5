/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { parse as parseModel } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

/**
 * TODO
 *
 */
export default function prepareTest( model, input ) {
	const modelRoot = model.document.getRoot( 'main' );

	// Parse data string to model.
	const parsedResult = parseModel( input, model.schema, { context: [ modelRoot.name ] } );

	// Retrieve DocumentFragment and Selection from parsed model.
	const modelDocumentFragment = parsedResult.model;
	const selection = parsedResult.selection;

	// Ensure no undo step is generated.
	model.enqueueChange( 'transparent', writer => {
		// Replace existing model in document by new one.
		writer.remove( writer.createRangeIn( modelRoot ) );
		writer.insert( modelDocumentFragment, modelRoot );

		// Clean up previous document selection.
		writer.setSelection( null );
		writer.removeSelectionAttribute( model.document.selection.getAttributeKeys() );
	} );

	const ranges = [];

	for ( const range of selection.getRanges() ) {
		const start = model.createPositionFromPath( modelRoot, range.start.path );
		const end = model.createPositionFromPath( modelRoot, range.end.path );

		ranges.push( model.createRange( start, end ) );
	}

	return model.createSelection( ranges );
}

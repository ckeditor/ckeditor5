/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewRange from '../view/range';
import viewWriter from '../view/writer';

/**
 * Contains {@link module:engine/model/selection~Selection model selection} to
 * {@link module:engine/view/selection~Selection view selection} converters for
 * {@link module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher}.
 *
 * @module engine/conversion/model-selection-to-view-converters
 */

/**
 * Function factory, creates a converter that converts non-collapsed {@link module:engine/model/selection~Selection model selection} to
 * {@link module:engine/view/selection~Selection view selection}. The converter consumes appropriate value from `consumable` object
 * and maps model positions from selection to view positions.
 *
 *		modelDispatcher.on( 'selection', convertRangeSelection() );
 *
 * @returns {Function} Selection converter.
 */
export function convertRangeSelection() {
	return ( evt, data, consumable, conversionApi ) => {
		const selection = data.selection;

		if ( selection.isCollapsed ) {
			return;
		}

		if ( !consumable.consume( selection, 'selection' ) ) {
			return;
		}

		conversionApi.viewSelection.removeAllRanges();

		for ( const range of selection.getRanges() ) {
			const viewRange = conversionApi.mapper.toViewRange( range );
			conversionApi.viewSelection.addRange( viewRange, selection.isBackward );
		}
	};
}

/**
 * Function factory, creates a converter that converts collapsed {@link module:engine/model/selection~Selection model selection} to
 * {@link module:engine/view/selection~Selection view selection}. The converter consumes appropriate value from `consumable` object,
 * maps model selection position to view position and breaks {@link module:engine/view/attributeelement~AttributeElement attribute elements}
 * at the selection position.
 *
 *		modelDispatcher.on( 'selection', convertCollapsedSelection() );
 *
 * Example of view state before and after converting collapsed selection:
 *
 *		   <p><strong>f^oo<strong>bar</p>
 *		-> <p><strong>f</strong>^<strong>oo</strong>bar</p>
 *
 * By breaking attribute elements like `<strong>`, selection is in correct element. Then, when selection attribute is
 * converted, the broken attributes might be merged again, or the position where the selection is may be wrapped
 * in different, appropriate attribute elements.
 *
 * See also {@link module:engine/conversion/model-selection-to-view-converters~clearAttributes} which does a clean-up
 * by merging attributes.
 *
 * @returns {Function} Selection converter.
 */
export function convertCollapsedSelection() {
	return ( evt, data, consumable, conversionApi ) => {
		const selection = data.selection;

		if ( !selection.isCollapsed ) {
			return;
		}

		if ( !consumable.consume( selection, 'selection' ) ) {
			return;
		}

		const modelPosition = selection.getFirstPosition();
		const viewPosition = conversionApi.mapper.toViewPosition( modelPosition );
		const brokenPosition = viewWriter.breakAttributes( viewPosition );

		conversionApi.viewSelection.removeAllRanges();
		conversionApi.viewSelection.addRange( new ViewRange( brokenPosition, brokenPosition ) );
	};
}

/**
 * Function factory, creates a converter that clears artifacts after the previous
 * {@link module:engine/model/selection~Selection model selection} conversion. It removes all empty
 * {@link module:engine/view/attributeelement~AttributeElement view attribute elements} and merge sibling attributes at all start and end
 * positions of all ranges.
 *
 *		   <p><strong>^</strong></p>
 *		-> <p>^</p>
 *
 *		   <p><strong>foo</strong>^<strong>bar</strong>bar</p>
 *		-> <p><strong>foo^bar<strong>bar</p>
 *
 *		   <p><strong>foo</strong><em>^</em><strong>bar</strong>bar</p>
 *		-> <p><strong>foo^bar<strong>bar</p>
 *
 * This listener should be assigned before any converter for the new selection:
 *
 *		modelDispatcher.on( 'selection', clearAttributes() );
 *
 * See {@link module:engine/conversion/model-selection-to-view-converters~convertCollapsedSelection}
 * which do the opposite by breaking attributes in the selection position.
 *
 * @returns {Function} Selection converter.
 */
export function clearAttributes() {
	return ( evt, data, consumable, conversionApi ) => {
		for ( const range of conversionApi.viewSelection.getRanges() ) {
			// Not collapsed selection should not have artifacts.
			if ( range.isCollapsed ) {
				// Position might be in the node removed by the view writer.
				if ( range.end.parent.document ) {
					viewWriter.mergeAttributes( range.start );
				}
			}
		}
		conversionApi.viewSelection.removeAllRanges();
	};
}

/**
 * Function factory, creates a converter that clears fake selection marking after the previous
 * {@link module:engine/model/selection~Selection model selection} conversion.
 */
export function clearFakeSelection() {
	return ( evt, data, consumable, conversionApi ) => conversionApi.viewSelection.setFake( false );
}

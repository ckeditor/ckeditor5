/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Contains {@link module:engine/model/selection~Selection model selection} to
 * {@link module:engine/view/documentselection~DocumentSelection view selection} converters for
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher downcast dispatcher}.
 *
 * @module engine/conversion/downcast-selection-converters
 */

/**
 * Function factory that creates a converter which converts a non-collapsed {@link module:engine/model/selection~Selection model selection}
 * to a {@link module:engine/view/documentselection~DocumentSelection view selection}. The converter consumes appropriate
 * value from the `consumable` object and maps model positions from the selection to view positions.
 *
 *		modelDispatcher.on( 'selection', convertRangeSelection() );
 *
 * @returns {Function} Selection converter.
 */
export function convertRangeSelection() {
	return ( evt, data, conversionApi ) => {
		const selection = data.selection;

		if ( selection.isCollapsed ) {
			return;
		}

		if ( !conversionApi.consumable.consume( selection, 'selection' ) ) {
			return;
		}

		const viewRanges = [];

		for ( const range of selection.getRanges() ) {
			const viewRange = conversionApi.mapper.toViewRange( range );
			viewRanges.push( viewRange );
		}

		conversionApi.writer.setSelection( viewRanges, { backward: selection.isBackward } );
	};
}

/**
 * Function factory that creates a converter which converts a collapsed {@link module:engine/model/selection~Selection model selection} to
 * a {@link module:engine/view/documentselection~DocumentSelection view selection}. The converter consumes appropriate
 * value from the `consumable` object, maps the model selection position to the view position and breaks
 * {@link module:engine/view/attributeelement~AttributeElement attribute elements} at the selection position.
 *
 *		modelDispatcher.on( 'selection', convertCollapsedSelection() );
 *
 * An example of the view state before and after converting the collapsed selection:
 *
 *		   <p><strong>f^oo<strong>bar</p>
 *		-> <p><strong>f</strong>^<strong>oo</strong>bar</p>
 *
 * By breaking attribute elements like `<strong>`, the selection is in a correct element. Then, when the selection attribute is
 * converted, broken attributes might be merged again, or the position where the selection is may be wrapped
 * with different, appropriate attribute elements.
 *
 * See also {@link module:engine/conversion/downcast-selection-converters~clearAttributes} which does a clean-up
 * by merging attributes.
 *
 * @returns {Function} Selection converter.
 */
export function convertCollapsedSelection() {
	return ( evt, data, conversionApi ) => {
		const selection = data.selection;

		if ( !selection.isCollapsed ) {
			return;
		}

		if ( !conversionApi.consumable.consume( selection, 'selection' ) ) {
			return;
		}

		const viewWriter = conversionApi.writer;
		const modelPosition = selection.getFirstPosition();
		const viewPosition = conversionApi.mapper.toViewPosition( modelPosition );
		const brokenPosition = viewWriter.breakAttributes( viewPosition );

		viewWriter.setSelection( brokenPosition );
	};
}

/**
 * Function factory that creates a converter which clears artifacts after the previous
 * {@link module:engine/model/selection~Selection model selection} conversion. It removes all empty
 * {@link module:engine/view/attributeelement~AttributeElement view attribute elements} and merges sibling attributes at all start and end
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
 * See {@link module:engine/conversion/downcast-selection-converters~convertCollapsedSelection}
 * which does the opposite by breaking attributes in the selection position.
 *
 * @returns {Function} Selection converter.
 */
export function clearAttributes() {
	return ( evt, data, conversionApi ) => {
		const viewWriter = conversionApi.writer;
		const viewSelection = viewWriter.document.selection;

		for ( const range of viewSelection.getRanges() ) {
			// Not collapsed selection should not have artifacts.
			if ( range.isCollapsed ) {
				// Position might be in the node removed by the view writer.
				if ( range.end.parent.document ) {
					conversionApi.writer.mergeAttributes( range.start );
				}
			}
		}
		viewWriter.setSelection( null );
	};
}

/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewElement from '../view/element';
import ViewRange from '../view/range';
import viewWriter from '../view/writer';
import { createViewElementFromHighlightDescriptor } from './model-to-view-converters';

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
 * By breaking attribute elements like `<strong>`, selection is in correct element. See also complementary
 * {@link module:engine/conversion/model-selection-to-view-converters~convertSelectionAttribute attribute converter}
 * for selection attributes,
 * which wraps collapsed selection into view elements. Those converters together ensure, that selection ends up in
 * appropriate attribute elements.
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
 * Function factory, creates a converter that converts {@link module:engine/model/selection~Selection model selection} attributes to
 * {@link module:engine/view/attributeelement~AttributeElement view attribute elements}. The converter works only for collapsed selection.
 * The converter consumes appropriate value from `consumable` object, maps model selection position to view position and
 * wraps that position into a view attribute element.
 *
 * The wrapping node depends on passed parameter. If {@link module:engine/view/element~Element} was passed, it will be cloned and
 * the copy will become the wrapping element. If `Function` is provided, it is passed all the parameters of the
 * {@link module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher#event:selectionAttribute selectionAttribute event}.
 * It's expected that the function returns a {@link module:engine/view/attributeelement~AttributeElement}.
 * The result of the function will be the wrapping element.
 *
 *		modelDispatcher.on( 'selectionAttribute:italic', convertSelectionAttribute( new ViewAttributeElement( 'em' ) ) );
 *
 *		function styleElementCreator( styleValue ) {
 *			if ( styleValue == 'important' ) {
 *				return new ViewAttributeElement( 'strong', { style: 'text-transform:uppercase;' } );
 *			} else if ( styleValue == 'gold' ) {
 *				return new ViewAttributeElement( 'span', { style: 'color:yellow;' } );
 *			}
 *		}
 *		modelDispatcher.on( 'selectionAttribute:style', convertSelectionAttribute( styleCreator ) );
 *		modelDispatcher.on( 'selection', convertCollapsedSelection() );
 *		modelDispatcher.on( 'selectionAttribute:italic', convertSelectionAttribute( new ViewAttributeElement( 'em' ) ) );
 *		modelDispatcher.on( 'selectionAttribute:bold', convertSelectionAttribute( new ViewAttributeElement( 'strong' ) ) );
 *
 * Example of view states before and after converting collapsed selection:
 *
 *		   <p><em>f^oo</em>bar</p>
 *		-> <p><em>f</em>^<em>oo</em>bar</p>
 *		-> <p><em>f^oo</em>bar</p>
 *
 * Example of view state after converting collapsed selection. The scenario is: selection is inside bold text (`<strong>` element)
 * but it does not have bold attribute itself and has italic attribute instead (let's assume that user turned off bold and turned
 * on italic with selection collapsed):
 *
 *		   <p><strong>f^oo<strong>bar</p>
 *		-> <p><strong>f</strong>^<strong>oo<strong>bar</p>
 *		-> <p><strong>f</strong><em>^</em><strong>oo</strong>bar</p>
 *
 * In first example, nothing has changed, because first `<em>` element got broken by `convertCollapsedSelection()` converter,
 * but then it got wrapped-back by `convertSelectionAttribute()` converter. In second example, notice how `<strong>` element
 * is broken to prevent putting selection in it, since selection has no `bold` attribute.
 *
 * @param {module:engine/view/attributeelement~AttributeElement|Function} elementCreator View element,
 * or function returning a view element, which will be used for wrapping.
 * @returns {Function} Selection converter.
 */
export function convertSelectionAttribute( elementCreator ) {
	return ( evt, data, consumable, conversionApi ) => {
		const viewElement = elementCreator instanceof ViewElement ?
			elementCreator.clone( true ) :
			elementCreator( data.value, data, data.selection, consumable, conversionApi );

		if ( !viewElement ) {
			return;
		}

		const consumableName = 'selectionAttribute:' + data.key;

		wrapCollapsedSelectionPosition( data.selection, conversionApi.viewSelection, viewElement, consumable, consumableName );
	};
}

/**
 * Performs similar conversion as {@link ~convertSelectionAttribute}, but depends on a marker name of a marker in which
 * collapsed selection is placed.
 *
 *		modelDispatcher.on( 'selectionMarker:searchResult', convertSelectionMarker( { class: 'search' } ) );
 *
 * @see module:engine/conversion/model-selection-to-view-converters~convertSelectionAttribute
 * @param {module:engine/conversion/model-to-view-converters~HighlightDescriptor|Function} highlightDescriptor Highlight
 * descriptor object or function returning a descriptor object.
 * @returns {Function} Selection converter.
 */
export function convertSelectionMarker( highlightDescriptor ) {
	return ( evt, data, consumable, conversionApi ) => {
		const descriptor = typeof highlightDescriptor == 'function' ?
			highlightDescriptor( data, consumable, conversionApi ) :
			highlightDescriptor;

		if ( !descriptor ) {
			return;
		}

		if ( !descriptor.id ) {
			descriptor.id = data.markerName;
		}

		const viewElement = createViewElementFromHighlightDescriptor( descriptor );
		const consumableName = 'selectionMarker:' + data.markerName;

		wrapCollapsedSelectionPosition( data.selection, conversionApi.viewSelection, viewElement, consumable, consumableName );
	};
}

// Helper function for `convertSelectionAttribute` and `convertSelectionMarker`, which perform similar task.
function wrapCollapsedSelectionPosition( modelSelection, viewSelection, viewElement, consumable, consumableName ) {
	if ( !modelSelection.isCollapsed ) {
		return;
	}

	if ( !consumable.consume( modelSelection, consumableName ) ) {
		return;
	}

	let viewPosition = viewSelection.getFirstPosition();

	// This hack is supposed to place attribute element *after* all ui elements if the attribute element would be
	// the only non-ui child and thus receive a block filler.
	// This is needed to properly render ui elements. Block filler is a <br /> element. If it is placed before
	// UI element, the ui element will most probably be incorrectly rendered (in next line). #1072.
	if ( shouldPushAttributeElement( viewPosition.parent ) ) {
		viewPosition = viewPosition.getLastMatchingPosition( value => value.item.is( 'uiElement' ) );
	}
	// End of hack.

	viewPosition = viewWriter.wrapPosition( viewPosition, viewElement );

	viewSelection.removeAllRanges();
	viewSelection.addRange( new ViewRange( viewPosition, viewPosition ) );
}

function shouldPushAttributeElement( parent ) {
	if ( !parent.is( 'element' ) ) {
		return false;
	}

	for ( const child of parent.getChildren() ) {
		if ( !child.is( 'uiElement' ) ) {
			return false;
		}
	}

	return true;
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

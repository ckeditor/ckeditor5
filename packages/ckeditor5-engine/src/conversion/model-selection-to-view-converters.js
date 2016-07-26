/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewElement from '../view/element.js';
import ViewRange from '../view/range.js';
import viewWriter from '../view/writer.js';

/**
 * Contains {@link engine.model.Selection model selection} to {@link engine.view.Selection view selection} converters for
 * {@link engine.conversion.ModelConversionDispatcher}.
 *
 * @namespace engine.conversion.modelSelectionToView
 */

/**
 * Function factory, creates a converter that converts non-collapsed {@link engine.model.Selection model selection} to
 * {@link engine.view.Selection view selection}. The converter consumes appropriate value from `consumable` object
 * and maps model positions from selection to view positions.
 *
 *		modelDispatcher.on( 'selection', convertRangeSelection() );
 *
 * @external engine.conversion.modelSelectionToView
 * @function engine.conversion.modelSelectionToView.convertRangeSelection
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

		for ( let range of selection.getRanges() ) {
			const viewRange = conversionApi.mapper.toViewRange( range );
			conversionApi.viewSelection.addRange( viewRange, selection.isBackward );
		}
	};
}

/**
 * Function factory, creates a converter that converts collapsed {@link engine.model.Selection model selection} to
 * {@link engine.view.Selection view selection}. The converter consumes appropriate value from `consumable` object,
 * maps model selection position to view position and breaks {@link engine.view.AttributeElement attribute elements}
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
 * {@link engine.conversion.modelSelectionToView.convertSelectionAttribute attribute converter} for selection attributes,
 * which wraps collapsed selection into view elements. Those converters together ensure, that selection ends up in
 * appropriate attribute elements.
 *
 * See also {@link engine.conversion.modelSelectionToView.clearAttributes} which does a clean-up by merging attributes.
 *
 * @external engine.conversion.modelSelectionToView
 * @function engine.conversion.modelSelectionToView.convertCollapsedSelection
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
		const brokenPosition = viewWriter.breakAt( viewPosition );

		conversionApi.viewSelection.removeAllRanges();
		conversionApi.viewSelection.addRange( new ViewRange( brokenPosition, brokenPosition ) );
	};
}

/**
 * Function factory, creates a converter that converts {@link engine.model.Selection model selection} attributes to
 * {@link engine.view.AttributeElement view attribute elements}. The converter works only for collapsed selection.
 * The converter consumes appropriate value from `consumable` object, maps model selection position to view position and
 * wraps that position into a view attribute element.
 *
 * The wrapping node depends on passed parameter. If {@link engine.view.Element} was passed, it will be cloned and
 * the copy will become the wrapping element. If `Function` is provided, it is passed all the parameters of the
 * {@link engine.conversion.ModelConversionDispatcher#event:selectionAttribute selectionAttribute event}. It's expected that
 * the function returns a {@link engine.view.AttributeElement}. The result of the function will be the wrapping element.
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
 *
 * **Note:** You can use the same `elementCreator` function for this converter factory and {@link engine.conversion.modelToView.wrap}
 * model to view converter, as long as the `elementCreator` function uses only the first parameter (attribute value).
 *
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
 * @external engine.conversion.modelSelectionToView
 * @function engine.conversion.modelSelectionToView.convertCollapsedSelection
 * @param {engine.view.AttributeElement|Function} elementCreator View element, or function returning a view element, which will
 * be used for wrapping.
 * @returns {Function} Selection converter.
 */
export function convertSelectionAttribute( elementCreator ) {
	return ( evt, data, consumable, conversionApi ) => {
		const selection = data.selection;

		if ( !selection.isCollapsed ) {
			return;
		}

		if ( !consumable.consume( selection, 'selectionAttribute:' + data.key ) ) {
			return;
		}

		let viewPosition = conversionApi.viewSelection.getFirstPosition();
		conversionApi.viewSelection.removeAllRanges();

		const viewElement = elementCreator instanceof ViewElement ?
				elementCreator.clone( true ) :
				elementCreator( data.value, selection, consumable, conversionApi );

		viewPosition = viewWriter.wrapPosition( viewPosition, viewElement );

		conversionApi.viewSelection.addRange( new ViewRange( viewPosition, viewPosition ) );
	};
}

/**
 * Function factory, creates a converter that clears artifacts after the previous
 * {@link engine.model.Selection model selection} conversion. It removes all empty
 * {@link engine.view.AttributeElement view attribute elements} and merge sibling attributes at all start and end
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
 * See {@link engine.conversion.modelSelectionToView.convertCollapsedSelection} which do the opposite by breaking
 * attributes in the selection position.
 *
 * @external engine.conversion.modelSelectionToView
 * @function engine.conversion.modelSelectionToView.clearAttributes
 * @returns {Function} Selection converter.
 */
export function clearAttributes() {
	return ( evt, data, consumable, conversionApi ) => {
		for ( let range of conversionApi.viewSelection.getRanges() ) {
			// Not collapsed selection should not have artifacts.
			if ( range.isCollapsed ) {
				// Position might be in the node removed by the view writer.
				if ( range.end.parent.document ) {
					viewWriter.mergeAt( range.start );
				}
			}
		}
		conversionApi.viewSelection.removeAllRanges();
	};
}

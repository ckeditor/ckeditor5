/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/utils/deletecontent
 */

import LivePosition from '../liveposition';
import Range from '../range';
import DocumentSelection from '../documentselection';

/**
 * Deletes content of the selection and merge siblings. The resulting selection is always collapsed.
 *
 * **Note:** Use {@link module:engine/model/model~Model#deleteContent} instead of this function.
 * This function is only exposed to be reusable in algorithms
 * which change the {@link module:engine/model/model~Model#deleteContent}
 * method's behavior.
 *
 * @param {module:engine/model/model~Model} model The model in context of which the insertion
 * should be performed.
 * @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
 * Selection of which the content should be deleted.
 * @param {Object} [options]
 * @param {Boolean} [options.leaveUnmerged=false] Whether to merge elements after removing the content of the selection.
 *
 * For example `<heading>x[x</heading><paragraph>y]y</paragraph>` will become:
 *
 * * `<heading>x^y</heading>` with the option disabled (`leaveUnmerged == false`)
 * * `<heading>x^</heading><paragraph>y</paragraph>` with enabled (`leaveUnmerged == true`).
 *
 * Note: {@link module:engine/model/schema~Schema#isObject object} and {@link module:engine/model/schema~Schema#isLimit limit}
 * elements will not be merged.
 *
 * @param {Boolean} [options.doNotResetEntireContent=false] Whether to skip replacing the entire content with a
 * paragraph when the entire content was selected.
 *
 * For example `<heading>[x</heading><paragraph>y]</paragraph>` will become:
 *
 * * `<paragraph>^</paragraph>` with the option disabled (`doNotResetEntireContent == false`)
 * * `<heading>^</heading>` with enabled (`doNotResetEntireContent == true`).
 *
 * @param {Boolean} [options.doNotAutoparagraph=false] Whether to create a paragraph if after content deletion selection is moved
 * to a place where text cannot be inserted.
 *
 * For example `<paragraph>x</paragraph>[<imageBlock src="foo.jpg"></imageBlock>]` will become:
 *
 * * `<paragraph>x</paragraph><paragraph>[]</paragraph>` with the option disabled (`doNotAutoparagraph == false`)
 * * `<paragraph>x</paragraph>[]` with the option enabled (`doNotAutoparagraph == true`).
 *
 * If you use this option you need to make sure to handle invalid selections yourself or leave
 * them to the selection post-fixer (may not always work).
 *
 * **Note:** If there is no valid position for the selection, the paragraph will always be created:
 *
 * `[<imageBlock src="foo.jpg"></imageBlock>]` -> `<paragraph>[]</paragraph>`.
 */
export default function deleteContent( model, selection, options = {} ) {
	if ( selection.isCollapsed ) {
		return;
	}

	const selRange = selection.getFirstRange();

	// If the selection is already removed, don't do anything.
	if ( selRange.root.rootName == '$graveyard' ) {
		return;
	}

	const schema = model.schema;

	model.change( writer => {
		// 1. Replace the entire content with paragraph.
		// See: https://github.com/ckeditor/ckeditor5-engine/issues/1012#issuecomment-315017594.
		if ( !options.doNotResetEntireContent && shouldEntireContentBeReplacedWithParagraph( schema, selection ) ) {
			replaceEntireContentWithParagraph( writer, selection, schema );

			return;
		}

		// Collect attributes to copy in case of autoparagraphing.
		const attributesForAutoparagraph = {};

		if ( !options.doNotAutoparagraph ) {
			const selectedElement = selection.getSelectedElement();

			if ( selectedElement ) {
				Object.assign( attributesForAutoparagraph, schema.getAttributesWithProperty( selectedElement, 'copyOnReplace', true ) );
			}
		}

		// Get the live positions for the range adjusted to span only blocks selected from the user perspective.
		const [ startPosition, endPosition ] = getLivePositionsForSelectedBlocks( selRange );

		// 2. Remove the content if there is any.
		if ( !startPosition.isTouching( endPosition ) ) {
			writer.remove( writer.createRange( startPosition, endPosition ) );
		}

		// 3. Merge elements in the right branch to the elements in the left branch.
		// The only reasonable (in terms of data and selection correctness) case in which we need to do that is:
		//
		// <heading type=1>Fo[</heading><paragraph>]ar</paragraph> => <heading type=1>Fo^ar</heading>
		//
		// However, the algorithm supports also merging deeper structures (up to the depth of the shallower branch),
		// as it's hard to imagine what should actually be the default behavior. Usually, specific features will
		// want to override that behavior anyway.
		if ( !options.leaveUnmerged ) {
			mergeBranches( writer, startPosition, endPosition );

			// TMP this will be replaced with a postfixer.
			// We need to check and strip disallowed attributes in all nested nodes because after merge
			// some attributes could end up in a path where are disallowed.
			//
			// e.g. bold is disallowed for <H1>
			// <h1>Fo{o</h1><p>b}a<b>r</b><p> -> <h1>Fo{}a<b>r</b><h1> -> <h1>Fo{}ar<h1>.
			schema.removeDisallowedAttributes( startPosition.parent.getChildren(), writer );
		}

		collapseSelectionAt( writer, selection, startPosition );

		// 4. Add a paragraph to set selection in it.
		// Check if a text is allowed in the new container. If not, try to create a new paragraph (if it's allowed here).
		// If autoparagraphing is off, we assume that you know what you do so we leave the selection wherever it was.
		if ( !options.doNotAutoparagraph && shouldAutoparagraph( schema, startPosition ) ) {
			insertParagraph( writer, startPosition, selection, attributesForAutoparagraph );
		}

		startPosition.detach();
		endPosition.detach();
	} );
}

// Returns the live positions for the range adjusted to span only blocks selected from the user perspective. Example:
//
//     <heading1>[foo</heading1>
//     <paragraph>bar</paragraph>
//     <heading1>]abc</heading1>  <-- this block is not considered as selected
//
// This is the same behavior as in Selection#getSelectedBlocks() "special case".
function getLivePositionsForSelectedBlocks( range ) {
	const model = range.root.document.model;

	const startPosition = range.start;
	let endPosition = range.end;

	// If the end of selection is at the start position of last block in the selection, then
	// shrink it to not include that trailing block. Note that this should happen only for not empty selection.
	if ( model.hasContent( range, { ignoreMarkers: true } ) ) {
		const endBlock = getParentBlock( endPosition );

		if ( endBlock && endPosition.isTouching( model.createPositionAt( endBlock, 0 ) ) ) {
			// Create forward selection as a probe to find a valid position after excluding last block from the range.
			const selection = model.createSelection( range );

			// Modify the forward selection in backward direction to shrink it and remove first position of following block from it.
			// This is how modifySelection works and here we are making use of it.
			model.modifySelection( selection, { direction: 'backward' } );

			const newEndPosition = selection.getLastPosition();

			// For such a model and selection:
			//     <paragraph>A[</paragraph><imageBlock></imageBlock><paragraph>]B</paragraph>
			//
			// After modifySelection(), we would end up with this:
			//     <paragraph>A[</paragraph>]<imageBlock></imageBlock><paragraph>B</paragraph>
			//
			// So we need to check if there is no content in the skipped range (because we want to include the <imageBlock>).
			const skippedRange = model.createRange( newEndPosition, endPosition );

			if ( !model.hasContent( skippedRange, { ignoreMarkers: true } ) ) {
				endPosition = newEndPosition;
			}
		}
	}

	return [
		LivePosition.fromPosition( startPosition, 'toPrevious' ),
		LivePosition.fromPosition( endPosition, 'toNext' )
	];
}

// Finds the lowest element in position's ancestors which is a block.
// Returns null if a limit element is encountered before reaching a block element.
function getParentBlock( position ) {
	const element = position.parent;
	const schema = element.root.document.model.schema;
	const ancestors = element.getAncestors( { parentFirst: true, includeSelf: true } );

	for ( const element of ancestors ) {
		if ( schema.isLimit( element ) ) {
			return null;
		}

		if ( schema.isBlock( element ) ) {
			return element;
		}
	}
}

// This function is a result of reaching the Ballmer's peak for just the right amount of time.
// Even I had troubles documenting it after a while and after reading it again I couldn't believe that it really works.
function mergeBranches( writer, startPosition, endPosition ) {
	const model = writer.model;

	// Verify if there is a need and possibility to merge.
	if ( !checkShouldMerge( writer.model.schema, startPosition, endPosition ) ) {
		return;
	}

	// If the start element on the common ancestor level is empty, and the end element on the same level is not empty
	// then merge those to the right element so that it's properties are preserved (name, attributes).
	// Because of OT merging is used instead of removing elements.
	//
	// Merge left:
	//     <heading1>foo[</heading1>    ->  <heading1>foo[]bar</heading1>
	//     <paragraph>]bar</paragraph>  ->               --^
	//
	// Merge right:
	//     <heading1>[</heading1>       ->
	//     <paragraph>]bar</paragraph>  ->  <paragraph>[]bar</paragraph>
	//
	// Merge left:
	//     <blockQuote>                     ->  <blockQuote>
	//         <heading1>foo[</heading1>    ->      <heading1>foo[]bar</heading1>
	//         <paragraph>]bar</paragraph>  ->                   --^
	//     </blockQuote>                    ->  </blockQuote>
	//
	// Merge right:
	//     <blockQuote>                     ->  <blockQuote>
	//         <heading1>[</heading1>       ->
	//         <paragraph>]bar</paragraph>  ->      <paragraph>[]bar</paragraph>
	//     </blockQuote>                    ->  </blockQuote>

	// Merging should not go deeper than common ancestor.
	const [ startAncestor, endAncestor ] = getAncestorsJustBelowCommonAncestor( startPosition, endPosition );

	// Branches can't be merged if one of the positions is directly inside a common ancestor.
	//
	// Example:
	//     <blockQuote>
	//         <paragraph>[foo</paragraph>]
	//         <table> ... </table>
	//     <blockQuote>
	//
	if ( !startAncestor || !endAncestor ) {
		return;
	}

	if ( !model.hasContent( startAncestor, { ignoreMarkers: true } ) && model.hasContent( endAncestor, { ignoreMarkers: true } ) ) {
		mergeBranchesRight( writer, startPosition, endPosition, startAncestor.parent );
	} else {
		mergeBranchesLeft( writer, startPosition, endPosition, startAncestor.parent );
	}
}

// Merging blocks to the left (properties of the left block are preserved).
// Simple example:
//     <heading1>foo[</heading1>    ->  <heading1>foo[bar</heading1>]
//     <paragraph>]bar</paragraph>  ->              --^
//
// Nested example:
//     <blockQuote>                     ->  <blockQuote>
//         <heading1>foo[</heading1>    ->      <heading1>foo[bar</heading1>
//     </blockQuote>                    ->  </blockQuote>]    ^
//     <blockBlock>                     ->                    |
//         <paragraph>]bar</paragraph>  ->                 ---
//     </blockBlock>                    ->
//
function mergeBranchesLeft( writer, startPosition, endPosition, commonAncestor ) {
	const startElement = startPosition.parent;
	const endElement = endPosition.parent;

	// Merging reached the common ancestor element, stop here.
	if ( startElement == commonAncestor || endElement == commonAncestor ) {
		return;
	}

	// Remember next positions to merge in next recursive step (also used as modification points pointers).
	startPosition = writer.createPositionAfter( startElement );
	endPosition = writer.createPositionBefore( endElement );

	// Move endElement just after startElement if they aren't siblings.
	if ( !endPosition.isEqual( startPosition ) ) {
		//
		//     <blockQuote>                     ->  <blockQuote>
		//         <heading1>foo[</heading1>    ->      <heading1>foo</heading1>[<paragraph>bar</paragraph>
		//     </blockQuote>                    ->  </blockQuote>                ^
		//     <blockBlock>                     ->  <blockBlock>                 |
		//         <paragraph>]bar</paragraph>  ->      ]                     ---
		//     </blockBlock>                    ->  </blockBlock>
		//
		writer.insert( endElement, startPosition );
	}

	// Merge two siblings (nodes on sides of startPosition):
	//
	//     <blockQuote>                                             ->  <blockQuote>
	//         <heading1>foo</heading1>[<paragraph>bar</paragraph>  ->      <heading1>foo[bar</heading1>
	//     </blockQuote>                                            ->  </blockQuote>
	//     <blockBlock>                                             ->  <blockBlock>
	//         ]                                                    ->      ]
	//     </blockBlock>                                            ->  </blockBlock>
	//
	// Or in simple case (without moving elements in above if):
	//     <heading1>foo</heading1>[<paragraph>bar</paragraph>]  ->  <heading1>foo[bar</heading1>]
	//
	writer.merge( startPosition );

	// Remove empty end ancestors:
	//
	//     <blockQuote>                      ->  <blockQuote>
	//         <heading1>foo[bar</heading1>  ->      <heading1>foo[bar</heading1>
	//     </blockQuote>                     ->  </blockQuote>
	//     <blockBlock>                      ->
	//         ]                             ->  ]
	//     </blockBlock>                     ->
	//
	while ( endPosition.parent.isEmpty ) {
		const parentToRemove = endPosition.parent;

		endPosition = writer.createPositionBefore( parentToRemove );

		writer.remove( parentToRemove );
	}

	// Verify if there is a need and possibility to merge next level.
	if ( !checkShouldMerge( writer.model.schema, startPosition, endPosition ) ) {
		return;
	}

	// Continue merging next level (blockQuote with blockBlock in the examples above if it would not be empty and got removed).
	mergeBranchesLeft( writer, startPosition, endPosition, commonAncestor );
}

// Merging blocks to the right (properties of the right block are preserved).
// Simple example:
//     <heading1>foo[</heading1>    ->            --v
//     <paragraph>]bar</paragraph>  ->  [<paragraph>foo]bar</paragraph>
//
// Nested example:
//     <blockQuote>                     ->
//         <heading1>foo[</heading1>    ->              ---
//     </blockQuote>                    ->                 |
//     <blockBlock>                     ->  [<blockBlock>  v
//         <paragraph>]bar</paragraph>  ->      <paragraph>foo]bar</paragraph>
//     </blockBlock>                    ->  </blockBlock>
//
function mergeBranchesRight( writer, startPosition, endPosition, commonAncestor ) {
	const startElement = startPosition.parent;
	const endElement = endPosition.parent;

	// Merging reached the common ancestor element, stop here.
	if ( startElement == commonAncestor || endElement == commonAncestor ) {
		return;
	}

	// Remember next positions to merge in next recursive step (also used as modification points pointers).
	startPosition = writer.createPositionAfter( startElement );
	endPosition = writer.createPositionBefore( endElement );

	// Move startElement just before endElement if they aren't siblings.
	if ( !endPosition.isEqual( startPosition ) ) {
		//
		//     <blockQuote>                     ->  <blockQuote>
		//         <heading1>foo[</heading1>    ->      [                   ---
		//     </blockQuote>                    ->  </blockQuote>              |
		//     <blockBlock>                     ->  <blockBlock>               v
		//         <paragraph>]bar</paragraph>  ->      <heading1>foo</heading1>]<paragraph>bar</paragraph>
		//     </blockBlock>                    ->  </blockBlock>
		//
		writer.insert( startElement, endPosition );
	}

	// Remove empty end ancestors:
	//
	//     <blockQuote>                                             ->
	//         [                                                    ->  [
	//     </blockQuote>                                            ->
	//     <blockBlock>                                             ->  <blockBlock>
	//         <heading1>foo</heading1>]<paragraph>bar</paragraph>  ->      <heading1>foo</heading1>]<paragraph>bar</paragraph>
	//     </blockBlock>                                            ->  </blockBlock>
	//
	while ( startPosition.parent.isEmpty ) {
		const parentToRemove = startPosition.parent;

		startPosition = writer.createPositionBefore( parentToRemove );

		writer.remove( parentToRemove );
	}

	// Update endPosition after inserting and removing elements.
	endPosition = writer.createPositionBefore( endElement );

	// Merge right two siblings (nodes on sides of endPosition):
	//                                                              ->
	//     [                                                        ->  [
	//                                                              ->
	//     <blockBlock>                                             ->  <blockBlock>
	//         <heading1>foo</heading1>]<paragraph>bar</paragraph>  ->      <paragraph>foo]bar</paragraph>
	//     </blockBlock>                                            ->  </blockBlock>
	//
	// Or in simple case (without moving elements in above if):
	//     [<heading1>foo</heading1>]<paragraph>bar</paragraph>  ->  [<heading1>foo]bar</heading1>
	//
	mergeRight( writer, endPosition );

	// Verify if there is a need and possibility to merge next level.
	if ( !checkShouldMerge( writer.model.schema, startPosition, endPosition ) ) {
		return;
	}

	// Continue merging next level (blockQuote with blockBlock in the examples above if it would not be empty and got removed).
	mergeBranchesRight( writer, startPosition, endPosition, commonAncestor );
}

// There is no right merge operation so we need to simulate it.
function mergeRight( writer, position ) {
	const startElement = position.nodeBefore;
	const endElement = position.nodeAfter;

	if ( startElement.name != endElement.name ) {
		writer.rename( startElement, endElement.name );
	}

	writer.clearAttributes( startElement );
	writer.setAttributes( Object.fromEntries( endElement.getAttributes() ), startElement );

	writer.merge( position );
}

// Verifies if merging is needed and possible. It's not needed if both positions are in the same element
// and it's not possible if some element is a limit or the range crosses a limit element.
function checkShouldMerge( schema, startPosition, endPosition ) {
	const startElement = startPosition.parent;
	const endElement = endPosition.parent;

	// If both positions ended up in the same parent, then there's nothing more to merge:
	// <$root><p>x[</p><p>]y</p></$root> => <$root><p>xy</p>[]</$root>
	if ( startElement == endElement ) {
		return false;
	}

	// If one of the positions is a limit element, then there's nothing to merge because we don't want to cross the limit boundaries.
	if ( schema.isLimit( startElement ) || schema.isLimit( endElement ) ) {
		return false;
	}

	// Check if operations we'll need to do won't need to cross object or limit boundaries.
	// E.g., we can't merge endElement into startElement in this case:
	// <limit><startElement>x[</startElement></limit><endElement>]</endElement>
	return isCrossingLimitElement( startPosition, endPosition, schema );
}

// Returns the elements that are the ancestors of the provided positions that are direct children of the common ancestor.
function getAncestorsJustBelowCommonAncestor( positionA, positionB ) {
	const ancestorsA = positionA.getAncestors();
	const ancestorsB = positionB.getAncestors();

	let i = 0;

	while ( ancestorsA[ i ] && ancestorsA[ i ] == ancestorsB[ i ] ) {
		i++;
	}

	return [ ancestorsA[ i ], ancestorsB[ i ] ];
}

function shouldAutoparagraph( schema, position ) {
	const isTextAllowed = schema.checkChild( position, '$text' );
	const isParagraphAllowed = schema.checkChild( position, 'paragraph' );

	return !isTextAllowed && isParagraphAllowed;
}

// Check if parents of two positions can be merged by checking if there are no limit/object
// boundaries between those two positions.
//
// E.g. in <bQ><p>x[]</p></bQ><widget><caption>{}</caption></widget>
// we'll check <p>, <bQ>, <widget> and <caption>.
// Usually, widget and caption are marked as objects/limits in the schema, so in this case merging will be blocked.
function isCrossingLimitElement( leftPos, rightPos, schema ) {
	const rangeToCheck = new Range( leftPos, rightPos );

	for ( const value of rangeToCheck.getWalker() ) {
		if ( schema.isLimit( value.item ) ) {
			return false;
		}
	}

	return true;
}

function insertParagraph( writer, position, selection, attributes = {} ) {
	const paragraph = writer.createElement( 'paragraph' );

	writer.model.schema.setAllowedAttributes( paragraph, attributes, writer );

	writer.insert( paragraph, position );

	collapseSelectionAt( writer, selection, writer.createPositionAt( paragraph, 0 ) );
}

function replaceEntireContentWithParagraph( writer, selection ) {
	const limitElement = writer.model.schema.getLimitElement( selection );

	writer.remove( writer.createRangeIn( limitElement ) );
	insertParagraph( writer, writer.createPositionAt( limitElement, 0 ), selection );
}

// We want to replace the entire content with a paragraph when:
// * the entire content is selected,
// * selection contains at least two elements,
// * whether the paragraph is allowed in schema in the common ancestor.
function shouldEntireContentBeReplacedWithParagraph( schema, selection ) {
	const limitElement = schema.getLimitElement( selection );

	if ( !selection.containsEntireContent( limitElement ) ) {
		return false;
	}

	const range = selection.getFirstRange();

	if ( range.start.parent == range.end.parent ) {
		return false;
	}

	return schema.checkChild( limitElement, 'paragraph' );
}

// Helper function that sets the selection. Depending whether given `selection` is a document selection or not,
// uses a different method to set it.
function collapseSelectionAt( writer, selection, positionOrRange ) {
	if ( selection instanceof DocumentSelection ) {
		writer.setSelection( positionOrRange );
	} else {
		selection.setTo( positionOrRange );
	}
}

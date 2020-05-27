/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
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
 * For example `<paragraph>x</paragraph>[<image src="foo.jpg"></image>]` will become:
 *
 * * `<paragraph>x</paragraph><paragraph>[]</paragraph>` with the option disabled (`doNotAutoparagraph == false`)
 * * `<paragraph>x</paragraph>[]` with the option enabled (`doNotAutoparagraph == true`).
 *
 * If you use this option you need to make sure to handle invalid selections yourself or leave
 * them to the selection post-fixer (may not always work).
 *
 * **Note:** if there is no valid position for the selection, the paragraph will always be created:
 *
 * `[<image src="foo.jpg"></image>]` -> `<paragraph>[]</paragraph>`.
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

	let startPosition = selRange.start;
	let endPosition = selRange.end;

	// If the end of selection is at the start position of last block in the selection, then
	// shrink it to not include that trailing block. Note that this should happen only for not empty selection.
	if ( hasContent( selRange ) ) {
		const endBlock = getParentBlock( endPosition );

		if ( endBlock && endPosition.isTouching( model.createPositionAt( endBlock, 0 ) ) ) {
			// Create forward selection from range.
			const selection = model.createSelection( selRange );

			// Modify the selection in backward direction to shrink it and remove first position of following block from it.
			model.modifySelection( selection, { direction: 'backward' } );

			endPosition = selection.getLastPosition();
		}
	}

	endPosition = LivePosition.fromPosition( endPosition, 'toNext' );

	model.change( writer => {
		// 1. Replace the entire content with paragraph.
		// See: https://github.com/ckeditor/ckeditor5-engine/issues/1012#issuecomment-315017594.
		if ( !options.doNotResetEntireContent && shouldEntireContentBeReplacedWithParagraph( schema, selection ) ) {
			replaceEntireContentWithParagraph( writer, selection, schema );

			return;
		}

		// 2. Remove the content if there is any.
		if ( !selRange.start.isTouching( selRange.end ) ) {
			writer.remove( selRange );
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
			startPosition = mergeBranches( writer, startPosition, endPosition ) || startPosition;

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
			insertParagraph( writer, startPosition, selection );
		}

		endPosition.detach();
	} );
}

// Finds the lowest element in position's ancestors which is a block.
// It will search until first ancestor that is a limit element.
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
	// Verify if there is a need and possibility to merge.
	if ( !checkShouldMerge( writer.model.schema, startPosition, endPosition ) ) {
		return;
	}

	// If the start element on the common ancestor level is empty, and the end element on the same level is not empty
	// then remove former one and merging is done.
	// <heading1>[</heading1><paragraph>]foo</paragraph> -> <paragraph>[]foo</paragraph>
	// <blockQuote><heading1>[</heading1><paragraph>]foo</paragraph> -> <blockQuote><paragraph>[]foo</paragraph></blockQuote>
	const [ startAncestor, endAncestor ] = getElementsNextToCommonAncestor( startPosition, endPosition );

	if ( !hasContent( startAncestor ) && hasContent( endAncestor ) ) {
		mergeBranchesRight( writer, startPosition, endPosition, startAncestor.parent );
	} else {
		mergeBranchesLeft( writer, startPosition, endPosition, startAncestor.parent );
	}

	// The new start position will be equal to end position (this is a LivePosition so it's up to date).
	return endPosition;
}

function mergeBranchesLeft( writer, startPosition, endPosition, commonAncestor ) {
	const startElement = startPosition.parent;
	const endElement = endPosition.parent;

	// Merging reached the common ancestor element, stop here.
	if ( startElement == commonAncestor || endElement == commonAncestor ) {
		return;
	}

	// Remember next positions to merge. For example:
	// <a><b>x[</b></a><c><d>]y</d></c>
	// will become:
	// <a><b>xy</b>[</a><c>]</c>
	startPosition = writer.createPositionAfter( startElement );
	endPosition = writer.createPositionBefore( endElement );

	if ( !endPosition.isEqual( startPosition ) ) {
		// In this case, before we merge, we need to move `endElement` to the `startPosition`:
		// <a><b>x[</b></a><c><d>]y</d></c>
		// becomes:
		// <a><b>x</b>[<d>y</d></a><c>]</c>
		writer.insert( endElement, startPosition );
	}

	// Merge two siblings:
	// <a>x</a>[]<b>y</b> -> <a>xy</a> (the usual case)
	// <a><b>x</b>[]<d>y</d></a><c></c> -> <a><b>xy</b>[]</a><c></c> (this is the "move parent" case shown above)
	writer.merge( startPosition );

	// Remove empty end ancestors:
	// <a>fo[o</a><b><a><c>bar]</c></a></b>
	// becomes:
	// <a>fo[</a><b><a>]</a></b>
	// So we can remove <a> and <b>.
	while ( endPosition.parent.isEmpty ) {
		const parentToRemove = endPosition.parent;

		endPosition = writer.createPositionBefore( parentToRemove );

		writer.remove( parentToRemove );
	}

	// Verify if there is a need and possibility to merge next level.
	if ( !checkShouldMerge( writer.model.schema, startPosition, endPosition ) ) {
		return;
	}

	// Continue merging next level.
	mergeBranchesLeft( writer, startPosition, endPosition, commonAncestor );
}

function mergeBranchesRight( writer, startPosition, endPosition, commonAncestor ) {
	const startElement = startPosition.parent;
	const endElement = endPosition.parent;

	// Merging reached the common ancestor element, stop here.
	if ( startElement == commonAncestor || endElement == commonAncestor ) {
		return;
	}

	// Remember next positions to merge. For example:
	// <a><b>x[</b></a><c><d>]y</d></c>
	// will become:
	// <a>[</a><c>]<d>xy</d></c>
	startPosition = writer.createPositionAfter( startElement );
	endPosition = writer.createPositionBefore( endElement );

	if ( !endPosition.isEqual( startPosition ) ) {
		// In this case, before we merge, we need to move `startElement` to the `endPosition`:
		// <a><b>x[</b></a><c><d>]y</d></c>
		// becomes:
		// <a>[</a><c><b>x</b>]<d>y</d></c>
		writer.insert( startElement, endPosition );
	}

	// Remove empty start ancestors:
	// <x><a><b>x[</b></a></x><c><d>]y</d></c>
	// becomes:
	// <x><a>[</a></x><c><b>x</b>]<d>y</d></c>
	// So we can remove <a> and <x>.
	while ( startPosition.parent.isEmpty ) {
		const parentToRemove = startPosition.parent;

		startPosition = writer.createPositionBefore( parentToRemove );

		writer.remove( parentToRemove );
	}

	// Update endPosition after inserting and removing elements.
	endPosition = writer.createPositionBefore( endElement );

	// Merge two siblings:
	// <a>x</a>[]<b>y</b> -> <b>xy</b>
	mergeRight( writer, endPosition );

	// Verify if there is a need and possibility to merge next level.
	if ( !checkShouldMerge( writer.model.schema, startPosition, endPosition ) ) {
		return;
	}

	// Continue merging next level.
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

// Verifies if merging is needed and possible.
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
	return checkCanBeMerged( startPosition, endPosition, schema );
}

// Returns the elements that are the ancestors of the provided positions that are direct children of the common ancestor.
function getElementsNextToCommonAncestor( positionA, positionB ) {
	const ancestorsA = positionA.getAncestors();
	const ancestorsB = positionB.getAncestors();

	let i = 0;

	while ( ancestorsA[ i ] && ancestorsA[ i ] == ancestorsB[ i ] ) {
		i++;
	}

	return [ ancestorsA[ i ], ancestorsB[ i ] ];
}

// Returns true if element or range contains any text.
function hasContent( elementOrRange ) {
	const model = elementOrRange.root.document.model;
	const schema = model.schema;
	const range = elementOrRange.is( 'range' ) ? elementOrRange : model.createRangeIn( elementOrRange );

	for ( const item of range.getItems() ) {
		if ( item.is( 'textProxy' ) || schema.isObject( item ) ) {
			return true;
		}
	}

	return false;
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
function checkCanBeMerged( leftPos, rightPos, schema ) {
	const rangeToCheck = new Range( leftPos, rightPos );

	for ( const value of rangeToCheck.getWalker() ) {
		if ( schema.isLimit( value.item ) ) {
			return false;
		}
	}

	return true;
}

function insertParagraph( writer, position, selection ) {
	const paragraph = writer.createElement( 'paragraph' );

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

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

	model.change( writer => {
		// 1. Replace the entire content with paragraph.
		// See: https://github.com/ckeditor/ckeditor5-engine/issues/1012#issuecomment-315017594.
		if ( !options.doNotResetEntireContent && shouldEntireContentBeReplacedWithParagraph( schema, selection ) ) {
			replaceEntireContentWithParagraph( writer, selection, schema );

			return;
		}

		const startPos = selRange.start;
		const endPos = LivePosition.fromPosition( selRange.end, 'toNext' );

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
			mergeBranches( writer, startPos, endPos );

			// TMP this will be replaced with a postfixer.
			// We need to check and strip disallowed attributes in all nested nodes because after merge
			// some attributes could end up in a path where are disallowed.
			//
			// e.g. bold is disallowed for <H1>
			// <h1>Fo{o</h1><p>b}a<b>r</b><p> -> <h1>Fo{}a<b>r</b><h1> -> <h1>Fo{}ar<h1>.
			schema.removeDisallowedAttributes( startPos.parent.getChildren(), writer );
		}

		collapseSelectionAt( writer, selection, startPos );

		// 4. Add a paragraph to set selection in it.
		// Check if a text is allowed in the new container. If not, try to create a new paragraph (if it's allowed here).
		// If autoparagraphing is off, we assume that you know what you do so we leave the selection wherever it was.
		if ( !options.doNotAutoparagraph && shouldAutoparagraph( schema, startPos ) ) {
			insertParagraph( writer, startPos, selection );
		}

		endPos.detach();
	} );
}

// This function is a result of reaching the Ballmer's peak for just the right amount of time.
// Even I had troubles documenting it after a while and after reading it again I couldn't believe that it really works.
function mergeBranches( writer, startPos, endPos ) {
	const startParent = startPos.parent;
	const endParent = endPos.parent;

	// If both positions ended up in the same parent, then there's nothing more to merge:
	// <$root><p>x[]</p><p>{}y</p></$root> => <$root><p>xy</p>[]{}</$root>
	if ( startParent == endParent ) {
		return;
	}

	// If one of the positions is a limit element, then there's nothing to merge because we don't want to cross the limit boundaries.
	if ( writer.model.schema.isLimit( startParent ) || writer.model.schema.isLimit( endParent ) ) {
		return;
	}

	// Check if operations we'll need to do won't need to cross object or limit boundaries.
	// E.g., we can't merge endParent into startParent in this case:
	// <limit><startParent>x[]</startParent></limit><endParent>{}</endParent>
	if ( !checkCanBeMerged( startPos, endPos, writer.model.schema ) ) {
		return;
	}

	// If first block element is empty then override it's name to make merging more user friendly.
	// Example:
	// <heading1>[</heading1><paragraph>]foo</paragraph> -> <paragraph>[]foo</paragraph>
	const startBlock = getParentBlock( startPos );
	const endBlock = getParentBlock( endPos );

	if ( startBlock && endBlock && startBlock.isEmpty && !endBlock.isEmpty && startBlock.name != endBlock.name ) {
		writer.rename( startBlock, endBlock.name );
	}

	// Remember next positions to merge. For example:
	// <a><b>x[]</b></a><c><d>{}y</d></c>
	// will become:
	// <a><b>xy</b>[]</a><c>{}</c>
	startPos = writer.createPositionAfter( startParent );
	endPos = writer.createPositionBefore( endParent );

	if ( !endPos.isEqual( startPos ) ) {
		// In this case, before we merge, we need to move `endParent` to the `startPos`:
		// <a><b>x[]</b></a><c><d>{}y</d></c>
		// becomes:
		// <a><b>x</b>[]<d>y</d></a><c>{}</c>
		writer.insert( endParent, startPos );
	}

	// Merge two siblings:
	// <a>x</a>[]<b>y</b> -> <a>xy</a> (the usual case)
	// <a><b>x</b>[]<d>y</d></a><c></c> -> <a><b>xy</b>[]</a><c></c> (this is the "move parent" case shown above)
	writer.merge( startPos );

	// Remove empty end ancestors:
	// <a>fo[o</a><b><a><c>bar]</c></a></b>
	// becomes:
	// <a>fo[]</a><b><a>{}</a></b>
	// So we can remove <a> and <b>.
	while ( endPos.parent.isEmpty ) {
		const parentToRemove = endPos.parent;

		endPos = writer.createPositionBefore( parentToRemove );

		writer.remove( parentToRemove );
	}

	// Continue merging next level.
	mergeBranches( writer, startPos, endPos );
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

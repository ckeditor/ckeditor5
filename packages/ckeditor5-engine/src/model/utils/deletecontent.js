/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/utils/deletecontent
 */

import LivePosition from '../liveposition';
import Position from '../position';
import Range from '../range';
import DocumentSelection from '../documentselection';

/**
 * Deletes content of the selection and merge siblings. The resulting selection is always collapsed.
 *
 * @param {module:engine/model/model~Model} model The model in context of which the insertion
 * should be performed.
 * @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
 * Selection of which the content should be deleted.
 * @param {module:engine/model/batch~Batch} batch Batch to which the deltas will be added.
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
 * For example `<heading>[x</heading><paragraph>y]</paragraph> will become:
 *
 * * `<paragraph>^</paragraph>` with the option disabled (`doNotResetEntireContent == false`)
 * * `<heading>^</heading>` with enabled (`doNotResetEntireContent == true`).
 */
export default function deleteContent( model, selection, options = {} ) {
	if ( selection.isCollapsed ) {
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

		const selRange = selection.getFirstRange();
		const startPos = selRange.start;
		const endPos = LivePosition.createFromPosition( selRange.end );

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

			// TMP this will be replaced with a postifxer.
			// We need to check and strip disallowed attributes in all nested nodes because after merge
			// some attributes could end up in a path where are disallowed.
			//
			// e.g. bold is disallowed for <H1>
			// <h1>Fo{o</h1><p>b}a<b>r</b><p> -> <h1>Fo{}a<b>r</b><h1> -> <h1>Fo{}ar<h1>.
			schema.removeDisallowedAttributes( startPos.parent.getChildren(), writer );
		}

		if ( selection instanceof DocumentSelection ) {
			writer.setSelection( startPos );
		} else {
			selection.setTo( startPos );
		}

		// 4. Autoparagraphing.
		// Check if a text is allowed in the new container. If not, try to create a new paragraph (if it's allowed here).
		if ( shouldAutoparagraph( schema, startPos ) ) {
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

	// If one of the positions is a root, then there's nothing more to merge (at least in the current state of implementation).
	// Theoretically in this case we could unwrap the <p>: <$root>x[]<p>{}y</p></$root>, but we don't need to support it yet
	// so let's just abort.
	if ( !startParent.parent || !endParent.parent ) {
		return;
	}

	// Check if operations we'll need to do won't need to cross object or limit boundaries.
	// E.g., we can't merge endParent into startParent in this case:
	// <limit><startParent>x[]</startParent></limit><endParent>{}</endParent>
	if ( !checkCanBeMerged( startPos, endPos, writer.model.schema ) ) {
		return;
	}

	// Remember next positions to merge. For example:
	// <a><b>x[]</b></a><c><d>{}y</d></c>
	// will become:
	// <a><b>xy</b>[]</a><c>{}</c>
	startPos = Position.createAfter( startParent );
	endPos = Position.createBefore( endParent );

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

		endPos = Position.createBefore( parentToRemove );

		writer.remove( parentToRemove );
	}

	// Continue merging next level.
	mergeBranches( writer, startPos, endPos );
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
		if ( schema.isObject( value.item ) || schema.isLimit( value.item ) ) {
			return false;
		}
	}

	return true;
}

function insertParagraph( writer, position, selection ) {
	const paragraph = writer.createElement( 'paragraph' );

	writer.insert( paragraph, position );

	if ( selection instanceof DocumentSelection ) {
		writer.setSelection( paragraph, 0 );
	} else {
		selection.setTo( paragraph, 0 );
	}
}

function replaceEntireContentWithParagraph( writer, selection ) {
	const limitElement = writer.model.schema.getLimitElement( selection );

	writer.remove( Range.createIn( limitElement ) );
	insertParagraph( writer, Position.createAt( limitElement ), selection );
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

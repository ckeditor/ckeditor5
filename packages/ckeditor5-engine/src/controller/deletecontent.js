/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/controller/deletecontent
 */

import LivePosition from '../model/liveposition';
import Position from '../model/position';
import Range from '../model/range';
import Element from '../model/element';

/**
 * Deletes content of the selection and merge siblings. The resulting selection is always collapsed.
 *
 * @param {module:engine/model/selection~Selection} selection Selection of which the content should be deleted.
 * @param {module:engine/model/batch~Batch} batch Batch to which the deltas will be added.
 * @param {Object} [options]
 * @param {Boolean} [options.leaveUnmerged=false] Whether to merge elements after removing the content of the selection.
 *
 * For example `<h>x[x</h><p>y]y</p>` will become:
 * * `<h>x^y</h>` with the option disabled (`leaveUnmerged == false`)
 * * `<h>x^</h><p>y</p>` with enabled (`leaveUnmerged == true`).
 *
 * Note: {@link module:engine/model/schema~Schema#objects object} and {@link module:engine/model/schema~Schema#limits limit}
 * elements will not be merged.
 */
export default function deleteContent( selection, batch, options = {} ) {
	if ( selection.isCollapsed ) {
		return;
	}

	const selRange = selection.getFirstRange();

	const startPos = selRange.start;
	const endPos = LivePosition.createFromPosition( selRange.end );

	// 1. Remove the content if there is any.
	if ( !selRange.start.isTouching( selRange.end ) ) {
		batch.remove( selRange );
	}

	// 2. Merge elements in the right branch to the elements in the left branch.
	// The only reasonable (in terms of data and selection correctness) case in which we need to do that is:
	//
	// <heading type=1>Fo[</heading><paragraph>]ar</paragraph> => <heading type=1>Fo^ar</heading>
	//
	// However, the algorithm supports also merging deeper structures (up to the depth of the shallower branch),
	// as it's hard to imagine what should actually be the default behavior. Usually, specific features will
	// want to override that behavior anyway.
	if ( !options.leaveUnmerged ) {
		mergeBranches( batch, startPos, endPos );
	}

	selection.collapse( startPos );

	// 3. Autoparagraphing.
	// Check if a text is allowed in the new container. If not, try to create a new paragraph (if it's allowed here).
	if ( shouldAutoparagraph( batch.document, startPos ) ) {
		const paragraph = new Element( 'paragraph' );
		batch.insert( startPos, paragraph );

		selection.collapse( paragraph );
	}

	endPos.detach();
}

// This function is a result of reaching the Ballmer's peak for just the right amount of time.
// Even I had troubles documenting it after a while and after reading it again I couldn't believe that it really works.
function mergeBranches( batch, startPos, endPos ) {
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
	if ( !checkCanBeMerged( startPos, endPos ) ) {
		return;
	}

	// Remember next positions to merge. For example:
	// <a><b>x[]</b></a><c><d>{}y</d></c>
	// will become:
	// <a><b>xy</b>[]</a><c>{}</c>
	startPos = Position.createAfter( startParent );
	endPos = Position.createBefore( endParent );

	if ( endParent.isEmpty ) {
		batch.remove( endParent );
	} else {
		// At the moment, next startPos is also the position to which the endParent
		// needs to be moved:
		// <a><b>x[]</b></a><c><d>{}y</d></c>
		// becomes:
		// <a><b>x</b>[]<d>y</d></a><c>{}</c>

		// Move the end parent only if needed.
		// E.g. not in this case: <p>ab</p>[]{}<p>cd</p>
		if ( !endPos.isEqual( startPos ) ) {
			batch.move( endParent, startPos );
		}

		// To then become:
		// <a><b>xy</b>[]</a><c>{}</c>
		batch.merge( startPos );
	}

	// Removes empty end ancestors:
	// <a>fo[o</a><b><a><c>bar]</c></a></b>
	// becomes:
	// <a>fo[]</a><b><a>{}</a></b>
	// So we can remove <a> and <b>.
	while ( endPos.parent.isEmpty ) {
		const parentToRemove = endPos.parent;

		endPos = Position.createBefore( parentToRemove );

		batch.remove( parentToRemove );
	}

	// Continue merging next level.
	mergeBranches( batch, startPos, endPos );
}

function shouldAutoparagraph( doc, position ) {
	const isTextAllowed = doc.schema.check( { name: '$text', inside: position } );
	const isParagraphAllowed = doc.schema.check( { name: 'paragraph', inside: position } );

	return !isTextAllowed && isParagraphAllowed;
}

// Check if parents of two positions can be merged by checking if there are no limit/object
// boundaries between those two positions.
//
// E.g. in <bQ><p>x[]</p></bQ><widget><caption>{}</caption></widget>
// we'll check <p>, <bQ>, <widget> and <caption>.
// Usually, widget and caption are marked as objects/limits in the schema, so in this case merging will be blocked.
function checkCanBeMerged( leftPos, rightPos ) {
	const schema = leftPos.root.document.schema;
	const rangeToCheck = new Range( leftPos, rightPos );

	for ( const value of rangeToCheck.getWalker() ) {
		if ( schema.objects.has( value.item.name ) || schema.limits.has( value.item.name ) ) {
			return false;
		}
	}

	return true;
}

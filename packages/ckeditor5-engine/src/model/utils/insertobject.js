/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/utils/insertobject
 */

import first from '@ckeditor/ckeditor5-utils/src/first';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/*
Place for exceptional documentation
Object - an object that we would like to insert
Selectable - 99% - document selection, but sometimes custom one.
Offset - just to pass to insert content
Options -     	setSelection: 'on|after',
findOptimalPosition: true,
// Maybe:
doNotInheritBlockAttributes: true
*/

export default function insertObject( model, object, selectable, offset, options = {} ) {
	if ( !model.schema.isObject( object ) ) {
		/**
		 * TODO
		 * @error insertobject-todo
		 */
		throw new CKEditorError( 'insertobject-todo', this, { object } );
	}

	// Normalize selectable to a selection instance.
	let originalSelection;

	if ( !selectable ) {
		originalSelection = model.document.selection;
	} else if ( selectable.is( 'selection' ) ) {
		originalSelection = selectable;
	} else {
		originalSelection = model.createSelection( selectable, offset );
	}

	// Adjust the insertion selection.
	let insertionSelection = originalSelection;

	if ( options.findOptimalPosition && model.schema.isBlock( object ) ) {
		insertionSelection = model.createSelection( findOptimalInsertionRange( originalSelection, model, options.findOptimalPosition ) );
	}

	// Collect attributes to be copied on the inserted object.
	const firstSelectedBlock = first( originalSelection.getSelectedBlocks() );
	const attributesToCopy = {};

	if ( firstSelectedBlock ) {
		Object.assign( attributesToCopy, model.schema.getAttributesWithProperty( firstSelectedBlock, 'copyOnReplace', true ) );
	}

	return model.change( writer => {
		let elementToInsert = object;

		// Autoparagraphing of an inline objects.
		if (
			!model.schema.checkChild( insertionSelection.anchor.parent, object ) &&
			model.schema.checkChild( insertionSelection.anchor.parent, 'paragraph' ) &&
			model.schema.checkChild( 'paragraph', object )
		) {
			elementToInsert = writer.createElement( 'paragraph' );

			writer.insert( object, elementToInsert );
		}

		// Apply attributes that are allowed on the inserted object (or paragraph if autoparagraphed).
		setAllowedAttributes( writer, elementToInsert, attributesToCopy );

		// Insert the prepared content at the optionally adjusted selection.
		const affectedRange = model.insertContent( elementToInsert, insertionSelection );

		// Nothing got inserted.
		if ( affectedRange.isCollapsed ) {
			return affectedRange;
		}

		if ( options.setSelection ) {
			updateSelection( writer, object, options.setSelection, attributesToCopy );
		}

		return affectedRange;
	} );
}

/**
 * TODO docs should be updated
 * TODO this should be exported or exposed in some reasonable place to be used in the widget util of the same name.
 *
 * Returns a model range which is optimal (in terms of UX) for inserting a widget block.
 *
 * For instance, if a selection is in the middle of a paragraph, the collapsed range before this paragraph
 * will be returned so that it is not split. If the selection is at the end of a paragraph,
 * the collapsed range after this paragraph will be returned.
 *
 * Note: If the selection is placed in an empty block, the range in that block will be returned. If that range
 * is then passed to {@link module:engine/model/model~Model#insertContent}, the block will be fully replaced
 * by the inserted widget block.
 *
 * @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
 * The selection based on which the insertion position should be calculated.
 * @param {module:engine/model/model~Model} model Model instance.
 * @param {'before'|'after'|Boolean} [preference=false] TODO
 * @returns {module:engine/model/range~Range} The optimal range.
 */
export function findOptimalInsertionRange( selection, model, preference = false ) {
	const selectedElement = selection.getSelectedElement();

	if ( selectedElement && model.schema.isObject( selectedElement ) && !model.schema.isInline( selectedElement ) ) {
		if ( [ 'before', 'after' ].includes( preference ) ) {
			return model.createRange( model.createPositionAt( selectedElement, preference ) );
		}

		return model.createRangeOn( selectedElement );
	}

	const firstBlock = first( selection.getSelectedBlocks() );

	// There are no block elements within ancestors (in the current limit element).
	if ( !firstBlock ) {
		return model.createRange( selection.focus );
	}

	// If inserting into an empty block – return position in that block. It will get
	// replaced with the image by insertContent(). #42.
	if ( firstBlock.isEmpty ) {
		return model.createRange( model.createPositionAt( firstBlock, 0 ) );
	}

	const positionAfter = model.createPositionAfter( firstBlock );

	// If selection is at the end of the block - return position after the block.
	if ( selection.focus.isTouching( positionAfter ) ) {
		return model.createRange( positionAfter );
	}

	// Otherwise, return position before the block.
	return model.createRange( model.createPositionBefore( firstBlock ) );
}

// TODO docs
function updateSelection( writer, contextElement, place, paragraphAttributes ) {
	const model = writer.model;

	if ( place == 'after' ) {
		let nextElement = contextElement.nextSibling;

		// Check whether an element next to the inserted element is defined and can contain a text.
		const canSetSelection = nextElement && model.schema.checkChild( nextElement, '$text' );

		// If the element is missing, but a paragraph could be inserted next to the element, let's add it.
		if ( !canSetSelection && model.schema.checkChild( contextElement.parent, 'paragraph' ) ) {
			nextElement = writer.createElement( 'paragraph' );

			setAllowedAttributes( writer, nextElement, paragraphAttributes );
			model.insertContent( nextElement, writer.createPositionAfter( contextElement ) );
		}

		// Put the selection inside the element, at the beginning.
		if ( nextElement ) {
			writer.setSelection( nextElement, 0 );
		}
	}
	else if ( place == 'on' ) {
		writer.setSelection( contextElement, 'on' );
	}
}

// TODO docs
function setAllowedAttributes( writer, element, attributes ) {
	const model = writer.model;

	for ( const [ attributeName, attributeValue ] of Object.entries( attributes ) ) {
		if ( model.schema.checkAttribute( element, attributeName ) ) {
			writer.setAttribute( attributeName, attributeValue, element );
		}
	}
}

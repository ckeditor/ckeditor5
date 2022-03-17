/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/utils/insertobject
 */

import first from '@ckeditor/ckeditor5-utils/src/first';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * TODO
 *
 * @param {module:engine/model/model~Model} model The model in context of which the insertion
 * should be performed.
 * @param {module:engine/model/element~Element} object TODO
 * @param {module:engine/model/selection~Selectable} [selectable=model.document.selection]
 * Selection into which the content should be inserted.
 * @param {Number|'before'|'end'|'after'|'on'|'in'} [placeOrOffset] Sets place or offset of the selection.
 * @param {Object} [options] TODO
 * @param {'auto'|'before'|'after'} [options.findOptimalPosition] TODO
 * @param {'on'|'after'} [options.setSelection] TODO
 * @returns {module:engine/model/range~Range} Range which contains all the performed changes. This is a range that, if removed,
 * would return the model to the state before the insertion. If no changes were preformed by `insertObject`, returns a range collapsed
 * at the insertion position.
 */
export default function insertObject( model, object, selectable, placeOrOffset, options = {} ) {
	if ( !model.schema.isObject( object ) ) {
		/**
		 * TODO
		 * @error insertobject-todo
		 */
		// TODO make sure that it is tested with expectToThrowCKEditorError helper
		throw new CKEditorError( 'insertobject-todo', model, { object } );
	}

	// Normalize selectable to a selection instance.
	let originalSelection;

	if ( !selectable ) {
		originalSelection = model.document.selection;
	} else if ( selectable.is( 'selection' ) ) {
		originalSelection = selectable;
	} else {
		originalSelection = model.createSelection( selectable, placeOrOffset );
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
		// Remove the selected content to find out what the parent of the inserted object would be.
		// It would be removed inside model.insertContent() anyway.
		if ( !insertionSelection.isCollapsed ) {
			model.deleteContent( insertionSelection, { doNotAutoparagraph: true } );
		}

		let elementToInsert = object;
		const insertionPositionParent = insertionSelection.anchor.parent;

		// Autoparagraphing of an inline objects.
		if (
			!model.schema.checkChild( insertionPositionParent, object ) &&
			model.schema.checkChild( insertionPositionParent, 'paragraph' ) &&
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
 * @param {'auto'|'before'|'after'} [place='auto'] TODO
 * @returns {module:engine/model/range~Range} The optimal range.
 */
export function findOptimalInsertionRange( selection, model, place = 'auto' ) {
	const selectedElement = selection.getSelectedElement();

	if ( selectedElement && model.schema.isObject( selectedElement ) && !model.schema.isInline( selectedElement ) ) {
		if ( [ 'before', 'after' ].includes( place ) ) {
			return model.createRange( model.createPositionAt( selectedElement, place ) );
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
	else {
		/**
		 * TODO
		 *
		 * @error insertobject-invalid-place-todo
		 */
		// TODO make sure that it is tested with expectToThrowCKEditorError helper
		throw new CKEditorError( 'insertobject-invalid-place-todo', model );
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

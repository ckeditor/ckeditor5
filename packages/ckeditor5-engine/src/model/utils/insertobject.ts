/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/model/utils/insertobject
 */

import type DocumentSelection from '../documentselection.js';
import type Selection from '../selection.js';

import type Element from '../element.js';
import type Model from '../model.js';
import type Range from '../range.js';
import type Writer from '../writer.js';

import { CKEditorError, first } from '@ckeditor/ckeditor5-utils';

/**
 * Inserts an {@glink framework/deep-dive/schema#object-elements object element} at a specific position in the editor content.
 *
 * **Note:** Use {@link module:engine/model/model~Model#insertObject} instead of this function.
 * This function is only exposed to be reusable in algorithms which change the {@link module:engine/model/model~Model#insertObject}
 * method's behavior.
 *
 * **Note**: For more documentation and examples, see {@link module:engine/model/model~Model#insertObject}.
 *
 * @param model The model in context of which the insertion should be performed.
 * @param object An object to be inserted into the model document.
 * @param selectable A selectable where the content should be inserted. If not specified, the current
 * {@link module:engine/model/document~Document#selection document selection} will be used instead.
 * @param options Additional options.
 * @param options.findOptimalPosition An option that, when set, adjusts the insertion position (relative to
 * `selectable` and `placeOrOffset`) so that the content of `selectable` is not split upon insertion (a.k.a. non-destructive insertion).
 * * When `'auto'`, the algorithm will decide whether to insert the object before or after `selectable` to avoid content splitting.
 * * When `'before'`, the closest position before `selectable` will be used that will not result in content splitting.
 * * When `'after'`, the closest position after `selectable` will be used that will not result in content splitting.
 *
 * Note that this option works only for block objects. Inline objects are inserted into text and do not split blocks.
 * @param options.setSelection An option that, when set, moves the
 * {@link module:engine/model/document~Document#selection document selection} after inserting the object.
 * * When `'on'`, the document selection will be set on the inserted object.
 * * When `'after'`, the document selection will move to the closest text node after the inserted object. If there is no
 * such text node, a paragraph will be created and the document selection will be moved inside it.
 * @returns A range which contains all the performed changes. This is a range that, if removed,
 * would return the model to the state before the insertion. If no changes were preformed by `insertObject()`, returns a range collapsed
 * at the insertion position.
 */
export default function insertObject(
	model: Model,
	object: Element,
	selectable?: Selection | DocumentSelection | null,
	options: {
		findOptimalPosition?: 'auto' | 'before' | 'after';
		setSelection?: 'on' | 'after';
	} = {}
): Range {
	if ( !model.schema.isObject( object ) ) {
		/**
		 * Tried to insert an element with {@link module:engine/model/utils/insertobject insertObject()} function
		 * that is not defined as an object in schema.
		 * See {@link module:engine/model/schema~SchemaItemDefinition#isObject `SchemaItemDefinition`}.
		 * If you want to insert content that is not an object you might want to use
		 * {@link module:engine/model/utils/insertcontent insertContent()} function.
		 * @error insertobject-element-not-an-object
		 */
		throw new CKEditorError( 'insertobject-element-not-an-object', model, { object } );
	}

	// Normalize selectable to a selection instance.
	const originalSelection: Selection | DocumentSelection = selectable ? selectable : model.document.selection;

	// Adjust the insertion selection.
	let insertionSelection = originalSelection;

	if ( options.findOptimalPosition && model.schema.isBlock( object ) ) {
		insertionSelection = model.createSelection(
			model.schema.findOptimalInsertionRange( originalSelection, options.findOptimalPosition )
		);
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
		const insertionPositionParent = insertionSelection.anchor!.parent;

		// Autoparagraphing of an inline objects.
		if (
			!model.schema.checkChild( insertionPositionParent as any, object ) &&
			model.schema.checkChild( insertionPositionParent as any, 'paragraph' ) &&
			model.schema.checkChild( 'paragraph', object )
		) {
			elementToInsert = writer.createElement( 'paragraph' );

			writer.insert( object, elementToInsert );
		}

		// Apply attributes that are allowed on the inserted object (or paragraph if autoparagraphed).
		model.schema.setAllowedAttributes( elementToInsert, attributesToCopy, writer );

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
 * Updates document selection based on given `place` parameter in relation to `contextElement` element.
 *
 * @param writer An instance of the model writer.
 * @param contextElement An element to set the attributes on.
 * @param place The place where selection should be set in relation to the `contextElement` element.
 * Value `on` will set selection on the passed `contextElement`. Value `after` will set selection after `contextElement`.
 * @param attributes Attributes keys and values to set on a paragraph that this function can create when
 * `place` parameter is equal to `after` but there is no element with `$text` node to set selection in.
 */
function updateSelection(
	writer: Writer,
	contextElement: Element,
	place: 'after' | 'on',
	paragraphAttributes: Record<string, unknown>
) {
	const model = writer.model;

	if ( place == 'on' ) {
		writer.setSelection( contextElement, 'on' );

		return;
	}

	if ( place != 'after' ) {
		/**
		 * The unsupported `options.setSelection` parameter was passed
		 * to the {@link module:engine/model/utils/insertobject insertObject()} function.
		 * Check the {@link module:engine/model/utils/insertobject insertObject()} API documentation for allowed
		 * `options.setSelection` parameter values.
		 *
		 * @error insertobject-invalid-place-parameter-value
		 */
		throw new CKEditorError( 'insertobject-invalid-place-parameter-value', model );
	}

	let nextElement = contextElement.nextSibling;

	if ( model.schema.isInline( contextElement ) ) {
		writer.setSelection( contextElement, 'after' );

		return;
	}

	// Check whether an element next to the inserted element is defined and can contain a text.
	const canSetSelection = nextElement && model.schema.checkChild( nextElement, '$text' );

	// If the element is missing, but a paragraph could be inserted next to the element, let's add it.
	if ( !canSetSelection && model.schema.checkChild( contextElement.parent as any, 'paragraph' ) ) {
		nextElement = writer.createElement( 'paragraph' );

		model.schema.setAllowedAttributes( nextElement, paragraphAttributes, writer );
		model.insertContent( nextElement, writer.createPositionAfter( contextElement ) );
	}

	// Put the selection inside the element, at the beginning.
	if ( nextElement ) {
		writer.setSelection( nextElement, 0 );
	}
}

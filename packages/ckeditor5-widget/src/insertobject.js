/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DocumentSelection from '@ckeditor/ckeditor5-engine/src/model/documentselection';
import Selection from '@ckeditor/ckeditor5-engine/src/model/selection';

import { findOptimalInsertionRange } from './utils';

/**
 * @module widget/insertobject
 */

const insertObjectDefaultOptions = { setSelection: undefined, findOptimalPosition: false };

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
	const optionsWithDefaults = { ...insertObjectDefaultOptions, ...options };

	return model.change( writer => {
		let selection;

		if ( !selectable ) {
			selection = model.document.selection;
		} else if ( selectable instanceof Selection || selectable instanceof DocumentSelection ) {
			selection = selectable;
		} else {
			selection = writer.createSelection( selectable, offset );
		}

		let insertionSelection = selection;

		if ( optionsWithDefaults.findOptimalPosition && model.schema.isBlock( object ) ) {
			const range = findOptimalInsertionRange( selection, model );
			insertionSelection = writer.createSelection( range, offset );
		}

		// Get and set attributes
		const firstSelectedBlock = selection.getSelectedBlocks().next().value;
		const attributesToCopy = model.schema.getAttributesWithProperty( firstSelectedBlock, 'copyOnReplace', true );

		writer.setAttributes( attributesToCopy, object );

		// Autoparagraph
		if ( !model.schema.checkChild( insertionSelection.anchor.parent, object ) && model.schema.checkChild( 'paragraph', object ) ) {
			const paragraph = writer.createElement( 'paragraph', attributesToCopy );

			if ( !insertionSelection.isCollapsed ) {
				model.deleteContent( insertionSelection, { doNotAutoparagraph: true } );
			}

			writer.insert( paragraph, insertionSelection.anchor );

			insertionSelection = writer.createPositionAt( paragraph, 0 );
		}

		const affectedRange = model.insertContent( object, insertionSelection, offset, options );

		if ( optionsWithDefaults.setSelection ) {
			_setSelection( writer, model, object, optionsWithDefaults.setSelection );
		}

		return affectedRange;
	} );
}

function _setSelection( writer, model, contextElement, place ) {
	if ( place === 'after' ) {
		let nextElement = contextElement.nextSibling;

		// Check whether an element next to the inserted element is defined and can contain a text.
		const canSetSelection = nextElement && model.schema.checkChild( nextElement, '$text' );

		// If the element is missing, but a paragraph could be inserted next to the element, let's add it.
		if ( !canSetSelection && model.schema.checkChild( contextElement.parent, 'paragraph' ) ) {
			nextElement = writer.createElement( 'paragraph' );

			model.insertContent( nextElement, writer.createPositionAfter( contextElement ) );
		}

		// Put the selection inside the element, at the beginning.
		if ( nextElement ) {
			writer.setSelection( nextElement, 0 );
		}
	}

	if ( place === 'on' ) {
		writer.setSelection( contextElement, 'on' );
	}
}

/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DocumentSelection from '@ckeditor/ckeditor5-engine/src/model/documentselection';
import Selection from '@ckeditor/ckeditor5-engine/src/model/selection';
import { first } from 'ckeditor5/src/utils';

import { findOptimalInsertionRange } from './utils';

/**
 * @module widget/insertobject
 */

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
	let objectToInsert = object;
	const insertObjectDefaultOptions = { setSelection: undefined, findOptimalPosition: false };
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
		const firstSelectedBlock = first( selection.getSelectedBlocks() );
		const attributesToCopy = model.schema.getAttributesWithProperty( firstSelectedBlock, 'copyOnReplace', true );

		// Autoparagraph
		if (
			!model.schema.checkChild( insertionSelection.anchor.parent, object ) &&
			model.schema.checkChild( insertionSelection.anchor.parent, 'paragraph' &&
			model.schema.checkChild( 'paragraph', object ) )
		) {
			const paragraph = writer.createElement( 'paragraph', attributesToCopy );

			if ( !insertionSelection.isCollapsed ) {
				model.deleteContent( insertionSelection, { doNotAutoparagraph: true } );
			}

			writer.insert( object, paragraph );

			objectToInsert = paragraph;
			insertionSelection = writer.createPositionAt( paragraph, 0 );
		}

		// Add checking schema
		for ( const attributeName of Object.keys( attributesToCopy ) ) {
			if ( model.schema.checkAttribute( objectToInsert, attributeName ) ) {
				writer.setAttribute( attributeName, attributesToCopy[ attributeName ], objectToInsert );
			}
		}

		const affectedRange = model.insertContent( objectToInsert, insertionSelection, offset );

		if ( optionsWithDefaults.setSelection ) {
			_setSelection( writer, model, object, optionsWithDefaults.setSelection );
		}

		return affectedRange;
	} );
}

function _setSelection( writer, model, contextElement, place, attributes ) {
	if ( place === 'after' ) {
		let nextElement = contextElement.nextSibling;

		// Check whether an element next to the inserted element is defined and can contain a text.
		const canSetSelection = nextElement && model.schema.checkChild( nextElement, '$text' );

		// If the element is missing, but a paragraph could be inserted next to the element, let's add it.
		if ( !canSetSelection && model.schema.checkChild( contextElement.parent, 'paragraph' ) ) {
			nextElement = writer.createElement( 'paragraph' );

			// Need to decide if it should be enabled.
			// for ( const attributeName of Object.keys( attributes ) ) {
			// 	if ( model.schema.checkAttribute( nextElement, attributeName ) ) {
			// 		writer.setAttribute( attributeName, attributes[ attributeName ], nextElement );
			// 	}
			// }

			model.insertContent( nextElement, writer.createPositionAfter( contextElement ) );
		}

		// Put the selection inside the element, at the beginning.
		if ( nextElement ) {
			writer.setSelection( nextElement, 0 );
		}
	} else if ( place === 'on' ) {
		writer.setSelection( contextElement, 'on' );
	}
}

/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DocumentSelection from '@ckeditor/ckeditor5-engine/src/model/documentselection';
import Selection from '@ckeditor/ckeditor5-engine/src/model/selection';
import getAttributesWithProperty from '@ckeditor/ckeditor5-utils/src/getattributeswithproperty';

import { findOptimalInsertionRange } from './utils';

/**
 * @module widget/insertobject
 */

const insertObjectDefaultOptions = { setSelection: 'in', findOptimalPosition: true };

/*
	Place for exceptional documentation
	Object - an object that we would like to insert
	Selectable - 99% - document selection, but sometimes custom one.
	Offset - just to pass to insert content
	Options -     	setSelection: 'on|in|after',
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
			insertionSelection = writer.createSelection( findOptimalInsertionRange( selection, model ) );
		}

		// Get and set attributes
		const firstSelectedBlock = selection.getSelectedBlocks().next().value;
		const attributesToCopy = getAttributesWithProperty( model, firstSelectedBlock, 'copyOnReplace', true );

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

		return model.insertContent( object, insertionSelection, offset, options );
	} );
}

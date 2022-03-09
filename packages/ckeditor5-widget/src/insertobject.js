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
export default function insertObject( model, object, selectable, offset, options = { setSelection: 'in', findOptimalPosition: true } ) {
	return model.change( writer => {
		const schema = model.schema;

		let selection;

		if ( !selectable ) {
			selection = model.document.selection;
		} else if ( selectable instanceof Selection || selectable instanceof DocumentSelection ) {
			selection = selectable;
		} else {
			selection = writer.createSelection( selectable, offset );
		}

		if ( options.findOptimalPosition ) {
			selection = getInsertionPosition( model, object, selection );

			if ( !( selection instanceof Selection ) && !( selection instanceof DocumentSelection ) ) {
				selection = writer.createSelection( selectable, offset );
			}
		}

		// TODO: extract to seperate function in utils and tidy it. Similar code is in deletecontent

		// Get attributes
		const attributesToCopy = {};
		const selectedBlocks = selection.getSelectedBlocks();
		const firstSelectedBlockAttributes = selectedBlocks.next().value.getAttributes();

		for ( const [ attributeName, attributeValue ] of firstSelectedBlockAttributes ) {
			const isAttributeValid = true;
			// const isAttributeValid = schema.checkAttribute( object, attributeName );
			const shouldCopyOnReplace = schema.getAttributeProperties( attributeName ).copyOnReplace;

			if ( isAttributeValid && shouldCopyOnReplace ) {
				attributesToCopy[ attributeName ] = attributeValue;
			}
		}

		// Autoparagraph
		if ( !model.schema.checkChild( selection.anchor.parent, object ) && model.schema.checkChild( 'paragraph', object ) ) {
			const paragraph = writer.createElement( 'paragraph', attributesToCopy );

			if ( !selection.isCollapsed ) {
				model.deleteContent( selection, { doNotAutoparagraph: true } );
			}

			writer.insert( paragraph, selection.anchor );

			selection = writer.createPositionAt( paragraph, 0 );
		}

		writer.setAttributes( attributesToCopy, object );

		return model.insertContent( object, selection, offset, options );
	} );
}

function getInsertionPosition( model, object, selectable ) {
	if ( model.schema.isBlock( object ) ) {
		return findOptimalInsertionRange( selectable, model );
	} else {
		return selectable;
	}
}

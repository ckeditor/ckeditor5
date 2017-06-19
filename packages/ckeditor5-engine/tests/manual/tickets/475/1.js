/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TreeWalker from '../../../../src/model/treewalker';
import Position from '../../../../src/model/position';
import Range from '../../../../src/model/range';
import LivePosition from '../../../../src/model/liveposition';

import buildModelConverter from '../../../../src/conversion/buildmodelconverter';
import buildViewConverter from '../../../../src/conversion/buildviewconverter';

import AttributeElement from '../../../../src/view/attributeelement';

import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';

class Link extends Plugin {
	init() {
		const editor = this.editor;
		const data = editor.data;
		const editing = editor.editing;

		// Allow bold attribute on all inline nodes.
		editor.document.schema.allow( { name: '$inline', attributes: [ 'link' ] } );

		// Build converter from model to view for data and editing pipelines.
		buildModelConverter().for( data.modelToView, editing.modelToView )
			.fromAttribute( 'link' )
			.toElement( href => new AttributeElement( 'a', { href } ) );

		// Build converter from view to model for data pipeline.
		buildViewConverter().for( data.viewToModel )
			.fromElement( 'a' )
			.toAttribute( viewElement => ( { key: 'link', value: viewElement.getAttribute( 'href' ) } ) );
	}
}

const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;

class AutoLinker extends Plugin {
	init() {
		this.editor.document.on( 'change', ( event, type, changes, batch ) => {
			if ( type != 'insert' ) {
				return;
			}

			for ( const value of changes.range.getItems( { singleCharacters: true } ) ) {
				const walker = new TreeWalker( {
					direction: 'backward',
					startPosition: Position.createAfter( value )
				} );

				const currentValue = walker.next().value;
				const text = currentValue.item.data;

				if ( !text ) {
					return;
				}

				const matchedUrl = urlRegex.exec( text );

				if ( !matchedUrl ) {
					return;
				}

				const doc = this.editor.document;
				const url = matchedUrl[ 0 ];
				const offset = _getLastPathPart( currentValue.nextPosition.path ) + matchedUrl.index;
				const livePos = LivePosition.createFromParentAndOffset( currentValue.item.parent, offset );

				doc.enqueueChanges( () => {
					const urlRange = Range.createFromPositionAndShift( livePos, url.length );
					batch.setAttribute( urlRange, 'link', url );
				} );
			}
		} );
	}
}

function _getLastPathPart( path ) {
	return path[ path.length - 1 ];
}

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ Enter, Typing, Paragraph, Undo, Link, AutoLinker ],
	toolbar: [ 'undo', 'redo' ]
} );

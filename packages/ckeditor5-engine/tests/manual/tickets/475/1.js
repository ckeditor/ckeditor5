/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Range from '../../../../src/model/range';
import LivePosition from '../../../../src/model/liveposition';

import {
	upcastElementToAttribute
} from '../../../../src/conversion/upcast-converters';

import {
	downcastAttributeToElement,
} from '../../../../src/conversion/downcast-converters';

import AttributeElement from '../../../../src/view/attributeelement';

import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';

class Link extends Plugin {
	init() {
		const editor = this.editor;

		// Allow bold attribute on all inline nodes.
		editor.model.schema.extend( '$text', { allowAttributes: 'link' } );

		editor.conversion.for( 'downcast' ).add( downcastAttributeToElement( 'link', {
			view: attributeValue => new AttributeElement( 'a', { href: attributeValue } )
		} ) );

		editor.conversion.for( 'upcast' ).add( upcastElementToAttribute( {
			view: 'a',
			model: {
				key: 'link',
				value: viewElement => viewElement.getAttribute( 'href' )
			}
		} ) );
	}
}

class AutoLinker extends Plugin {
	init() {
		this.editor.model.document.on( 'change', () => {
			const changes = this.editor.model.document.differ.getChanges();

			for ( const entry of changes ) {
				if ( entry.type != 'insert' || entry.name != '$text' || !entry.position.textNode ) {
					continue;
				}

				const textNode = entry.position.textNode;
				const text = textNode.data;

				if ( !text ) {
					return;
				}

				const regexp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
				let match;

				while ( ( match = regexp.exec( text ) ) !== null ) {
					const index = match.index;
					const url = match[ 0 ];
					const length = url.length;

					if ( entry.position.offset + entry.length == index + length ) {
						const livePos = LivePosition.createFromParentAndOffset( textNode.parent, index );
						this.editor.model.enqueueChange( writer => {
							const urlRange = Range.createFromPositionAndShift( livePos, length );
							writer.setAttribute( 'link', url, urlRange );
						} );
						return;
					}
				}
			}
		} );
	}
}

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ Enter, Typing, Paragraph, Undo, Link, AutoLinker ],
	toolbar: [ 'undo', 'redo' ]
} );

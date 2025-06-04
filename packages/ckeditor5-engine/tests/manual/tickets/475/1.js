/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import Range from '../../../../src/model/range.js';
import LivePosition from '../../../../src/model/liveposition.js';

import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';

class Link extends Plugin {
	init() {
		const editor = this.editor;

		// Allow bold attribute on all inline nodes.
		editor.model.schema.extend( '$text', { allowAttributes: 'link' } );

		editor.conversion.for( 'downcast' ).attributeToElement( {
			model: 'link',
			view: ( modelAttributeValue, { writer } ) => {
				return writer.createAttributeElement( 'a', { href: modelAttributeValue } );
			}
		} );

		editor.conversion.for( 'upcast' ).elementToAttribute( {
			view: 'a',
			model: {
				key: 'link',
				value: viewElement => viewElement.getAttribute( 'href' )
			}
		} );
	}
}

class AutoLinker extends Plugin {
	init() {
		this.editor.model.document.on( 'change', () => {
			const changes = this.editor.model.document.differ.getChanges();

			for ( const entry of changes ) {
				if ( entry.type != 'insert' || entry.name != '$text' || !entry.position.parent ) {
					continue;
				}

				const parent = entry.position.parent;
				const text = Array.from( parent.getChildren() ).map( item => item.data ).join( '' );

				const regexp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
				let match;

				while ( ( match = regexp.exec( text ) ) !== null ) {
					const index = match.index;
					const url = match[ 0 ];
					const length = url.length;

					if ( entry.position.offset + entry.length == index + length ) {
						const livePos = LivePosition._createAt( parent, index );
						this.editor.model.enqueueChange( writer => {
							const urlRange = Range._createFromPositionAndShift( livePos, length );
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

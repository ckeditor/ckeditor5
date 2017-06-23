/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Clipboard from '../src/clipboard';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'Pasting – integration', () => {
	let element;

	beforeEach( () => {
		element = document.createElement( 'div' );

		document.body.appendChild( element );
	} );

	afterEach( () => {
		element.remove();
	} );

	describe( 'inline styles', () => {
		// See https://github.com/ckeditor/ckeditor5/issues/477.
		it( 'pastes inline styles and links (no block)', () => {
			return ClassicTestEditor
				.create( element, { plugins: [ Clipboard, Paragraph, Bold, Italic, Link ] } )
				.then( editor => {
					setData( editor.document, '<paragraph>[]</paragraph>' );

					pasteHtml( editor, 'x <strong>bold</strong> <i>italic</i> <a href="x">link</a> y' );

					expect( getData( editor.document ) ).to.equal(
						'<paragraph>' +
							'x <$text bold="true">bold</$text> <$text italic="true">italic</$text> ' +
							'<$text linkHref="x">link</$text> y[]' +
						'</paragraph>'
					);

					return editor.destroy();
				} );
		} );

		it( 'pastes inline styles and links (inside known block)', () => {
			return ClassicTestEditor
				.create( element, { plugins: [ Clipboard, Paragraph, Bold, Italic, Link ] } )
				.then( editor => {
					setData( editor.document, '<paragraph>[]</paragraph>' );

					pasteHtml( editor, '<p>x <strong>bold</strong> <i>italic</i> <a href="x">link</a> y</p>' );

					expect( getData( editor.document ) ).to.equal(
						'<paragraph>' +
							'x <$text bold="true">bold</$text> <$text italic="true">italic</$text> ' +
							'<$text linkHref="x">link</$text> y[]' +
						'</paragraph>'
					);

					return editor.destroy();
				} );
		} );

		it( 'pastes inline styles and links (inside unknown block)', () => {
			return ClassicTestEditor
				.create( element, { plugins: [ Clipboard, Paragraph, Bold, Italic, Link ] } )
				.then( editor => {
					setData( editor.document, '<paragraph>[]</paragraph>' );

					pasteHtml( editor, '<div>x <strong>bold</strong> <i>italic</i> <a href="x">link</a> y</div>' );

					expect( getData( editor.document ) ).to.equal(
						'<paragraph>' +
							'x <$text bold="true">bold</$text> <$text italic="true">italic</$text> ' +
							'<$text linkHref="x">link</$text> y[]' +
						'</paragraph>'
					);

					return editor.destroy();
				} );
		} );

		it( 'pastes inline styles and links (inside known block but on disallowed position)', () => {
			return ClassicTestEditor
				.create( element, { plugins: [ Clipboard, Paragraph, BlockQuote, Bold, Italic, Link ] } )
				.then( editor => {
					setData( editor.document, '<paragraph>[]</paragraph>' );

					pasteHtml( editor, '<blockquote>x <strong>bold</strong> <i>italic</i> <a href="x">link</a> y</blockquote>' );

					expect( getData( editor.document ) ).to.equal(
						'<blockQuote><paragraph>x bold italic link y[]</paragraph></blockQuote>'
					);

					// The expected result would be this:
					//
					// '<blockQuote>' +
					// 	'<paragraph>' +
					// 		'x <$text bold="true">bold</$text> <$text italic="true">italic</$text> ' +
					// 		'<$text linkHref="x">link</$text> y[]' +
					// 	'</paragraph>' +
					// '</blockQuote>'
					//
					// See https://github.com/ckeditor/ckeditor5/issues/477#issuecomment-310428963.
					// Although, this may be a deeper problem with ckeditor5-paragraph's wildcard conversion.

					return editor.destroy();
				} );
		} );
	} );
} );

function pasteHtml( editor, html ) {
	editor.editing.view.fire( 'paste', {
		dataTransfer: createDataTransfer( { 'text/html': html } ),
		preventDefault() {}
	} );
}

function createDataTransfer( data ) {
	return {
		getData( type ) {
			return data[ type ];
		}
	};
}

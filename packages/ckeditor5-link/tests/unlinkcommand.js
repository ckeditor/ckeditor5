/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '/tests/core/_utils/modeltesteditor.js';
import UnlinkCommand from '/ckeditor5/link/unlinkcommand.js';
import { setData, getData } from '/tests/engine/_utils/model.js';

describe( 'UnlinkCommand', () => {
	let editor, document, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				document = editor.document;
				command = new UnlinkCommand( editor );

				// Allow text in $root.
				document.schema.allow( { name: '$text', inside: '$root' } );

				// Allow text with link attribute in paragraph.
				document.schema.registerItem( 'p', '$block' );
				document.schema.allow( { name: '$text', attributes: 'link', inside: '$root' } );
			} );
	} );

	afterEach( () => {
		command.destroy();
	} );

	describe( '_doExecute', () => {
		describe( 'non-collapsed selection', () => {
			it( 'should remove link attribute from selected text', () => {
				setData( document, '<$text link="url">f[ooba]r</$text>' );

				command._doExecute();

				expect( getData( document ) ).to.equal( '<$text link="url">f</$text>[ooba]<$text link="url">r</$text>' );
			} );

			it( 'should remove link attribute from selected text and do not modified other attributes', () => {
				setData( document, '<$text bold="true" link="url">f[ooba]r</$text>' );

				command._doExecute();

				expect( getData( document ) )
					.to.equal( '<$text bold="true" link="url">f</$text>[<$text bold="true">ooba</$text>]<$text bold="true" link="url">r</$text>' );
			} );

			it( 'should remove link attribute from selected text when attributes have different value', () => {
				setData( document, '[<$text link="url">foo</$text><$text link="other url">bar</$text>]' );

				command._doExecute();

				expect( getData( document ) ).to.equal( '[foobar]' );
			} );
		} );

		describe( 'collapsed selection', () => {
			it( 'should remove link attribute from selection siblings with the same attribute value', () => {
				setData( document, '<$text link="url">foo[]bar</$text>' );

				command._doExecute();

				expect( getData( document ) ).to.equal( 'foo[]bar' );
			} );

			it( 'should remove link attribute from selection siblings with the same attribute value and do not ' +
				'modified other attributes',
			() => {
				setData( document, '<$text bold="true" link="url">foo[]bar</$text>' );

				command._doExecute();

				expect( getData( document ) ).to.equal( '<$text bold="true">foo[]bar</$text>' );
			} );

			it(
				'should remove link attribute from selection siblings with the same attribute value and do nothing ' +
				'with other value links',
			() => {
				setData( document, '<$text link="other url">fo</$text><$text link="url">o[]b</$text><$text link="other url">ar</$text>' );

				command._doExecute();

				expect( getData( document ) ).to.equal( '<$text link="other url">fo</$text>o[]b<$text link="other url">ar</$text>' );
			} );

			it( 'should do nothing with the same value links when there is a link with other value between', () => {
					setData(
						document,
						'<$text link="same url">f</$text>' +
						'<$text link="other url">o</$text>' +
						'<$text link="same url">o[]b</$text>' +
						'<$text link="other url">a</$text>' +
						'<$text link="same url">r</$text>'
					);

					command._doExecute();

					expect( getData( document ) )
						.to.equal(
							'<$text link="same url">f</$text>' +
							'<$text link="other url">o</$text>' +
							'o[]b' +
							'<$text link="other url">a</$text>' +
							'<$text link="same url">r</$text>'
						);
				} );

			it( 'should remove link attribute from selection siblings only in the same parent as selection parent', () => {
				setData( document, '<p><$text link="url">fo[]o</$text></p><p><$text link="url">bar</$text></p>' );

				command._doExecute();

				expect( getData( document ) ).to.equal( '<p>fo[]o</p><p><$text link="url">bar</$text></p>' );
			} );

			it( 'should remove link attribute from selection siblings when selection is at the end of link', () => {
				setData( document, '<$text link="url">foobar</$text>[]' );

				command._doExecute();

				expect( getData( document ) ).to.equal( 'foobar[]' );
			} );

			it( 'should remove link attribute from selection siblings when selection is at the beginning of link', () => {
				setData( document, '[]<$text link="url">foobar</$text>' );

				command._doExecute();

				expect( getData( document ) ).to.equal( '[]foobar' );
			} );

			it( 'should remove link attribute from selection siblings on the left side when selection is between two ' +
				'elements with different link attributes',
			() => {
				setData( document, '<$text link="url">foo</$text>[]<$text link="other url">bar</$text>' );

				command._doExecute();

				expect( getData( document ) ).to.equal( 'foo[]<$text link="other url">bar</$text>' );
			} );
		} );
	} );
} );

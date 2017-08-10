/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import UnlinkCommand from '../src/unlinkcommand';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

testUtils.createSinonSandbox();

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

				// Allow text with `linkHref` attribute in paragraph.
				document.schema.registerItem( 'p', '$block' );
				document.schema.allow( { name: '$text', attributes: 'linkHref', inside: '$root' } );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be true when selection has `linkHref` attribute', () => {
			document.enqueueChanges( () => {
				document.selection.setAttribute( 'linkHref', 'value' );
			} );

			expect( command.isEnabled ).to.true;
		} );

		it( 'should be false when selection doesn\'t have `linkHref` attribute', () => {
			document.enqueueChanges( () => {
				document.selection.removeAttribute( 'linkHref' );
			} );

			expect( command.isEnabled ).to.false;
		} );
	} );

	describe( 'execute()', () => {
		describe( 'non-collapsed selection', () => {
			it( 'should remove `linkHref` attribute from selected text', () => {
				setData( document, '<$text linkHref="url">f[ooba]r</$text>' );

				command.execute();

				expect( getData( document ) ).to.equal( '<$text linkHref="url">f</$text>[ooba]<$text linkHref="url">r</$text>' );
			} );

			it( 'should remove `linkHref` attribute from selected text and do not modified other attributes', () => {
				setData( document, '<$text bold="true" linkHref="url">f[ooba]r</$text>' );

				command.execute();

				expect( getData( document ) ).to.equal(
					'<$text bold="true" linkHref="url">f</$text>' +
					'[<$text bold="true">ooba</$text>]' +
					'<$text bold="true" linkHref="url">r</$text>'
				);
			} );

			it( 'should remove `linkHref` attribute from selected text when attributes have different value', () => {
				setData( document, '[<$text linkHref="url">foo</$text><$text linkHref="other url">bar</$text>]' );

				command.execute();

				expect( getData( document ) ).to.equal( '[foobar]' );
			} );

			it( 'should remove `linkHref` attribute from selection', () => {
				setData( document, '<$text linkHref="url">f[ooba]r</$text>' );

				command.execute();

				expect( document.selection.hasAttribute( 'linkHref' ) ).to.false;
			} );
		} );

		describe( 'collapsed selection', () => {
			it( 'should remove `linkHref` attribute from selection siblings with the same attribute value', () => {
				setData( document, '<$text linkHref="url">foo[]bar</$text>' );

				command.execute();

				expect( getData( document ) ).to.equal( 'foo[]bar' );
			} );

			it( 'should remove `linkHref` attribute from selection siblings with the same attribute value and do not modify ' +
				'other attributes', () => {
				setData(
					document,
					'<$text linkHref="other url">fo</$text>' +
					'<$text linkHref="url">o[]b</$text>' +
					'<$text linkHref="other url">ar</$text>'
				);

				command.execute();

				expect( getData( document ) ).to.equal(
					'<$text linkHref="other url">fo</$text>' +
					'o[]b' +
					'<$text linkHref="other url">ar</$text>'
				);
			} );

			it( 'should do nothing with nodes with the same `linkHref` value when there is a node with different value `linkHref` ' +
				'attribute between', () => {
				setData(
					document,
					'<$text linkHref="same url">f</$text>' +
					'<$text linkHref="other url">o</$text>' +
					'<$text linkHref="same url">o[]b</$text>' +
					'<$text linkHref="other url">a</$text>' +
					'<$text linkHref="same url">r</$text>'
				);

				command.execute();

				expect( getData( document ) )
					.to.equal(
						'<$text linkHref="same url">f</$text>' +
						'<$text linkHref="other url">o</$text>' +
						'o[]b' +
						'<$text linkHref="other url">a</$text>' +
						'<$text linkHref="same url">r</$text>'
					);
			} );

			it( 'should remove `linkHref` attribute from selection siblings with the same attribute value ' +
				'and do nothing with other attributes',
			() => {
				setData(
					document,
					'<$text linkHref="url">f</$text>' +
					'<$text bold="true" linkHref="url">o</$text>' +
					'<$text linkHref="url">o[]b</$text>' +
					'<$text bold="true" linkHref="url">a</$text>' +
					'<$text linkHref="url">r</$text>'
				);

				command.execute();

				expect( getData( document ) ).to.equal(
					'f' +
					'<$text bold="true">o</$text>' +
					'o[]b' +
					'<$text bold="true">a</$text>' +
					'r'
				);
			} );

			it( 'should remove `linkHref` attribute from selection siblings only in the same parent as selection parent', () => {
				setData(
					document,
					'<p><$text linkHref="url">bar</$text></p>' +
					'<p><$text linkHref="url">fo[]o</$text></p>' +
					'<p><$text linkHref="url">bar</$text></p>'
				);

				command.execute();

				expect( getData( document ) ).to.equal(
					'<p><$text linkHref="url">bar</$text></p>' +
					'<p>fo[]o</p>' +
					'<p><$text linkHref="url">bar</$text></p>'
				);
			} );

			it( 'should remove `linkHref` attribute from selection siblings when selection is at the end of link', () => {
				setData( document, '<$text linkHref="url">foobar</$text>[]' );

				command.execute();

				expect( getData( document ) ).to.equal( 'foobar[]' );
			} );

			it( 'should remove `linkHref` attribute from selection siblings when selection is at the beginning of link', () => {
				setData( document, '[]<$text linkHref="url">foobar</$text>' );

				command.execute();

				expect( getData( document ) ).to.equal( '[]foobar' );
			} );

			it( 'should remove `linkHref` attribute from selection siblings on the left side when selection is between two elements with ' +
				'different `linkHref` attributes',
			() => {
				setData( document, '<$text linkHref="url">foo</$text>[]<$text linkHref="other url">bar</$text>' );

				command.execute();

				expect( getData( document ) ).to.equal( 'foo[]<$text linkHref="other url">bar</$text>' );
			} );

			it( 'should remove `linkHref` attribute from selection', () => {
				setData( document, '<$text linkHref="url">foo[]bar</$text>' );

				command.execute();

				expect( document.selection.hasAttribute( 'linkHref' ) ).to.false;
			} );
		} );
	} );
} );

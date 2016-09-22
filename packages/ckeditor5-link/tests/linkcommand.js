/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '/tests/core/_utils/modeltesteditor.js';
import LinkCommand from '/ckeditor5/link/linkcommand.js';
import { setData, getData } from '/ckeditor5/engine/dev-utils/model.js';

describe( 'LinkCommand', () => {
	let editor, document, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				document = editor.document;
				command = new LinkCommand( editor );

				// Allow text in $root.
				document.schema.allow( { name: '$text', inside: '$root' } );

				// Allow text with `linkHref` attribute in paragraph.
				document.schema.registerItem( 'p', '$block' );
				document.schema.allow( { name: '$text', attributes: 'linkHref', inside: '$root' } );
			} );
	} );

	afterEach( () => {
		command.destroy();
	} );

	describe( 'value', () => {
		describe( 'collapsed selection', () => {
			it( 'should be equal attribute value when selection is placed inside element with `linkHref` attribute', () => {
				setData( document, `<$text linkHref="url">foo[]bar</$text>` );

				expect( command.value ).to.equal( 'url' );
			} );

			it( 'should be undefined when selection is placed inside element without `linkHref` attribute', () => {
				setData( document, `<$text bold="true">foo[]bar</$text>` );

				expect( command.value ).to.undefined;
			} );
		} );

		describe( 'non-collapsed selection', () => {
			it( 'should be equal attribute value when selection contains only elements with `linkHref` attribute', () => {
				setData( document, 'fo[<$text linkHref="url">ob</$text>]ar' );

				expect( command.value ).to.equal( 'url' );
			} );

			it( 'should be undefined when selection contains not only elements with `linkHref` attribute', () => {
				setData( document, 'f[o<$text linkHref="url">ob</$text>]ar' );

				expect( command.value ).to.undefined;
			} );
		} );
	} );

	describe( '_doExecute', () => {
		describe( 'non-collapsed selection', () => {
			it( 'should set `linkHref` attribute to selected text', () => {
				setData( document, 'f[ooba]r' );

				expect( command.value ).to.undefined;

				command._doExecute( 'url' );

				expect( getData( document ) ).to.equal( 'f[<$text linkHref="url">ooba</$text>]r' );
				expect( command.value ).to.equal( 'url' );
			} );

			it( 'should set `linkHref` attribute to selected text when text already has attributes', () => {
				setData( document, 'f[o<$text bold="true">oba]r</$text>' );

				expect( command.value ).to.undefined;

				command._doExecute( 'url' );

				expect( command.value ).to.equal( 'url' );
				expect( getData( document ) ).to.equal(
					'f[<$text linkHref="url">o</$text>' +
					'<$text bold="true" linkHref="url">oba</$text>]' +
					'<$text bold="true">r</$text>'
				);
			} );

			it( 'should overwrite existing `linkHref` attribute when selected text wraps text with `linkHref` attribute', () => {
				setData( document, 'f[o<$text linkHref="other url">o</$text>ba]r' );

				expect( command.value ).to.undefined;

				command._doExecute( 'url' );

				expect( getData( document ) ).to.equal( 'f[<$text linkHref="url">ooba</$text>]r' );
				expect( command.value ).to.equal( 'url' );
			} );

			it( 'should split text and overwrite attribute value when selection is inside text with `linkHref` attribute', () => {
				setData( document, 'f<$text linkHref="other url">o[ob]a</$text>r' );

				expect( command.value ).to.equal( 'other url' );

				command._doExecute( 'url' );

				expect( getData( document ) ).to.equal(
					'f' +
					'<$text linkHref="other url">o</$text>' +
					'[<$text linkHref="url">ob</$text>]' +
					'<$text linkHref="other url">a</$text>' +
					'r'
				);
				expect( command.value ).to.equal( 'url' );
			} );

			it(
				'should overwrite `linkHref` attribute of selected text only, when selection start inside text with `linkHref` attribute',
			() => {
				setData( document, 'f<$text linkHref="other url">o[o</$text>ba]r' );

				expect( command.value ).to.equal( 'other url' );

				command._doExecute( 'url' );

				expect( getData( document ) ).to.equal( 'f<$text linkHref="other url">o</$text>[<$text linkHref="url">oba</$text>]r' );
				expect( command.value ).to.equal( 'url' );
			} );

			it( 'should overwrite `linkHref` attribute of selected text only, when selection end inside text with `linkHref` attribute', () => {
				setData( document, 'f[o<$text linkHref="other url">ob]a</$text>r' );

				expect( command.value ).to.undefined;

				command._doExecute( 'url' );

				expect( getData( document ) ).to.equal( 'f[<$text linkHref="url">oob</$text>]<$text linkHref="other url">a</$text>r' );
				expect( command.value ).to.equal( 'url' );
			} );

			it( 'should set `linkHref` attribute to selected text when text is split by $block element', () => {
				setData( document, '<p>f[oo</p><p>ba]r</p>' );

				expect( command.value ).to.undefined;

				command._doExecute( 'url' );

				expect( getData( document ) )
					.to.equal( '<p>f[<$text linkHref="url">oo</$text></p><p><$text linkHref="url">ba</$text>]r</p>' );
				expect( command.value ).to.equal( 'url' );
			} );

			it( 'should set `linkHref` attribute only to allowed elements and omit disallowed', () => {
				// Disallow text in img.
				document.schema.registerItem( 'img', '$block' );
				document.schema.disallow( { name: '$text', attributes: 'linkHref', inside: 'img' } );

				setData( document, '<p>f[oo<img></img>ba]r</p>' );

				expect( command.value ).to.undefined;

				command._doExecute( 'url' );

				expect( getData( document ) )
					.to.equal( '<p>f[<$text linkHref="url">oo</$text><img></img><$text linkHref="url">ba</$text>]r</p>' );
				expect( command.value ).to.equal( 'url' );
			} );
		} );

		describe( 'collapsed selection', () => {
			it( 'should insert text with `linkHref` attribute, text data equal to href and select new link', () => {
				setData( document, 'foo[]bar' );

				command._doExecute( 'url' );

				expect( getData( document ) ).to.equal( 'foo[<$text linkHref="url">url</$text>]bar' );
			} );

			it( 'should update `linkHref` attribute and select whole link when selection is inside text with `linkHref` attribute', () => {
				setData( document, '<$text linkHref="other url">foo[]bar</$text>' );

				command._doExecute( 'url' );

				expect( getData( document ) ).to.equal( '[<$text linkHref="url">foobar</$text>]' );
			} );

			it( 'should not insert text with `linkHref` attribute when is not allowed in parent', () => {
				document.schema.disallow( { name: '$text', attributes: 'linkHref', inside: 'p' } );
				setData( document, '<p>foo[]bar</p>' );

				command._doExecute( 'url' );

				expect( getData( document ) ).to.equal( '<p>foo[]bar</p>' );
			} );
		} );
	} );

	describe( '_checkEnabled', () => {
		// This test doesn't tests every possible case.
		// Method `_checkEnabled` uses `isAttributeAllowedInSelection` helper which is fully tested in his own test.

		beforeEach( () => {
			document.schema.registerItem( 'x', '$block' );
			document.schema.disallow( { name: '$text', inside: 'x', attributes: 'linkHref' } );
		} );

		describe( 'when selection is collapsed', () => {
			it( 'should return true if characters with the attribute can be placed at caret position', () => {
				setData( document, '<p>f[]oo</p>' );
				expect( command._checkEnabled() ).to.be.true;
			} );

			it( 'should return false if characters with the attribute cannot be placed at caret position', () => {
				setData( document, '<x>fo[]o</x>' );
				expect( command._checkEnabled() ).to.be.false;
			} );
		} );

		describe( 'when selection is not collapsed', () => {
			it( 'should return true if there is at least one node in selection that can have the attribute', () => {
				setData( document, '<p>[foo]</p>' );
				expect( command._checkEnabled() ).to.be.true;
			} );

			it( 'should return false if there are no nodes in selection that can have the attribute', () => {
				setData( document, '<x>[foo]</x>' );
				expect( command._checkEnabled() ).to.be.false;
			} );
		} );
	} );
} );

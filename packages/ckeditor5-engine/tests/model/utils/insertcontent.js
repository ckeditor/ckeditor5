/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Model from '../../../src/model/model';
import insertContent from '../../../src/model/utils/insertcontent';
import DocumentFragment from '../../../src/model/documentfragment';
import Text from '../../../src/model/text';
import Element from '../../../src/model/element';
import Position from '../../../src/model/position';

import { setData, getData, parse, stringify } from '../../../src/dev-utils/model';
import Range from '../../../src/model/range';

describe( 'DataController utils', () => {
	let model, doc, root;

	describe( 'insertContent', () => {
		beforeEach( () => {
			model = new Model();
			doc = model.document;
			root = doc.createRoot();
		} );

		it( 'should use parent batch', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );
			setData( model, 'x[]x' );

			model.change( writer => {
				insertContent( model, writer.createText( 'a' ) );
				expect( writer.batch.operations ).to.length( 1 );
			} );
		} );

		it( 'should be able to insert content at custom selection', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );
			setData( model, 'a[]bc' );

			const selection = model.createSelection( model.createPositionFromPath( doc.getRoot(), [ 2 ] ) );

			model.change( writer => {
				const affectedRange = insertContent( model, writer.createText( 'x' ), selection );

				expect( getData( model ) ).to.equal( 'a[]bxc' );
				expect( stringify( root, affectedRange ) ).to.equal( 'ab[x]c' );
			} );
		} );

		it( 'should modify passed selection instance', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );
			setData( model, 'a[]bc' );

			const selection = model.createSelection( model.createPositionFromPath( doc.getRoot(), [ 2 ] ) );
			const selectionCopy = model.createSelection( model.createPositionFromPath( doc.getRoot(), [ 2 ] ) );

			expect( selection.isEqual( selectionCopy ) ).to.be.true;

			model.change( writer => {
				insertContent( model, writer.createText( 'x' ), selection );
			} );

			expect( selection.isEqual( selectionCopy ) ).to.be.false;

			const insertionSelection = model.createSelection( model.createPositionFromPath( doc.getRoot(), [ 3 ] ) );
			expect( selection.isEqual( insertionSelection ) ).to.be.true;
		} );

		it( 'should be able to insert content at custom position', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );
			setData( model, 'a[]bc' );

			const position = new Position( doc.getRoot(), [ 2 ] );

			model.change( writer => {
				const affectedRange = insertContent( model, writer.createText( 'x' ), position );

				expect( getData( model ) ).to.equal( 'a[]bxc' );
				expect( stringify( root, affectedRange ) ).to.equal( 'ab[x]c' );
			} );
		} );

		it( 'should be able to insert content at custom range', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );
			setData( model, 'a[]bc' );

			const range = new Range( new Position( doc.getRoot(), [ 2 ] ), new Position( doc.getRoot(), [ 3 ] ) );

			model.change( writer => {
				const affectedRange = insertContent( model, writer.createText( 'x' ), range );

				expect( getData( model ) ).to.equal( 'a[]bx' );
				expect( stringify( root, affectedRange ) ).to.equal( 'ab[x]' );
			} );
		} );

		it( 'should be able to insert content at model selection if document selection is passed', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );
			setData( model, 'a[]bc' );

			model.change( writer => {
				const affectedRange = insertContent( model, writer.createText( 'x' ), model.document.selection );

				expect( getData( model ) ).to.equal( 'ax[]bc' );
				expect( stringify( root, affectedRange ) ).to.equal( 'a[x]bc' );
			} );
		} );

		it( 'should be able to insert content at model selection if none passed', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );
			setData( model, 'a[]bc' );

			model.change( writer => {
				const affectedRange = insertContent( model, writer.createText( 'x' ) );

				expect( getData( model ) ).to.equal( 'ax[]bc' );
				expect( stringify( root, affectedRange ) ).to.equal( 'a[x]bc' );
			} );
		} );

		it( 'should be able to insert content at model element (numeric offset)', () => {
			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			setData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

			const element = doc.getRoot().getNodeByPath( [ 1 ] );

			model.change( writer => {
				const text = writer.createText( 'x' );

				const affectedRange = insertContent( model, text, element, 2 );

				expect( getData( model ) ).to.equal( '<paragraph>foo[]</paragraph><paragraph>baxr</paragraph>' );
				expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>foo</paragraph><paragraph>ba[x]r</paragraph>' );
			} );
		} );

		it( 'should be able to insert content at model element (offset="in")', () => {
			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			setData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

			const element = doc.getRoot().getNodeByPath( [ 1 ] );

			model.change( writer => {
				const text = writer.createText( 'x' );

				const affectedRange = insertContent( model, text, element, 'in' );

				expect( getData( model ) ).to.equal( '<paragraph>foo[]</paragraph><paragraph>x</paragraph>' );
				expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>foo</paragraph><paragraph>[x]</paragraph>' );
			} );
		} );

		it( 'should be able to insert content at model element (offset="on")', () => {
			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			model.schema.register( 'foo', { inheritAllFrom: '$block' } );

			setData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

			const element = doc.getRoot().getNodeByPath( [ 1 ] );

			model.change( writer => {
				const insertElement = writer.createElement( 'foo' );

				const affectedRange = insertContent( model, insertElement, element, 'on' );

				expect( getData( model ) ).to.equal( '<paragraph>foo[]</paragraph><foo></foo>' );
				expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>foo</paragraph>[<foo></foo>]' );
			} );
		} );

		it( 'should be able to insert content at model element (offset="end")', () => {
			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			setData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

			const element = doc.getRoot().getNodeByPath( [ 1 ] );

			model.change( writer => {
				const text = writer.createText( 'x' );

				const affectedRange = insertContent( model, text, element, 'end' );

				expect( getData( model ) ).to.equal( '<paragraph>foo[]</paragraph><paragraph>barx</paragraph>' );
				expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>foo</paragraph><paragraph>bar[x]</paragraph>' );
			} );
		} );

		it( 'accepts DocumentFragment', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );

			setData( model, 'x[]x' );

			insertContent( model, new DocumentFragment( [ new Text( 'a' ) ] ) );

			expect( getData( model ) ).to.equal( 'xa[]x' );
		} );

		it( 'accepts Text', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );

			setData( model, 'x[]x' );

			insertContent( model, new Text( 'a' ) );

			expect( getData( model ) ).to.equal( 'xa[]x' );
		} );

		it( 'should save the reference to the original object', () => {
			const content = new Element( 'image' );

			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			model.schema.register( 'image', {
				allowWhere: '$text',
				isObject: true
			} );

			setData( model, '<paragraph>foo[]</paragraph>' );

			insertContent( model, content );

			expect( doc.getRoot().getChild( 0 ).getChild( 1 ) ).to.equal( content );
		} );

		it( 'should use the selection set by deleteContent()', () => {
			model.on( 'deleteContent', evt => {
				evt.stop();

				model.change( writer => {
					writer.setSelection( root.getChild( 0 ), 'end' );
				} );
			}, { priority: 'high' } );

			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			setData( model, '<paragraph>[fo]o</paragraph>' );

			insertHelper( 'xyz' );

			expect( getData( model ) ).to.equal( '<paragraph>fooxyz[]</paragraph>' );
		} );

		describe( 'in simple scenarios', () => {
			beforeEach( () => {
				model = new Model();
				doc = model.document;
				root = doc.createRoot();

				const schema = model.schema;

				schema.register( 'image', {
					allowWhere: '$text',
					isObject: true
				} );
				schema.register( 'disallowedElement' );

				schema.extend( '$text', { allowIn: '$root' } );
				schema.extend( 'image', { allowIn: '$root' } );
				// Otherwise it won't be passed to the temporary model fragment used inside insert().
				schema.extend( 'disallowedElement', { allowIn: '$clipboardHolder' } );
				schema.extend( '$text', {
					allowIn: 'disallowedElement',
					allowAttributes: [ 'bold', 'italic' ]
				} );
			} );

			it( 'inserts one text node', () => {
				setData( model, 'f[]oo' );
				const affectedRange = insertHelper( 'xyz' );

				expect( getData( model ) ).to.equal( 'fxyz[]oo' );
				expect( stringify( root, affectedRange ) ).to.equal( 'f[xyz]oo' );
			} );

			it( 'inserts one text node (at the end)', () => {
				setData( model, 'foo[]' );
				const affectedRange = insertHelper( 'xyz' );

				expect( getData( model ) ).to.equal( 'fooxyz[]' );
				expect( stringify( root, affectedRange ) ).to.equal( 'foo[xyz]' );
			} );

			it( 'inserts one text node with attribute', () => {
				setData( model, 'f[]oo' );
				const affectedRange = insertHelper( '<$text bold="true">xyz</$text>' );

				expect( getData( model ) ).to.equal( 'f<$text bold="true">xyz[]</$text>oo' );
				expect( stringify( root, affectedRange ) ).to.equal( 'f[<$text bold="true">xyz</$text>]oo' );

				expect( doc.selection.getAttribute( 'bold' ) ).to.be.true;
			} );

			it( 'inserts one text node with attribute into text with a different attribute', () => {
				setData( model, '<$text bold="true">f[]oo</$text>' );
				const affectedRange = insertHelper( '<$text italic="true">xyz</$text>' );

				expect( getData( model ) )
					.to.equal( '<$text bold="true">f</$text><$text italic="true">xyz[]</$text><$text bold="true">oo</$text>' );

				expect( stringify( root, affectedRange ) )
					.to.equal( '<$text bold="true">f</$text>[<$text italic="true">xyz</$text>]<$text bold="true">oo</$text>' );

				expect( doc.selection.getAttribute( 'italic' ) ).to.be.true;
				expect( doc.selection.hasAttribute( 'bold' ) ).to.be.false;
			} );

			it( 'inserts one text node with attribute into text with the same attribute', () => {
				setData( model, '<$text bold="true">f[]oo</$text>' );
				const affectedRange = insertHelper( '<$text bold="true">xyz</$text>' );

				expect( getData( model ) ).to.equal( '<$text bold="true">fxyz[]oo</$text>' );
				expect( stringify( root, affectedRange ) ).to.equal( '<$text bold="true">f[xyz]oo</$text>' );

				expect( doc.selection.getAttribute( 'bold' ) ).to.be.true;
			} );

			it( 'inserts a text without attributes into a text with an attribute', () => {
				setData( model, '<$text bold="true">f[]oo</$text>' );
				const affectedRange = insertHelper( 'xyz' );

				expect( getData( model ) ).to.equal( '<$text bold="true">f</$text>xyz[]<$text bold="true">oo</$text>' );
				expect( stringify( root, affectedRange ) ).to.equal( '<$text bold="true">f</$text>[xyz]<$text bold="true">oo</$text>' );

				expect( doc.selection.hasAttribute( 'bold' ) ).to.be.false;
			} );

			it( 'inserts an element', () => {
				setData( model, 'f[]oo' );
				const affectedRange = insertHelper( '<image></image>' );

				expect( getData( model ) ).to.equal( 'f<image></image>[]oo' );
				expect( stringify( root, affectedRange ) ).to.equal( 'f[<image></image>]oo' );
			} );

			it( 'inserts a text and an element', () => {
				setData( model, 'f[]oo' );
				const affectedRange = insertHelper( 'xyz<image></image>' );

				expect( getData( model ) ).to.equal( 'fxyz<image></image>[]oo' );
				expect( stringify( root, affectedRange ) ).to.equal( 'f[xyz<image></image>]oo' );
			} );

			it( 'strips a disallowed element', () => {
				setData( model, 'f[]oo' );
				const affectedRange = insertHelper( '<disallowedElement>xyz</disallowedElement>' );

				expect( getData( model ) ).to.equal( 'fxyz[]oo' );
				expect( stringify( root, affectedRange ) ).to.equal( 'f[xyz]oo' );
			} );

			it( 'deletes selection before inserting the content', () => {
				setData( model, 'f[abc]oo' );
				const affectedRange = insertHelper( 'x' );

				expect( getData( model ) ).to.equal( 'fx[]oo' );
				expect( stringify( root, affectedRange ) ).to.equal( 'f[x]oo' );
			} );

			describe( 'spaces handling', () => {
				// Note: spaces in the view are not encoded like in the DOM, so subsequent spaces must be
				// inserted into the model as is. The conversion to nbsps happen on view<=>DOM conversion.

				it( 'inserts one space', () => {
					setData( model, 'f[]oo' );
					insertHelper( new Text( ' ' ) );
					expect( getData( model ) ).to.equal( 'f []oo' );
				} );

				it( 'inserts three spaces', () => {
					setData( model, 'f[]oo' );
					insertHelper( new Text( '   ' ) );
					expect( getData( model ) ).to.equal( 'f   []oo' );
				} );

				it( 'inserts spaces at the end', () => {
					setData( model, 'foo[]' );
					insertHelper( new Text( '   ' ) );
					expect( getData( model ) ).to.equal( 'foo   []' );
				} );

				it( 'inserts one nbsp', () => {
					setData( model, 'f[]oo' );
					insertHelper( new Text( '\u200a' ) );
					expect( getData( model ) ).to.equal( 'f\u200a[]oo' );
				} );

				it( 'inserts word surrounded by spaces', () => {
					setData( model, 'f[]oo' );
					insertHelper( new Text( ' xyz  ' ) );
					expect( getData( model ) ).to.equal( 'f xyz  []oo' );
				} );
			} );
		} );

		describe( 'in blocks', () => {
			beforeEach( () => {
				model = new Model();
				doc = model.document;
				root = doc.createRoot();

				const schema = model.schema;

				schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				schema.register( 'heading1', { inheritAllFrom: '$block' } );
				schema.register( 'heading2', { inheritAllFrom: '$block' } );
				schema.register( 'blockWidget', {
					isObject: true,
					allowIn: '$root'
				} );
				schema.register( 'inlineWidget', {
					isObject: true,
					allowIn: [ '$block', '$clipboardHolder' ]
				} );
				schema.register( 'listItem', {
					inheritAllFrom: '$block',
					allowAttributes: [ 'listType', 'listIndent' ]
				} );
			} );

			it( 'inserts one text node', () => {
				setData( model, '<paragraph>f[]oo</paragraph>' );
				const affectedRange = insertHelper( 'xyz' );

				expect( getData( model ) ).to.equal( '<paragraph>fxyz[]oo</paragraph>' );
				expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>f[xyz]oo</paragraph>' );
			} );

			it( 'inserts one text node to fully selected paragraph', () => {
				setData( model, '<paragraph>[foo]</paragraph>' );
				const affectedRange = insertHelper( 'xyz' );

				expect( getData( model ) ).to.equal( '<paragraph>xyz[]</paragraph>' );
				expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>[xyz]</paragraph>' );
			} );

			it( 'inserts one text node to fully selected paragraphs (from outside)', () => {
				setData( model, '[<paragraph>foo</paragraph><paragraph>bar</paragraph>]' );
				const affectedRange = insertHelper( 'xyz' );

				expect( getData( model ) ).to.equal( '<paragraph>xyz[]</paragraph>' );
				expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>[xyz]</paragraph>' );
			} );

			it( 'merges two blocks before inserting content (p+p)', () => {
				setData( model, '<paragraph>fo[o</paragraph><paragraph>b]ar</paragraph>' );
				const affectedRange = insertHelper( 'xyz' );

				expect( getData( model ) ).to.equal( '<paragraph>foxyz[]ar</paragraph>' );
				expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>fo[xyz]ar</paragraph>' );
			} );

			it( 'inserts inline widget and text', () => {
				setData( model, '<paragraph>f[]oo</paragraph>' );
				const affectedRange = insertHelper( 'xyz<inlineWidget></inlineWidget>' );

				expect( getData( model ) ).to.equal( '<paragraph>fxyz<inlineWidget></inlineWidget>[]oo</paragraph>' );
				expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>f[xyz<inlineWidget></inlineWidget>]oo</paragraph>' );
			} );

			// Note: In CKEditor 4 the blocks are not merged, but to KISS we're merging here
			// because that's what deleteContent() does.
			it( 'merges two blocks before inserting content (h+p)', () => {
				setData( model, '<heading1>fo[o</heading1><paragraph>b]ar</paragraph>' );
				const affectedRange = insertHelper( 'xyz' );

				expect( getData( model ) ).to.equal( '<heading1>foxyz[]ar</heading1>' );
				expect( stringify( root, affectedRange ) ).to.equal( '<heading1>fo[xyz]ar</heading1>' );
			} );

			it( 'not insert autoparagraph when paragraph is disallowed at the current position', () => {
				// Disallow paragraph in $root.
				model.schema.addChildCheck( ( ctx, childDef ) => {
					if ( childDef.name == 'paragraph' && ctx.endsWith( '$root' ) ) {
						return false;
					}
				} );

				const content = new DocumentFragment( [
					new Element( 'heading1', [], [ new Text( 'bar' ) ] ),
					new Text( 'biz' )
				] );

				setData( model, '[<heading2>foo</heading2>]' );
				const affectedRange = insertContent( model, content );

				expect( getData( model ) ).to.equal( '<heading1>bar[]</heading1>' );
				expect( stringify( root, affectedRange ) ).to.equal( '[<heading1>bar</heading1>]' );
			} );

			describe( 'block to block handling', () => {
				it( 'inserts one paragraph', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>xyz</paragraph>' );

					expect( getData( model ) ).to.equal( '<paragraph>fxyz[]oo</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>f[xyz]oo</paragraph>' );
				} );

				it( 'inserts one paragraph (at the end)', () => {
					setData( model, '<paragraph>foo[]</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>xyz</paragraph>' );

					expect( getData( model ) ).to.equal( '<paragraph>fooxyz[]</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>foo[xyz]</paragraph>' );
				} );

				it( 'inserts one paragraph into an empty paragraph', () => {
					setData( model, '<paragraph>[]</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>xyz</paragraph>' );

					expect( getData( model ) ).to.equal( '<paragraph>xyz[]</paragraph>' );

					// The empty paragraph gets removed and the new element is inserted instead.
					expect( stringify( root, affectedRange ) ).to.equal( '[<paragraph>xyz</paragraph>]' );
				} );

				it( 'inserts one empty paragraph', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<paragraph></paragraph>' );

					expect( getData( model ) ).to.equal( '<paragraph>f[]oo</paragraph>' );

					// Nothing is inserted so the `affectedRange` is collapsed at insertion position.
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>f[]oo</paragraph>' );
				} );

				it( 'inserts one block into a fully selected content', () => {
					setData( model, '<heading1>[foo</heading1><paragraph>bar]</paragraph>' );
					const affectedRange = insertHelper( '<heading2>xyz</heading2>' );

					expect( getData( model ) ).to.equal( '<heading2>xyz[]</heading2>' );
					expect( stringify( root, affectedRange ) ).to.equal( '[<heading2>xyz</heading2>]' );
				} );

				it( 'inserts one heading', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<heading1>xyz</heading1>' );

					expect( getData( model ) ).to.equal( '<paragraph>fxyz[]oo</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>f[xyz]oo</paragraph>' );
				} );

				it( 'inserts two headings', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<heading1>xxx</heading1><heading1>yyy</heading1>' );

					expect( getData( model ) ).to.equal( '<paragraph>fxxx</paragraph><heading1>yyy[]oo</heading1>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>f[xxx</paragraph><heading1>yyy]oo</heading1>' );
				} );

				it( 'inserts one object', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<blockWidget></blockWidget>' );

					expect( getData( model ) )
						.to.equal( '<paragraph>f</paragraph>[<blockWidget></blockWidget>]<paragraph>oo</paragraph>' );

					expect( stringify( root, affectedRange ) )
						.to.equal( '<paragraph>f[</paragraph><blockWidget></blockWidget><paragraph>]oo</paragraph>' );
				} );

				it( 'inserts one object (at the end)', () => {
					setData( model, '<paragraph>foo[]</paragraph>' );
					const affectedRange = insertHelper( '<blockWidget></blockWidget>' );

					expect( getData( model ) ).to.equal( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );
				} );

				it( 'inserts one object (at the beginning)', () => {
					setData( model, '<paragraph>[]bar</paragraph>' );
					const affectedRange = insertHelper( '<blockWidget></blockWidget>' );

					expect( getData( model ) ).to.equal( '[<blockWidget></blockWidget>]<paragraph>bar</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '[<blockWidget></blockWidget>]<paragraph>bar</paragraph>' );
				} );

				it( 'inserts one list item', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<listItem listIndent="0" listType="bulleted">xyz</listItem>' );

					expect( getData( model ) ).to.equal( '<paragraph>fxyz[]oo</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>f[xyz]oo</paragraph>' );
				} );

				it( 'inserts list item to empty element', () => {
					setData( model, '<paragraph>[]</paragraph>' );
					const affectedRange = insertHelper( '<listItem listIndent="0" listType="bulleted">xyz</listItem>' );

					expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="bulleted">xyz[]</listItem>' );
					expect( stringify( root, affectedRange ) ).to.equal( '[<listItem listIndent="0" listType="bulleted">xyz</listItem>]' );
				} );

				it( 'inserts three list items at the end of paragraph', () => {
					setData( model, '<paragraph>foo[]</paragraph>' );
					const affectedRange = insertHelper(
						'<listItem listIndent="0" listType="bulleted">xxx</listItem>' +
						'<listItem listIndent="0" listType="bulleted">yyy</listItem>' +
						'<listItem listIndent="0" listType="bulleted">zzz</listItem>'
					);

					expect( getData( model ) ).to.equal(
						'<paragraph>fooxxx</paragraph>' +
						'<listItem listIndent="0" listType="bulleted">yyy</listItem>' +
						'<listItem listIndent="0" listType="bulleted">zzz[]</listItem>'
					);

					expect( stringify( root, affectedRange ) ).to.equal(
						'<paragraph>foo[xxx</paragraph>' +
						'<listItem listIndent="0" listType="bulleted">yyy</listItem>' +
						'<listItem listIndent="0" listType="bulleted">zzz</listItem>]'
					);
				} );

				it( 'inserts two list items to an empty paragraph', () => {
					setData( model, '<paragraph>a</paragraph><paragraph>[]</paragraph><paragraph>b</paragraph>' );
					const affectedRange = insertHelper(
						'<listItem listIndent="0" listType="bulleted">xxx</listItem>' +
						'<listItem listIndent="0" listType="bulleted">yyy</listItem>'
					);

					expect( getData( model ) ).to.equal(
						'<paragraph>a</paragraph>' +
						'<listItem listIndent="0" listType="bulleted">xxx</listItem>' +
						'<listItem listIndent="0" listType="bulleted">yyy[]</listItem>' +
						'<paragraph>b</paragraph>'
					);

					expect( stringify( root, affectedRange ) ).to.equal(
						'<paragraph>a</paragraph>' +
						'[<listItem listIndent="0" listType="bulleted">xxx</listItem>' +
						'<listItem listIndent="0" listType="bulleted">yyy</listItem>]' +
						'<paragraph>b</paragraph>'
					);
				} );

				it( 'should not merge a paragraph wrapped in blockQuote with list item (checking left merge)', () => {
					model.schema.register( 'blockQuote', {
						allowWhere: '$block',
						allowContentOf: '$root'
					} );

					setData( model, '<listItem>fo[]o</listItem>' );

					const affectedRange = insertHelper( '<blockQuote><paragraph>xxx</paragraph></blockQuote><heading1>yyy</heading1>' );

					expect( getData( model ) ).to.equal(
						'<listItem>fo</listItem>' +
						'<blockQuote>' +
							'<paragraph>xxx</paragraph>' +
						'</blockQuote>' +
						'<heading1>yyy[]o</heading1>'
					);

					expect( stringify( root, affectedRange ) ).to.equal(
						'<listItem>fo[</listItem>' +
						'<blockQuote>' +
							'<paragraph>xxx</paragraph>' +
						'</blockQuote>' +
						'<heading1>yyy]o</heading1>'
					);
				} );

				it( 'should not merge a paragraph wrapped in blockQuote with list item (checking right merge)', () => {
					model.schema.register( 'blockQuote', {
						allowWhere: '$block',
						allowContentOf: '$root'
					} );

					setData( model, '<listItem>fo[]o</listItem>' );

					const affectedRange = insertHelper( '<heading1>yyy</heading1><blockQuote><paragraph>xxx</paragraph></blockQuote>' );

					expect( getData( model ) ).to.equal(
						'<listItem>foyyy</listItem>' +
						'<blockQuote>' +
							'<paragraph>xxx</paragraph>' +
						'</blockQuote>' +
						'<listItem>[]o</listItem>'
					);

					expect( stringify( root, affectedRange ) ).to.equal(
						'<listItem>fo[yyy</listItem>' +
						'<blockQuote>' +
							'<paragraph>xxx</paragraph>' +
						'</blockQuote>' +
						'<listItem>]o</listItem>'
					);
				} );

				it( 'should not merge a paragraph wrapped in blockQuote with list item (checking both merges)', () => {
					model.schema.register( 'blockQuote', {
						allowWhere: '$block',
						allowContentOf: '$root'
					} );

					setData( model, '<listItem>fo[]o</listItem>' );

					const affectedRange = insertHelper( '<blockQuote><paragraph>xxx</paragraph></blockQuote>' );

					expect( getData( model ) ).to.equal(
						'<listItem>fo</listItem>' +
						'<blockQuote>' +
							'<paragraph>xxx</paragraph>' +
						'</blockQuote>' +
						'<listItem>[]o</listItem>'
					);

					expect( stringify( root, affectedRange ) ).to.equal(
						'<listItem>fo[</listItem>' +
						'<blockQuote>' +
							'<paragraph>xxx</paragraph>' +
						'</blockQuote>' +
						'<listItem>]o</listItem>'
					);
				} );

				// See ckeditor5#2010.
				it( 'should handle bQ+p over bQ+p insertion', () => {
					model.schema.register( 'blockQuote', {
						allowWhere: '$block',
						allowContentOf: '$root'
					} );

					setData( model, '<blockQuote><paragraph>[foo</paragraph></blockQuote><paragraph>bar]</paragraph>' );

					const affectedRange = insertHelper( '<blockQuote><paragraph>xxx</paragraph></blockQuote><paragraph>yyy</paragraph>' );

					expect( getData( model ) ).to.equal(
						'<blockQuote>' +
							'<paragraph>xxx</paragraph>' +
						'</blockQuote>' +
						'<paragraph>yyy[]</paragraph>'
					);

					expect( stringify( root, affectedRange ) ).to.equal(
						'[<blockQuote>' +
							'<paragraph>xxx</paragraph>' +
						'</blockQuote>' +
						'<paragraph>yyy</paragraph>]'
					);
				} );
			} );

			describe( 'mixed content to block', () => {
				it( 'inserts text + paragraph', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( 'xxx<paragraph>yyy</paragraph>' );

					expect( getData( model ) ).to.equal( '<paragraph>fxxx</paragraph><paragraph>yyy[]oo</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>f[xxx</paragraph><paragraph>yyy]oo</paragraph>' );
				} );

				it( 'inserts text + inlineWidget + text + paragraph', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( 'xxx<inlineWidget></inlineWidget>yyy<paragraph>zzz</paragraph>' );

					expect( getData( model ) ).to.equal(
						'<paragraph>fxxx<inlineWidget></inlineWidget>yyy</paragraph><paragraph>zzz[]oo</paragraph>'
					);

					expect( stringify( root, affectedRange ) ).to.equal(
						'<paragraph>f[xxx<inlineWidget></inlineWidget>yyy</paragraph><paragraph>zzz]oo</paragraph>'
					);
				} );

				it( 'inserts text + paragraph (at the beginning)', () => {
					setData( model, '<paragraph>[]foo</paragraph>' );
					const affectedRange = insertHelper( 'xxx<paragraph>yyy</paragraph>' );

					expect( getData( model ) ).to.equal( '<paragraph>xxx</paragraph><paragraph>yyy[]foo</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>[xxx</paragraph><paragraph>yyy]foo</paragraph>' );
				} );

				it( 'inserts text + paragraph (at the end)', () => {
					setData( model, '<paragraph>foo[]</paragraph>' );
					const affectedRange = insertHelper( 'xxx<paragraph>yyy</paragraph>' );

					expect( getData( model ) ).to.equal( '<paragraph>fooxxx</paragraph><paragraph>yyy[]</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>foo[xxx</paragraph><paragraph>yyy</paragraph>]' );
				} );

				it( 'inserts paragraph + text', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>yyy</paragraph>xxx' );

					expect( getData( model ) ).to.equal( '<paragraph>fyyy</paragraph><paragraph>xxx[]oo</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>f[yyy</paragraph><paragraph>xxx]oo</paragraph>' );
				} );

				// This is the expected result, but it was so hard to achieve at this stage that I
				// decided to go with the what the next test represents.
				// it( 'inserts paragraph + text + inlineWidget + text', () => {
				// 	setData( model, '<paragraph>f[]oo</paragraph>' );
				// 	insertHelper( '<paragraph>yyy</paragraph>xxx<inlineWidget></inlineWidget>zzz' );
				// 	expect( getData( model ) )
				// 		.to.equal( '<paragraph>fyyy</paragraph><paragraph>xxx<inlineWidget></inlineWidget>zzz[]oo</paragraph>' );
				// } );

				// See the comment above.
				it( 'inserts paragraph + text + inlineWidget + text', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>yyy</paragraph>xxx<inlineWidget></inlineWidget>zzz' );

					expect( getData( model ) ).to.equal(
						'<paragraph>fyyy</paragraph><paragraph>xxx</paragraph>' +
						'<paragraph><inlineWidget></inlineWidget></paragraph>' +
						'<paragraph>zzz[]oo</paragraph>'
					);

					expect( stringify( root, affectedRange ) ).to.equal(
						'<paragraph>f[yyy</paragraph><paragraph>xxx</paragraph>' +
						'<paragraph><inlineWidget></inlineWidget></paragraph>' +
						'<paragraph>zzz]oo</paragraph>'
					);
				} );

				it( 'inserts paragraph + text + paragraph', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>yyy</paragraph>xxx<paragraph>zzz</paragraph>' );

					expect( getData( model ) ).to.equal(
						'<paragraph>fyyy</paragraph><paragraph>xxx</paragraph><paragraph>zzz[]oo</paragraph>'
					);

					expect( stringify( root, affectedRange ) ).to.equal(
						'<paragraph>f[yyy</paragraph><paragraph>xxx</paragraph><paragraph>zzz]oo</paragraph>'
					);
				} );

				it( 'inserts paragraph + text (at the beginning)', () => {
					setData( model, '<paragraph>[]foo</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>yyy</paragraph>xxx' );

					expect( getData( model ) ).to.equal( '<paragraph>yyy</paragraph><paragraph>xxx[]foo</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '[<paragraph>yyy</paragraph><paragraph>xxx]foo</paragraph>' );
				} );

				it( 'inserts paragraph + text (at the end)', () => {
					setData( model, '<paragraph>foo[]</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>yyy</paragraph>xxx' );

					expect( getData( model ) ).to.equal( '<paragraph>fooyyy</paragraph><paragraph>xxx[]</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>foo[yyy</paragraph><paragraph>xxx</paragraph>]' );
				} );

				it( 'inserts text + heading', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( 'xxx<heading1>yyy</heading1>' );

					expect( getData( model ) ).to.equal( '<paragraph>fxxx</paragraph><heading1>yyy[]oo</heading1>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>f[xxx</paragraph><heading1>yyy]oo</heading1>' );
				} );

				it( 'inserts paragraph + object', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>xxx</paragraph><blockWidget></blockWidget>' );

					expect( getData( model ) ).to.equal(
						'<paragraph>fxxx</paragraph>[<blockWidget></blockWidget>]<paragraph>oo</paragraph>'
					);

					expect( stringify( root, affectedRange ) ).to.equal(
						'<paragraph>f[xxx</paragraph><blockWidget></blockWidget><paragraph>]oo</paragraph>'
					);
				} );

				it( 'inserts object + paragraph', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<blockWidget></blockWidget><paragraph>xxx</paragraph>' );

					expect( getData( model ) ).to.equal(
						'<paragraph>f</paragraph><blockWidget></blockWidget><paragraph>xxx[]oo</paragraph>'
					);

					expect( stringify( root, affectedRange ) ).to.equal(
						'<paragraph>f[</paragraph><blockWidget></blockWidget><paragraph>xxx]oo</paragraph>'
					);
				} );

				it( 'inserts object + text', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<blockWidget></blockWidget>xxx' );

					expect( getData( model ) ).to.equal(
						'<paragraph>f</paragraph><blockWidget></blockWidget><paragraph>xxx[]oo</paragraph>'
					);

					expect( stringify( root, affectedRange ) ).to.equal(
						'<paragraph>f[</paragraph><blockWidget></blockWidget><paragraph>xxx]oo</paragraph>'
					);
				} );

				it( 'inserts object + text (at the beginning)', () => {
					setData( model, '<paragraph>[]foo</paragraph>' );
					const affectedRange = insertHelper( '<blockWidget></blockWidget>xxx' );

					expect( getData( model ) ).to.equal(
						'<blockWidget></blockWidget><paragraph>xxx[]foo</paragraph>'
					);

					expect( stringify( root, affectedRange ) ).to.equal(
						'[<blockWidget></blockWidget><paragraph>xxx]foo</paragraph>'
					);
				} );

				it( 'inserts object + text (at the end)', () => {
					setData( model, '<paragraph>foo[]</paragraph>' );
					const affectedRange = insertHelper( '<blockWidget></blockWidget>xxx' );

					expect( getData( model ) ).to.equal(
						'<paragraph>foo</paragraph><blockWidget></blockWidget><paragraph>xxx[]</paragraph>'
					);

					expect( stringify( root, affectedRange ) ).to.equal(
						'<paragraph>foo</paragraph>[<blockWidget></blockWidget><paragraph>xxx</paragraph>]'
					);
				} );

				it( 'inserts text + object (at the end)', () => {
					setData( model, '<paragraph>foo[]</paragraph>' );
					const affectedRange = insertHelper( 'xxx<blockWidget></blockWidget>' );

					expect( getData( model ) ).to.equal(
						'<paragraph>fooxxx</paragraph>[<blockWidget></blockWidget>]'
					);

					expect( stringify( root, affectedRange ) ).to.equal(
						'<paragraph>foo[xxx</paragraph><blockWidget></blockWidget>]'
					);
				} );
			} );

			describe( 'content over a block object', () => {
				it( 'inserts text', () => {
					setData( model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>' );
					const affectedRange = insertHelper( 'xxx' );

					expect( getData( model ) ).to.equal(
						'<paragraph>foo</paragraph><paragraph>xxx[]</paragraph><paragraph>bar</paragraph>'
					);

					expect( stringify( root, affectedRange ) ).to.equal(
						'<paragraph>foo</paragraph>[<paragraph>xxx</paragraph>]<paragraph>bar</paragraph>'
					);
				} );

				it( 'inserts paragraph', () => {
					setData( model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>xxx</paragraph>' );

					expect( getData( model ) )
						.to.equal( '<paragraph>foo</paragraph><paragraph>xxx[]</paragraph><paragraph>bar</paragraph>' );

					expect( stringify( root, affectedRange ) )
						.to.equal( '<paragraph>foo</paragraph>[<paragraph>xxx</paragraph>]<paragraph>bar</paragraph>' );
				} );

				it( 'inserts text + paragraph', () => {
					setData( model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>' );
					const affectedRange = insertHelper( 'yyy<paragraph>xxx</paragraph>' );

					expect( getData( model ) ).to.equal(
						'<paragraph>foo</paragraph><paragraph>yyy</paragraph><paragraph>xxx[]</paragraph><paragraph>bar</paragraph>'
					);

					expect( stringify( root, affectedRange ) ).to.equal(
						'<paragraph>foo</paragraph>[<paragraph>yyy</paragraph><paragraph>xxx</paragraph>]<paragraph>bar</paragraph>'
					);
				} );

				it( 'inserts two blocks', () => {
					setData( model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>' );
					const affectedRange = insertHelper( '<heading1>xxx</heading1><paragraph>yyy</paragraph>' );

					expect( getData( model ) ).to.equal(
						'<paragraph>foo</paragraph><heading1>xxx</heading1><paragraph>yyy[]</paragraph><paragraph>bar</paragraph>'
					);

					expect( stringify( root, affectedRange ) ).to.equal(
						'<paragraph>foo</paragraph>[<heading1>xxx</heading1><paragraph>yyy</paragraph>]<paragraph>bar</paragraph>'
					);
				} );

				it( 'inserts block object', () => {
					setData( model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>' );
					const affectedRange = insertHelper( '<blockWidget></blockWidget>' );

					// It's enough, don't worry.
					expect( getData( model ) ).to.equal(
						'<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>'
					);

					expect( stringify( root, affectedRange ) ).to.equal(
						'<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>'
					);
				} );

				it( 'inserts inline object', () => {
					setData( model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>' );
					const affectedRange = insertHelper( '<inlineWidget></inlineWidget>' );

					expect( getData( model ) ).to.equal(
						'<paragraph>foo</paragraph><paragraph><inlineWidget></inlineWidget>[]</paragraph><paragraph>bar</paragraph>'
					);

					expect( stringify( root, affectedRange ) ).to.equal(
						'<paragraph>foo</paragraph>[<paragraph><inlineWidget></inlineWidget></paragraph>]<paragraph>bar</paragraph>'
					);
				} );
			} );

			describe( 'content over an inline object', () => {
				it( 'inserts text', () => {
					setData( model, '<paragraph>foo[<inlineWidget></inlineWidget>]bar</paragraph>' );
					const affectedRange = insertHelper( 'xxx' );

					expect( getData( model ) ).to.equal( '<paragraph>fooxxx[]bar</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>foo[xxx]bar</paragraph>' );
				} );

				it( 'inserts paragraph', () => {
					setData( model, '<paragraph>foo[<inlineWidget></inlineWidget>]bar</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>xxx</paragraph>' );

					expect( getData( model ) ).to.equal( '<paragraph>fooxxx[]bar</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>foo[xxx]bar</paragraph>' );
				} );

				it( 'inserts text + paragraph', () => {
					setData( model, '<paragraph>foo[<inlineWidget></inlineWidget>]bar</paragraph>' );
					const affectedRange = insertHelper( 'yyy<paragraph>xxx</paragraph>' );

					expect( getData( model ) ).to.equal( '<paragraph>fooyyy</paragraph><paragraph>xxx[]bar</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>foo[yyy</paragraph><paragraph>xxx]bar</paragraph>' );
				} );

				it( 'inserts two blocks', () => {
					setData( model, '<paragraph>foo[<inlineWidget></inlineWidget>]bar</paragraph>' );
					const affectedRange = insertHelper( '<heading1>xxx</heading1><paragraph>yyy</paragraph>' );

					expect( getData( model ) ).to.equal( '<paragraph>fooxxx</paragraph><paragraph>yyy[]bar</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>foo[xxx</paragraph><paragraph>yyy]bar</paragraph>' );
				} );

				it( 'inserts inline object', () => {
					setData( model, '<paragraph>foo[<inlineWidget></inlineWidget>]bar</paragraph>' );
					const affectedRange = insertHelper( '<inlineWidget></inlineWidget>' );

					expect( getData( model ) ).to.equal( '<paragraph>foo<inlineWidget></inlineWidget>[]bar</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>foo[<inlineWidget></inlineWidget>]bar</paragraph>' );
				} );

				it( 'inserts block object', () => {
					setData( model, '<paragraph>foo[<inlineWidget></inlineWidget>]bar</paragraph>' );
					const affectedRange = insertHelper( '<blockWidget></blockWidget>' );

					expect( getData( model ) ).to.equal(
						'<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>'
					);

					expect( stringify( root, affectedRange ) ).to.equal(
						'<paragraph>foo[</paragraph><blockWidget></blockWidget><paragraph>]bar</paragraph>'
					);
				} );
			} );
		} );

		describe( 'filtering out', () => {
			beforeEach( () => {
				model = new Model();
				doc = model.document;
				root = doc.createRoot();

				const schema = model.schema;

				schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				schema.register( 'heading1', { inheritAllFrom: '$block' } );
				schema.register( 'element', { inheritAllFrom: '$block' } );

				schema.register( 'table' );
				schema.register( 'td' );
				schema.register( 'disallowedWidget', {
					isObject: true
				} );

				schema.extend( 'table', { allowIn: '$clipboardHolder' } );
				schema.extend( 'td', { allowIn: '$clipboardHolder' } );
				schema.extend( 'td', { allowIn: 'table' } );
				schema.extend( 'element', { allowIn: 'td' } );
				schema.extend( '$block', { allowIn: 'td' } );
				schema.extend( '$text', { allowIn: 'td' } );
				schema.extend( 'table', { allowIn: 'element' } );

				schema.extend( 'disallowedWidget', { allowIn: '$clipboardHolder' } );
				schema.extend( '$text', { allowIn: 'disallowedWidget' } );

				schema.extend( 'element', { allowIn: 'paragraph' } );
				schema.extend( 'element', { allowIn: 'heading1' } );

				schema.addAttributeCheck( ( ctx, attributeName ) => {
					// Allow 'b' on paragraph>$text.
					if ( ctx.endsWith( 'paragraph $text' ) && attributeName == 'b' ) {
						return true;
					}

					// Allow 'b' on paragraph>element>$text.
					if ( ctx.endsWith( 'paragraph element $text' ) && attributeName == 'b' ) {
						return true;
					}

					// Allow 'a' and 'b' on heading1>element>$text.
					if ( ctx.endsWith( 'heading1 element $text' ) && [ 'a', 'b' ].includes( attributeName ) ) {
						return true;
					}

					// Allow 'b' on element>table>td>$text.
					if ( ctx.endsWith( 'element table td $text' ) && attributeName == 'b' ) {
						return true;
					}
				} );
			} );

			it( 'filters out disallowed elements and leaves out the text', () => {
				setData( model, '<paragraph>f[]oo</paragraph>' );
				const affectedRange = insertHelper( '<table><td>xxx</td><td>yyy</td></table>' );

				expect( getData( model ) ).to.equal( '<paragraph>fxxxyyy[]oo</paragraph>' );
				expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>f[xxxyyy]oo</paragraph>' );
			} );

			it( 'filters out disallowed elements and leaves out the paragraphs', () => {
				setData( model, '<paragraph>f[]oo</paragraph>' );
				const affectedRange = insertHelper(
					'<table><td><paragraph>xxx</paragraph><paragraph>yyy</paragraph><paragraph>zzz</paragraph></td></table>'
				);

				expect( getData( model ) )
					.to.equal( '<paragraph>fxxx</paragraph><paragraph>yyy</paragraph><paragraph>zzz[]oo</paragraph>' );

				expect( stringify( root, affectedRange ) )
					.to.equal( '<paragraph>f[xxx</paragraph><paragraph>yyy</paragraph><paragraph>zzz]oo</paragraph>' );
			} );

			it( 'filters out disallowed objects', () => {
				setData( model, '<paragraph>f[]oo</paragraph>' );
				const affectedRange = insertHelper( '<disallowedWidget>xxx</disallowedWidget>' );

				expect( getData( model ) ).to.equal( '<paragraph>f[]oo</paragraph>' );
				expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>f[]oo</paragraph>' );
			} );

			it( 'filters out disallowed attributes when inserting text', () => {
				setData( model, '<paragraph>f[]oo</paragraph>' );
				const affectedRange = insertHelper( 'x<$text a="1" b="1">x</$text>xy<$text a="1">y</$text>y' );

				expect( getData( model ) ).to.equal( '<paragraph>fx<$text b="1">x</$text>xyyy[]oo</paragraph>' );
				expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>f[x<$text b="1">x</$text>xyyy]oo</paragraph>' );
			} );

			it( 'filters out disallowed attributes when inserting nested elements', () => {
				setData( model, '<element>[]</element>' );
				const affectedRange = insertHelper( '<table><td>f<$text a="1" b="1" c="1">o</$text>o</td></table>' );

				expect( getData( model ) )
					.to.equal( '<element><table><td>f<$text b="1">o</$text>o</td></table>[]</element>' );

				expect( stringify( root, affectedRange ) )
					.to.equal( '<element>[<table><td>f<$text b="1">o</$text>o</td></table>]</element>' );
			} );

			it( 'filters out disallowed attributes when inserting text in disallowed elements', () => {
				setData( model, '<paragraph>f[]oo</paragraph>' );
				const affectedRange = insertHelper(
					'<table><td>x<$text a="1" b="1">x</$text>x</td><td>y<$text a="1">y</$text>y</td></table>'
				);

				expect( getData( model ) ).to.equal( '<paragraph>fx<$text b="1">x</$text>xyyy[]oo</paragraph>' );
				expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>f[x<$text b="1">x</$text>xyyy]oo</paragraph>' );
			} );

			it( 'filters out disallowed attributes when merging #1', () => {
				setData( model, '<paragraph>[]foo</paragraph>' );
				const affectedRange = insertHelper( '<paragraph>x<$text a="1" b="1">x</$text>x</paragraph>' );

				expect( getData( model ) ).to.equal( '<paragraph>x<$text b="1">x</$text>x[]foo</paragraph>' );
				expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>[x<$text b="1">x</$text>x]foo</paragraph>' );
			} );

			it( 'filters out disallowed attributes when merging #2', () => {
				setData( model, '<paragraph>f[]oo</paragraph>' );
				const affectedRange = insertHelper( '<paragraph>x<$text a="1" b="1">x</$text>x</paragraph>' );

				expect( getData( model ) ).to.equal( '<paragraph>fx<$text b="1">x</$text>x[]oo</paragraph>' );
				expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>f[x<$text b="1">x</$text>x]oo</paragraph>' );
			} );

			it( 'filters out disallowed attributes when merging #3', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );
				const affectedRange = insertHelper( '<paragraph>x<$text a="1" b="1">x</$text>x</paragraph>' );

				expect( getData( model ) ).to.equal( '<paragraph>foox<$text b="1">x</$text>x[]</paragraph>' );
				expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>foo[x<$text b="1">x</$text>x]</paragraph>' );
			} );

			it( 'filters out disallowed attributes from nested nodes when merging', () => {
				setData( model, '<paragraph>f[]oo</paragraph>' );
				const affectedRange = insertHelper( '<heading1>x<element>b<$text a="1" b="1">a</$text>r</element>x</heading1>' );

				expect( getData( model ) )
					.to.equal( '<paragraph>fx<element>b<$text b="1">a</$text>r</element>x[]oo</paragraph>' );

				expect( stringify( root, affectedRange ) )
					.to.equal( '<paragraph>f[x<element>b<$text b="1">a</$text>r</element>x]oo</paragraph>' );
			} );

			it( 'filters out disallowed attributes when autoparagraphing', () => {
				setData( model, '<paragraph>f[]oo</paragraph>' );
				const affectedRange = insertHelper( '<paragraph>xxx</paragraph><$text a="1" b="1">yyy</$text>' );

				expect( getData( model ) )
					.to.equal( '<paragraph>fxxx</paragraph><paragraph><$text b="1">yyy[]</$text>oo</paragraph>' );

				expect( stringify( root, affectedRange ) )
					.to.equal( '<paragraph>f[xxx</paragraph><paragraph><$text b="1">yyy</$text>]oo</paragraph>' );
			} );
		} );
	} );

	describe( 'integration with limit elements', () => {
		beforeEach( () => {
			model = new Model();
			doc = model.document;
			root = doc.createRoot();

			const schema = model.schema;

			schema.register( 'limit', {
				isLimit: true
			} );
			schema.extend( 'limit', { allowIn: '$root' } );
			schema.extend( '$text', { allowIn: 'limit' } );

			schema.register( 'disallowedElement' );
			schema.extend( 'disallowedElement', { allowIn: '$clipboardHolder' } );

			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		} );

		it( 'should insert limit element', () => {
			const affectedRange = insertHelper( '<limit></limit>' );

			expect( getData( model ) ).to.equal( '<limit>[]</limit>' );
			expect( stringify( root, affectedRange ) ).to.equal( '[<limit></limit>]' );
		} );

		it( 'should insert text into limit element', () => {
			setData( model, '<limit>[]</limit>' );
			const affectedRange = insertHelper( 'foo bar' );

			expect( getData( model ) ).to.equal( '<limit>foo bar[]</limit>' );
			expect( stringify( root, affectedRange ) ).to.equal( '<limit>[foo bar]</limit>' );
		} );

		it( 'should insert text into limit element when selection spans over many limit elements', () => {
			let affectedRange;

			model.enqueueChange( 'transparent', () => {
				setData( model, '<limit>foo[</limit><limit>]bar</limit>' );
				affectedRange = insertHelper( 'baz' );
			} );

			expect( getData( model ) ).to.equal( '<limit>foobaz[]</limit><limit>bar</limit>' );
			expect( stringify( root, affectedRange ) ).to.equal( '<limit>foo[baz]</limit><limit>bar</limit>' );
		} );

		it( 'should not insert disallowed elements inside limit elements', () => {
			setData( model, '<limit>[]</limit>' );
			const affectedRange = insertHelper( '<disallowedElement></disallowedElement>' );

			expect( getData( model ) ).to.equal( '<limit>[]</limit>' );
			expect( stringify( root, affectedRange ) ).to.equal( '<limit>[]</limit>' );
		} );

		it( 'should not leave the limit element when inserting at the end', () => {
			setData( model, '<limit>foo[]</limit>' );
			const affectedRange = insertHelper( '<paragraph>a</paragraph><paragraph>b</paragraph>' );

			expect( getData( model ) ).to.equal( '<limit>fooab[]</limit>' );
			expect( stringify( root, affectedRange ) ).to.equal( '<limit>foo[ab]</limit>' );
		} );

		it( 'should not leave the limit element when inserting at the beginning', () => {
			setData( model, '<limit>[]foo</limit>' );
			const affectedRange = insertHelper( '<paragraph>a</paragraph><paragraph>b</paragraph>' );

			expect( getData( model ) ).to.equal( '<limit>ab[]foo</limit>' );
			expect( stringify( root, affectedRange ) ).to.equal( '<limit>[ab]foo</limit>' );
		} );

		describe( 'when allowed element is above limit element in document tree', () => {
			// $root > table > tableRow > tableCell > paragraph
			// After inserting new table ( allowed in root ), empty paragraph shouldn't be removed from current tableCell.
			beforeEach( () => {
				const schema = model.schema;

				schema.register( 'wrapper', {
					isLimit: true,
					isBlock: true,
					isObject: true,
					allowWhere: '$block'
				} );

				schema.extend( 'paragraph', { allowIn: 'limit' } );
				schema.extend( 'limit', { allowIn: 'wrapper' } );
			} );

			it( 'should not remove empty elements when not-allowed element is paste', () => {
				setData( model, '<wrapper><limit><paragraph>[]</paragraph></limit></wrapper>' );

				// Pasted content is forbidden in current selection.
				const affectedRange = insertHelper( '<wrapper><limit><paragraph>foo</paragraph></limit></wrapper>' );

				expect( getData( model ) ).to.equal( '<wrapper><limit>[]<paragraph></paragraph></limit></wrapper>' );
				expect( stringify( root, affectedRange ) ).to.equal( '<wrapper><limit>[]<paragraph></paragraph></limit></wrapper>' );
			} );

			it( 'should correctly paste allowed nodes', () => {
				setData( model, '<wrapper><limit><paragraph>[]</paragraph></limit></wrapper>' );

				const affectedRange = insertHelper( '<paragraph>foo</paragraph>' );

				expect( getData( model ) ).to.equal( '<wrapper><limit><paragraph>foo</paragraph>[]</limit></wrapper>' );
				expect( stringify( root, affectedRange ) ).to.equal( '<wrapper><limit>[<paragraph>foo</paragraph>]</limit></wrapper>' );
			} );
		} );
	} );

	// Helper function that parses given content and inserts it at the cursor position.
	//
	// @param {module:engine/model/item~Item|String} content
	// @returns {module:engine/model/range~Range} range
	function insertHelper( content ) {
		if ( typeof content == 'string' ) {
			content = parse( content, model.schema, {
				context: [ '$clipboardHolder' ]
			} );
		}

		return insertContent( model, content );
	}
} );

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Model } from '../../../src/model/model.js';
import { insertContent } from '../../../src/model/utils/insertcontent.js';
import { ModelDocumentFragment } from '../../../src/model/documentfragment.js';
import { ModelText } from '../../../src/model/text.js';
import { ModelElement } from '../../../src/model/element.js';
import { ModelPosition } from '../../../src/model/position.js';

import { _setModelData, _getModelData, _parseModel, _stringifyModel } from '../../../src/dev-utils/model.js';
import { ModelRange } from '../../../src/model/range.js';
import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'DataController utils', () => {
	let model, doc, root;

	testUtils.createSinonSandbox();

	describe( 'insertContent', () => {
		beforeEach( () => {
			model = new Model();
			doc = model.document;
			root = doc.createRoot();
		} );

		it( 'should use parent batch', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );
			_setModelData( model, 'x[]x' );

			model.change( writer => {
				insertContent( model, writer.createText( 'a' ) );
				expect( writer.batch.operations.filter( operation => operation.isDocumentOperation ) ).to.length( 1 );
			} );
		} );

		it( 'should be able to insert content at custom selection', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );
			_setModelData( model, 'a[]bc' );

			const selection = model.createSelection( model.createPositionFromPath( doc.getRoot(), [ 2 ] ) );

			model.change( writer => {
				const affectedRange = insertContent( model, writer.createText( 'x' ), selection );

				expect( _getModelData( model ) ).to.equal( 'a[]bxc' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( 'ab[x]c' );
			} );
		} );

		it( 'should modify passed selection instance', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );
			_setModelData( model, 'a[]bc' );

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

		it( 'should be able to insert content at model selection if document selection is passed', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );
			_setModelData( model, 'a[]bc' );

			model.change( writer => {
				const affectedRange = insertContent( model, writer.createText( 'x' ), model.document.selection );

				expect( _getModelData( model ) ).to.equal( 'ax[]bc' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( 'a[x]bc' );
			} );
		} );

		it( 'should be able to insert content at model selection if none passed', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );
			_setModelData( model, 'a[]bc' );

			model.change( writer => {
				const affectedRange = insertContent( model, writer.createText( 'x' ) );

				expect( _getModelData( model ) ).to.equal( 'ax[]bc' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( 'a[x]bc' );
			} );
		} );

		it( 'accepts ModelDocumentFragment', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );

			_setModelData( model, 'x[]x' );

			insertContent( model, new ModelDocumentFragment( [ new ModelText( 'a' ) ] ) );

			expect( _getModelData( model ) ).to.equal( 'xa[]x' );
		} );

		it( 'accepts Text', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );

			_setModelData( model, 'x[]x' );

			insertContent( model, new ModelText( 'a' ) );

			expect( _getModelData( model ) ).to.equal( 'xa[]x' );
		} );

		it( 'should save the reference to the original object', () => {
			const content = new ModelElement( 'imageBlock' );

			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			model.schema.register( 'imageBlock', {
				allowWhere: '$text',
				isObject: true
			} );

			_setModelData( model, '<paragraph>foo[]</paragraph>' );

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

			_setModelData( model, '<paragraph>[fo]o</paragraph>' );

			insertHelper( 'xyz' );

			expect( _getModelData( model ) ).to.equal( '<paragraph>fooxyz[]</paragraph>' );
		} );

		it( 'should group multiple node inserts', () => {
			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			_setModelData( model, '<paragraph>f[]oo</paragraph>' );
			const affectedRange = insertHelper(
				'<paragraph>abc</paragraph>' +
				'<paragraph>def</paragraph>' +
				'<paragraph>ghi</paragraph>' +
				'<paragraph>jkl</paragraph>'
			);

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>fabc</paragraph>' +
				'<paragraph>def</paragraph>' +
				'<paragraph>ghi</paragraph>' +
				'<paragraph>jkl[]oo</paragraph>'
			);
			expect( _stringifyModel( root, affectedRange ) ).to.equal(
				'<paragraph>f[abc</paragraph>' +
				'<paragraph>def</paragraph>' +
				'<paragraph>ghi</paragraph>' +
				'<paragraph>jkl]oo</paragraph>'
			);

			const batch = model.document.history.getOperation( model.document.version - 1 ).batch;
			const operations = batch.operations.filter( operation => operation.isDocumentOperation );

			expect( operations.length ).to.equal( 5 );

			expect( operations[ 0 ].type ).to.equal( 'split' );
			expect( operations[ 0 ].splitPosition.path ).to.deep.equal( [ 0, 1 ] );

			// First node should always be inserted by a separate operation (to avoid operation transformation
			// on multiple nodes on undoing (insert + merge).
			expect( operations[ 1 ].type ).to.equal( 'insert' );
			expect( operations[ 1 ].position.path ).to.deep.equal( [ 1 ] );
			expect( operations[ 1 ].nodes.length ).to.equal( 1 );

			expect( operations[ 2 ].type ).to.equal( 'merge' );
			expect( operations[ 2 ].targetPosition.path ).to.deep.equal( [ 0, 1 ] );

			expect( operations[ 3 ].type ).to.equal( 'insert' );
			expect( operations[ 3 ].position.path ).to.deep.equal( [ 1 ] );
			expect( operations[ 3 ].nodes.length ).to.equal( 3 );

			expect( operations[ 4 ].type ).to.equal( 'merge' );
			expect( operations[ 4 ].targetPosition.path ).to.deep.equal( [ 3, 3 ] );
		} );

		describe( 'in simple scenarios', () => {
			beforeEach( () => {
				model = new Model();
				doc = model.document;
				root = doc.createRoot();

				const schema = model.schema;

				schema.register( 'imageBlock', {
					allowWhere: '$text',
					isObject: true
				} );
				schema.register( 'disallowedElement' );

				schema.extend( '$text', { allowIn: '$root' } );
				schema.extend( 'imageBlock', { allowIn: '$root' } );
				// Otherwise it won't be passed to the temporary model fragment used inside insert().
				schema.extend( 'disallowedElement', { allowIn: '$clipboardHolder' } );
				schema.extend( '$text', {
					allowIn: 'disallowedElement',
					allowAttributes: [ 'bold', 'italic' ]
				} );
			} );

			it( 'inserts one text node', () => {
				_setModelData( model, 'f[]oo' );
				const affectedRange = insertHelper( 'xyz' );

				expect( _getModelData( model ) ).to.equal( 'fxyz[]oo' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( 'f[xyz]oo' );
			} );

			it( 'inserts one text node (at the end)', () => {
				_setModelData( model, 'foo[]' );
				const affectedRange = insertHelper( 'xyz' );

				expect( _getModelData( model ) ).to.equal( 'fooxyz[]' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( 'foo[xyz]' );
			} );

			it( 'inserts one text node with attribute', () => {
				_setModelData( model, 'f[]oo' );
				const affectedRange = insertHelper( '<$text bold="true">xyz</$text>' );

				expect( _getModelData( model ) ).to.equal( 'f<$text bold="true">xyz[]</$text>oo' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( 'f[<$text bold="true">xyz</$text>]oo' );

				expect( doc.selection.getAttribute( 'bold' ) ).to.be.true;
			} );

			it( 'inserts one text node with attribute into text with a different attribute', () => {
				_setModelData( model, '<$text bold="true">f[]oo</$text>' );
				const affectedRange = insertHelper( '<$text italic="true">xyz</$text>' );

				expect( _getModelData( model ) )
					.to.equal( '<$text bold="true">f</$text><$text italic="true">xyz[]</$text><$text bold="true">oo</$text>' );

				expect( _stringifyModel( root, affectedRange ) )
					.to.equal( '<$text bold="true">f</$text>[<$text italic="true">xyz</$text>]<$text bold="true">oo</$text>' );

				expect( doc.selection.getAttribute( 'italic' ) ).to.be.true;
				expect( doc.selection.hasAttribute( 'bold' ) ).to.be.false;
			} );

			it( 'inserts one text node with attribute into text with the same attribute', () => {
				_setModelData( model, '<$text bold="true">f[]oo</$text>' );
				const affectedRange = insertHelper( '<$text bold="true">xyz</$text>' );

				expect( _getModelData( model ) ).to.equal( '<$text bold="true">fxyz[]oo</$text>' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( '<$text bold="true">f[xyz]oo</$text>' );

				expect( doc.selection.getAttribute( 'bold' ) ).to.be.true;
			} );

			it( 'inserts a text without attributes into a text with an attribute', () => {
				_setModelData( model, '<$text bold="true">f[]oo</$text>' );
				const affectedRange = insertHelper( 'xyz' );

				expect( _getModelData( model ) ).to.equal( '<$text bold="true">f</$text>xyz[]<$text bold="true">oo</$text>' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal(
					'<$text bold="true">f</$text>[xyz]<$text bold="true">oo</$text>'
				);

				expect( doc.selection.hasAttribute( 'bold' ) ).to.be.false;
			} );

			it( 'inserts an element', () => {
				_setModelData( model, 'f[]oo' );
				const affectedRange = insertHelper( '<imageBlock></imageBlock>' );

				expect( _getModelData( model ) ).to.equal( 'f<imageBlock></imageBlock>[]oo' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( 'f[<imageBlock></imageBlock>]oo' );
			} );

			it( 'inserts a text and an element', () => {
				_setModelData( model, 'f[]oo' );
				const affectedRange = insertHelper( 'xyz<imageBlock></imageBlock>' );

				expect( _getModelData( model ) ).to.equal( 'fxyz<imageBlock></imageBlock>[]oo' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( 'f[xyz<imageBlock></imageBlock>]oo' );
			} );

			it( 'strips a disallowed element', () => {
				_setModelData( model, 'f[]oo' );
				const affectedRange = insertHelper( '<disallowedElement>xyz</disallowedElement>' );

				expect( _getModelData( model ) ).to.equal( 'fxyz[]oo' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( 'f[xyz]oo' );
			} );

			it( 'deletes selection before inserting the content', () => {
				_setModelData( model, 'f[abc]oo' );
				const affectedRange = insertHelper( 'x' );

				expect( _getModelData( model ) ).to.equal( 'fx[]oo' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( 'f[x]oo' );
			} );

			describe( 'spaces handling', () => {
				// Note: spaces in the view are not encoded like in the DOM, so subsequent spaces must be
				// inserted into the model as is. The conversion to nbsps happen on view<=>DOM conversion.

				it( 'inserts one space', () => {
					_setModelData( model, 'f[]oo' );
					insertHelper( new ModelText( ' ' ) );
					expect( _getModelData( model ) ).to.equal( 'f []oo' );
				} );

				it( 'inserts three spaces', () => {
					_setModelData( model, 'f[]oo' );
					insertHelper( new ModelText( '   ' ) );
					expect( _getModelData( model ) ).to.equal( 'f   []oo' );
				} );

				it( 'inserts spaces at the end', () => {
					_setModelData( model, 'foo[]' );
					insertHelper( new ModelText( '   ' ) );
					expect( _getModelData( model ) ).to.equal( 'foo   []' );
				} );

				it( 'inserts one nbsp', () => {
					_setModelData( model, 'f[]oo' );
					insertHelper( new ModelText( '\u200a' ) );
					expect( _getModelData( model ) ).to.equal( 'f\u200a[]oo' );
				} );

				it( 'inserts word surrounded by spaces', () => {
					_setModelData( model, 'f[]oo' );
					insertHelper( new ModelText( ' xyz  ' ) );
					expect( _getModelData( model ) ).to.equal( 'f xyz  []oo' );
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
				schema.extend( '$text', { allowAttributes: 'foo' } );
			} );

			it( 'inserts one text node', () => {
				_setModelData( model, '<paragraph>f[]oo</paragraph>' );
				const affectedRange = insertHelper( 'xyz' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>fxyz[]oo</paragraph>' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>f[xyz]oo</paragraph>' );
			} );

			it( 'inserts one text node to fully selected paragraph', () => {
				_setModelData( model, '<paragraph>[foo]</paragraph>' );
				const affectedRange = insertHelper( 'xyz' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>xyz[]</paragraph>' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>[xyz]</paragraph>' );
			} );

			it( 'inserts one text node to fully selected paragraphs (from outside)', () => {
				_setModelData( model, '[<paragraph>foo</paragraph><paragraph>bar</paragraph>]' );
				const affectedRange = insertHelper( 'xyz' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>xyz[]</paragraph>' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>[xyz]</paragraph>' );
			} );

			it( 'merges two blocks before inserting content (p+p)', () => {
				_setModelData( model, '<paragraph>fo[o</paragraph><paragraph>b]ar</paragraph>' );
				const affectedRange = insertHelper( 'xyz' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>foxyz[]ar</paragraph>' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>fo[xyz]ar</paragraph>' );
			} );

			it( 'inserts inline widget and text', () => {
				_setModelData( model, '<paragraph>f[]oo</paragraph>' );
				const affectedRange = insertHelper( 'xyz<inlineWidget></inlineWidget>' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>fxyz<inlineWidget></inlineWidget>[]oo</paragraph>' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>f[xyz<inlineWidget></inlineWidget>]oo</paragraph>' );
			} );

			// Note: In CKEditor 4 the blocks are not merged, but to KISS we're merging here
			// because that's what deleteContent() does.
			it( 'merges two blocks before inserting content (h+p)', () => {
				_setModelData( model, '<heading1>fo[o</heading1><paragraph>b]ar</paragraph>' );
				const affectedRange = insertHelper( 'xyz' );

				expect( _getModelData( model ) ).to.equal( '<heading1>foxyz[]ar</heading1>' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( '<heading1>fo[xyz]ar</heading1>' );
			} );

			it( 'should split and auto-paragraph if needed', () => {
				model.schema.register( 'widgetContainer', {
					allowWhere: '$block'
				} );
				model.schema.extend( 'blockWidget', {
					allowIn: 'widgetContainer'
				} );

				_setModelData( model, '<widgetContainer><blockWidget></blockWidget>[<blockWidget></blockWidget>]</widgetContainer>' );

				const affectedRange = insertHelper( 'abc', null, [ 0, 1 ] );

				expect( _getModelData( model ) ).to.equal(
					'<widgetContainer><blockWidget></blockWidget></widgetContainer>' +
					'<paragraph>abc</paragraph>' +
					'<widgetContainer>[<blockWidget></blockWidget>]</widgetContainer>'
				);
				expect( _stringifyModel( root, affectedRange ) ).to.equal(
					'<widgetContainer><blockWidget></blockWidget>[</widgetContainer>' +
					'<paragraph>abc</paragraph>' +
					'<widgetContainer>]<blockWidget></blockWidget></widgetContainer>'
				);
			} );

			it( 'should split and auto-paragraph multiple levels if needed', () => {
				model.schema.register( 'blockContainer', {
					allowIn: '$root',
					allowChildren: '$block'
				} );
				model.schema.register( 'outerContainer', {
					allowWhere: '$block'
				} );
				model.schema.register( 'widgetContainer', {
					allowIn: 'outerContainer'
				} );
				model.schema.extend( 'blockWidget', {
					allowIn: 'widgetContainer'
				} );

				_setModelData( model,
					'<blockContainer>' +
						'<outerContainer>' +
							'<widgetContainer>' +
								'<blockWidget></blockWidget>' +
								'[<blockWidget></blockWidget>]' +
							'</widgetContainer>' +
						'</outerContainer>' +
					'</blockContainer>'
				);

				const affectedRange = insertHelper( 'abc', null, [ 0, 0, 0, 1 ] );

				expect( _getModelData( model ) ).to.equal(
					'<blockContainer>' +
						'<outerContainer>' +
							'<widgetContainer>' +
								'<blockWidget></blockWidget>' +
							'</widgetContainer>' +
						'</outerContainer>' +
						'<paragraph>abc</paragraph>' +
						'<outerContainer>' +
							'<widgetContainer>' +
								'[<blockWidget></blockWidget>]' +
							'</widgetContainer>' +
						'</outerContainer>' +
					'</blockContainer>'
				);
				expect( _stringifyModel( root, affectedRange ) ).to.equal(
					'<blockContainer>' +
						'<outerContainer>' +
							'<widgetContainer>' +
								'<blockWidget></blockWidget>' +
							'[</widgetContainer>' +
						'</outerContainer>' +
						'<paragraph>abc</paragraph>' +
						'<outerContainer>' +
							'<widgetContainer>]' +
								'<blockWidget></blockWidget>' +
							'</widgetContainer>' +
						'</outerContainer>' +
					'</blockContainer>'
				);
			} );

			it( 'not insert autoparagraph when paragraph is disallowed at the current position', () => {
				// Disallow paragraph in $root.
				model.schema.addChildCheck( ( ctx, childDef ) => {
					if ( childDef.name == 'paragraph' && ctx.endsWith( '$root' ) ) {
						return false;
					}
				} );

				const content = new ModelDocumentFragment( [
					new ModelElement( 'heading1', [], [ new ModelText( 'bar' ) ] ),
					new ModelText( 'biz' )
				] );

				_setModelData( model, '[<heading2>foo</heading2>]' );
				const affectedRange = insertContent( model, content );

				expect( _getModelData( model ) ).to.equal( '<heading1>bar[]</heading1>' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( '[<heading1>bar</heading1>]' );
			} );

			// https://github.com/ckeditor/ckeditor5/issues/9794
			it( 'should not insert a disallowed inline widget into a limit element', () => {
				const schema = model.schema;

				schema.register( 'limit', {
					isLimit: true,
					allowIn: '$root'
				} );

				schema.extend( '$text', {
					allowIn: 'limit'
				} );

				const content = new ModelDocumentFragment( [ new ModelElement( 'inlineWidget' ) ] );

				_setModelData( model, '<limit>[]</limit>' );

				const affectedRange = insertContent( model, content );

				expect( _getModelData( model ) ).to.equal( '<limit>[]</limit>' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( '<limit>[]</limit>' );
			} );

			describe( 'block to block handling', () => {
				it( 'inserts one paragraph', () => {
					_setModelData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>xyz</paragraph>' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>fxyz[]oo</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>f[xyz]oo</paragraph>' );
				} );

				it( 'inserts one paragraph (at the end)', () => {
					_setModelData( model, '<paragraph>foo[]</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>xyz</paragraph>' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>fooxyz[]</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>foo[xyz]</paragraph>' );
				} );

				it( 'inserts one paragraph into an empty paragraph', () => {
					_setModelData( model, '<paragraph>[]</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>xyz</paragraph>' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>xyz[]</paragraph>' );

					// The empty paragraph gets removed and the new element is inserted instead.
					expect( _stringifyModel( root, affectedRange ) ).to.equal( '[<paragraph>xyz</paragraph>]' );
				} );

				it( 'inserts one empty paragraph', () => {
					_setModelData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<paragraph></paragraph>' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>f[]oo</paragraph>' );

					// Nothing is inserted so the `affectedRange` is collapsed at insertion position.
					expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>f[]oo</paragraph>' );
				} );

				it( 'inserts one block into a fully selected content', () => {
					_setModelData( model, '<heading1>[foo</heading1><paragraph>bar]</paragraph>' );
					const affectedRange = insertHelper( '<heading2>xyz</heading2>' );

					expect( _getModelData( model ) ).to.equal( '<heading2>xyz[]</heading2>' );
					expect( _stringifyModel( root, affectedRange ) ).to.equal( '[<heading2>xyz</heading2>]' );
				} );

				it( 'inserts one heading', () => {
					_setModelData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<heading1>xyz</heading1>' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>fxyz[]oo</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>f[xyz]oo</paragraph>' );
				} );

				it( 'inserts two headings', () => {
					_setModelData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<heading1>xxx</heading1><heading1>yyy</heading1>' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>fxxx</paragraph><heading1>yyy[]oo</heading1>' );
					expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>f[xxx</paragraph><heading1>yyy]oo</heading1>' );
				} );

				it( 'inserts one object', () => {
					_setModelData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<blockWidget></blockWidget>' );

					expect( _getModelData( model ) )
						.to.equal( '<paragraph>f</paragraph>[<blockWidget></blockWidget>]<paragraph>oo</paragraph>' );

					expect( _stringifyModel( root, affectedRange ) )
						.to.equal( '<paragraph>f[</paragraph><blockWidget></blockWidget><paragraph>]oo</paragraph>' );
				} );

				it( 'inserts one object (at the end)', () => {
					_setModelData( model, '<paragraph>foo[]</paragraph>' );
					const affectedRange = insertHelper( '<blockWidget></blockWidget>' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );
					expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );
				} );

				it( 'inserts one object (at the beginning)', () => {
					_setModelData( model, '<paragraph>[]bar</paragraph>' );
					const affectedRange = insertHelper( '<blockWidget></blockWidget>' );

					expect( _getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]<paragraph>bar</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).to.equal( '[<blockWidget></blockWidget>]<paragraph>bar</paragraph>' );
				} );

				it( 'inserts one list item', () => {
					_setModelData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<listItem listIndent="0" listType="bulleted">xyz</listItem>' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>fxyz[]oo</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>f[xyz]oo</paragraph>' );
				} );

				it( 'inserts list item to empty element', () => {
					_setModelData( model, '<paragraph>[]</paragraph>' );
					const affectedRange = insertHelper( '<listItem listIndent="0" listType="bulleted">xyz</listItem>' );

					expect( _getModelData( model ) ).to.equal( '<listItem listIndent="0" listType="bulleted">xyz[]</listItem>' );
					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'[<listItem listIndent="0" listType="bulleted">xyz</listItem>]'
					);
				} );

				it( 'inserts three list items at the end of paragraph', () => {
					_setModelData( model, '<paragraph>foo[]</paragraph>' );
					const affectedRange = insertHelper(
						'<listItem listIndent="0" listType="bulleted">xxx</listItem>' +
						'<listItem listIndent="0" listType="bulleted">yyy</listItem>' +
						'<listItem listIndent="0" listType="bulleted">zzz</listItem>'
					);

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>fooxxx</paragraph>' +
						'<listItem listIndent="0" listType="bulleted">yyy</listItem>' +
						'<listItem listIndent="0" listType="bulleted">zzz[]</listItem>'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>foo[xxx</paragraph>' +
						'<listItem listIndent="0" listType="bulleted">yyy</listItem>' +
						'<listItem listIndent="0" listType="bulleted">zzz</listItem>]'
					);
				} );

				it( 'inserts two list items to an empty paragraph', () => {
					_setModelData( model, '<paragraph>a</paragraph><paragraph>[]</paragraph><paragraph>b</paragraph>' );
					const affectedRange = insertHelper(
						'<listItem listIndent="0" listType="bulleted">xxx</listItem>' +
						'<listItem listIndent="0" listType="bulleted">yyy</listItem>'
					);

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>a</paragraph>' +
						'<listItem listIndent="0" listType="bulleted">xxx</listItem>' +
						'<listItem listIndent="0" listType="bulleted">yyy[]</listItem>' +
						'<paragraph>b</paragraph>'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
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

					_setModelData( model, '<listItem>fo[]o</listItem>' );

					const affectedRange = insertHelper( '<blockQuote><paragraph>xxx</paragraph></blockQuote><heading1>yyy</heading1>' );

					expect( _getModelData( model ) ).to.equal(
						'<listItem>fo</listItem>' +
						'<blockQuote>' +
							'<paragraph>xxx</paragraph>' +
						'</blockQuote>' +
						'<heading1>yyy[]o</heading1>'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
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

					_setModelData( model, '<listItem>fo[]o</listItem>' );

					const affectedRange = insertHelper( '<heading1>yyy</heading1><blockQuote><paragraph>xxx</paragraph></blockQuote>' );

					expect( _getModelData( model ) ).to.equal(
						'<listItem>foyyy</listItem>' +
						'<blockQuote>' +
							'<paragraph>xxx</paragraph>' +
						'</blockQuote>' +
						'<listItem>[]o</listItem>'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
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

					_setModelData( model, '<listItem>fo[]o</listItem>' );

					const affectedRange = insertHelper( '<blockQuote><paragraph>xxx</paragraph></blockQuote>' );

					expect( _getModelData( model ) ).to.equal(
						'<listItem>fo</listItem>' +
						'<blockQuote>' +
							'<paragraph>xxx</paragraph>' +
						'</blockQuote>' +
						'<listItem>[]o</listItem>'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
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

					_setModelData( model, '<blockQuote><paragraph>[foo</paragraph></blockQuote><paragraph>bar]</paragraph>' );

					const affectedRange = insertHelper( '<blockQuote><paragraph>xxx</paragraph></blockQuote><paragraph>yyy</paragraph>' );

					expect( _getModelData( model ) ).to.equal(
						'<blockQuote>' +
							'<paragraph>xxx</paragraph>' +
						'</blockQuote>' +
						'<paragraph>yyy[]</paragraph>'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'[<blockQuote>' +
							'<paragraph>xxx</paragraph>' +
						'</blockQuote>' +
						'<paragraph>yyy</paragraph>]'
					);
				} );
			} );

			describe( 'mixed content to block', () => {
				it( 'inserts text + paragraph', () => {
					_setModelData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( 'xxx<paragraph>yyy</paragraph>' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>fxxx</paragraph><paragraph>yyy[]oo</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>f[xxx</paragraph><paragraph>yyy]oo</paragraph>'
					);
				} );

				it( 'inserts text + inlineWidget + text + paragraph', () => {
					_setModelData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( 'xxx<inlineWidget></inlineWidget>yyy<paragraph>zzz</paragraph>' );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>fxxx<inlineWidget></inlineWidget>yyy</paragraph><paragraph>zzz[]oo</paragraph>'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>f[xxx<inlineWidget></inlineWidget>yyy</paragraph><paragraph>zzz]oo</paragraph>'
					);
				} );

				it( 'inserts text + paragraph (at the beginning)', () => {
					_setModelData( model, '<paragraph>[]foo</paragraph>' );
					const affectedRange = insertHelper( 'xxx<paragraph>yyy</paragraph>' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>xxx</paragraph><paragraph>yyy[]foo</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>[xxx</paragraph><paragraph>yyy]foo</paragraph>'
					);
				} );

				it( 'inserts text + paragraph (at the end)', () => {
					_setModelData( model, '<paragraph>foo[]</paragraph>' );
					const affectedRange = insertHelper( 'xxx<paragraph>yyy</paragraph>' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>fooxxx</paragraph><paragraph>yyy[]</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>foo[xxx</paragraph><paragraph>yyy</paragraph>]'
					);
				} );

				it( 'inserts paragraph + text', () => {
					_setModelData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>yyy</paragraph>xxx' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>fyyy</paragraph><paragraph>xxx[]oo</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>f[yyy</paragraph><paragraph>xxx]oo</paragraph>'
					);
				} );

				it( 'inserts paragraph + text + inlineWidget + text', () => {
					_setModelData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>yyy</paragraph>xxx<inlineWidget></inlineWidget>zzz' );

					expect( _getModelData( model ) )
						.to.equal( '<paragraph>fyyy</paragraph><paragraph>xxx<inlineWidget></inlineWidget>zzz[]oo</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) )
						.to.equal( '<paragraph>f[yyy</paragraph><paragraph>xxx<inlineWidget></inlineWidget>zzz]oo</paragraph>' );
				} );

				it( 'inserts paragraph + text + paragraph', () => {
					_setModelData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>yyy</paragraph>xxx<paragraph>zzz</paragraph>' );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>fyyy</paragraph><paragraph>xxx</paragraph><paragraph>zzz[]oo</paragraph>'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>f[yyy</paragraph><paragraph>xxx</paragraph><paragraph>zzz]oo</paragraph>'
					);
				} );

				it( 'inserts paragraph + text (at the beginning)', () => {
					_setModelData( model, '<paragraph>[]foo</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>yyy</paragraph>xxx' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>yyy</paragraph><paragraph>xxx[]foo</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'[<paragraph>yyy</paragraph><paragraph>xxx]foo</paragraph>'
					);
				} );

				it( 'inserts paragraph + text (at the end)', () => {
					_setModelData( model, '<paragraph>foo[]</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>yyy</paragraph>xxx' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>fooyyy</paragraph><paragraph>xxx[]</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>foo[yyy</paragraph><paragraph>xxx</paragraph>]'
					);
				} );

				it( 'inserts text + heading', () => {
					_setModelData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( 'xxx<heading1>yyy</heading1>' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>fxxx</paragraph><heading1>yyy[]oo</heading1>' );
					expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>f[xxx</paragraph><heading1>yyy]oo</heading1>' );
				} );

				it( 'inserts paragraph + object', () => {
					_setModelData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>xxx</paragraph><blockWidget></blockWidget>' );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>fxxx</paragraph>[<blockWidget></blockWidget>]<paragraph>oo</paragraph>'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>f[xxx</paragraph><blockWidget></blockWidget><paragraph>]oo</paragraph>'
					);
				} );

				it( 'inserts object + paragraph', () => {
					_setModelData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<blockWidget></blockWidget><paragraph>xxx</paragraph>' );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>f</paragraph><blockWidget></blockWidget><paragraph>xxx[]oo</paragraph>'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>f[</paragraph><blockWidget></blockWidget><paragraph>xxx]oo</paragraph>'
					);
				} );

				it( 'inserts object + text', () => {
					_setModelData( model, '<paragraph>f[]oo</paragraph>' );
					const affectedRange = insertHelper( '<blockWidget></blockWidget>xxx' );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>f</paragraph><blockWidget></blockWidget><paragraph>xxx[]oo</paragraph>'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>f[</paragraph><blockWidget></blockWidget><paragraph>xxx]oo</paragraph>'
					);
				} );

				it( 'inserts object + text (at the beginning)', () => {
					_setModelData( model, '<paragraph>[]foo</paragraph>' );
					const affectedRange = insertHelper( '<blockWidget></blockWidget>xxx' );

					expect( _getModelData( model ) ).to.equal(
						'<blockWidget></blockWidget><paragraph>xxx[]foo</paragraph>'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'[<blockWidget></blockWidget><paragraph>xxx]foo</paragraph>'
					);
				} );

				it( 'inserts object + text (at the end)', () => {
					_setModelData( model, '<paragraph>foo[]</paragraph>' );
					const affectedRange = insertHelper( '<blockWidget></blockWidget>xxx' );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph><blockWidget></blockWidget><paragraph>xxx[]</paragraph>'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>foo</paragraph>[<blockWidget></blockWidget><paragraph>xxx</paragraph>]'
					);
				} );

				it( 'inserts object + text + object', () => {
					_setModelData( model, '<paragraph>foo[]</paragraph>' );

					const affectedRange = insertHelper( '<blockWidget></blockWidget>foo<blockWidget></blockWidget>' );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph><blockWidget></blockWidget><paragraph>foo</paragraph>[<blockWidget></blockWidget>]'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>foo</paragraph>[<blockWidget></blockWidget><paragraph>foo</paragraph><blockWidget></blockWidget>]'
					);
				} );

				it( 'inserts text + object (at the end)', () => {
					_setModelData( model, '<paragraph>foo[]</paragraph>' );
					const affectedRange = insertHelper( 'xxx<blockWidget></blockWidget>' );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>fooxxx</paragraph>[<blockWidget></blockWidget>]'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>foo[xxx</paragraph><blockWidget></blockWidget>]'
					);
				} );
			} );

			describe( 'content over a block object', () => {
				it( 'inserts text', () => {
					_setModelData( model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>' );
					const affectedRange = insertHelper( 'xxx' );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph><paragraph>xxx[]</paragraph><paragraph>bar</paragraph>'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>foo</paragraph>[<paragraph>xxx</paragraph>]<paragraph>bar</paragraph>'
					);
				} );

				it( 'inserts paragraph', () => {
					_setModelData( model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>xxx</paragraph>' );

					expect( _getModelData( model ) )
						.to.equal( '<paragraph>foo</paragraph><paragraph>xxx[]</paragraph><paragraph>bar</paragraph>' );

					expect( _stringifyModel( root, affectedRange ) )
						.to.equal( '<paragraph>foo</paragraph>[<paragraph>xxx</paragraph>]<paragraph>bar</paragraph>' );
				} );

				it( 'inserts text + paragraph', () => {
					_setModelData( model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>' );
					const affectedRange = insertHelper( 'yyy<paragraph>xxx</paragraph>' );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph><paragraph>yyy</paragraph><paragraph>xxx[]</paragraph><paragraph>bar</paragraph>'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>foo</paragraph>[<paragraph>yyy</paragraph><paragraph>xxx</paragraph>]<paragraph>bar</paragraph>'
					);
				} );

				it( 'inserts two blocks', () => {
					_setModelData( model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>' );
					const affectedRange = insertHelper( '<heading1>xxx</heading1><paragraph>yyy</paragraph>' );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph><heading1>xxx</heading1><paragraph>yyy[]</paragraph><paragraph>bar</paragraph>'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>foo</paragraph>[<heading1>xxx</heading1><paragraph>yyy</paragraph>]<paragraph>bar</paragraph>'
					);
				} );

				it( 'inserts block object', () => {
					_setModelData( model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>' );
					const affectedRange = insertHelper( '<blockWidget></blockWidget>' );

					// It's enough, don't worry.
					expect( _getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>'
					);
				} );

				it( 'inserts inline object', () => {
					_setModelData( model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>' );
					const affectedRange = insertHelper( '<inlineWidget></inlineWidget>' );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph><paragraph><inlineWidget></inlineWidget>[]</paragraph><paragraph>bar</paragraph>'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>foo</paragraph>[<paragraph><inlineWidget></inlineWidget></paragraph>]<paragraph>bar</paragraph>'
					);
				} );

				it( 'inserts multiple text nodes with different attribute values', () => {
					_setModelData( model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>' );
					const affectedRange = insertHelper( '<$text foo="a">yyy</$text><$text foo="b">xxx</$text>' );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph>' +
						'<paragraph><$text foo="a">yyy</$text><$text foo="b">xxx[]</$text></paragraph>' +
						'<paragraph>bar</paragraph>'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>foo</paragraph>' +
						'[<paragraph><$text foo="a">yyy</$text><$text foo="b">xxx</$text></paragraph>]' +
						'<paragraph>bar</paragraph>'
					);
				} );
			} );

			describe( 'content over an inline object', () => {
				it( 'inserts text', () => {
					_setModelData( model, '<paragraph>foo[<inlineWidget></inlineWidget>]bar</paragraph>' );
					const affectedRange = insertHelper( 'xxx' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>fooxxx[]bar</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>foo[xxx]bar</paragraph>' );
				} );

				it( 'inserts paragraph', () => {
					_setModelData( model, '<paragraph>foo[<inlineWidget></inlineWidget>]bar</paragraph>' );
					const affectedRange = insertHelper( '<paragraph>xxx</paragraph>' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>fooxxx[]bar</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>foo[xxx]bar</paragraph>' );
				} );

				it( 'inserts text + paragraph', () => {
					_setModelData( model, '<paragraph>foo[<inlineWidget></inlineWidget>]bar</paragraph>' );
					const affectedRange = insertHelper( 'yyy<paragraph>xxx</paragraph>' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>fooyyy</paragraph><paragraph>xxx[]bar</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>foo[yyy</paragraph><paragraph>xxx]bar</paragraph>'
					);
				} );

				it( 'inserts two blocks', () => {
					_setModelData( model, '<paragraph>foo[<inlineWidget></inlineWidget>]bar</paragraph>' );
					const affectedRange = insertHelper( '<heading1>xxx</heading1><paragraph>yyy</paragraph>' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>fooxxx</paragraph><paragraph>yyy[]bar</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>foo[xxx</paragraph><paragraph>yyy]bar</paragraph>'
					);
				} );

				it( 'inserts inline object', () => {
					_setModelData( model, '<paragraph>foo[<inlineWidget></inlineWidget>]bar</paragraph>' );
					const affectedRange = insertHelper( '<inlineWidget></inlineWidget>' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>foo<inlineWidget></inlineWidget>[]bar</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>foo[<inlineWidget></inlineWidget>]bar</paragraph>'
					);
				} );

				it( 'inserts block object', () => {
					_setModelData( model, '<paragraph>foo[<inlineWidget></inlineWidget>]bar</paragraph>' );
					const affectedRange = insertHelper( '<blockWidget></blockWidget>' );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>'
					);

					expect( _stringifyModel( root, affectedRange ) ).to.equal(
						'<paragraph>foo[</paragraph><blockWidget></blockWidget><paragraph>]bar</paragraph>'
					);
				} );
			} );

			describe( 'merging edge auto-paragraphs', () => {
				describe( 'with text auto-paragraphing', () => {
					it( 'inserts text + paragraph + text in the middle of a paragraph text', () => {
						_setModelData( model, '<paragraph>12[]34</paragraph>' );
						const affectedRange = insertHelper( 'aaa<paragraph>bbb</paragraph>ccc' );

						expect( _getModelData( model ) ).to.equal(
							'<paragraph>12aaa</paragraph><paragraph>bbb</paragraph><paragraph>ccc[]34</paragraph>'
						);
						expect( _stringifyModel( root, affectedRange ) ).to.equal(
							'<paragraph>12[aaa</paragraph><paragraph>bbb</paragraph><paragraph>ccc]34</paragraph>'
						);
					} );

					it( 'inserts text + paragraph + text in the end of a paragraph text', () => {
						_setModelData( model, '<paragraph>1234[]</paragraph>' );
						const affectedRange = insertHelper( 'aaa<paragraph>bbb</paragraph>ccc' );

						expect( _getModelData( model ) ).to.equal(
							'<paragraph>1234aaa</paragraph><paragraph>bbb</paragraph><paragraph>ccc[]</paragraph>'
						);
						expect( _stringifyModel( root, affectedRange ) ).to.equal(
							'<paragraph>1234[aaa</paragraph><paragraph>bbb</paragraph><paragraph>ccc</paragraph>]'
						);
					} );

					it( 'inserts text + paragraph + text in the start of a paragraph text', () => {
						_setModelData( model, '<paragraph>[]1234</paragraph>' );
						const affectedRange = insertHelper( 'aaa<paragraph>bbb</paragraph>ccc' );

						expect( _getModelData( model ) ).to.equal(
							'<paragraph>aaa</paragraph><paragraph>bbb</paragraph><paragraph>ccc[]1234</paragraph>'
						);
						expect( _stringifyModel( root, affectedRange ) ).to.equal(
							'<paragraph>[aaa</paragraph><paragraph>bbb</paragraph><paragraph>ccc]1234</paragraph>'
						);
					} );
				} );

				describe( 'with inline-object auto-paragraphing', () => {
					it( 'inserts inlineObject + paragraph + inlineObject in the middle of a paragraph text', () => {
						_setModelData( model, '<paragraph>12[]34</paragraph>' );
						const affectedRange = insertHelper(
							'<inlineWidget></inlineWidget><paragraph>bbb</paragraph><inlineWidget></inlineWidget>'
						);

						expect( _getModelData( model ) ).to.equal(
							'<paragraph>12<inlineWidget></inlineWidget></paragraph>' +
							'<paragraph>bbb</paragraph>' +
							'<paragraph><inlineWidget></inlineWidget>[]34</paragraph>'
						);
						expect( _stringifyModel( root, affectedRange ) ).to.equal(
							'<paragraph>12[<inlineWidget></inlineWidget></paragraph>' +
							'<paragraph>bbb</paragraph>' +
							'<paragraph><inlineWidget></inlineWidget>]34</paragraph>'
						);
					} );

					it( 'inserts inlineObject + paragraph + inlineObject in the end of a paragraph text', () => {
						_setModelData( model, '<paragraph>1234[]</paragraph>' );
						const affectedRange = insertHelper(
							'<inlineWidget></inlineWidget><paragraph>bbb</paragraph><inlineWidget></inlineWidget>'
						);

						expect( _getModelData( model ) ).to.equal(
							'<paragraph>1234<inlineWidget></inlineWidget></paragraph>' +
							'<paragraph>bbb</paragraph>' +
							'<paragraph><inlineWidget></inlineWidget>[]</paragraph>'
						);
						expect( _stringifyModel( root, affectedRange ) ).to.equal(
							'<paragraph>1234[<inlineWidget></inlineWidget></paragraph>' +
							'<paragraph>bbb</paragraph>' +
							'<paragraph><inlineWidget></inlineWidget></paragraph>]'
						);
					} );

					it( 'inserts inlineObject + paragraph + inlineObject in the start of a paragraph text', () => {
						_setModelData( model, '<paragraph>[]1234</paragraph>' );
						const affectedRange = insertHelper(
							'<inlineWidget></inlineWidget><paragraph>bbb</paragraph><inlineWidget></inlineWidget>'
						);

						expect( _getModelData( model ) ).to.equal(
							'<paragraph><inlineWidget></inlineWidget></paragraph>' +
							'<paragraph>bbb</paragraph>' +
							'<paragraph><inlineWidget></inlineWidget>[]1234</paragraph>'
						);
						expect( _stringifyModel( root, affectedRange ) ).to.equal(
							'<paragraph>[<inlineWidget></inlineWidget></paragraph>' +
							'<paragraph>bbb</paragraph>' +
							'<paragraph><inlineWidget></inlineWidget>]1234</paragraph>'
						);
					} );

					it( 'inserts inlineObject + text + inlineObject in the middle of a paragraph text', () => {
						_setModelData( model, '<paragraph>12[]34</paragraph>' );
						const affectedRange = insertHelper( '<inlineWidget></inlineWidget>bbb<inlineWidget></inlineWidget>' );

						expect( _getModelData( model ) ).to.equal(
							'<paragraph>12<inlineWidget></inlineWidget>bbb<inlineWidget></inlineWidget>[]34</paragraph>'
						);
						expect( _stringifyModel( root, affectedRange ) ).to.equal(
							'<paragraph>12[<inlineWidget></inlineWidget>bbb<inlineWidget></inlineWidget>]34</paragraph>'
						);
					} );

					it( 'inserts inlineObject + text + inlineObject in the end of a paragraph text', () => {
						_setModelData( model, '<paragraph>1234[]</paragraph>' );
						const affectedRange = insertHelper( '<inlineWidget></inlineWidget>bbb<inlineWidget></inlineWidget>' );

						expect( _getModelData( model ) ).to.equal(
							'<paragraph>1234<inlineWidget></inlineWidget>bbb<inlineWidget></inlineWidget>[]</paragraph>'
						);
						expect( _stringifyModel( root, affectedRange ) ).to.equal(
							'<paragraph>1234[<inlineWidget></inlineWidget>bbb<inlineWidget></inlineWidget>]</paragraph>'
						);
					} );

					it( 'inserts inlineObject + text + inlineObject in the start of a paragraph text', () => {
						_setModelData( model, '<paragraph>[]1234</paragraph>' );
						const affectedRange = insertHelper( '<inlineWidget></inlineWidget>bbb<inlineWidget></inlineWidget>' );

						expect( _getModelData( model ) ).to.equal(
							'<paragraph><inlineWidget></inlineWidget>bbb<inlineWidget></inlineWidget>[]1234</paragraph>'
						);
						expect( _stringifyModel( root, affectedRange ) ).to.equal(
							'<paragraph>[<inlineWidget></inlineWidget>bbb<inlineWidget></inlineWidget>]1234</paragraph>'
						);
					} );

					it( 'inserts inlineObject + text + inlineObject between paragraphs', () => {
						_setModelData( model, '<paragraph>12</paragraph>[]<paragraph>34</paragraph>' );
						const affectedRange = insertHelper( '<inlineWidget></inlineWidget>bbb<inlineWidget></inlineWidget>', null, [ 1 ] );

						expect( _getModelData( model ) ).to.equal(
							'<paragraph>12[]</paragraph>' +
							'<paragraph><inlineWidget></inlineWidget>bbb<inlineWidget></inlineWidget></paragraph>' +
							'<paragraph>34</paragraph>'
						);
						expect( _stringifyModel( root, affectedRange ) ).to.equal(
							'<paragraph>12</paragraph>' +
							'[<paragraph><inlineWidget></inlineWidget>bbb<inlineWidget></inlineWidget></paragraph>]' +
							'<paragraph>34</paragraph>'
						);
					} );
				} );

				describe( 'with text between block widgets auto-paragraphing', () => {
					it( 'inserts blockObject + text + blockObject in the middle of a paragraph text', () => {
						_setModelData( model, '<paragraph>12[]34</paragraph>' );
						const affectedRange = insertHelper( '<blockWidget></blockWidget>bbb<blockWidget></blockWidget>' );

						expect( _getModelData( model ) ).to.equal(
							'<paragraph>12</paragraph>' +
							'<blockWidget></blockWidget>' +
							'<paragraph>bbb</paragraph>' +
							'[<blockWidget></blockWidget>]' +
							'<paragraph>34</paragraph>'
						);
						expect( _stringifyModel( root, affectedRange ) ).to.equal(
							'<paragraph>12[</paragraph>' +
							'<blockWidget></blockWidget>' +
							'<paragraph>bbb</paragraph>' +
							'<blockWidget></blockWidget>' +
							'<paragraph>]34</paragraph>'
						);
					} );

					it( 'inserts blockObject + text + blockObject in the end of a paragraph text', () => {
						_setModelData( model, '<paragraph>1234[]</paragraph>' );
						const affectedRange = insertHelper( '<blockWidget></blockWidget>bbb<blockWidget></blockWidget>' );

						expect( _getModelData( model ) ).to.equal(
							'<paragraph>1234</paragraph>' +
							'<blockWidget></blockWidget>' +
							'<paragraph>bbb</paragraph>' +
							'[<blockWidget></blockWidget>]'
						);
						expect( _stringifyModel( root, affectedRange ) ).to.equal(
							'<paragraph>1234</paragraph>' +
							'[<blockWidget></blockWidget>' +
							'<paragraph>bbb</paragraph>' +
							'<blockWidget></blockWidget>]'
						);
					} );

					it( 'inserts blockObject + text + blockObject in the start of a paragraph text', () => {
						_setModelData( model, '<paragraph>[]1234</paragraph>' );
						const affectedRange = insertHelper( '<blockWidget></blockWidget>bbb<blockWidget></blockWidget>' );

						expect( _getModelData( model ) ).to.equal(
							'<blockWidget></blockWidget>' +
							'<paragraph>bbb</paragraph>' +
							'[<blockWidget></blockWidget>]' +
							'<paragraph>1234</paragraph>'
						);
						expect( _stringifyModel( root, affectedRange ) ).to.equal(
							'[<blockWidget></blockWidget>' +
							'<paragraph>bbb</paragraph>' +
							'<blockWidget></blockWidget>]' +
							'<paragraph>1234</paragraph>'
						);
					} );
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
				_setModelData( model, '<paragraph>f[]oo</paragraph>' );
				const affectedRange = insertHelper( '<table><td>xxx</td><td>yyy</td></table>' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>fxxxyyy[]oo</paragraph>' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>f[xxxyyy]oo</paragraph>' );
			} );

			it( 'filters out disallowed elements and leaves out the paragraphs', () => {
				_setModelData( model, '<paragraph>f[]oo</paragraph>' );
				const affectedRange = insertHelper(
					'<table><td><paragraph>xxx</paragraph><paragraph>yyy</paragraph><paragraph>zzz</paragraph></td></table>'
				);

				expect( _getModelData( model ) )
					.to.equal( '<paragraph>fxxx</paragraph><paragraph>yyy</paragraph><paragraph>zzz[]oo</paragraph>' );

				expect( _stringifyModel( root, affectedRange ) )
					.to.equal( '<paragraph>f[xxx</paragraph><paragraph>yyy</paragraph><paragraph>zzz]oo</paragraph>' );
			} );

			it( 'filters out disallowed objects', () => {
				_setModelData( model, '<paragraph>f[]oo</paragraph>' );
				const affectedRange = insertHelper( '<disallowedWidget>xxx</disallowedWidget>' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>f[]oo</paragraph>' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>f[]oo</paragraph>' );
			} );

			it( 'filters out disallowed attributes when inserting text', () => {
				_setModelData( model, '<paragraph>f[]oo</paragraph>' );
				const affectedRange = insertHelper( 'x<$text a="1" b="1">x</$text>xy<$text a="1">y</$text>y' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>fx<$text b="1">x</$text>xyyy[]oo</paragraph>' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>f[x<$text b="1">x</$text>xyyy]oo</paragraph>' );
			} );

			it( 'filters out disallowed attributes when inserting nested elements', () => {
				_setModelData( model, '<element>[]</element>' );
				const affectedRange = insertHelper( '<table><td>f<$text a="1" b="1" c="1">o</$text>o</td></table>' );

				expect( _getModelData( model ) )
					.to.equal( '<element><table><td>f<$text b="1">o</$text>o</td></table>[]</element>' );

				expect( _stringifyModel( root, affectedRange ) )
					.to.equal( '<element>[<table><td>f<$text b="1">o</$text>o</td></table>]</element>' );
			} );

			it( 'filters out disallowed attributes when inserting text in disallowed elements', () => {
				_setModelData( model, '<paragraph>f[]oo</paragraph>' );
				const affectedRange = insertHelper(
					'<table><td>x<$text a="1" b="1">x</$text>x</td><td>y<$text a="1">y</$text>y</td></table>'
				);

				expect( _getModelData( model ) ).to.equal( '<paragraph>fx<$text b="1">x</$text>xyyy[]oo</paragraph>' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>f[x<$text b="1">x</$text>xyyy]oo</paragraph>' );
			} );

			it( 'filters out disallowed attributes when merging #1', () => {
				_setModelData( model, '<paragraph>[]foo</paragraph>' );
				const affectedRange = insertHelper( '<paragraph>x<$text a="1" b="1">x</$text>x</paragraph>' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>x<$text b="1">x</$text>x[]foo</paragraph>' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>[x<$text b="1">x</$text>x]foo</paragraph>' );
			} );

			it( 'filters out disallowed attributes when merging #2', () => {
				_setModelData( model, '<paragraph>f[]oo</paragraph>' );
				const affectedRange = insertHelper( '<paragraph>x<$text a="1" b="1">x</$text>x</paragraph>' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>fx<$text b="1">x</$text>x[]oo</paragraph>' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>f[x<$text b="1">x</$text>x]oo</paragraph>' );
			} );

			it( 'filters out disallowed attributes when merging #3', () => {
				_setModelData( model, '<paragraph>foo[]</paragraph>' );
				const affectedRange = insertHelper( '<paragraph>x<$text a="1" b="1">x</$text>x</paragraph>' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>foox<$text b="1">x</$text>x[]</paragraph>' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( '<paragraph>foo[x<$text b="1">x</$text>x]</paragraph>' );
			} );

			it( 'filters out disallowed attributes from nested nodes when merging', () => {
				_setModelData( model, '<paragraph>f[]oo</paragraph>' );
				const affectedRange = insertHelper( '<heading1>x<element>b<$text a="1" b="1">a</$text>r</element>x</heading1>' );

				expect( _getModelData( model ) )
					.to.equal( '<paragraph>fx<element>b<$text b="1">a</$text>r</element>x[]oo</paragraph>' );

				expect( _stringifyModel( root, affectedRange ) )
					.to.equal( '<paragraph>f[x<element>b<$text b="1">a</$text>r</element>x]oo</paragraph>' );
			} );

			it( 'filters out disallowed attributes when autoparagraphing', () => {
				_setModelData( model, '<paragraph>f[]oo</paragraph>' );
				const affectedRange = insertHelper( '<paragraph>xxx</paragraph><$text a="1" b="1">yyy</$text>' );

				expect( _getModelData( model ) )
					.to.equal( '<paragraph>fxxx</paragraph><paragraph><$text b="1">yyy[]</$text>oo</paragraph>' );

				expect( _stringifyModel( root, affectedRange ) )
					.to.equal( '<paragraph>f[xxx</paragraph><paragraph><$text b="1">yyy</$text>]oo</paragraph>' );
			} );
		} );

		describe( 'markers', () => {
			beforeEach( () => {
				const schema = model.schema;

				schema.register( 'paragraph', { inheritAllFrom: '$block' } );

				schema.register( 'blockQuote', {
					allowWhere: '$block',
					allowContentOf: '$root'
				} );

				schema.register( 'imageInline', {
					inheritAllFrom: '$inlineObject',
					allowIn: [ '$block' ]
				} );

				schema.register( 'imageBlock', {
					allowIn: '$root',
					isObject: true,
					isBlock: true
				} );

				schema.register( 'limit', {
					isLimit: true,
					allowIn: '$root'

				} );

				schema.register( 'wrapper', {
					isLimit: true,
					isBlock: true,
					isObject: true,
					allowWhere: '$block'
				} );

				schema.extend( 'paragraph', { allowIn: 'limit' } );
				schema.extend( 'limit', { allowIn: 'wrapper' } );
			} );

			it( 'should create marker after inserting paragraph', () => {
				// <paragraph>foo[]</paragraph>
				// <paragraph>{Bar}</paragraph>
				//
				// <paragraph>foo{Bar}</paragraph>
				_setModelData( model, '<paragraph>foo[]</paragraph>' );

				insertHelper( '<paragraph>Bar</paragraph>', {
					'marker-a': { start: [ 0, 0 ], end: [ 0, 3 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>fooBar[]</paragraph>' );

				expect( expectedMarker ).to.exist;
				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 3 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 6 ] );
			} );

			it( 'should create marker after inserting in the middle of existing content', () => {
				// <paragraph>fo[]oo</paragraph>
				// <paragraph>{Bar}</paragraph>
				//
				// <paragraph>fo{Bar}oo</paragraph>
				_setModelData( model, '<paragraph>fo[]oo</paragraph>' );

				insertHelper( '<paragraph>Bar</paragraph>', {
					'marker-a': { start: [ 0, 0 ], end: [ 0, 3 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>foBar[]oo</paragraph>' );

				expect( expectedMarker ).to.exist;
				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 2 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 5 ] );
			} );

			it( 'should create marker after inserting at the beginning of existing content', () => {
				// <paragraph>[]foo</paragraph>
				// <paragraph>{Ba}r</paragraph>
				//
				// <paragraph>{Ba}rfoo</paragraph>
				_setModelData( model, '<paragraph>[]foo</paragraph>' );

				insertHelper( '<paragraph>Bar</paragraph>', {
					'marker-a': { start: [ 0, 0 ], end: [ 0, 2 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>Bar[]foo</paragraph>' );

				expect( expectedMarker ).to.exist;
				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 0 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 2 ] );
			} );

			it( 'should create marker on the whole paragraph after inserting in the middle', () => {
				// <paragraph>f[]oo</paragraph>
				// {<paragraph>Bar</paragraph>}
				//
				// <paragraph>f{Bar}oo</paragraph>
				_setModelData( model, '<paragraph>f[]oo</paragraph>' );

				insertHelper( '<paragraph>Bar</paragraph>', {
					'marker-a': { start: [ 0 ], end: [ 1 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>fBar[]oo</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 1 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 4 ] );
			} );

			it( 'should create marker on the whole paragraph after inserting next to another paragraph', () => {
				// <paragraph>foo</paragraph>[]
				// {<paragraph>Bar</paragraph>}
				//
				// <paragraph>foo</paragraph>{<paragraph>Bar</paragraph>}
				_setModelData( model, '<paragraph>foo</paragraph>[]' );

				insertHelper( '<paragraph>Bar</paragraph>', {
					'marker-a': { start: [ 0 ], end: [ 1 ] }
				}, [ 1 ] );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph><paragraph>Bar</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 1 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 2 ] );
			} );

			it( 'should create marker on the whole paragraph after inserting before another paragraph', () => {
				// []<paragraph>foo</paragraph>
				// {<paragraph>Bar</paragraph>}
				//
				// {<paragraph>Bar</paragraph>}<paragraph>foo</paragraph>
				_setModelData( model, '[]<paragraph>foo</paragraph>' );

				insertHelper( '<paragraph>Bar</paragraph>', {
					'marker-a': { start: [ 0 ], end: [ 1 ] }
				}, [ 0 ] );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>Bar</paragraph><paragraph>[]foo</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1 ] );
			} );

			it( 'should create marker in paragraph after inserting into block quoted paragraph', () => {
				// <blockQuote><paragraph>foo[]</paragraph></blockQuote>
				// <paragraph>{Bar}</paragraph>
				//
				// <blockQuote><paragraph>foo{Bar}</paragraph></blockQuote>
				_setModelData( model, '<blockQuote><paragraph>foo[]</paragraph></blockQuote>' );

				insertHelper( '<paragraph>Bar</paragraph>', {
					'marker-a': { start: [ 0, 0 ], end: [ 0, 3 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<blockQuote><paragraph>fooBar[]</paragraph></blockQuote>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 0, 3 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 0, 6 ] );
			} );

			it( 'should create marker in paragraph after inserting into block quoted next to paragraph', () => {
				// <blockQuote><paragraph>foo</paragraph>[]</blockQuote>
				// <paragraph>{Bar}</paragraph>
				//
				// <blockQuote><paragraph>foo{Bar}</paragraph></blockQuote>
				_setModelData( model, '<blockQuote><paragraph>foo</paragraph>[]</blockQuote>' );

				insertHelper( '<paragraph>Bar</paragraph>', {
					'marker-a': { start: [ 0, 0 ], end: [ 0, 3 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<blockQuote><paragraph>fooBar[]</paragraph></blockQuote>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 0, 3 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 0, 6 ] );
			} );

			it( 'should create multiple markers after inserting paragraphs', () => {
				// <paragraph>foo[]</paragraph>
				// <paragraph>{Ba}r</paragraph><paragraph>B(ar)</paragraph>
				//
				// <paragraph>foo{Ba}r</paragraph><paragraph>B(ar)</paragraph>
				_setModelData( model, '<paragraph>foo[]</paragraph>' );

				insertHelper( '<paragraph>Bar</paragraph><paragraph>Bar</paragraph>', {
					'marker-a': { start: [ 0, 0 ], end: [ 0, 2 ] },
					'marker-b': { start: [ 1, 1 ], end: [ 1, 3 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );
				const expectedNestedMarker = model.markers.get( 'marker-b' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>fooBar</paragraph><paragraph>Bar[]</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 3 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 5 ] );
				expect( expectedNestedMarker.getRange().start.path ).to.deep.equal( [ 1, 1 ] );
				expect( expectedNestedMarker.getRange().end.path ).to.deep.equal( [ 1, 3 ] );
			} );

			it( 'should create nested markers after inserting paragraph', () => {
				// <paragraph>foo[]</paragraph>
				// <paragraph>{B(a)r}</paragraph>
				//
				// <paragraph>foo{B(a)r}</paragraph>
				_setModelData( model, '<paragraph>foo[]</paragraph>' );

				insertHelper( '<paragraph>Bar</paragraph>', {
					'marker-a': { start: [ 0, 0 ], end: [ 0, 3 ] },
					'marker-b': { start: [ 0, 1 ], end: [ 0, 2 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );
				const expectedNestedMarker = model.markers.get( 'marker-b' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>fooBar[]</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 3 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 6 ] );
				expect( expectedNestedMarker.getRange().start.path ).to.deep.equal( [ 0, 4 ] );
				expect( expectedNestedMarker.getRange().end.path ).to.deep.equal( [ 0, 5 ] );
			} );

			it( 'should create nested markers that begin in the same place after inserting paragraph', () => {
				// <paragraph>foo[]</paragraph>
				// <paragraph>{(Ba}r)</paragraph>
				//
				// <paragraph>foo{(Ba}r)</paragraph>
				_setModelData( model, '<paragraph>foo[]</paragraph>' );

				insertHelper( '<paragraph>Bar</paragraph>', {
					'marker-a': { start: [ 0, 0 ], end: [ 0, 2 ] },
					'marker-b': { start: [ 0, 0 ], end: [ 0, 3 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );
				const expectedNestedMarker = model.markers.get( 'marker-b' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>fooBar[]</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 3 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 5 ] );
				expect( expectedNestedMarker.getRange().start.path ).to.deep.equal( [ 0, 3 ] );
				expect( expectedNestedMarker.getRange().end.path ).to.deep.equal( [ 0, 6 ] );
			} );

			it( 'should create nested markers that end in the same place after inserting paragraph', () => {
				// <paragraph>foo[]</paragraph>
				// <paragraph>{B(ar)}</paragraph>
				//
				// <paragraph>foo{B(ar)}</paragraph>
				_setModelData( model, '<paragraph>foo[]</paragraph>' );

				insertHelper( '<paragraph>Bar</paragraph>', {
					'marker-a': { start: [ 0, 0 ], end: [ 0, 3 ] },
					'marker-b': { start: [ 0, 1 ], end: [ 0, 3 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );
				const expectedNestedMarker = model.markers.get( 'marker-b' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>fooBar[]</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 3 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 6 ] );
				expect( expectedNestedMarker.getRange().start.path ).to.deep.equal( [ 0, 4 ] );
				expect( expectedNestedMarker.getRange().end.path ).to.deep.equal( [ 0, 6 ] );
			} );

			it( 'should create nested markers that have the same range after inserting paragraph', () => {
				// <paragraph>foo[]</paragraph>
				// <paragraph>{(Bar)}</paragraph>
				//
				// <paragraph>foo{(Bar)}</paragraph>
				_setModelData( model, '<paragraph>foo[]</paragraph>' );

				insertHelper( '<paragraph>Bar</paragraph>', {
					'marker-a': { start: [ 0, 0 ], end: [ 0, 3 ] },
					'marker-b': { start: [ 0, 0 ], end: [ 0, 3 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );
				const expectedNestedMarker = model.markers.get( 'marker-b' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>fooBar[]</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 3 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 6 ] );
				expect( expectedNestedMarker.getRange().start.path ).to.deep.equal( [ 0, 3 ] );
				expect( expectedNestedMarker.getRange().end.path ).to.deep.equal( [ 0, 6 ] );
			} );

			it( 'should create intersecting markers after inserting paragraph inside another paragraph', () => {
				// <paragraph>foo[]</paragraph>
				// <paragraph>{B(a}r)</paragraph>
				//
				// <paragraph>foo{B(a}r)</paragraph>
				_setModelData( model, '<paragraph>foo[]</paragraph>' );

				insertHelper( '<paragraph>Bar</paragraph>', {
					'marker-a': { start: [ 0, 0 ], end: [ 0, 2 ] },
					'marker-b': { start: [ 0, 1 ], end: [ 0, 3 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );
				const expectedNestedMarker = model.markers.get( 'marker-b' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>fooBar[]</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 3 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 5 ] );
				expect( expectedNestedMarker.getRange().start.path ).to.deep.equal( [ 0, 4 ] );
				expect( expectedNestedMarker.getRange().end.path ).to.deep.equal( [ 0, 6 ] );
			} );

			it( 'should create inline marker after inserting paragraph', () => {
				// <paragraph>foo</paragraph>[]
				// {<paragraph>}Bar</paragraph>
				//
				// <paragraph>foo</paragraph>{<paragraph>}Bar</paragraph>
				_setModelData( model, '<paragraph>foo</paragraph>[]' );

				insertHelper( '<paragraph>Bar</paragraph>', {
					'marker-a': { start: [ 0 ], end: [ 0, 0 ] }
				}, [ 1 ] );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) )
					.to.equal( '<paragraph>foo[]</paragraph><paragraph>Bar</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 1 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1, 0 ] );
			} );

			it( 'should create inline nested marker after inserting paragraph next to another one', () => {
				// <paragraph>foo</paragraph>[]
				// {(<paragraph>}B)ar</paragraph>
				//
				// <paragraph>foo</paragraph>{(<paragraph>}B)ar</paragraph>
				_setModelData( model, '<paragraph>foo</paragraph>[]' );

				insertHelper( '<paragraph>Bar</paragraph>', {
					'marker-a': { start: [ 0 ], end: [ 0, 0 ] },
					'marker-b': { start: [ 0 ], end: [ 0, 1 ] }
				}, [ 1 ] );

				const expectedFirstMarker = model.markers.get( 'marker-a' );
				const expectedSecondMarker = model.markers.get( 'marker-b' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph><paragraph>Bar</paragraph>' );

				expect( expectedFirstMarker.getRange().start.path ).to.deep.equal( [ 1 ] );
				expect( expectedFirstMarker.getRange().end.path ).to.deep.equal( [ 1, 0 ] );
				expect( expectedSecondMarker.getRange().start.path ).to.deep.equal( [ 1 ] );
				expect( expectedSecondMarker.getRange().end.path ).to.deep.equal( [ 1, 1 ] );
			} );

			it( 'should create marker on paragraph after inserting between another paragraphs', () => {
				// <paragraph>foo</paragraph>[]<paragraph>Bar</paragraph>
				// {<paragraph>Test</paragraph>}
				//
				// <paragraph>foo</paragraph>{<paragraph>Test</paragraph>}<paragraph>Bar</paragraph>
				_setModelData( model, '<paragraph>foo</paragraph>[]<paragraph>Bar</paragraph>' );

				insertHelper( '<paragraph>Test</paragraph>', {
					'marker-a': { start: [ 0 ], end: [ 1 ] }
				}, [ 1 ] );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>foo[]</paragraph><paragraph>Test</paragraph><paragraph>Bar</paragraph>'
				);

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 1 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 2 ] );
			} );

			it( 'should create marker after inserting imageBlock next to paragraph', () => {
				// <paragraph>foo</paragraph>[]
				// {<imageBlock></imageBlock>}
				//
				// <paragraph>foo</paragraph>{<imageBlock></imageBlock>}
				_setModelData( model, '<paragraph>foo</paragraph>[]' );

				insertHelper( '<imageBlock></imageBlock>', {
					'marker-a': { start: [ 0 ], end: [ 1 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>foo</paragraph>[<imageBlock></imageBlock>]' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 1 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 2 ] );
			} );

			it( 'should create marker on imageInline after inserting inside paragraph', () => {
				// <paragraph>foo[]</paragraph>
				// {<imageInline></imageInline>}
				//
				// <paragraph>foo{<imageInline></imageInline>}</paragraph>
				_setModelData( model, '<paragraph>foo[]</paragraph>' );

				insertHelper( '<imageInline></imageInline>', {
					'marker-a': { start: [ 0 ], end: [ 1 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>foo<imageInline></imageInline>[]</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 3 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 4 ] );
			} );

			it( 'should create marker on imageInline when content contains another imageInline', () => {
				// <paragraph><imageInline></imageInline>[]</paragraph>
				// {<imageInline></imageInline>}
				//
				// <paragraph><imageInline></imageInline>{<imageInline></imageInline>}</paragraph>
				_setModelData( model, '<paragraph><imageInline></imageInline>[]</paragraph>' );

				insertHelper( '<imageInline></imageInline>', {
					'marker-a': { start: [ 0 ], end: [ 1 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph><imageInline></imageInline><imageInline></imageInline>[]</paragraph>'
				);

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 1 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 2 ] );
			} );

			it( 'should create marker which contains text and imageInline', () => {
				// <paragraph>Foo[]</paragraph>
				// <paragraph>b{ar<imageInline></imageInline>bar}</paragraph>
				//
				// <paragraph>Foob{ar<imageInline></imageInline>bar}</paragraph>
				_setModelData( model, '<paragraph>Foo[]</paragraph>' );

				insertHelper( '<paragraph>bar<imageInline></imageInline>bar</paragraph>', {
					'marker-a': { start: [ 0, 1 ], end: [ 0, 7 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>Foobar<imageInline></imageInline>bar[]</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 4 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 10 ] );
			} );

			it( 'should create marker which starts in paragraph and ends inside another paragraph with imageInline', () => {
				// <paragraph>Foo[]</paragraph>
				// <paragraph>b{ar</paragraph><paragraph><imageInline></imageInline>}</paragraph>
				//
				// <paragraph>Foob{ar</paragraph><paragraph><imageInline></imageInline>}</paragraph>
				_setModelData( model, '<paragraph>Foo[]</paragraph>' );

				insertHelper( '<paragraph>bar</paragraph><paragraph><imageInline></imageInline></paragraph>', {
					'marker-a': { start: [ 0, 1 ], end: [ 1, 1 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>Foobar</paragraph><paragraph><imageInline></imageInline>[]</paragraph>'
				);

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 4 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1, 1 ] );
			} );

			it( 'should create two markers that have intersection between multiple elements', () => {
				// <paragraph>Foo[]</paragraph>
				// <paragraph>b{a(r</paragraph><paragraph><imageInline></imageInline>te}s)t</paragraph>
				//
				// <paragraph>Foob{a(r</paragraph><paragraph><imageInline></imageInline>te}s)t</paragraph>
				_setModelData( model, '<paragraph>Foo[]</paragraph>' );

				insertHelper( '<paragraph>bar</paragraph><paragraph><imageInline></imageInline>test</paragraph>', {
					'marker-a': { start: [ 0, 1 ], end: [ 1, 3 ] },
					'marker-b': { start: [ 0, 2 ], end: [ 1, 4 ] }
				} );

				const expectedFirstMarker = model.markers.get( 'marker-a' );
				const expectedSecondMarker = model.markers.get( 'marker-b' );

				expect( _getModelData( model ) )
					.to.equal( '<paragraph>Foobar</paragraph><paragraph><imageInline></imageInline>test[]</paragraph>' );

				expect( expectedFirstMarker.getRange().start.path ).to.deep.equal( [ 0, 4 ] );
				expect( expectedFirstMarker.getRange().end.path ).to.deep.equal( [ 1, 3 ] );
				expect( expectedSecondMarker.getRange().start.path ).to.deep.equal( [ 0, 5 ] );
				expect( expectedSecondMarker.getRange().end.path ).to.deep.equal( [ 1, 4 ] );
			} );

			it( 'should create marker on imageInline inside paragraph after inserting at the beginning', () => {
				// <paragraph>[]Foo</paragraph>
				// <paragraph>{<imageInline></imageInline>}</paragraph><paragraph>bar</paragraph>
				//
				// <paragraph>{<imageInline></imageInline>}</paragraph><paragraph>barFoo</paragraph>
				_setModelData( model, '<paragraph>[]Foo</paragraph>' );

				insertHelper( '<paragraph><imageInline></imageInline></paragraph><paragraph>bar</paragraph>', {
					'marker-a': { start: [ 0, 0 ], end: [ 0, 1 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph><imageInline></imageInline></paragraph><paragraph>bar[]Foo</paragraph>'
				);

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 0 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 1 ] );
			} );

			it( 'should create marker after inserting paragraph with imageInline and text inside existing paragraph', () => {
				// <paragraph>F[]oo</paragraph>
				// {<paragraph><imageInline></imageInline>ba}r</paragraph>
				//
				// <paragraph>F{<imageInline></imageInline>ba}roo</paragraph>
				_setModelData( model, '<paragraph>F[]oo</paragraph>' );

				insertHelper( '<paragraph><imageInline></imageInline>bar</paragraph>', {
					'marker-a': { start: [ 0 ], end: [ 0, 3 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>F<imageInline></imageInline>bar[]oo</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 1 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 4 ] );
			} );

			it( 'should create marker after inserting paragraph with imageInline and another paragraph inside existing paragraph', () => {
				// <paragraph>F[]oo</paragraph>
				// {<paragraph><imageInline></imageInline></paragraph><paragraph>ba}r</paragraph>
				//
				// <paragraph>F{<imageInline></imageInline></paragraph><paragraph>ba}roo</paragraph>
				_setModelData( model, '<paragraph>F[]oo</paragraph>' );

				insertHelper( '<paragraph><imageInline></imageInline></paragraph><paragraph>bar</paragraph>', {
					'marker-a': { start: [ 0 ], end: [ 1, 2 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>F<imageInline></imageInline></paragraph><paragraph>bar[]oo</paragraph>'
				);

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 1 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1, 2 ] );
			} );

			it( 'should create marker after inserting imageInline and paragraph inside existing paragraph', () => {
				// <paragraph>F[]oo</paragraph>
				// {<imageInline></imageInline><paragraph>ba}r</paragraph>
				//
				// <paragraph>F{<imageInline></imageInline></paragraph><paragraph>ba}roo</paragraph>
				_setModelData( model, '<paragraph>F[]oo</paragraph>' );

				insertHelper( '<imageInline></imageInline><paragraph>bar</paragraph>', {
					'marker-a': { start: [ 0 ], end: [ 1, 2 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>F<imageInline></imageInline></paragraph><paragraph>bar[]oo</paragraph>'
				);

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 1 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1, 2 ] );
			} );

			it( 'should create marker which starts in paragraph and ends inside the beginning of next paragraph', () => {
				// <paragraph>Foo[]</paragraph>
				// <paragraph>b{ar</paragraph><paragraph>}</paragraph>
				//
				// <paragraph>Foob{ar</paragraph><paragraph>}</paragraph>
				_setModelData( model, '<paragraph>Foo[]</paragraph>' );

				insertHelper( '<paragraph>bar</paragraph><paragraph></paragraph>', {
					'marker-a': { start: [ 0, 1 ], end: [ 1, 0 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>Foobar</paragraph><paragraph>[]</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 4 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1, 0 ] );
			} );

			it( 'should create marker from imageInline and part of text from the next paragraph after inserting in the middle', () => {
				// <paragraph>Foo[]</paragraph>
				// {<imageInline></imageInline><paragraph>ba}r</paragraph>
				//
				// <paragraph>Foo{<imageInline></imageInline></paragraph><paragraph>ba}r</paragraph>
				_setModelData( model, '<paragraph>Foo[]</paragraph>' );

				insertHelper( '<imageInline></imageInline><paragraph>bar</paragraph>', {
					'marker-a': { start: [ 0 ], end: [ 1, 2 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>Foo<imageInline></imageInline></paragraph><paragraph>bar[]</paragraph>'
				);

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 3 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1, 2 ] );
			} );

			it( 'should create marker from imageInline and part of text from the next paragraph after inserting at he beginning',
				() => {
					// <paragraph>[]Foo</paragraph>
					// {<imageInline></imageInline><paragraph>ba}r</paragraph>
					//
					// <paragraph>{<imageInline></imageInline></paragraph><paragraph>ba}rFoo</paragraph>
					_setModelData( model, '<paragraph>[]Foo</paragraph>' );

					insertHelper( '<imageInline></imageInline><paragraph>bar</paragraph>', {
						'marker-a': { start: [ 0 ], end: [ 1, 2 ] }
					} );

					const expectedMarker = model.markers.get( 'marker-a' );

					expect( _getModelData( model ) )
						.to.equal( '<paragraph><imageInline></imageInline></paragraph><paragraph>bar[]Foo</paragraph>' );

					expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 0 ] );
					expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1, 2 ] );
				} );

			it.skip( 'should create marker on imageInline and part of paragraph text after inserting next to paragraph', () => {
				// <paragraph>Foo</paragraph>[]
				// {<imageInline></imageInline><paragraph>ba}r</paragraph>
				//
				// <paragraph>Foo</paragraph><paragraph>{<imageInline></imageInline></paragraph><paragraph>ba}r</paragraph>
				_setModelData( model, '<paragraph>Foo</paragraph>[]' );

				insertHelper( '<imageInline></imageInline><paragraph>bar</paragraph>', {
					'marker-a': { start: [ 0 ], end: [ 1, 2 ] }
				}, [ 1 ] );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) )
					.to.equal( '<paragraph>Foo[]</paragraph><paragraph><imageInline></imageInline></paragraph><paragraph>bar</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 1, 1 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 2, 2 ] );
			} );

			it.skip( 'should create marker from imageInline  and part of paragraph text after inserting before paragraph', () => {
				// []<paragraph>Foo</paragraph>
				// {<imageInline></imageInline><paragraph>ba}r</paragraph>
				//
				// <paragraph>{<imageInline></imageInline></paragraph><paragraph>ba}r</paragraph><paragraph>Foo</paragraph>
				_setModelData( model, '[]<paragraph>Foo</paragraph>' );

				insertHelper( '<imageInline></imageInline><paragraph>bar</paragraph>', {
					'marker-a': { start: [ 0 ], end: [ 1, 2 ] }
				}, [ 0 ] );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) )
					.to.equal( '<paragraph><imageInline></imageInline></paragraph><paragraph>bar</paragraph><paragraph>[]Foo</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 0 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1, 2 ] );
			} );

			it.skip( 'should create marker which contains the part of paragraph and imageInline', () => {
				// <paragraph>Foo[]</paragraph>
				// <paragraph>b{ar</paragraph><imageInline></imageInline>}
				//
				// <paragraph>Foob{ar</paragraph><paragraph><imageInline></imageInline>}</paragraph>
				_setModelData( model, '<paragraph>Foo[]</paragraph>' );

				insertHelper( '<paragraph>bar</paragraph><imageInline></imageInline>', {
					'marker-a': { start: [ 0, 1 ], end: [ 2 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>Foobar</paragraph><paragraph><imageInline></imageInline>[]</paragraph>'
				);

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 4 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1, 1 ] );
			} );

			it( 'should create marker on imageBlock after inserting at the begining of paragraph', () => {
				// <paragraph>[]Foo</paragraph>
				// {<imageBlock></imageBlock>}
				//
				// {<imageBlock></imageBlock>}<paragraph>Foo</paragraph>
				_setModelData( model, '<paragraph>[]Foo</paragraph>' );

				insertHelper( '<imageBlock></imageBlock>', {
					'marker-a': { start: [ 0 ], end: [ 1 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '[<imageBlock></imageBlock>]<paragraph>Foo</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1 ] );
			} );

			it.skip( 'should create marker on imageBlock after inserting in the middle of paragraph', () => {
				// <paragraph>Fo[]o</paragraph>
				// {<imageBlock></imageBlock>}
				//
				// <paragraph>Fo</paragraph>{<imageBlock></imageBlock>}<paragraph>o</paragraph>
				_setModelData( model, '<paragraph>Fo[]o</paragraph>' );

				insertHelper( '<imageBlock></imageBlock>', {
					'marker-a': { start: [ 0 ], end: [ 1 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>Fo</paragraph>[<imageBlock></imageBlock>]<paragraph>o</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 1 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 2 ] );
			} );

			it( 'should create marker on imageBlock after inserting at the end of paragraph', () => {
				// <paragraph>Foo[]</paragraph>
				// {<imageBlock></imageBlock>}
				//
				// <paragraph>Foo</paragraph>{<imageBlock></imageBlock>}
				_setModelData( model, '<paragraph>Foo[]</paragraph>' );

				insertHelper( '<imageBlock></imageBlock>', {
					'marker-a': { start: [ 0 ], end: [ 1 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>Foo</paragraph>[<imageBlock></imageBlock>]' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 1 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 2 ] );
			} );

			it( 'should create marker on imageBlock after inserting before paragraph', () => {
				// []<paragraph>Foo</paragraph>
				// {<imageBlock></imageBlock>}
				//
				// {<imageBlock></imageBlock>}<paragraph>Foo</paragraph>
				_setModelData( model, '[]<paragraph>Foo</paragraph>' );

				insertHelper( '<imageBlock></imageBlock>', {
					'marker-a': { start: [ 0 ], end: [ 1 ] }
				}, [ 0 ] );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<imageBlock></imageBlock><paragraph>[]Foo</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1 ] );
			} );

			it( 'should create marker on imageBlock after inserting next to another imageBlock', () => {
				// <imageBlock></imageBlock>[]
				// {<imageBlock></imageBlock>}
				//
				// <imageBlock></imageBlock>{<imageBlock></imageBlock>}
				_setModelData( model, '<imageBlock></imageBlock>[]' );

				insertHelper( '<imageBlock></imageBlock>', {
					'marker-a': { start: [ 0 ], end: [ 1 ] }
				}, [ 1 ] );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '[<imageBlock></imageBlock>]<imageBlock></imageBlock>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 1 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 2 ] );
			} );

			it( 'should create marker on imageBlock after inserting into paragraph next to another imageBlock', () => {
				// <imageBlock></imageBlock><paragraph>[]</paragraph>
				// {<imageBlock></imageBlock>}
				//
				// <imageBlock></imageBlock>{<imageBlock></imageBlock>}
				_setModelData( model, '<imageBlock></imageBlock><paragraph>[]</paragraph>' );

				insertHelper( '<imageBlock></imageBlock>', {
					'marker-a': { start: [ 0 ], end: [ 1 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<imageBlock></imageBlock>[<imageBlock></imageBlock>]' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 1 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 2 ] );
			} );

			it( 'should create marker on imageBlock after inserting between another image blocks', () => {
				// <imageBlock></imageBlock>[]<imageBlock></imageBlock>
				// {<imageBlock></imageBlock>}
				//
				// <imageBlock></imageBlock>{<imageBlock></imageBlock>}<imageBlock></imageBlock>
				_setModelData( model, '<imageBlock></imageBlock>[]<imageBlock></imageBlock>' );

				insertHelper( '<imageBlock></imageBlock>', {
					'marker-a': { start: [ 0 ], end: [ 1 ] }
				}, [ 1 ] );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal(
					'[<imageBlock></imageBlock>]<imageBlock></imageBlock><imageBlock></imageBlock>'
				);

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 1 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 2 ] );
			} );

			it( 'should create marker on imageBlock after inserting next to imageInline', () => {
				// <paragraph><imageInline></imageInline>[]</paragraph>
				// {<imageBlock></imageBlock>}
				//
				// <paragraph><imageInline></imageInline></paragraph>{<imageBlock></imageBlock>}
				_setModelData( model, '<paragraph><imageInline></imageInline>[]</paragraph>' );

				insertHelper( '<imageBlock></imageBlock>', {
					'marker-a': { start: [ 0 ], end: [ 1 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph><imageInline></imageInline></paragraph>[<imageBlock></imageBlock>]'
				);

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 1 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 2 ] );
			} );

			it.skip( 'should create marker on imageBlock and imageInline after inserting', () => {
				// <paragraph>[]</paragraph>
				// {<imageBlock></imageBlock><imageInline></imageInline>}
				//
				// {<imageBlock></imageBlock><paragraph><imageInline></imageInline>}</paragraph>
				_setModelData( model, '<paragraph>[]</paragraph>' );

				insertHelper( '<imageBlock></imageBlock><imageInline></imageInline>', {
					'marker-a': { start: [ 0 ], end: [ 2 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal(
					'<imageBlock></imageBlock><paragraph><imageInline></imageInline>[]</paragraph>'
				);

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1, 1 ] );
			} );

			it.skip( 'should create marker on imageBlock after inserting in block quoted paragraph', () => {
				// <blockQuote><paragraph>f[]oo</paragraph></blockQuote>
				// {<imageBlock></imageBlock>}
				//
				// <blockQuote><paragraph>f</paragraph>{<imageBlock></imageBlock>}<paragraph>oo</paragraph></blockQuote>
				_setModelData( model, '<blockQuote><paragraph>f[]oo</paragraph></blockQuote>' );

				insertHelper( '<imageBlock></imageBlock>', {
					'marker-a': { start: [ 0 ], end: [ 1 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) )
					.to.equal( '<blockQuote><paragraph>f</paragraph>[<imageBlock></imageBlock>]<paragraph>oo</paragraph></blockQuote>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 1 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 2 ] );
			} );

			it( 'should create marker in paragraph after inserting when content is empty', () => {
				// []
				// <paragraph>{foo}</paragraph>
				//
				// <paragraph>{foo}</paragraph>
				_setModelData( model, '[]' );

				insertHelper( '<paragraph>foo</paragraph>', {
					'marker-a': { start: [ 0, 0 ], end: [ 0, 3 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 0 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 3 ] );
			} );

			it( 'should create marker on imageInline after inserting when content is empty', () => {
				// []
				// {<imageInline></imageInline>}
				//
				// <paragraph>{<imageInline></imageInline>}</paragraph>
				_setModelData( model, '[]' );

				insertHelper( '<imageInline></imageInline>', {
					'marker-a': { start: [ 0 ], end: [ 1 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<paragraph><imageInline></imageInline>[]</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 0 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 1 ] );
			} );

			it( 'should create marker on paragraph containing imageInline after inserting when content is empty', () => {
				// []
				// <paragraph>{Foo<imageInline></imageInline></paragraph>}
				//
				// <paragraph>{Foo<imageInline></imageInline></paragraph>}
				_setModelData( model, '[]' );

				insertHelper( '<paragraph>Foo<imageInline></imageInline></paragraph>', {
					'marker-a': { start: [ 0, 0 ], end: [ 1 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>Foo<imageInline></imageInline>[]</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 0 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1 ] );
			} );

			it( 'should create marker on imageBlock after inserting when content is empty', () => {
				// []
				// {<imageBlock></imageBlock>}
				//
				// {<imageBlock></imageBlock>}
				_setModelData( model, '[]' );

				insertHelper( '<imageBlock></imageBlock>', {
					'marker-a': { start: [ 0 ], end: [ 1 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '[<imageBlock></imageBlock>]' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1 ] );
			} );

			it( 'should create multiple markers around imageBlocks after inserting into empty content', () => {
				// []
				// {<imageBlock></imageBlock>}(<imageBlock></imageBlock>)
				//
				// {<imageBlock></imageBlock>}(<imageBlock></imageBlock>)
				_setModelData( model, '[]' );

				insertHelper( '<imageBlock></imageBlock><imageBlock></imageBlock>', {
					'marker-a': { start: [ 0 ], end: [ 1 ] },
					'marker-b': { start: [ 1 ], end: [ 2 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );
				const expectedMarkerB = model.markers.get( 'marker-b' );

				expect( _getModelData( model ) ).to.equal( '<imageBlock></imageBlock>[<imageBlock></imageBlock>]' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1 ] );
				expect( expectedMarkerB.getRange().start.path ).to.deep.equal( [ 1 ] );
				expect( expectedMarkerB.getRange().end.path ).to.deep.equal( [ 2 ] );
			} );

			describe( 'collapsed', () => {
				it( 'should create collapsed marker after inserting paragraph at the beginning', () => {
					// <paragraph>[]foo</paragraph>
					// <paragraph>{}Bar</paragraph>
					//
					// <paragraph>{}Barfoo</paragraph>
					_setModelData( model, '<paragraph>[]foo</paragraph>' );

					insertHelper( '<paragraph>Bar</paragraph>', {
						'marker-a': { start: [ 0, 0 ], end: [ 0, 0 ] }
					} );

					const expectedMarker = model.markers.get( 'marker-a' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>Bar[]foo</paragraph>' );

					expect( expectedMarker ).to.exist;
					expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 0 ] );
					expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 0 ] );
				} );

				it( 'should create collapsed marker after inserting paragraph in the middle', () => {
					// <paragraph>f[]oo</paragraph>
					// <paragraph>{}Bar</paragraph>
					//
					// <paragraph>f{}Baroo</paragraph>
					_setModelData( model, '<paragraph>f[]oo</paragraph>' );

					insertHelper( '<paragraph>Bar</paragraph>', {
						'marker-a': { start: [ 0, 0 ], end: [ 0, 0 ] }
					} );

					const expectedMarker = model.markers.get( 'marker-a' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>fBar[]oo</paragraph>' );

					expect( expectedMarker ).to.exist;
					expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 1 ] );
					expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 1 ] );
				} );

				it( 'should create collapsed marker after inserting paragraph at the end', () => {
					// <paragraph>foo[]</paragraph>
					// <paragraph>{}Bar</paragraph>
					//
					// <paragraph>foo{}Bar</paragraph>
					_setModelData( model, '<paragraph>foo[]</paragraph>' );

					insertHelper( '<paragraph>Bar</paragraph>', {
						'marker-a': { start: [ 0, 0 ], end: [ 0, 0 ] }
					} );

					const expectedMarker = model.markers.get( 'marker-a' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>fooBar[]</paragraph>' );

					expect( expectedMarker ).to.exist;
					expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 3 ] );
					expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 3 ] );
				} );

				it( 'should create collapsed marker after inserting paragraph next to another one', () => {
					// <paragraph>foo</paragraph>[]
					// <paragraph>{}Bar</paragraph>
					//
					// <paragraph>foo</paragraph><paragraph>{}Bar</paragraph>
					_setModelData( model, '<paragraph>foo</paragraph>[]' );

					insertHelper( '<paragraph>Bar</paragraph>', {
						'marker-a': { start: [ 0, 0 ], end: [ 0, 0 ] }
					}, [ 1 ] );

					const expectedMarker = model.markers.get( 'marker-a' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph><paragraph>Bar</paragraph>' );

					expect( expectedMarker ).to.exist;
					expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 1, 0 ] );
					expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1, 0 ] );
				} );

				it( 'should create collapsed marker after inserting paragraph before another one', () => {
					// []<paragraph>foo</paragraph>
					// <paragraph>{}Bar</paragraph>
					//
					// <paragraph>{}Bar</paragraph><paragraph>foo</paragraph>
					_setModelData( model, '[]<paragraph>foo</paragraph>' );

					insertHelper( '<paragraph>Bar</paragraph>', {
						'marker-a': { start: [ 0, 0 ], end: [ 0, 0 ] }
					}, [ 0 ] );

					const expectedMarker = model.markers.get( 'marker-a' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>Bar</paragraph><paragraph>[]foo</paragraph>' );

					expect( expectedMarker ).to.exist;
					expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 0 ] );
					expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 0 ] );
				} );

				it( 'should create collapsed marker between two paragraphs', () => {
					// []<paragraph>foo</paragraph>
					// <paragraph>Bar</paragraph>{}
					//
					// <paragraph>Bar</paragraph>{}<paragraph>foo</paragraph>
					_setModelData( model, '[]<paragraph>foo</paragraph>' );

					insertHelper( '<paragraph>Bar</paragraph>', {
						'marker-a': { start: [ 1 ], end: [ 1 ] }
					}, [ 0 ] );

					const expectedMarker = model.markers.get( 'marker-a' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>Bar</paragraph><paragraph>[]foo</paragraph>' );

					expect( expectedMarker ).to.exist;
					expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 1 ] );
					expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1 ] );
				} );

				it( 'should create collapsed marker after inserting imageInline at the beginning of paragraph', () => {
					// <paragraph>[]foo</paragraph>
					// {}<imageInline></imageInline>
					//
					// <paragraph>{}<imageInline></imageInline>foo</paragraph>
					_setModelData( model, '<paragraph>[]foo</paragraph>' );

					insertHelper( '<imageInline></imageInline>', {
						'marker-a': { start: [ 0 ], end: [ 0 ] }
					} );

					const expectedMarker = model.markers.get( 'marker-a' );

					expect( _getModelData( model ) ).to.equal( '<paragraph><imageInline></imageInline>[]foo</paragraph>' );

					expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 0 ] );
					expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 0 ] );
				} );

				it( 'should create collapsed marker after inserting imageInline in the middle of paragraph', () => {
					// <paragraph>f[]oo</paragraph>
					// {}<imageInline></imageInline>
					//
					// <paragraph>f{}<imageInline></imageInline>oo</paragraph>
					_setModelData( model, '<paragraph>f[]oo</paragraph>' );

					insertHelper( '<imageInline></imageInline>', {
						'marker-a': { start: [ 0 ], end: [ 0 ] }
					} );

					const expectedMarker = model.markers.get( 'marker-a' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>f<imageInline></imageInline>[]oo</paragraph>' );

					expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 1 ] );
					expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 1 ] );
				} );

				it( 'should create collapsed marker after inserting imageInline at the end of paragraph', () => {
					// <paragraph>foo[]</paragraph>
					// {}<imageInline></imageInline>
					//
					// <paragraph>foo{}<imageInline></imageInline></paragraph>
					_setModelData( model, '<paragraph>foo[]</paragraph>' );

					insertHelper( '<imageInline></imageInline>', {
						'marker-a': { start: [ 0 ], end: [ 0 ] }
					} );

					const expectedMarker = model.markers.get( 'marker-a' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>foo<imageInline></imageInline>[]</paragraph>' );

					expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 3 ] );
					expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 3 ] );
				} );

				it.skip( 'should create collapsed marker after inserting imageInline next to paragraph', () => {
					// <paragraph>foo</paragraph>[]
					// {}<imageInline></imageInline>
					//
					// <paragraph>foo</paragraph><paragraph>{}<imageInline></imageInline></paragraph>
					_setModelData( model, '<paragraph>foo</paragraph>[]' );

					insertHelper( '<imageInline></imageInline>', {
						'marker-a': { start: [ 0 ], end: [ 0 ] }
					}, [ 1 ] );

					const expectedMarker = model.markers.get( 'marker-a' );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>foo[]</paragraph><paragraph><imageInline></imageInline></paragraph>'
					);

					expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 1, 1 ] );
					expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1, 1 ] );
				} );

				it( 'should create collapsed marker after inserting imageInline before paragraph', () => {
					// []<paragraph>foo</paragraph>
					// {}<imageInline></imageInline>
					//
					// {}<paragraph><imageInline></imageInline></paragraph><paragraph>foo</paragraph>
					_setModelData( model, '[]<paragraph>foo</paragraph>' );

					insertHelper( '<imageInline></imageInline>', {
						'marker-a': { start: [ 0 ], end: [ 0 ] }
					}, [ 0 ] );

					const expectedMarker = model.markers.get( 'marker-a' );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph><imageInline></imageInline></paragraph><paragraph>[]foo</paragraph>'
					);

					expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0 ] );
					expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0 ] );
				} );

				it( 'should create collapsed marker after inserting imageBlock at the beginning of paragraph', () => {
					// <paragraph>[]foo</paragraph>
					// {}<imageBlock></imageBlock>
					//
					// {}<imageBlock></imageBlock><paragraph>foo</paragraph>
					_setModelData( model, '<paragraph>[]foo</paragraph>' );

					insertHelper( '<imageBlock></imageBlock>', {
						'marker-a': { start: [ 0 ], end: [ 0 ] }
					} );

					const expectedMarker = model.markers.get( 'marker-a' );

					expect( _getModelData( model ) ).to.equal( '[<imageBlock></imageBlock>]<paragraph>foo</paragraph>' );

					expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0 ] );
					expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0 ] );
				} );

				it.skip( 'should create collapsed marker after inserting imageBlock in the middle of paragraph', () => {
					// <paragraph>f[]oo</paragraph>
					// {}<imageBlock></imageBlock>
					//
					// <paragraph>f</paragraph>{}<imageBlock></imageBlock><paragraph>oo</paragraph>
					_setModelData( model, '<paragraph>f[]oo</paragraph>' );

					insertHelper( '<imageBlock></imageBlock>', {
						'marker-a': { start: [ 0 ], end: [ 0 ] }
					} );

					const expectedMarker = model.markers.get( 'marker-a' );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph>f</paragraph>[<imageBlock></imageBlock>]<paragraph>oo</paragraph>'
					);

					expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 1 ] );
					expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1 ] );
				} );

				it( 'should create collapsed marker after inserting imageBlock at the end of paragraph', () => {
					// <paragraph>foo[]</paragraph>
					// {}<imageBlock></imageBlock>
					//
					// <paragraph>foo</paragraph>{}<imageBlock></imageBlock>
					_setModelData( model, '<paragraph>foo[]</paragraph>' );

					insertHelper( '<imageBlock></imageBlock>', {
						'marker-a': { start: [ 0 ], end: [ 0 ] }
					} );

					const expectedMarker = model.markers.get( 'marker-a' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>foo</paragraph>[<imageBlock></imageBlock>]' );

					expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 1 ] );
					expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1 ] );
				} );

				it( 'should create collapsed marker after inserting imageBlock next to paragraph', () => {
					// <paragraph>foo</paragraph>[]
					// {}<imageBlock></imageBlock>
					//
					// <paragraph>foo</paragraph>{}<imageBlock></imageBlock>
					_setModelData( model, '<paragraph>foo</paragraph>[]' );

					insertHelper( '<imageBlock></imageBlock>', {
						'marker-a': { start: [ 0 ], end: [ 0 ] }
					}, [ 1 ] );

					const expectedMarker = model.markers.get( 'marker-a' );

					expect( _getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph><imageBlock></imageBlock>' );

					expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 1 ] );
					expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1 ] );
				} );

				it( 'should create collapsed marker after inserting imageBlock before paragraph', () => {
					// []<paragraph>foo</paragraph>
					// {}<imageBlock></imageBlock>
					//
					// {}<imageBlock></imageBlock><paragraph>foo</paragraph>
					_setModelData( model, '[]<paragraph>foo</paragraph>' );

					insertHelper( '<imageBlock></imageBlock>', {
						'marker-a': { start: [ 0 ], end: [ 0 ] }
					}, [ 0 ] );

					const expectedMarker = model.markers.get( 'marker-a' );

					expect( _getModelData( model ) ).to.equal( '<imageBlock></imageBlock><paragraph>[]foo</paragraph>' );

					expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0 ] );
					expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0 ] );
				} );

				it( 'should create collapsed marker between imageBlock and paragraph', () => {
					// []<paragraph>foo</paragraph>
					// <imageBlock></imageBlock>{}
					//
					// <imageBlock></imageBlock>{}<paragraph>foo</paragraph>
					_setModelData( model, '[]<paragraph>foo</paragraph>' );

					insertHelper( '<imageBlock></imageBlock>', {
						'marker-a': { start: [ 1 ], end: [ 1 ] }
					}, [ 0 ] );

					const expectedMarker = model.markers.get( 'marker-a' );

					expect( _getModelData( model ) ).to.equal( '<imageBlock></imageBlock><paragraph>[]foo</paragraph>' );

					expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 1 ] );
					expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 1 ] );
				} );

				it( 'should create multiple collapsed marker after inserting different elements in empty content', () => {
					// []
					// {}<imageInline></imageInline>()<imageBlock></imageBlock>
					//
					// <paragraph>{}<imageInline></imageInline>()</paragraph><imageBlock></imageBlock>
					_setModelData( model, '[]' );

					insertHelper( '<imageInline></imageInline><imageBlock></imageBlock>', {
						'marker-a': { start: [ 0 ], end: [ 0 ] },
						'marker-b': { start: [ 1 ], end: [ 1 ] }
					} );

					const expectedMarkerA = model.markers.get( 'marker-a' );
					const expectedMarkerB = model.markers.get( 'marker-b' );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph><imageInline></imageInline></paragraph>[<imageBlock></imageBlock>]'
					);

					expect( expectedMarkerA.getRange().start.path ).to.deep.equal( [ 0, 0 ] );
					expect( expectedMarkerA.getRange().end.path ).to.deep.equal( [ 0, 0 ] );
					expect( expectedMarkerB.getRange().start.path ).to.deep.equal( [ 0, 1 ] );
					expect( expectedMarkerB.getRange().end.path ).to.deep.equal( [ 0, 1 ] );
				} );
			} );

			it( 'should create marker after inserting empty document fragment', () => {
				// <paragraph>fo[]o</paragraph>
				// '{}'
				//
				// <paragraph>fo{}o</paragraph>
				_setModelData( model, '<paragraph>fo[]o</paragraph>' );

				insertHelper( new ModelDocumentFragment( [] ), {
					'marker-a': { start: [ 0 ], end: [ 0 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>fo[]o</paragraph>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 2 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 2 ] );
			} );

			it( 'should not create marker when insertion is forbidden', () => {
				// <wrapper><limit><paragraph>[]</paragraph></limit></wrapper>
				// {<wrapper><limit><paragraph>foo</paragraph></limit></wrapper>}
				//
				// <wrapper><limit><paragraph></paragraph></limit></wrapper>
				_setModelData( model, '<wrapper><limit><paragraph>[]</paragraph></limit></wrapper>' );

				// Pasted content is forbidden in current selection.
				insertHelper( '<wrapper><limit><paragraph>foo</paragraph></limit></wrapper>', {
					'marker-a': { start: [ 0, 0 ], end: [ 1 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<wrapper><limit><paragraph>[]</paragraph></limit></wrapper>' );

				expect( expectedMarker ).to.be.null;
			} );

			it( 'should not create marker that is partially on forbidden content', () => {
				// <wrapper><limit><paragraph>[]</paragraph></limit></wrapper>
				// {<wrapper><limit><paragraph>foo</paragraph></limit></wrapper><paragraph>Ba}r</paragraph>
				//
				// <wrapper><limit><paragraph>Bar</paragraph></limit></wrapper>
				_setModelData( model, '<wrapper><limit><paragraph>[]</paragraph></limit></wrapper>' );

				insertHelper( '<wrapper><limit><paragraph>foo</paragraph></limit></wrapper><paragraph>Bar</paragraph>', {
					'marker-a': { start: [ 0, 0 ], end: [ 1, 2 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<wrapper><limit><paragraph>Bar[]</paragraph></limit></wrapper>' );

				expect( expectedMarker ).to.be.null;
			} );

			it( 'should create marker that starts before and ends after forbidden content', () => {
				// <wrapper><limit><paragraph>[]</paragraph></limit></wrapper>
				// <paragraph>{Test</paragraph><wrapper><limit><paragraph>foo</paragraph></limit></wrapper><paragraph>Ba}r</paragraph>
				//
				// <wrapper><limit><paragraph>{Test</paragraph><paragraph>Ba}r</paragraph></limit></wrapper>
				_setModelData( model, '<wrapper><limit><paragraph>[]</paragraph></limit></wrapper>' );

				insertHelper(
					'<paragraph>Test</paragraph><wrapper><limit><paragraph>foo</paragraph></limit></wrapper><paragraph>Bar</paragraph>',
					{
						'marker-a': { start: [ 0, 0 ], end: [ 2, 2 ] }
					}
				);

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) )
					.to.equal( '<wrapper><limit><paragraph>Test</paragraph><paragraph>Bar[]</paragraph></limit></wrapper>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 0, 0, 0 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 0, 1, 2 ] );
			} );

			it( 'should create marker that is next to forbidden content', () => {
				// <wrapper><limit><paragraph>[]</paragraph></limit></wrapper>
				// <wrapper><limit><paragraph>foo</paragraph></limit></wrapper><paragraph>B{ar}</paragraph>
				//
				// <wrapper><limit><paragraph>B{ar}</paragraph></limit></wrapper>
				_setModelData( model, '<wrapper><limit><paragraph>[]</paragraph></limit></wrapper>' );

				insertHelper( '<wrapper><limit><paragraph>foo</paragraph></limit></wrapper><paragraph>Bar</paragraph>', {
					'marker-a': { start: [ 1, 1 ], end: [ 1, 3 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<wrapper><limit><paragraph>Bar[]</paragraph></limit></wrapper>' );

				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 0, 0, 1 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 0, 0, 3 ] );
			} );

			it( 'should create 500 markers', () => {
				_setModelData( model, '<paragraph>foo[]</paragraph>' );

				const mockMarkers = {};
				for ( let i = 0; i < 500; i++ ) {
					mockMarkers[ `comment-thread-${ i }` ] = { start: [ 0, 0 ], end: [ 0, 3 ] };
				}

				insertHelper( '<paragraph>Bar</paragraph>', mockMarkers );

				for ( let i = 0; i < 500; i++ ) {
					expect( model.markers.get( `comment-thread-${ i }` ) ).to.exist;
				}
			} );

			it( 'should handle markers when selection range is null', () => {
				// <paragraph>[]foo</paragraph>
				// <paragraph>{Ba}r</paragraph>
				//
				// <paragraph>{Ba}rfoo</paragraph>
				testUtils.sinon.stub( console, 'warn' );

				model.schema.getNearestSelectionRange = () => null;
				_setModelData( model, '<paragraph>[]foo</paragraph>' );

				insertHelper( '<paragraph>Bar</paragraph>', {
					'marker-a': { start: [ 0, 0 ], end: [ 0, 2 ] }
				} );

				const expectedMarker = model.markers.get( 'marker-a' );

				expect( _getModelData( model ) ).to.equal( '<paragraph>Bar[]foo</paragraph>' );

				expect( expectedMarker ).to.exist;
				expect( expectedMarker.getRange().start.path ).to.deep.equal( [ 0, 0 ] );
				expect( expectedMarker.getRange().end.path ).to.deep.equal( [ 0, 2 ] );
			} );

			describe( 'affected range', () => {
				it( 'should calculate affected range correctly after inserting content with simple marker', () => {
					_setModelData( model, '<paragraph>foo[]</paragraph>' );

					const affectedRange = insertHelper( '<paragraph>Bar</paragraph>', {
						'marker-a': { start: [ 0, 0 ], end: [ 0, 3 ] }
					} );

					expect( affectedRange.start.path ).to.deep.equal( [ 0, 3 ] );
					expect( affectedRange.end.path ).to.deep.equal( [ 0, 6 ] );
				} );

				it( 'should calculate affected range correctly after inserting in the middle of paragraph', () => {
					_setModelData( model, '<paragraph>fo[]o</paragraph>' );

					const affectedRange = insertHelper( '<paragraph>Bar</paragraph>', {
						'marker-a': { start: [ 0, 0 ], end: [ 0, 3 ] }
					} );

					expect( affectedRange.start.path ).to.deep.equal( [ 0, 2 ] );
					expect( affectedRange.end.path ).to.deep.equal( [ 0, 5 ] );
				} );

				it( 'should calculate affected range correctly after inserting paragraph before another one', () => {
					_setModelData( model, '[]<paragraph>foo</paragraph>' );

					const affectedRange = insertHelper( '<paragraph>Bar</paragraph>', {
						'marker-a': { start: [ 0, 0 ], end: [ 0, 3 ] }
					} );

					expect( affectedRange.start.path ).to.deep.equal( [ 0, 0 ] );
					expect( affectedRange.end.path ).to.deep.equal( [ 0, 3 ] );
				} );

				it( 'should return affected range correctly after inserting content with multiple markers', () => {
					_setModelData( model, '<paragraph>foo[]</paragraph>' );

					const affectedRange = insertHelper( '<paragraph>Bar</paragraph>', {
						'marker-a': { start: [ 0, 0 ], end: [ 0, 1 ] },
						'marker-b': { start: [ 0, 1 ], end: [ 0, 2 ] }
					} );

					expect( affectedRange.start.path ).to.deep.equal( [ 0, 3 ] );
					expect( affectedRange.end.path ).to.deep.equal( [ 0, 6 ] );
				} );

				it( 'should calculate affected range correctly after inserting content with nested markers', () => {
					_setModelData( model, '<paragraph>foo[]</paragraph>' );

					const affectedRange = insertHelper( '<paragraph>Bar</paragraph>', {
						'marker-a': { start: [ 0, 0 ], end: [ 0, 3 ] },
						'marker-b': { start: [ 0, 1 ], end: [ 0, 2 ] }
					} );

					expect( affectedRange.start.path ).to.deep.equal( [ 0, 3 ] );
					expect( affectedRange.end.path ).to.deep.equal( [ 0, 6 ] );
				} );

				it( 'should calculate affected range correctly after inserting imageBlock', () => {
					_setModelData( model, '<paragraph>foo[]</paragraph>' );

					const affectedRange = insertHelper( '<imageBlock></imageBlock>', {
						'marker-a': { start: [ 0 ], end: [ 1 ] }
					} );

					expect( affectedRange.start.path ).to.deep.equal( [ 1 ] );
					expect( affectedRange.end.path ).to.deep.equal( [ 2 ] );
				} );

				it( 'should calculate affected range correctly after inserting paragraph in empty content', () => {
					_setModelData( model, '' );

					const affectedRange = insertHelper( '<paragraph>Bar</paragraph>', {
						'marker-a': { start: [ 0, 0 ], end: [ 0, 3 ] }
					} );

					expect( affectedRange.start.path ).to.deep.equal( [ 0 ] );
					expect( affectedRange.end.path ).to.deep.equal( [ 1 ] );
				} );

				it( 'should calculate affected range correctly after inserting imageBlock in empty content', () => {
					_setModelData( model, '' );

					const affectedRange = insertHelper( '<imageBlock></imageBlock>', {
						'marker-a': { start: [ 0 ], end: [ 1 ] }
					} );

					expect( affectedRange.start.path ).to.deep.equal( [ 0 ] );
					expect( affectedRange.end.path ).to.deep.equal( [ 1 ] );
				} );
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

			expect( _getModelData( model ) ).to.equal( '<limit>[]</limit>' );
			expect( _stringifyModel( root, affectedRange ) ).to.equal( '[<limit></limit>]' );
		} );

		it( 'should insert text into limit element', () => {
			_setModelData( model, '<limit>[]</limit>' );
			const affectedRange = insertHelper( 'foo bar' );

			expect( _getModelData( model ) ).to.equal( '<limit>foo bar[]</limit>' );
			expect( _stringifyModel( root, affectedRange ) ).to.equal( '<limit>[foo bar]</limit>' );
		} );

		it( 'should insert text into limit element when selection spans over many limit elements', () => {
			let affectedRange;

			model.enqueueChange( { isUndoable: false }, () => {
				_setModelData( model, '<limit>foo[</limit><limit>]bar</limit>' );
				affectedRange = insertHelper( 'baz' );
			} );

			expect( _getModelData( model ) ).to.equal( '<limit>foobaz[]</limit><limit>bar</limit>' );
			expect( _stringifyModel( root, affectedRange ) ).to.equal( '<limit>foo[baz]</limit><limit>bar</limit>' );
		} );

		it( 'should not insert disallowed elements inside limit elements', () => {
			_setModelData( model, '<limit>[]</limit>' );
			const affectedRange = insertHelper( '<disallowedElement></disallowedElement>' );

			expect( _getModelData( model ) ).to.equal( '<limit>[]</limit>' );
			expect( _stringifyModel( root, affectedRange ) ).to.equal( '<limit>[]</limit>' );
		} );

		it( 'should not leave the limit element when inserting at the end', () => {
			_setModelData( model, '<limit>foo[]</limit>' );
			const affectedRange = insertHelper( '<paragraph>a</paragraph><paragraph>b</paragraph>' );

			expect( _getModelData( model ) ).to.equal( '<limit>fooab[]</limit>' );
			expect( _stringifyModel( root, affectedRange ) ).to.equal( '<limit>foo[ab]</limit>' );
		} );

		it( 'should not leave the limit element when inserting at the beginning', () => {
			_setModelData( model, '<limit>[]foo</limit>' );
			const affectedRange = insertHelper( '<paragraph>a</paragraph><paragraph>b</paragraph>' );

			expect( _getModelData( model ) ).to.equal( '<limit>ab[]foo</limit>' );
			expect( _stringifyModel( root, affectedRange ) ).to.equal( '<limit>[ab]foo</limit>' );
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
				_setModelData( model, '<wrapper><limit><paragraph>[]</paragraph></limit></wrapper>' );

				// Pasted content is forbidden in current selection.
				const affectedRange = insertHelper( '<wrapper><limit><paragraph>foo</paragraph></limit></wrapper>' );

				expect( _getModelData( model ) ).to.equal( '<wrapper><limit><paragraph>[]</paragraph></limit></wrapper>' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal( '<wrapper><limit><paragraph>[]</paragraph></limit></wrapper>' );
			} );

			it( 'should correctly paste allowed nodes', () => {
				_setModelData( model, '<wrapper><limit><paragraph>[]</paragraph></limit></wrapper>' );

				const affectedRange = insertHelper( '<paragraph>foo</paragraph>' );

				expect( _getModelData( model ) ).to.equal( '<wrapper><limit><paragraph>foo</paragraph>[]</limit></wrapper>' );
				expect( _stringifyModel( root, affectedRange ) ).to.equal(
					'<wrapper><limit>[<paragraph>foo</paragraph>]</limit></wrapper>'
				);
			} );
		} );
	} );

	// Helper function that parses given content and inserts it at the cursor position.
	//
	// @param {module:engine/model/item~ModelItem|String} content
	// @returns {module:engine/model/range~ModelRange} range
	function insertHelper( content, markers, customInsertionPath ) {
		const selection = customInsertionPath ?
			model.createSelection( model.createPositionFromPath( doc.getRoot(), customInsertionPath ) ) :
			doc.selection;

		const markersMap = new Map();

		if ( typeof content == 'string' ) {
			content = _parseModel( content, model.schema, {
				context: [ '$clipboardHolder' ]
			} );

			if ( markers && !content.is( 'documentFragment' ) ) {
				content = new ModelDocumentFragment( [ content ] );
			}
		}

		if ( markers ) {
			for ( const [ name, value ] of Object.entries( markers ) ) {
				markersMap.set( name, new ModelRange(
					new ModelPosition( content, value.start ), new ModelPosition( content, value.end )
				) );
			}

			content.markers = markersMap;
		}

		return insertContent( model, content, selection );
	}
} );

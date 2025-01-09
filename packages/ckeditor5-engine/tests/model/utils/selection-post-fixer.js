/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Model from '../../../src/model/model.js';

import { stringify, getData as getModelData, setData as setModelData } from '../../../src/dev-utils/model.js';
import { injectSelectionPostFixer, mergeIntersectingRanges } from '../../../src/model/utils/selection-post-fixer.js';

describe( 'Selection post-fixer', () => {
	describe( 'injectSelectionPostFixer()', () => {
		it( 'is a function', () => {
			expect( injectSelectionPostFixer ).to.be.a( 'function' );
		} );
	} );

	describe( 'injected behavior', () => {
		let model, modelRoot;

		beforeEach( () => {
			model = new Model();
			modelRoot = model.document.createRoot();

			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			model.schema.register( 'table', {
				allowWhere: '$block',
				allowAttributes: [ 'headingRows', 'headingColumns' ],
				isLimit: true,
				isObject: true
			} );

			model.schema.register( 'tableRow', {
				allowIn: 'table',
				isLimit: true
			} );

			model.schema.register( 'tableCell', {
				allowIn: 'tableRow',
				allowAttributes: [ 'colspan', 'rowspan' ],
				isLimit: true,
				isSelectable: true
			} );

			model.schema.extend( '$block', { allowIn: 'tableCell' } );

			model.schema.register( 'imageBlock', {
				isObject: true,
				isBlock: true,
				allowWhere: '$block'
			} );

			model.schema.extend( '$block', { allowIn: 'tableCell' } );

			model.schema.register( 'caption', {
				allowIn: 'imageBlock',
				allowContentOf: '$block',
				isLimit: true
			} );

			model.schema.register( 'inlineWidget', {
				isObject: true,
				allowIn: [ '$block', '$clipboardHolder' ]
			} );

			model.schema.register( 'figure', {
				allowIn: '$root',
				allowAttributes: [ 'name', 'title' ]
			} );
		} );

		it( 'should not crash if there is no correct position for model selection', () => {
			setModelData( model, '' );

			// Note that auto-paragraphing post-fixer injected a paragraph into the empty root.
			expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
		} );

		it( 'should react to structure changes', () => {
			setModelData( model, '<paragraph>[]foo</paragraph><imageBlock></imageBlock>' );

			model.change( writer => {
				writer.remove( modelRoot.getChild( 0 ) );
			} );

			expect( getModelData( model ) ).to.equal( '[<imageBlock></imageBlock>]' );
		} );

		it( 'should react to selection changes', () => {
			setModelData( model, '<paragraph>[]foo</paragraph><imageBlock></imageBlock>' );

			// <paragraph>foo</paragraph>[]<imageBlock></imageBlock>
			model.change( writer => {
				writer.setSelection(
					writer.createRange( writer.createPositionAt( modelRoot, 1 ), writer.createPositionAt( modelRoot, 1 ) )
				);
			} );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph><imageBlock></imageBlock>' );
		} );

		describe( 'selection - table scenarios', () => {
			beforeEach( () => {
				setModelData( model,
					'<paragraph>[]foo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should fix #1 (range start outside table, end on table cell)', () => {
				// <paragraph>f[oo</paragraph><table><tableRow><tableCell></tableCell>]<tableCell>...
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( modelRoot.getChild( 0 ), 1 ),
						writer.createPositionAt( modelRoot.getChild( 1 ).getChild( 0 ), 1 )
					) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>f[oo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>]' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should fix #2 (range start on table cell, end outside table)', () => {
				// ...<table><tableRow><tableCell></tableCell>[<tableCell></tableCell></tableRow></table><paragraph>b]ar</paragraph>
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( modelRoot.getChild( 1 ).getChild( 0 ), 1 ),
						writer.createPositionAt( modelRoot.getChild( 2 ), 1 )
					) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'[<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>' +
					'<paragraph>b]ar</paragraph>'
				);
			} );

			it( 'should fix #3', () => {
				// <paragraph>f[oo</paragraph><table>]<tableRow>...
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( modelRoot.getChild( 0 ), 1 ),
						writer.createPositionAt( modelRoot.getChild( 1 ), 0 )
					) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>f[oo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>]' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should fix #4', () => {
				// <paragraph>foo</paragraph><table><tableRow><tableCell>a[aa</tableCell><tableCell>b]bb</tableCell>
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( modelRoot.getNodeByPath( [ 1, 0, 0, 0 ] ), 1 ),
						writer.createPositionAt( modelRoot.getNodeByPath( [ 1, 0, 1, 0 ] ), 2 )
					) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'[<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>]' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should fix #5 (collapsed selection between tables)', () => {
				setModelData( model,
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>' +
					'[]' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>xxx</paragraph></tableCell>' +
							'<tableCell><paragraph>yyy</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>' +
					'<paragraph>baz</paragraph>'
				);

				expect( getModelData( model ) ).to.equalMarkup(
					'<paragraph>foo</paragraph>' +
					'[<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>]' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>xxx</paragraph></tableCell>' +
							'<tableCell><paragraph>yyy</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>' +
					'<paragraph>baz</paragraph>'
				);
			} );

			// There's a chance that this and the following test will not be up to date with
			// how the table feature is really implemented once we'll introduce row/cells/columns selection
			// in which case all these elements will need to be marked as objects.
			it( 'should fix #6 (element selection of not an object)', () => {
				setModelData( model,
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'[<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>]' +
					'</table>' +
					'<paragraph>baz</paragraph>'
				);

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'[<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>]' +
					'<paragraph>baz</paragraph>'
				);
			} );

			it( 'should fix #7 (element selection of non-objects)', () => {
				setModelData( model,
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'[<tableRow>' +
							'<tableCell><paragraph>1</paragraph></tableCell>' +
							'<tableCell><paragraph>2</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>3</paragraph></tableCell>' +
							'<tableCell><paragraph>4</paragraph></tableCell>]' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>5</paragraph></tableCell>' +
							'<tableCell><paragraph>6</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>' +
					'<paragraph>baz</paragraph>'
				);

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'[<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>1</paragraph></tableCell>' +
							'<tableCell><paragraph>2</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>3</paragraph></tableCell>' +
							'<tableCell><paragraph>4</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>5</paragraph></tableCell>' +
							'<tableCell><paragraph>6</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>]' +
					'<paragraph>baz</paragraph>'
				);
			} );

			it( 'should fix #8 (cross-limit selection which starts in a non-limit elements)', () => {
				model.schema.extend( 'paragraph', { allowIn: 'tableCell' } );

				setModelData( model,
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>f[oo</paragraph></tableCell>' +
							'<tableCell><paragraph>b]ar</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>' +
					'<paragraph>baz</paragraph>'
				);

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'[<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>foo</paragraph></tableCell>' +
							'<tableCell><paragraph>bar</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>]' +
					'<paragraph>baz</paragraph>'
				);
			} );

			it( 'should not fix #1 (selection over paragraphs outside table)', () => {
				setModelData( model,
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>' +
					'<paragraph>b[ar</paragraph>' +
					'<paragraph>ba]z</paragraph>'
				);

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>' +
					'<paragraph>b[ar</paragraph>' +
					'<paragraph>ba]z</paragraph>'
				);
			} );

			it( 'should not fix #2 (selection over image in table)', () => {
				setModelData( model,
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>foo</paragraph><imageBlock></imageBlock></tableCell>' +
							'<tableCell><paragraph>[]bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				model.change( writer => {
					const image = model.document.getRoot().getNodeByPath( [ 1, 0, 0, 1 ] );

					writer.setSelection( writer.createRangeOn( image ) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>foo</paragraph>[<imageBlock></imageBlock>]</tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should not fix #3 (selection over paragraph & image in table)', () => {
				setModelData( model,
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>foo</paragraph><imageBlock></imageBlock></tableCell>' +
							'<tableCell><paragraph>[]bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				model.change( writer => {
					const tableCell = model.document.getRoot().getNodeByPath( [ 1, 0, 0 ] );

					writer.setSelection( writer.createRangeIn( tableCell ) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>[foo</paragraph><imageBlock></imageBlock>]</tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should not fix #4 (selection over image & paragraph in table)', () => {
				setModelData( model,
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><imageBlock></imageBlock><paragraph>foo</paragraph></tableCell>' +
							'<tableCell><paragraph>[]bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				model.change( writer => {
					const tableCell = model.document.getRoot().getNodeByPath( [ 1, 0, 0 ] );

					writer.setSelection( writer.createRangeIn( tableCell ) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell>[<imageBlock></imageBlock><paragraph>foo]</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should not fix #5 (selection over blockQuote in table)', () => {
				model.schema.register( 'blockQuote', {
					allowWhere: '$block',
					allowContentOf: '$root'
				} );

				setModelData( model,
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><blockQuote><paragraph>foo</paragraph></blockQuote></tableCell>' +
							'<tableCell><paragraph>[]bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				model.change( writer => {
					const tableCell = model.document.getRoot().getNodeByPath( [ 1, 0, 0 ] );

					writer.setSelection( writer.createRangeIn( tableCell ) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><blockQuote><paragraph>[foo]</paragraph></blockQuote></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should fix multiple ranges #1', () => {
				model.change( writer => {
					const ranges = [
						writer.createRange(
							writer.createPositionFromPath( modelRoot, [ 0, 1 ] ),
							writer.createPositionFromPath( modelRoot, [ 1, 0 ] )
						),
						writer.createRange(
							writer.createPositionFromPath( modelRoot, [ 1, 0, 0, 0 ] ),
							writer.createPositionFromPath( modelRoot, [ 1, 1 ] )
						)
					];
					writer.setSelection( ranges );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>f[oo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>]' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should fix multiple ranges #2', () => {
				model.change( writer => {
					const ranges = [
						writer.createRange(
							writer.createPositionFromPath( modelRoot, [ 0, 1 ] ),
							writer.createPositionFromPath( modelRoot, [ 1, 0 ] )
						),
						writer.createRange(
							writer.createPositionFromPath( modelRoot, [ 1, 0, 0, 0 ] ),
							writer.createPositionFromPath( modelRoot, [ 2, 2 ] )
						)
					];

					writer.setSelection( ranges );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>f[oo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>' +
					'<paragraph>ba]r</paragraph>'
				);
			} );

			it( 'should fix multiple ranges #3', () => {
				setModelData( model,
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>[aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>]' +
							'<tableCell><paragraph>[aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>]' +
							'<tableCell><paragraph>[aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>]' +
							'<tableCell><paragraph>[aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>' +
					'<paragraph>b]az</paragraph>'
				);

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'[<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>' +
					'<paragraph>b]az</paragraph>'
				);
			} );

			it( 'should not fix multiple ranges #1 (not overlapping ranges)', () => {
				model.change( writer => {
					const ranges = [
						writer.createRange(
							writer.createPositionFromPath( modelRoot, [ 0, 1 ] ),
							writer.createPositionFromPath( modelRoot, [ 1, 0 ] )
						),
						writer.createRange(
							writer.createPositionFromPath( modelRoot, [ 1, 0, 0, 0 ] ),
							writer.createPositionFromPath( modelRoot, [ 2, 1 ] )
						),
						writer.createRange(
							writer.createPositionFromPath( modelRoot, [ 2, 2 ] ),
							writer.createPositionFromPath( modelRoot, [ 2, 3 ] )
						)
					];

					writer.setSelection( ranges );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>f[oo</paragraph>' +
					'<table>' +
					'<tableRow>' +
					'<tableCell><paragraph>aaa</paragraph></tableCell>' +
					'<tableCell><paragraph>bbb</paragraph></tableCell>' +
					'</tableRow>' +
					'</table>' +
					'<paragraph>b]a[r]</paragraph>'
				);
			} );

			it( 'should not fix multiple ranges on objects (table selection)', () => {
				setModelData( model,
					'<table>' +
						'<tableRow>' +
							'[<tableCell><paragraph>a</paragraph></tableCell>]' +
							'[<tableCell><paragraph>b</paragraph></tableCell>]' +
						'</tableRow>' +
						'<tableRow>' +
							'[<tableCell><paragraph>c</paragraph></tableCell>]' +
							'<tableCell><paragraph>d</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				expect( getModelData( model ) ).to.equalMarkup(
					'<table>' +
					'<tableRow>' +
							'[<tableCell><paragraph>a</paragraph></tableCell>]' +
							'[<tableCell><paragraph>b</paragraph></tableCell>]' +
						'</tableRow>' +
						'<tableRow>' +
							'[<tableCell><paragraph>c</paragraph></tableCell>]' +
							'<tableCell><paragraph>d</paragraph></tableCell>' +
					'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should fix selection on block', () => {
				model.schema.extend( '$block', { allowIn: 'tableCell' } );

				setModelData( model,
					'<table>' +
					'<tableRow><tableCell>[<paragraph>aaa</paragraph>]</tableCell></tableRow>' +
					'</table>'
				);

				expect( getModelData( model ) ).to.equalMarkup(
					'<table>' +
						'<tableRow><tableCell><paragraph>[aaa]</paragraph></tableCell></tableRow>' +
					'</table>'
				);
			} );

			it( 'should allow multi-range selection on non-continues blocks (column selected)', () => {
				setModelData( model,
					'<table>' +
						'<tableRow>' +
							'[<tableCell><paragraph>A1</paragraph></tableCell>]' +
							'<tableCell><paragraph>B1</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'[<tableCell><paragraph>A2</paragraph></tableCell>]' +
							'<tableCell><paragraph>B2</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'[<tableCell><paragraph>A3</paragraph></tableCell>]' +
							'<tableCell><paragraph>B3</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				expect( getModelData( model ) ).to.equalMarkup(
					'<table>' +
						'<tableRow>' +
							'[<tableCell><paragraph>A1</paragraph></tableCell>]' +
							'<tableCell><paragraph>B1</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'[<tableCell><paragraph>A2</paragraph></tableCell>]' +
							'<tableCell><paragraph>B2</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'[<tableCell><paragraph>A3</paragraph></tableCell>]' +
							'<tableCell><paragraph>B3</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should allow multi-range selection on continues blocks (row selected)', () => {
				setModelData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>A1</paragraph></tableCell>' +
							'<tableCell><paragraph>B1</paragraph></tableCell>' +
							'<tableCell><paragraph>C1</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'[<tableCell><paragraph>A2</paragraph></tableCell>]' +
							'[<tableCell><paragraph>B2</paragraph></tableCell>]' +
							'[<tableCell><paragraph>C2</paragraph></tableCell>]' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>A3</paragraph></tableCell>' +
							'<tableCell><paragraph>B3</paragraph></tableCell>' +
							'<tableCell><paragraph>C3</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				expect( getModelData( model ) ).to.equalMarkup(
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>A1</paragraph></tableCell>' +
							'<tableCell><paragraph>B1</paragraph></tableCell>' +
							'<tableCell><paragraph>C1</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'[<tableCell><paragraph>A2</paragraph></tableCell>]' +
							'[<tableCell><paragraph>B2</paragraph></tableCell>]' +
							'[<tableCell><paragraph>C2</paragraph></tableCell>]' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>A3</paragraph></tableCell>' +
							'<tableCell><paragraph>B3</paragraph></tableCell>' +
							'<tableCell><paragraph>C3</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should allow multi-range selection with mixed continues/non-continues blocks (part of table selected)', () => {
				setModelData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>A1</paragraph></tableCell>' +
							'<tableCell><paragraph>B1</paragraph></tableCell>' +
							'<tableCell><paragraph>C1</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>A2</paragraph></tableCell>' +
							'[<tableCell><paragraph>B2</paragraph></tableCell>]' +
							'[<tableCell><paragraph>C2</paragraph></tableCell>]' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>A3</paragraph></tableCell>' +
							'[<tableCell><paragraph>B3</paragraph></tableCell>]' +
							'[<tableCell><paragraph>C3</paragraph></tableCell>]' +
						'</tableRow>' +
					'</table>'
				);

				expect( getModelData( model ) ).to.equalMarkup(
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>A1</paragraph></tableCell>' +
							'<tableCell><paragraph>B1</paragraph></tableCell>' +
							'<tableCell><paragraph>C1</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>A2</paragraph></tableCell>' +
							'[<tableCell><paragraph>B2</paragraph></tableCell>]' +
							'[<tableCell><paragraph>C2</paragraph></tableCell>]' +
							'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>A3</paragraph></tableCell>' +
							'[<tableCell><paragraph>B3</paragraph></tableCell>]' +
							'[<tableCell><paragraph>C3</paragraph></tableCell>]' +
						'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should not fix ranges in multi-range selection (each range set differently - but valid)', () => {
				setModelData( model,
					'<paragraph>[foo]</paragraph>' +
						'<table>' +
						'<tableRow>' +
							'[<tableCell><paragraph>aaa</paragraph></tableCell>]' +
							'<tableCell><paragraph>[bbb]</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				expect( getModelData( model ) ).to.equalMarkup(
					'<paragraph>[foo]</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'[<tableCell><paragraph>aaa</paragraph></tableCell>]' +
							'<tableCell><paragraph>[bbb]</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should fix partially wrong selection (last range is post-fixed on whole table)', () => {
				setModelData( model,
					'<table>' +
						'<tableRow>' +
							'[<tableCell><paragraph>aaa</paragraph></tableCell>]' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
							'[<tableCell><paragraph>ccc</paragraph></tableCell>' +
						'</tableRow>]' +
					'</table>'
				);

				expect( getModelData( model ) ).to.equalMarkup(
					'[<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
							'<tableCell><paragraph>ccc</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>]'
				);
			} );

			it( 'should fix partially wrong selection (first range is post-fixed on whole table)', () => {
				setModelData( model,
					'<table>' +
						'[<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>]' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
							'[<tableCell><paragraph>ccc</paragraph></tableCell>]' +
						'</tableRow>' +
					'</table>'
				);

				expect( getModelData( model ) ).to.equalMarkup(
					'[<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
							'<tableCell><paragraph>ccc</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>]'
				);
			} );

			it( 'should not reset the selection if the final range is the same as the initial one', () => {
				setModelData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell>[<imageBlock></imageBlock>]</tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				// Setting a selection attribute will trigger the post-fixer. However, because this
				// action does not affect ranges, the post-fixer should not set a new selection and,
				// in consequence, should not clear the selection attribute (like it normally would when
				// a new selection is set).
				// https://github.com/ckeditor/ckeditor5/issues/6693
				model.change( writer => {
					writer.setSelectionAttribute( 'foo', 'bar' );
				} );

				expect( getModelData( model ) ).to.equalMarkup(
					'<table>' +
						'<tableRow>' +
							'<tableCell>[<imageBlock></imageBlock>]</tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				expect( model.document.selection.hasAttribute( 'foo' ) ).to.be.true;
			} );

			it( 'should include a selectable object at the end of the selection', () => {
				model.schema.register( 'blockQuote', {
					allowWhere: '$block',
					allowContentOf: '$root'
				} );

				setModelData( model,
					'[<blockQuote>' +
						'<paragraph>foo</paragraph>' +
						'<table>' +
							'<tableRow>' +
								'<tableCell><paragraph>bar</paragraph></tableCell>' +
							'</tableRow>' +
						'</table>' +
					'</blockQuote>]'
				);

				expect( getModelData( model ) ).to.equalMarkup(
					'<blockQuote>' +
						'<paragraph>[foo</paragraph>' +
						'<table>' +
							'<tableRow>' +
								'<tableCell><paragraph>bar</paragraph></tableCell>' +
							'</tableRow>' +
						'</table>]' +
					'</blockQuote>'
				);
			} );
		} );

		describe( 'non-collapsed selection - image scenarios', () => {
			beforeEach( () => {
				setModelData( model,
					'<paragraph>[]foo</paragraph>' +
					'<imageBlock>' +
						'<caption>xxx</caption>' +
					'</imageBlock>' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should fix #1 (crossing object and limit boundaries)', () => {
				model.change( writer => {
					// <paragraph>f[oo</paragraph><imageBlock><caption>x]xx</caption>...
					writer.setSelection( writer.createRange(
						writer.createPositionAt( modelRoot.getChild( 0 ), 1 ),
						writer.createPositionAt( modelRoot.getChild( 1 ).getChild( 0 ), 1 )
					) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>f[oo</paragraph>' +
					'<imageBlock>' +
						'<caption>xxx</caption>' +
					'</imageBlock>]' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should fix #2 (crossing object boundary)', () => {
				model.change( writer => {
					// <paragraph>f[oo</paragraph><imageBlock>]<caption>xxx</caption>...
					writer.setSelection( writer.createRange(
						writer.createPositionAt( modelRoot.getChild( 0 ), 1 ),
						writer.createPositionAt( modelRoot.getChild( 1 ), 0 )
					) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>f[oo</paragraph>' +
					'<imageBlock>' +
						'<caption>xxx</caption>' +
					'</imageBlock>]' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should fix #3 (crossing object boundary)', () => {
				model.change( writer => {
					// <paragraph>f[oo</paragraph><imageBlock><caption>xxx</caption>]</imageBlock>...
					writer.setSelection( writer.createRange(
						writer.createPositionAt( modelRoot.getChild( 0 ), 1 ),
						writer.createPositionAt( modelRoot.getChild( 1 ), 1 )
					) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>f[oo</paragraph>' +
					'<imageBlock>' +
						'<caption>xxx</caption>' +
					'</imageBlock>]' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should fix #4 (element selection of not an object)', () => {
				model.change( writer => {
					// <paragraph>foo</paragraph><imageBlock>[<caption>xxx</caption>]</imageBlock>...
					writer.setSelection( writer.createRange(
						writer.createPositionAt( modelRoot.getChild( 1 ), 0 ),
						writer.createPositionAt( modelRoot.getChild( 1 ), 1 )
					) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'[<imageBlock>' +
						'<caption>xxx</caption>' +
					'</imageBlock>]' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should not fix #1 (element selection of an object)', () => {
				model.change( writer => {
					// <paragraph>foo</paragraph>[<imageBlock><caption>xxx</caption></imageBlock>]...
					writer.setSelection( writer.createRange(
						writer.createPositionAt( modelRoot, 1 ),
						writer.createPositionAt( modelRoot, 2 )
					) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'[<imageBlock>' +
						'<caption>xxx</caption>' +
					'</imageBlock>]' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should not fix #2 (inside a limit)', () => {
				model.change( writer => {
					const caption = modelRoot.getChild( 1 ).getChild( 0 );

					// <paragraph>foo</paragraph><imageBlock><caption>[xxx]</caption></imageBlock>...
					writer.setSelection( writer.createRange(
						writer.createPositionAt( caption, 0 ),
						writer.createPositionAt( caption, 3 )
					) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<imageBlock>' +
						'<caption>[xxx]</caption>' +
					'</imageBlock>' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should not fix #3 (inside a limit - partial text selection)', () => {
				model.change( writer => {
					const caption = modelRoot.getChild( 1 ).getChild( 0 );

					// <paragraph>foo</paragraph><imageBlock><caption>[xx]x</caption></imageBlock>...
					writer.setSelection( writer.createRange(
						writer.createPositionAt( caption, 0 ),
						writer.createPositionAt( caption, 2 )
					) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<imageBlock>' +
						'<caption>[xx]x</caption>' +
					'</imageBlock>' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should not fix #4 (inside a limit - partial text selection)', () => {
				model.change( writer => {
					const caption = modelRoot.getChild( 1 ).getChild( 0 );

					// <paragraph>foo</paragraph><imageBlock><caption>x[xx]</caption></imageBlock>...
					writer.setSelection( writer.createRange(
						writer.createPositionAt( caption, 1 ),
						writer.createPositionAt( caption, 3 )
					) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<imageBlock>' +
						'<caption>x[xx]</caption>' +
					'</imageBlock>' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should not fix #5 (selection in root on non limit element that doesn\'t allow text)', () => {
				setModelData( model,
					'[<figure></figure>]'
				);

				expect( getModelData( model ) ).to.equal(
					'[<figure></figure>]'
				);
			} );

			it( 'should fix multi-range selection with equal ranges', () => {
				// It may happen that multi-range selection contains equal ranges.
				// Duplicated ranges should be ommited from the final (merged) selection.
				// https://github.com/ckeditor/ckeditor5/issues/7892
				model.change( writer => {
					const firstRange = writer.createRange(
						writer.createPositionAt( modelRoot.getChild( 1 ).getChild( 0 ), 3 )
					);

					const duplicatedRange = firstRange.clone();

					const otherRange = writer.createRange(
						writer.createPositionAt( modelRoot.getChild( 1 ).getChild( 0 ), 3 ),
						writer.createPositionAt( modelRoot.getChild( 2 ), 0 )
					);

					// <paragraph>foo</paragraph><imageBlock><caption>xxx[][][</caption></imageBlock><paragraph>]bar</paragraph>
					writer.setSelection( [ firstRange, duplicatedRange, otherRange ] );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'[<imageBlock>' +
						'<caption>xxx</caption>' +
					'</imageBlock>' +
					'<paragraph>]bar</paragraph>'
				);
			} );
		} );

		describe( 'intersecting selection - merge ranges', () => {
			it( 'should return one merged range: A+B+C - #1', () => {
				setModelData( model,
					'<paragraph>fo[o b][ar b]az</paragraph>'
				);

				const rangeA = model.document.selection.getFirstRange();
				const rangeB = model.document.selection.getLastRange();
				// A range containing both rangeA and rangeB.
				const rangeC = model.createRange(
					model.createPositionAt( modelRoot.getChild( 0 ), 0 ),
					model.createPositionAt( modelRoot.getChild( 0 ), 11 )
				);

				const mergedRanges = mergeIntersectingRanges( [ rangeA, rangeB, rangeC ] );

				expect( mergedRanges.length ).to.equal( 1 );
				expect( stringify( model.document.getRoot(), mergedRanges[ 0 ] ) ).to.equal( '<paragraph>[foo bar baz]</paragraph>' );
			} );

			it( 'should return one merged range: A+B+C - #2', () => {
				setModelData( model,
					'<paragraph>f[oo b]a[r ba]z</paragraph>'
				);

				const rangeA = model.document.selection.getFirstRange();
				const rangeB = model.document.selection.getLastRange();
				// Range intersecting with rangeA and rangeB
				const rangeC = model.createRange(
					model.createPositionAt( modelRoot.getChild( 0 ), 4 ),
					model.createPositionAt( modelRoot.getChild( 0 ), 11 )
				);

				const mergedRanges = mergeIntersectingRanges( [ rangeA, rangeB, rangeC ] );

				expect( mergedRanges.length ).to.equal( 1 );
				expect( stringify( model.document.getRoot(), mergedRanges[ 0 ] ) ).to.equal( '<paragraph>f[oo bar baz]</paragraph>' );
			} );

			it( 'should return two ranges: A, B+C', () => {
				setModelData( model,
					'<paragraph>f[oo] ba[r ba]z</paragraph>'
				);

				const rangeA = model.document.selection.getFirstRange();
				const rangeB = model.document.selection.getLastRange();
				// Range intersecting with rangeB
				const rangeC = model.createRange(
					model.createPositionAt( modelRoot.getChild( 0 ), 4 ),
					model.createPositionAt( modelRoot.getChild( 0 ), 10 )
				);

				const mergedRanges = mergeIntersectingRanges( [ rangeA, rangeB, rangeC ] );

				expect( mergedRanges.length ).to.equal( 2 );
				expect( stringify( model.document.getRoot(), mergedRanges[ 0 ] ) ).to.equal( '<paragraph>f[oo] bar baz</paragraph>' );
				expect( stringify( model.document.getRoot(), mergedRanges[ 1 ] ) ).to.equal( '<paragraph>foo [bar ba]z</paragraph>' );
			} );

			it( 'should return two ranges: A+B,C', () => {
				setModelData( model,
					'<paragraph>f[oo][ bar] baz</paragraph>'	// foo bar baz
				);

				const rangeA = model.document.selection.getFirstRange();
				const rangeB = model.document.selection.getLastRange();
				const rangeC = model.createRange(
					model.createPositionAt( modelRoot.getChild( 0 ), 8 ),
					model.createPositionAt( modelRoot.getChild( 0 ), 11 )
				);

				const mergedRanges = mergeIntersectingRanges( [ rangeA, rangeB, rangeC ] );

				expect( mergedRanges.length ).to.equal( 3 );
				expect( stringify( model.document.getRoot(), mergedRanges[ 0 ] ) ).to.equal( '<paragraph>f[oo] bar baz</paragraph>' );
				expect( stringify( model.document.getRoot(), mergedRanges[ 1 ] ) ).to.equal( '<paragraph>foo[ bar] baz</paragraph>' );
				expect( stringify( model.document.getRoot(), mergedRanges[ 2 ] ) ).to.equal( '<paragraph>foo bar [baz]</paragraph>' );
			} );
		} );

		describe( 'non-collapsed selection - other scenarios', () => {
			it( 'should fix #1 (element selection of not an object)', () => {
				setModelData( model,
					'<paragraph>aaa</paragraph>' +
					'[<paragraph>bbb</paragraph>]' +
					'<paragraph>ccc</paragraph>'
				);

				expect( getModelData( model ) ).to.equal(
					'<paragraph>aaa</paragraph>' +
					'<paragraph>[bbb]</paragraph>' +
					'<paragraph>ccc</paragraph>'
				);
			} );

			it( 'should fix #2 (elements selection of not an object)', () => {
				setModelData( model,
					'<paragraph>aaa</paragraph>' +
					'[<paragraph>bbb</paragraph>' +
					'<paragraph>ccc</paragraph>]'
				);

				expect( getModelData( model ) ).to.equal(
					'<paragraph>aaa</paragraph>' +
					'<paragraph>[bbb</paragraph>' +
					'<paragraph>ccc]</paragraph>'
				);
			} );

			it( 'should fix #3 (partial selection of not an object)', () => {
				setModelData( model,
					'<paragraph>aaa</paragraph>' +
					'[<paragraph>bbb</paragraph>' +
					'<paragraph>ccc]</paragraph>'
				);

				expect( getModelData( model ) ).to.equal(
					'<paragraph>aaa</paragraph>' +
					'<paragraph>[bbb</paragraph>' +
					'<paragraph>ccc]</paragraph>'
				);
			} );

			it( 'should fix #4 (partial selection of not an object)', () => {
				setModelData( model,
					'<paragraph>aaa</paragraph>' +
					'<paragraph>b[bb</paragraph>]' +
					'<paragraph>ccc</paragraph>'
				);

				expect( getModelData( model ) ).to.equal(
					'<paragraph>aaa</paragraph>' +
					'<paragraph>b[bb]</paragraph>' +
					'<paragraph>ccc</paragraph>'
				);
			} );

			it( 'should fix #5 (partial selection of not an object)', () => {
				setModelData( model,
					'<paragraph>aaa</paragraph>' +
					'[<paragraph>bb]b</paragraph>' +
					'<paragraph>ccc</paragraph>'
				);

				expect( getModelData( model ) ).to.equal(
					'<paragraph>aaa</paragraph>' +
					'<paragraph>[bb]b</paragraph>' +
					'<paragraph>ccc</paragraph>'
				);
			} );

			it( 'should fix #6 (selection must not cross a limit element; starts in a root)', () => {
				model.schema.register( 'a', { isLimit: true, allowIn: '$root' } );
				model.schema.register( 'b', { isLimit: true, allowIn: 'a' } );
				model.schema.register( 'c', { allowIn: 'b' } );
				model.schema.extend( '$text', { allowIn: 'c' } );

				setModelData( model,
					'<a><b><c>[</c></b></a>]'
				);

				expect( getModelData( model ) ).to.equal( '[<a><b><c></c></b></a>]' );
			} );

			it( 'should fix #7 (selection must not cross a limit element; ends in a root)', () => {
				model.schema.register( 'a', { isLimit: true, allowIn: '$root' } );
				model.schema.register( 'b', { isLimit: true, allowIn: 'a' } );
				model.schema.register( 'c', { allowIn: 'b' } );
				model.schema.extend( '$text', { allowIn: 'c' } );

				setModelData( model,
					'[<a><b><c>]</c></b></a>'
				);

				expect( getModelData( model ) ).to.equal( '[<a><b><c></c></b></a>]' );
			} );

			it( 'should fix #8 (selection must not cross a limit element; starts in a non-limit)', () => {
				model.schema.register( 'div', { allowIn: '$root' } );
				model.schema.register( 'a', { isLimit: true, allowIn: 'div' } );
				model.schema.register( 'b', { isLimit: true, allowIn: 'a' } );
				model.schema.register( 'c', { allowIn: 'b' } );
				model.schema.extend( '$text', { allowIn: 'c' } );

				setModelData( model,
					'<div>[<a><b><c>]</c></b></a></div>'
				);

				expect( getModelData( model ) ).to.equal( '<div>[<a><b><c></c></b></a>]</div>' );
			} );

			it( 'should fix #9 (selection must not cross a limit element; ends in a non-limit)', () => {
				model.schema.register( 'div', { allowIn: '$root' } );
				model.schema.register( 'a', { isLimit: true, allowIn: 'div' } );
				model.schema.register( 'b', { isLimit: true, allowIn: 'a' } );
				model.schema.register( 'c', { allowIn: 'b' } );
				model.schema.extend( '$text', { allowIn: 'c' } );

				setModelData( model,
					'<div><a><b><c>[</c></b></a>]</div>'
				);

				expect( getModelData( model ) ).to.equal( '<div>[<a><b><c></c></b></a>]</div>' );
			} );

			it( 'should not fix #1 (selection on text node)', () => {
				setModelData( model, '<paragraph>foob[a]r</paragraph>', { lastRangeBackward: true } );

				expect( getModelData( model ) ).to.equal( '<paragraph>foob[a]r</paragraph>' );
			} );

			it( 'should not fix #2 (inline widget selected)', () => {
				setModelData( model,
					'<paragraph>[<inlineWidget></inlineWidget>]</paragraph>'
				);

				expect( getModelData( model ) ).to.equal(
					'<paragraph>[<inlineWidget></inlineWidget>]</paragraph>'
				);
			} );

			it( 'should not fix #3 (text around inline widget)', () => {
				setModelData( model,
					'<paragraph>fo[o<inlineWidget></inlineWidget>b]ar</paragraph>'
				);

				expect( getModelData( model ) ).to.equal(
					'<paragraph>fo[o<inlineWidget></inlineWidget>b]ar</paragraph>'
				);
			} );

			it( 'should not fix #4 (object in object)', () => {
				model.schema.register( 'div', {
					allowIn: [ '$root', 'div' ],
					isObject: true
				} );

				setModelData( model, '<div>[<div></div>]</div>' );

				model.change( writer => {
					const innerDiv = model.document.getRoot().getNodeByPath( [ 0, 0 ] );

					writer.setSelection( writer.createRangeOn( innerDiv ) );
				} );

				expect( getModelData( model ) ).to.equal( '<div>[<div></div>]</div>' );
			} );

			it( 'should not fix #5 (selection starts before a selectable, which is not an object)', () => {
				model.schema.register( 'div', { allowIn: '$root' } );
				model.schema.register( 'selectable', { isSelectable: true, allowIn: 'div' } );
				model.schema.extend( '$text', { allowIn: 'selectable' } );

				setModelData( model,
					'<div>[<selectable>foo]</selectable></div>'
				);

				expect( getModelData( model ) ).to.equal( '<div>[<selectable>foo]</selectable></div>' );
			} );

			it( 'should not fix #6 (selection ends after before a selectable, which is not an object)', () => {
				model.schema.register( 'div', { allowIn: '$root' } );
				model.schema.register( 'selectable', { isSelectable: true, allowIn: 'div' } );
				model.schema.extend( '$text', { allowIn: 'selectable' } );

				setModelData( model,
					'<div><selectable>[foo</selectable>]</div>'
				);

				expect( getModelData( model ) ).to.equal( '<div><selectable>[foo</selectable>]</div>' );
			} );
		} );

		describe( 'non-collapsed selection - inline widget scenarios', () => {
			beforeEach( () => {
				model.schema.register( 'placeholder', {
					allowWhere: '$text',
					isInline: true
				} );
			} );

			it( 'should fix selection that ends in inline element', () => {
				setModelData( model, '<paragraph>aaa[<placeholder>]</placeholder>bbb</paragraph>' );

				expect( getModelData( model ) ).to.equal( '<paragraph>aaa[]<placeholder></placeholder>bbb</paragraph>' );
			} );

			it( 'should fix selection that starts in inline element', () => {
				setModelData( model, '<paragraph>aaa<placeholder>[</placeholder>]bbb</paragraph>' );

				expect( getModelData( model ) ).to.equal( '<paragraph>aaa<placeholder></placeholder>[]bbb</paragraph>' );
			} );

			it( 'should fix selection that ends in inline element that is also an object', () => {
				model.schema.extend( 'placeholder', {
					isObject: true
				} );

				setModelData( model, '<paragraph>aaa[<placeholder>]</placeholder>bbb</paragraph>' );

				expect( getModelData( model ) ).to.equal( '<paragraph>aaa[<placeholder></placeholder>]bbb</paragraph>' );
			} );

			it( 'should fix selection that starts in inline element that is also an object', () => {
				model.schema.extend( 'placeholder', {
					isObject: true
				} );

				setModelData( model, '<paragraph>aaa<placeholder>[</placeholder>]bbb</paragraph>' );

				expect( getModelData( model ) ).to.equal( '<paragraph>aaa[<placeholder></placeholder>]bbb</paragraph>' );
			} );
		} );

		describe( 'collapsed selection', () => {
			beforeEach( () => {
				setModelData( model,
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should fix #1 (selection in limit element & before limit element)', () => {
				// <table>[]<tableRow>...
				model.change( writer => {
					writer.setSelection(
						writer.createRange( writer.createPositionAt( modelRoot.getChild( 1 ), 0 ) )
					);
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>[]aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should fix #2 (selection in limit element & before limit+object element)', () => {
				// <table><tableRow>[]<tableCell>...
				model.change( writer => {
					const row = modelRoot.getChild( 1 ).getChild( 0 );

					writer.setSelection(
						writer.createRange( writer.createPositionAt( row, 0 ) )
					);
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>[]aaa</paragraph></tableCell>' +
							'<tableCell><paragraph>bbb</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should fix #3 (selection inside object element and before block element)', () => {
				setModelData( model,
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell>[]<paragraph>aaa</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>' +
					'<paragraph>bar</paragraph>'
				);

				expect( getModelData( model ) ).to.equalMarkup(
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>[]aaa</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should fix #4 (selection inside limit element that doesn\'t allow text)', () => {
				setModelData( model, '<imageBlock>[]</imageBlock>' );

				expect( getModelData( model ) ).to.equalMarkup(
					'[<imageBlock></imageBlock>]'
				);
			} );

			it( 'should fix #5 (selection inside limit element that doesn\'t allow text - closest ancestor)', () => {
				setModelData( model,
					'<table><tableRow><tableCell><imageBlock>[]</imageBlock></tableCell></tableRow></table>'
				);

				expect( getModelData( model ) ).to.equalMarkup(
					'<table><tableRow><tableCell>[<imageBlock></imageBlock>]</tableCell></tableRow></table>'
				);
			} );

			it( 'should fix multiple ranges outside block element (but not merge them)', () => {
				setModelData( model,
					'[]<paragraph>foo</paragraph>[]' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>' +
					'<paragraph>bar</paragraph>'
				);

				expect( getModelData( model ) ).to.equalMarkup(
					'<paragraph>[]foo[]</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>aaa</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>' +
					'<paragraph>bar</paragraph>'
				);
			} );
		} );
	} );
} );

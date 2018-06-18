/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../../src/model/model';
import ModelPosition from '../../../src/model/position';
import ModelRange from '../../../src/model/range';

import { injectSelectionPostFixer } from '../../../src/model/utils/selection-post-fixer';

import { getData as getModelData, setData as setModelData } from '../../../src/dev-utils/model';

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
				isObject: true,
				isLimit: true
			} );

			model.schema.register( 'tableRow', {
				allowIn: 'table',
				isLimit: true
			} );

			model.schema.register( 'tableCell', {
				allowIn: 'tableRow',
				allowContentOf: '$block',
				isLimit: true
			} );

			setModelData( model,
				'<paragraph>[]foo</paragraph>' +
				'<table>' +
					'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
				'</table>' +
				'<paragraph>bar</paragraph>'
			);
		} );

		it( 'should not crash if there is no correct position for model selection', () => {
			setModelData( model, '' );

			expect( getModelData( model ) ).to.equal( '[]' );
		} );

		it( 'should react to structure changes', () => {
			model.change( writer => {
				writer.remove( modelRoot.getChild( 0 ) );
			} );

			expect( getModelData( model ) ).to.equal(
				'[<table>' +
					'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
				'</table>]' +
				'<paragraph>bar</paragraph>'
			);
		} );

		it( 'should react to selection changes', () => {
			// <paragraph>foo</paragraph>[]<table>...
			model.change( writer => {
				writer.setSelection(
					ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 1 )
				);
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo[]</paragraph>' +
				'<table>' +
					'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
				'</table>' +
				'<paragraph>bar</paragraph>'
			);
		} );

		describe( 'not collapsed selection', () => {
			it( 'should fix #1', () => {
				model.change( writer => {
					writer.setSelection( ModelRange.createFromParentsAndOffsets(
						modelRoot.getChild( 0 ), 1,
						modelRoot.getChild( 1 ).getChild( 0 ), 1
					) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>f[oo</paragraph>' +
					'<table>' +
						'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
					'</table>]' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should fix #2', () => {
				model.change( writer => {
					writer.setSelection( ModelRange.createFromParentsAndOffsets(
						modelRoot.getChild( 1 ).getChild( 0 ), 1,
						modelRoot.getChild( 2 ), 1
					) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'[<table>' +
						'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
					'</table>' +
					'<paragraph>b]ar</paragraph>'
				);
			} );

			it( 'should fix #3', () => {
				model.change( writer => {
					writer.setSelection( ModelRange.createFromParentsAndOffsets(
						modelRoot.getChild( 0 ), 1,
						modelRoot.getChild( 1 ), 0
					) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>f[oo</paragraph>' +
					'<table>' +
						'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
					'</table>]' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should fix #4', () => {
				model.change( writer => {
					writer.setSelection( ModelRange.createFromParentsAndOffsets(
						modelRoot.getChild( 1 ).getChild( 0 ).getChild( 0 ), 1,
						modelRoot.getChild( 1 ).getChild( 0 ).getChild( 1 ), 2
					) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'[<table>' +
						'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
					'</table>]' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should fix #5', () => {
				setModelData( model,
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
					'</table>' +
					'[]<table>' +
						'<tableRow><tableCell>xxx</tableCell><tableCell>yyy</tableCell></tableRow>' +
					'</table>' +
					'<paragraph>baz</paragraph>'
				);

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'[<table>' +
						'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
					'</table>]' +
					'<table>' +
						'<tableRow><tableCell>xxx</tableCell><tableCell>yyy</tableCell></tableRow>' +
					'</table>' +
					'<paragraph>baz</paragraph>'
				);
			} );

			it( 'should not fix #1', () => {
				setModelData( model,
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
					'</table>' +
					'<paragraph>b[ar</paragraph>' +
					'<paragraph>ba]z</paragraph>'
				);

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
					'</table>' +
					'<paragraph>b[ar</paragraph>' +
					'<paragraph>ba]z</paragraph>'
				);
			} );

			it( 'should fix multiple ranges #1', () => {
				model.change( writer => {
					const ranges = [
						new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 1, 0 ] ) ),
						new ModelRange( new ModelPosition( modelRoot, [ 1, 0, 0, 0 ] ), new ModelPosition( modelRoot, [ 1, 1 ] ) )
					];
					writer.setSelection( ranges );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>f[oo</paragraph>' +
					'<table>' +
						'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
					'</table>]' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should fix multiple ranges #2', () => {
				model.change( writer => {
					const ranges = [
						new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 1, 0 ] ) ),
						new ModelRange( new ModelPosition( modelRoot, [ 1, 0, 0, 0 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) )
					];

					writer.setSelection( ranges );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>f[oo</paragraph>' +
					'<table>' +
						'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
					'</table>' +
					'<paragraph>ba]r</paragraph>'
				);
			} );

			it( 'should fix multiple ranges #3', () => {
				setModelData( model,
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow><tableCell>[aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
						'<tableRow>]<tableCell>[aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
						'<tableRow>]<tableCell>[aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
						'<tableRow>]<tableCell>[aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
					'</table>' +
					'<paragraph>b]az</paragraph>'
				);

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'[<table>' +
						'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
						'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
						'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
						'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
					'</table>' +
					'<paragraph>b]az</paragraph>'
				);
			} );

			it( 'should fix multiple ranges #4', () => {
				model.change( writer => {
					const ranges = [
						new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 1, 0 ] ) ),
						new ModelRange( new ModelPosition( modelRoot, [ 1, 0, 0, 0 ] ), new ModelPosition( modelRoot, [ 2, 1 ] ) ),
						new ModelRange( new ModelPosition( modelRoot, [ 2, 2 ] ), new ModelPosition( modelRoot, [ 2, 3 ] ) )
					];

					writer.setSelection( ranges );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>f[oo</paragraph>' +
					'<table>' +
						'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
					'</table>' +
					'<paragraph>b]a[r]</paragraph>'
				);
			} );
		} );

		describe( 'collapsed selection', () => {
			it( 'should fix #1', () => {
				// <table>[]<tableRow>...
				model.change( writer => {
					writer.setSelection(
						ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 1 ), 0, modelRoot.getChild( 1 ), 0 )
					);
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo[]</paragraph>' +
					'<table>' +
						'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
					'</table>' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should fix #2', () => {
				// <table><tableRow>[]<tableCell>...
				model.change( writer => {
					const row = modelRoot.getChild( 1 ).getChild( 0 );

					writer.setSelection(
						ModelRange.createFromParentsAndOffsets( row, 0, row, 0 )
					);
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<table>' +
						'<tableRow><tableCell>[]aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
					'</table>' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should fix multiple ranges #1', () => {
				// []<paragraph></paragraph>[]<table>...
				model.change( writer => {
					writer.setSelection(
						[
							ModelRange.createFromParentsAndOffsets( modelRoot, 0, modelRoot, 0 ),
							ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 1 )
						]
					);
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>[]foo[]</paragraph>' +
					'<table>' +
						'<tableRow><tableCell>aaa</tableCell><tableCell>bbb</tableCell></tableRow>' +
					'</table>' +
					'<paragraph>bar</paragraph>'
				);
			} );
		} );
	} );
} );

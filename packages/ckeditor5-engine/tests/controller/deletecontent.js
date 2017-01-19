/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../src/model/document';
import deleteContent from '../../src/controller/deletecontent';
import { setData, getData } from '../../src/dev-utils/model';

describe( 'DataController', () => {
	let doc;

	describe( 'deleteContent', () => {
		describe( 'in simple scenarios', () => {
			beforeEach( () => {
				doc = new Document();
				doc.createRoot();

				const schema = doc.schema;

				schema.registerItem( 'image', '$inline' );

				schema.allow( { name: '$text', inside: '$root' } );
				schema.allow( { name: 'image', inside: '$root' } );
			} );

			test(
				'does nothing on collapsed selection',
				'f[]oo',
				'f[]oo'
			);

			test(
				'deletes single character',
				'f[o]o',
				'f[]o'
			);

			it( 'deletes single character (backward selection)' , () => {
				setData( doc, 'f[o]o', { lastRangeBackward: true } );

				deleteContent( doc.selection, doc.batch() );

				expect( getData( doc ) ).to.equal( 'f[]o' );
			} );

			test(
				'deletes whole text',
				'[foo]',
				'[]'
			);

			test(
				'deletes whole text between nodes',
				'<image></image>[foo]<image></image>',
				'<image></image>[]<image></image>'
			);

			test(
				'deletes an element',
				'x[<image></image>]y',
				'x[]y'
			);

			test(
				'deletes a bunch of nodes',
				'w[x<image></image>y]z',
				'w[]z'
			);

			test(
				'does not break things when option.merge passed',
				'w[x<image></image>y]z',
				'w[]z',
				{ merge: true }
			);
		} );

		describe( 'with text attributes', () => {
			beforeEach( () => {
				doc = new Document();
				doc.createRoot();

				const schema = doc.schema;

				schema.registerItem( 'image', '$inline' );
				schema.registerItem( 'paragraph', '$block' );

				schema.allow( { name: '$text', inside: '$root' } );
				schema.allow( { name: '$text', attributes: [ 'bold', 'italic' ] } );
			} );

			it( 'deletes characters (first half has attrs)', () => {
				setData( doc, '<$text bold="true">fo[o</$text>b]ar' );

				deleteContent( doc.selection, doc.batch() );

				expect( getData( doc ) ).to.equal( '<$text bold="true">fo[]</$text>ar' );
				expect( doc.selection.getAttribute( 'bold' ) ).to.equal( true );
			} );

			it( 'deletes characters (2nd half has attrs)', () => {
				setData( doc, 'fo[o<$text bold="true">b]ar</$text>' );

				deleteContent( doc.selection, doc.batch() );

				expect( getData( doc ) ).to.equal( 'fo[]<$text bold="true">ar</$text>' );
				expect( doc.selection.getAttribute( 'bold' ) ).to.undefined;
			} );

			it( 'clears selection attrs when emptied content', () => {
				setData( doc, '<paragraph>x</paragraph><paragraph>[<$text bold="true">foo</$text>]</paragraph><paragraph>y</paragraph>' );

				deleteContent( doc.selection, doc.batch() );

				expect( getData( doc ) ).to.equal( '<paragraph>x</paragraph><paragraph>[]</paragraph><paragraph>y</paragraph>' );
				expect( doc.selection.getAttribute( 'bold' ) ).to.undefined;
			} );

			it( 'leaves selection attributes when text contains them', () => {
				setData(
					doc,
					'<paragraph>x<$text bold="true">a[foo]b</$text>y</paragraph>',
					{
						selectionAttributes: {
							bold: true
						}
					}
				);

				deleteContent( doc.selection, doc.batch() );

				expect( getData( doc ) ).to.equal( '<paragraph>x<$text bold="true">a[]b</$text>y</paragraph>' );
				expect( doc.selection.getAttribute( 'bold' ) ).to.equal( true );
			} );
		} );

		// Note: The algorithm does not care what kind of it's merging as it knows nothing useful about these elements.
		// In most cases it handles all elements like you'd expect to handle block elements in HTML. However,
		// in some scenarios where the tree depth is bigger results may be hard to justify. In fact, such cases
		// should not happen unless we're talking about lists or tables, but these features will need to cover
		// their scenarios themselves. In all generic scenarios elements are never nested.
		//
		// You may also be thinking – but I don't want my elements to be merged. It means that there are some special rules,
		// like – multiple editing hosts (cE=true/false in use) or block limit elements like <td>.
		// Those case should, again, be handled by their specific implementations.
		describe( 'in multi-element scenarios', () => {
			beforeEach( () => {
				doc = new Document();
				doc.createRoot();

				const schema = doc.schema;

				schema.registerItem( 'paragraph', '$block' );
				schema.registerItem( 'heading1', '$block' );
				schema.registerItem( 'pchild' );
				schema.registerItem( 'image', '$inline' );

				schema.allow( { name: 'pchild', inside: 'paragraph' } );
				schema.allow( { name: '$text', inside: 'pchild' } );
				schema.allow( { name: 'paragraph', attributes: [ 'align' ] } );
			} );

			test(
				'do not merge when no need to',
				'<paragraph>x</paragraph><paragraph>[foo]</paragraph><paragraph>y</paragraph>',
				'<paragraph>x</paragraph><paragraph>[]</paragraph><paragraph>y</paragraph>',
				{ merge: true }
			);

			test(
				'merges second element into the first one (same name)',
				'<paragraph>x</paragraph><paragraph>fo[o</paragraph><paragraph>b]ar</paragraph><paragraph>y</paragraph>',
				'<paragraph>x</paragraph><paragraph>fo[]ar</paragraph><paragraph>y</paragraph>',
				{ merge: true }
			);

			test(
				'does not merge second element into the first one (same name, !option.merge)',
				'<paragraph>x</paragraph><paragraph>fo[o</paragraph><paragraph>b]ar</paragraph><paragraph>y</paragraph>',
				'<paragraph>x</paragraph><paragraph>fo[]</paragraph><paragraph>ar</paragraph><paragraph>y</paragraph>'
			);

			test(
				'merges second element into the first one (same name)',
				'<paragraph>x</paragraph><paragraph>fo[o</paragraph><paragraph>b]ar</paragraph><paragraph>y</paragraph>',
				'<paragraph>x</paragraph><paragraph>fo[]ar</paragraph><paragraph>y</paragraph>',
				{ merge: true }
			);

			test(
				'merges second element into the first one (different name)',
				'<paragraph>x</paragraph><heading1>fo[o</heading1><paragraph>b]ar</paragraph><paragraph>y</paragraph>',
				'<paragraph>x</paragraph><heading1>fo[]ar</heading1><paragraph>y</paragraph>',
				{ merge: true }
			);

			it( 'merges second element into the first one (different name, backward selection)', () => {
				setData(
					doc,
					'<paragraph>x</paragraph><heading1>fo[o</heading1><paragraph>b]ar</paragraph><paragraph>y</paragraph>',
					{ lastRangeBackward: true }
				);

				deleteContent( doc.selection, doc.batch(), { merge: true } );

				expect( getData( doc ) ).to.equal( '<paragraph>x</paragraph><heading1>fo[]ar</heading1><paragraph>y</paragraph>' );
			} );

			test(
				'merges second element into the first one (different attrs)',
				'<paragraph>x</paragraph><paragraph align="l">fo[o</paragraph><paragraph>b]ar</paragraph><paragraph>y</paragraph>',
				'<paragraph>x</paragraph><paragraph align="l">fo[]ar</paragraph><paragraph>y</paragraph>',
				{ merge: true }
			);

			test(
				'merges second element to an empty first element',
				'<paragraph>x</paragraph><heading1>[</heading1><paragraph>fo]o</paragraph><paragraph>y</paragraph>',
				'<paragraph>x</paragraph><heading1>[]o</heading1><paragraph>y</paragraph>',
				{ merge: true }
			);

			test(
				'merges elements when deep nested',
				'<paragraph>x<pchild>fo[o</pchild></paragraph><paragraph><pchild>b]ar</pchild>y</paragraph>',
				'<paragraph>x<pchild>fo[]ar</pchild>y</paragraph>',
				{ merge: true }
			);

			// For code coverage reasons.
			test(
				'merges element when selection is in two consecutive nodes even when it is empty',
				'<paragraph>foo[</paragraph><paragraph>]bar</paragraph>',
				'<paragraph>foo[]bar</paragraph>',
				{ merge: true }
			);

			// If you disagree with this case please read the notes before this section.
			test(
				'merges elements when left end deep nested',
				'<paragraph>x<pchild>fo[o</pchild></paragraph><paragraph>b]ary</paragraph>',
				'<paragraph>x<pchild>fo[]</pchild>ary</paragraph>',
				{ merge: true }
			);

			// If you disagree with this case please read the notes before this section.
			test(
				'merges elements when right end deep nested',
				'<paragraph>xfo[o</paragraph><paragraph><pchild>b]ar</pchild>y<image></image></paragraph>',
				'<paragraph>xfo[]<pchild>ar</pchild>y<image></image></paragraph>',
				{ merge: true }
			);

			test(
				'merges elements when more content in the right branch',
				'<paragraph>xfo[o</paragraph><paragraph>b]a<pchild>r</pchild>y</paragraph>',
				'<paragraph>xfo[]a<pchild>r</pchild>y</paragraph>',
				{ merge: true }
			);

			test(
				'leaves just one element when all selected',
				'<heading1>[x</heading1><paragraph>foo</paragraph><paragraph>y]</paragraph>',
				'<heading1>[]</heading1>',
				{ merge: true }
			);

			it( 'uses remove delta instead of merge delta if merged element is empty', () => {
				setData( doc, '<paragraph>ab[cd</paragraph><paragraph>efgh]</paragraph>' );

				const batch = doc.batch();
				const spyMerge = sinon.spy( batch, 'merge' );
				const spyRemove = sinon.spy( batch, 'remove' );

				deleteContent( doc.selection, batch, { merge: true } );

				expect( getData( doc ) ).to.equal( '<paragraph>ab[]</paragraph>' );

				expect( spyMerge.called ).to.be.false;
				expect( spyRemove.called ).to.be.true;
			} );
		} );

		describe( 'in element selections scenarios', () => {
			beforeEach( () => {
				doc = new Document();
				// <p> like root.
				doc.createRoot( 'paragraph', 'paragraphRoot' );
				// <body> like root.
				doc.createRoot( '$root', 'bodyRoot' );
				// Special root which allows only blockWidgets inside itself.
				doc.createRoot( 'restrictedRoot', 'restrictedRoot' );

				const schema = doc.schema;

				schema.registerItem( 'image', '$inline' );
				schema.registerItem( 'paragraph', '$block' );
				schema.registerItem( 'heading1', '$block' );
				schema.registerItem( 'blockWidget' );
				schema.registerItem( 'restrictedRoot' );

				schema.allow( { name: '$block', inside: '$root' } );
				schema.allow( { name: 'blockWidget', inside: '$root' } );

				schema.allow( { name: 'blockWidget', inside: 'restrictedRoot' } );
			} );

			// See also "in simple scenarios => deletes an element".

			it( 'deletes two inline elements', () => {
				setData(
					doc,
					'<paragraph>x[<image></image><image></image>]z</paragraph>',
					{ rootName: 'paragraphRoot' }
				);

				deleteContent( doc.selection, doc.batch() );

				expect( getData( doc, { rootName: 'paragraphRoot' } ) )
					.to.equal( '<paragraph>x[]z</paragraph>' );
			} );

			it( 'creates a paragraph when text is not allowed (paragraph selected)', () => {
				setData(
					doc,
					'<paragraph>x</paragraph>[<paragraph>yyy</paragraph>]<paragraph>z</paragraph>',
					{ rootName: 'bodyRoot' }
				);

				deleteContent( doc.selection, doc.batch() );

				expect( getData( doc, { rootName: 'bodyRoot' } ) )
					.to.equal( '<paragraph>x</paragraph><paragraph>[]</paragraph><paragraph>z</paragraph>' );
			} );

			it( 'creates a paragraph when text is not allowed (block widget selected)', () => {
				setData(
					doc,
					'<paragraph>x</paragraph>[<blockWidget></blockWidget>]<paragraph>z</paragraph>',
					{ rootName: 'bodyRoot' }
				);

				deleteContent( doc.selection, doc.batch() );

				expect( getData( doc, { rootName: 'bodyRoot' } ) )
					.to.equal( '<paragraph>x</paragraph><paragraph>[]</paragraph><paragraph>z</paragraph>' );
			} );

			it( 'creates paragraph when text is not allowed (heading selected)', () => {
				setData(
					doc,
					'<paragraph>x</paragraph>[<heading1>yyy</heading1>]<paragraph>z</paragraph>',
					{ rootName: 'bodyRoot' }
				);

				deleteContent( doc.selection, doc.batch() );

				expect( getData( doc, { rootName: 'bodyRoot' } ) )
					.to.equal( '<paragraph>x</paragraph><paragraph>[]</paragraph><paragraph>z</paragraph>' );
			} );

			it( 'creates paragraph when text is not allowed (two blocks selected)', () => {
				setData(
					doc,
					'<paragraph>x</paragraph>[<heading1>yyy</heading1><paragraph>yyy</paragraph>]<paragraph>z</paragraph>',
					{ rootName: 'bodyRoot' }
				);

				deleteContent( doc.selection, doc.batch() );

				expect( getData( doc, { rootName: 'bodyRoot' } ) )
					.to.equal( '<paragraph>x</paragraph><paragraph>[]</paragraph><paragraph>z</paragraph>' );
			} );

			it( 'creates paragraph when text is not allowed (all content selected)', () => {
				setData(
					doc,
					'[<heading1>x</heading1><paragraph>z</paragraph>]',
					{ rootName: 'bodyRoot' }
				);

				deleteContent( doc.selection, doc.batch() );

				expect( getData( doc, { rootName: 'bodyRoot' } ) )
					.to.equal( '<paragraph>[]</paragraph>' );
			} );

			it( 'does not create a paragraph when it is not allowed', () => {
				setData(
					doc,
					'<blockWidget></blockWidget>[<blockWidget></blockWidget>]<blockWidget></blockWidget>',
					{ rootName: 'restrictedRoot' }
				);

				deleteContent( doc.selection, doc.batch() );

				expect( getData( doc, { rootName: 'restrictedRoot' } ) )
					.to.equal( '<blockWidget></blockWidget>[]<blockWidget></blockWidget>' );
			} );
		} );

		function test( title, input, output, options ) {
			it( title, () => {
				setData( doc, input );

				deleteContent( doc.selection, doc.batch(), options );

				expect( getData( doc ) ).to.equal( output );
			} );
		}
	} );
} );

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Model from '@ckeditor/ckeditor5-engine/src/model/model.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import getText from '../../src/utils/getlasttextline.js';

describe( 'utils', () => {
	let model, doc, root;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();

		model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		model.schema.register( 'softBreak', { allowWhere: '$text', isInline: true } );
		model.schema.extend( '$text', { allowAttributes: [ 'bold', 'italic' ] } );
	} );

	describe( 'getText()', () => {
		it( 'should return all text from passed range', () => {
			setModelData( model, '<paragraph>foobar[]baz</paragraph>' );

			testOutput(
				model.createRangeIn( root.getChild( 0 ) ),
				'foobarbaz',
				[ 0, 0 ],
				[ 0, 9 ] );
		} );

		it( 'should limit the output text to the given range', () => {
			setModelData( model, '<paragraph>foobar[]baz</paragraph>' );

			const testRange = model.createRange(
				model.createPositionAt( root.getChild( 0 ), 1 ),
				model.document.selection.focus
			);

			testOutput(
				testRange,
				'oobar',
				[ 0, 1 ],
				[ 0, 6 ] );
		} );

		it( 'should limit the output to the last inline element text constrain in given range', () => {
			setModelData( model, '<paragraph>foo<softBreak></softBreak>bar<softBreak></softBreak>baz[]</paragraph>' );

			const testRange = model.createRange(
				model.createPositionAt( root.getChild( 0 ), 0 ),
				model.document.selection.focus
			);

			testOutput(
				testRange,
				'baz',
				[ 0, 8 ],
				[ 0, 11 ] );
		} );

		it( 'should return text from text nodes with attributes', () => {
			setModelData( model,
				'<paragraph>' +
				'<$text bold="true">foo</$text>' +
				'<$text bold="true" italic="true">bar</$text>' +
				'<$text italic="true">baz</$text>[]' +
				'</paragraph>'
			);

			testOutput(
				model.createRangeIn( root.getChild( 0 ) ),
				'foobarbaz',
				[ 0, 0 ],
				[ 0, 9 ] );
		} );

		it( 'should return empty string if the range is `on` the element', () => {
			setModelData( model, '<paragraph>foobarbaz[]</paragraph>' );

			testOutput(
				model.createRangeOn( root.getChild( 0 ) ),
				'',
				[ 1 ],
				[ 1 ] );
		} );
	} );

	function testOutput( range1, expectedText, startPath, endPath ) {
		const { text, range } = getText( range1, model );

		expect( text ).to.equal( expectedText );
		expect( range.start.path ).to.deep.equal( startPath );
		expect( range.end.path ).to.deep.equal( endPath );
	}
} );

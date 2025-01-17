/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Model from '@ckeditor/ckeditor5-engine/src/model/model.js';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import { canBeCodeBlock, getTextNodeAtLineStart } from '../src/utils.js';

describe( 'CodeBlock - utils', () => {
	describe( 'canBecomeCodeBlock()', () => {
		it( 'should not allow a root element to become a code block', () => {
			const model = new Model();
			const root = model.document.createRoot();

			const testResult = canBeCodeBlock( model.schema, root );

			expect( root.is( 'rootElement' ) ).to.be.true;
			expect( testResult ).to.be.false;
		} );

		it( 'should not allow a limit element to become a code block', () => {
			const model = new Model();
			const root = model.document.createRoot();

			model.schema.register( 'limitElement', { isObject: true } );

			model.change( writer => {
				const limitElement = writer.createElement( 'limitElement' );

				writer.insert( limitElement, root, 0 );
			} );

			const limitElement = root.getChild( 0 );

			const testResult = canBeCodeBlock( model.schema, limitElement );

			expect( model.schema.isLimit( limitElement ) ).to.be.true;
			expect( testResult ).to.be.false;
		} );

		it( 'should not allow an element to become a code block if it isnt allowed in parent', () => {
			const model = new Model();
			const root = model.document.createRoot();

			model.schema.register( 'container', { allowIn: '$root' } );
			model.schema.register( 'fooElement', { allowIn: 'container' } );
			model.schema.register( 'codeBlock', { } );

			let fooElement;
			let containerElement;

			model.change( writer => {
				containerElement = writer.createElement( 'container' );
				fooElement = writer.createElement( 'codeBlock' );

				writer.insert( containerElement, root, 0 );
				writer.insert( fooElement, containerElement, 0 );
			} );

			const testResult = canBeCodeBlock( model.schema, fooElement );

			expect( testResult ).to.be.false;
		} );

		it( 'should allow an element to become a code block if it is allowed in parent', () => {
			const model = new Model();
			const root = model.document.createRoot();

			model.schema.register( 'container', { allowIn: '$root' } );
			model.schema.register( 'fooElement', { allowIn: 'container' } );
			model.schema.register( 'codeBlock', { allowIn: 'container' } );

			let fooElement;
			let containerElement;

			model.change( writer => {
				containerElement = writer.createElement( 'container' );
				fooElement = writer.createElement( 'codeBlock' );

				writer.insert( containerElement, root, 0 );
				writer.insert( fooElement, containerElement, 0 );
			} );

			const testResult = canBeCodeBlock( model.schema, fooElement );

			expect( testResult ).to.be.true;
		} );
	} );

	describe( 'getTextNodeAtLineStart()', () => {
		let model;

		beforeEach( () => {
			model = new Model();
			model.document.createRoot();

			// Simplified schema.
			model.schema.register( 'codeBlock', { inheritAllFrom: '$block' } );
			model.schema.register( 'element', { inheritAllFrom: '$inlineObject', allowIn: 'codeBlock' } );
			model.schema.register( 'softBreak', { inheritAllFrom: '$inlineObject', allowIn: 'codeBlock' } );
		} );

		// Tests examples taken from `getTextNodeAtLineStart()` API docs.
		test(
			'<codeBlock>[]</codeBlock>',
			null
		);

		test(
			'<codeBlock>[]foobar</codeBlock>',
			'<codeBlock>[foobar]</codeBlock>'
		);

		test(
			'<codeBlock>foobar[]</codeBlock>',
			'<codeBlock>[foobar]</codeBlock>'
		);

		test(
			'<codeBlock>foo[]bar</codeBlock>',
			'<codeBlock>[foobar]</codeBlock>'
		);

		test(
			'<codeBlock>foo[]<softBreak></softBreak>bar</codeBlock>',
			'<codeBlock>[foo]<softBreak></softBreak>bar</codeBlock>'
		);

		test(
			'<codeBlock>foo<softBreak></softBreak>bar[]</codeBlock>',
			'<codeBlock>foo<softBreak></softBreak>[bar]</codeBlock>'
		);

		test(
			'<codeBlock>foo<softBreak></softBreak>b[]ar</codeBlock>',
			'<codeBlock>foo<softBreak></softBreak>[bar]</codeBlock>'
		);

		test(
			'<codeBlock>foo<softBreak></softBreak>[]bar</codeBlock>',
			'<codeBlock>foo<softBreak></softBreak>[bar]</codeBlock>'
		);

		test(
			'<codeBlock>[]<element></element></codeBlock>',
			null
		);

		test(
			'<codeBlock><element></element>[]</codeBlock>',
			null
		);

		test(
			'<codeBlock>foo[]<element></element></codeBlock>',
			'<codeBlock>[foo]<element></element></codeBlock>'
		);

		test(
			'<codeBlock>foo<element></element>[]</codeBlock>',
			'<codeBlock>[foo]<element></element></codeBlock>'
		);

		test(
			'<codeBlock>foo<element></element>bar[]</codeBlock>',
			'<codeBlock>[foo]<element></element>bar</codeBlock>'
		);

		test(
			'<codeBlock><element></element>bar[]</codeBlock>',
			null
		);

		test(
			'<codeBlock>foo<softBreak></softBreak>[]<softBreak></softBreak></codeBlock>',
			null
		);

		test(
			'<codeBlock>foo<softBreak></softBreak>[]<element></element></codeBlock>',
			null
		);

		test(
			'<codeBlock>foo<softBreak></softBreak><element></element>[]</codeBlock>',
			null
		);

		test(
			'<codeBlock>foo<softBreak></softBreak>bar<element></element>[]</codeBlock>',
			'<codeBlock>foo<softBreak></softBreak>[bar]<element></element></codeBlock>'
		);

		test(
			'<codeBlock>foo<softBreak></softBreak><element></element>ba[]r</codeBlock>',
			null
		);

		function test( input, output ) {
			it( input, () => {
				setData( model, input );

				const textNode = getTextNodeAtLineStart( model.document.selection.getFirstPosition(), model );

				if ( textNode ) {
					model.change( writer => {
						writer.setSelection( textNode, 'on' );
					} );
				}

				if ( output ) {
					expect( getData( model ) ).to.equal( output );
				} else {
					expect( textNode ).to.be.null;
				}
			} );
		}
	} );
} );

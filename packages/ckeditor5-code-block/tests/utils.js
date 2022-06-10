/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Model from '@ckeditor/ckeditor5-engine/src/model/model';

import { canBeCodeBlock } from '../src/utils';

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
} );

/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { getNodeSchemaName, removeDisallowedAttributes } from '../../src/model/utils';
import Element from '../../src/model/element';
import Text from '../../src/model/text';
import Document from '../../src/model/document';
import { stringify } from '../../src/dev-utils/model';

describe( 'model utils', () => {
	describe( 'getNodeSchemaName()', () => {
		it( 'should return schema name for a given Element', () => {
			const element = new Element( 'paragraph' );

			expect( getNodeSchemaName( element ) ).to.equal( 'paragraph' );
		} );

		it( 'should return schema name for a Text', () => {
			const element = new Text();

			expect( getNodeSchemaName( element ) ).to.equal( '$text' );
		} );
	} );

	describe( 'removeDisallowedAttributes()', () => {
		let doc;

		beforeEach( () => {
			doc = new Document();
			doc.createRoot();

			const schema = doc.schema;

			schema.registerItem( 'paragraph', '$block' );
			schema.registerItem( 'el', '$inline' );

			schema.allow( { name: '$text', attributes: 'a', inside: 'paragraph' } );
			schema.allow( { name: '$text', attributes: 'c', inside: 'paragraph' } );
			schema.allow( { name: 'el', attributes: 'b' } );
		} );

		it( 'should remove disallowed by schema attributes from list of nodes', () => {
			const paragraph = new Element( 'paragraph' );
			const el = new Element( 'el', { a: 1, b: 1, c: 1 } );
			const foo = new Text( 'foo', { a: 1, b: 1 } );
			const bar = new Text( 'bar' );
			const biz = new Text( 'biz', { b: 1, c: 1 } );

			paragraph.appendChildren( [ el, foo, bar, biz ] );

			removeDisallowedAttributes( Array.from( paragraph.getChildren() ), [ paragraph ], doc.schema );

			expect( stringify( paragraph ) )
				.to.equal( '<paragraph><el b="1"></el><$text a="1">foo</$text>bar<$text c="1">biz</$text></paragraph>' );
		} );

		it( 'should remove disallowed by schema attributes from a single node', () => {
			const paragraph = new Element( 'paragraph' );
			const foo = new Text( 'foo', { a: 1, b: 1 } );

			removeDisallowedAttributes( foo, [ paragraph ], doc.schema );

			expect( stringify( foo ) ).to.equal( '<$text a="1">foo</$text>' );
		} );
	} );
} );

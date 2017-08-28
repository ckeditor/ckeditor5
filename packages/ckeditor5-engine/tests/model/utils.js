/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { getNodeSchemaName, removeDisallowedAttributes } from '../../src/model/utils';
import Element from '../../src/model/element';
import Text from '../../src/model/text';
import Document from '../../src/model/document';
import { setData, getData } from '../../src/dev-utils/model';

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

			schema.allow( { name: '$text', attributes: 'a', inside: 'paragraph' } );
			schema.allow( { name: '$text', attributes: 'c', inside: 'paragraph' } );
		} );

		it( 'should remove disallowed by schema attributes from list of nodes', () => {
			setData( doc, '<paragraph>f<$text a="1" b="1">o</$text>ob<$text b="1" c="1">a</$text>r</paragraph>' );

			const paragraph = doc.getRoot().getChild( 0 );

			removeDisallowedAttributes( Array.from( paragraph.getChildren() ), [ paragraph ], doc.schema );

			expect( getData( doc, { withoutSelection: true } ) )
				.to.equal( '<paragraph>f<$text a="1">o</$text>ob<$text c="1">a</$text>r</paragraph>' );
		} );

		it( 'should remove disallowed by schema attributes from a single node', () => {
			setData( doc, '<paragraph><$text a="1" b="1">foo</$text></paragraph>' );

			const paragraph = doc.getRoot().getChild( 0 );

			removeDisallowedAttributes( paragraph.getChild( 0 ), [ paragraph ], doc.schema );

			expect( getData( doc, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text a="1">foo</$text></paragraph>' );
		} );
	} );
} );

/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../src/model/model';

import { setData as modelSetData } from '../../src/dev-utils/model';
import View from '../../src/view/view';
import createViewRoot from '../view/_utils/createroot';
import { setData as viewSetData } from '../../src/dev-utils/view';
import Mapper from '../../src/conversion/mapper';
import ViewPosition from '../../src/view/position';
import { mapViewPositionInsideInlineElement } from '../../src/conversion/mapper-helpers';

describe( 'mapper-helpers', () => {
	describe( 'mapViewPositionInsideInlineElement()', () => {
		let model, view, viewDocument, mapper, modelRoot, viewRoot, viewInlineWidget, viewP, modelParagraph;

		beforeEach( () => {
			model = new Model();
			modelRoot = model.document.createRoot();
			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			model.schema.register( 'inline-widget', { isInline: true, isObject: true, allowWhere: '$text' } );

			modelSetData( model, '<paragraph>foo<inline-widget></inline-widget>bar</paragraph>' );

			view = new View();
			viewDocument = view.document;
			viewRoot = createViewRoot( viewDocument, 'div', 'main' );

			viewSetData( view, '<p>foo<placeholder>widget description</placeholder>bar</p>' );

			viewP = viewRoot.getChild( 0 );
			viewInlineWidget = viewP.getChild( 1 );
			modelParagraph = modelRoot.getChild( 0 );

			mapper = new Mapper();
			mapper.bindElements( modelRoot, viewRoot );
			mapper.bindElements( modelParagraph, viewRoot.getChild( 0 ) );
			mapper.bindElements( modelParagraph.getChild( 1 ), viewInlineWidget );

			mapper.on( 'viewToModelPosition', mapViewPositionInsideInlineElement( model ) );
		} );

		it( 'should return position after inline-widget when view position is at start of inline-widget', () => {
			const viewPosition = new ViewPosition( viewInlineWidget, 0 );

			const modelPosition = mapper.toModelPosition( viewPosition );

			expect( modelPosition.parent ).to.equal( modelParagraph );
			// The offset in <paragraph> should be after the inline-widget:
			// PARAGRAPH
			//   |- foo            before: [ 0 ]         after: [ 3 ]
			//   |- INLINE-WIDGET  before: [ 3 ]         after: [ 4 ]
			//   |- bar            before: [ 4 ]         after: [ 7 ]
			expect( modelPosition.offset ).to.equal( 4 );
		} );

		it( 'should return position before inline-widget when view position is not at start of inline-widget', () => {
			const viewPosition = new ViewPosition( viewInlineWidget, 2 ); // in real-case scenarios is 1 even if placeholder has text.

			const modelPosition = mapper.toModelPosition( viewPosition );

			expect( modelPosition.parent ).to.equal( modelParagraph );
			// The offset in <paragraph> should be before the inline-widget:
			// PARAGRAPH
			//   |- foo            before: [ 0 ]         after: [ 3 ]
			//   |- INLINE-WIDGET  before: [ 3 ]         after: [ 4 ]
			//   |- bar            before: [ 4 ]         after: [ 7 ]
			expect( modelPosition.offset ).to.equal( 3 );
		} );

		it( 'should do nothing if position maps to text node', () => {
			const viewPosition = new ViewPosition( viewP.getChild( 0 ), 1 );

			const data = { viewPosition, mapper };

			const mapperHelper = mapViewPositionInsideInlineElement( model );
			mapperHelper( {}, data );

			expect( data.modelPosition ).to.be.undefined;
		} );

		it( 'should do nothing if position maps to a non-inline element', () => {
			const viewPosition = new ViewPosition( viewP, 0 );

			const data = { viewPosition, mapper };

			const mapperHelper = mapViewPositionInsideInlineElement( model );
			mapperHelper( {}, data );

			expect( data.modelPosition ).to.be.undefined;
		} );
	} );
} );

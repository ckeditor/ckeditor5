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
import { mapModelPositionOnInlineElement, mapViewPositionInsideInlineElement } from '../../src/conversion/mapper-helpers';

describe( 'mapper-helpers', () => {
	let model, view, viewDocument, mapper, modelRoot, viewRoot, viewInlineWidget, viewP, modelParagraph, inlineWidget;

	beforeEach( () => {
		model = new Model();
		modelRoot = model.document.createRoot();
		model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		model.schema.register( 'inline-widget', { isInline: true, isObject: true, allowWhere: '$text' } );

		modelSetData( model, '<paragraph>foo[<inline-widget></inline-widget>]bar</paragraph>' );

		view = new View();
		viewDocument = view.document;
		viewRoot = createViewRoot( viewDocument, 'div', 'main' );

		viewSetData( view, '<p>foo<placeholder>widget description</placeholder>bar</p>' );

		viewP = viewRoot.getChild( 0 );
		viewInlineWidget = viewP.getChild( 1 );
		modelParagraph = modelRoot.getChild( 0 );
		inlineWidget = modelParagraph.getChild( 1 );

		mapper = new Mapper();
		mapper.bindElements( modelRoot, viewRoot );
		mapper.bindElements( modelParagraph, viewRoot.getChild( 0 ) );
		mapper.bindElements( inlineWidget, viewInlineWidget );
	} );

	describe( 'mapViewPositionInsideInlineElement()', () => {
		beforeEach( () => {
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

	describe( 'mapModelPositionOnInlineElement()', () => {
		beforeEach( () => {
			mapper.on( 'modelToViewPosition', mapModelPositionOnInlineElement( model, view ) );
		} );

		it( 'should return position after inline-widget when view position is at start of inline-widget', () => {
			const modelPosition = model.createPositionFromPath( modelRoot, [ 0, 4 ], 'toPrevious' );

			const viewPosition = mapper.toViewPosition( modelPosition );

			expect( viewPosition.parent ).to.equal( viewP );
			expect( viewPosition.offset ).to.equal( 2 );
			expect( viewPosition.nodeBefore ).to.equal( viewInlineWidget );
		} );

		it( 'should return position before inline-widget when view position is not at start of inline-widget', () => {
			const modelPosition = model.createPositionFromPath( modelRoot, [ 0, 3 ], 'toNext' );

			const viewPosition = mapper.toViewPosition( modelPosition );

			expect( viewPosition.parent ).to.equal( viewP );
			expect( viewPosition.offset ).to.equal( 1 );
			expect( viewPosition.nodeAfter ).to.equal( viewInlineWidget );
		} );

		it( 'should do nothing if position is phantom', () => {
			const modelPosition = model.createPositionFromPath( modelRoot, [ 0, 4 ], 'toPrevious' );

			const data = { isPhantom: true };

			mapper.toViewPosition( modelPosition, data );

			expect( data.modelPosition ).to.be.undefined;
		} );

		it( 'should do nothing if position\'s parent is not mapped', () => {
			mapper.unbindViewElement( viewInlineWidget );

			const modelPosition = model.createPositionFromPath( modelRoot, [ 0, 4 ], 'toPrevious' );

			const data = {};

			mapper.toViewPosition( modelPosition, data );

			expect( data.modelPosition ).to.be.undefined;
		} );

		it( 'should do nothing if position maps to a non-inline element', () => {
			const modelPosition = model.createPositionFromPath( modelRoot, [ 0 ], 'toPrevious' );

			const data = {};

			mapper.toViewPosition( modelPosition, data );

			expect( data.modelPosition ).to.be.undefined;
		} );
	} );
} );

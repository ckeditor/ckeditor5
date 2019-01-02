/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import View from '../../src/view/view';
import ViewSelection from '../../src/view/selection';
import ViewRange from '../../src/view/range';
import createViewRoot from '../view/_utils/createroot';

import Model from '../../src/model/model';

import Mapper from '../../src/conversion/mapper';

import { setData as modelSetData, getData as modelGetData } from '../../src/dev-utils/model';
import { setData as viewSetData } from '../../src/dev-utils/view';
import { convertSelectionChange } from '../../src/conversion/upcasthelpers';

describe( 'convertSelectionChange', () => {
	let model, view, viewDocument, mapper, convertSelection, modelRoot, viewRoot;

	beforeEach( () => {
		model = new Model();
		modelRoot = model.document.createRoot();
		model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

		modelSetData( model, '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );

		view = new View();
		viewDocument = view.document;
		viewRoot = createViewRoot( viewDocument, 'div', 'main' );

		viewSetData( view, '<p>foo</p><p>bar</p>' );

		mapper = new Mapper();
		mapper.bindElements( modelRoot, viewRoot );
		mapper.bindElements( modelRoot.getChild( 0 ), viewRoot.getChild( 0 ) );
		mapper.bindElements( modelRoot.getChild( 1 ), viewRoot.getChild( 1 ) );

		convertSelection = convertSelectionChange( model, mapper );
	} );

	afterEach( () => {
		view.destroy();
	} );

	it( 'should convert collapsed selection', () => {
		const viewSelection = new ViewSelection();
		viewSelection.setTo( ViewRange._createFromParentsAndOffsets(
			viewRoot.getChild( 0 ).getChild( 0 ), 1, viewRoot.getChild( 0 ).getChild( 0 ), 1 ) );

		convertSelection( null, { newSelection: viewSelection } );

		expect( modelGetData( model ) ).to.equals( '<paragraph>f[]oo</paragraph><paragraph>bar</paragraph>' );
		expect( modelGetData( model ) ).to.equal( '<paragraph>f[]oo</paragraph><paragraph>bar</paragraph>' );
	} );

	it( 'should support unicode', () => {
		modelSetData( model, '<paragraph>நிலைக்கு</paragraph>' );
		viewSetData( view, '<p>நிலைக்கு</p>' );

		// Re-bind elements that were just re-set.
		mapper.bindElements( modelRoot.getChild( 0 ), viewRoot.getChild( 0 ) );

		const viewSelection = new ViewSelection( [
			ViewRange._createFromParentsAndOffsets( viewRoot.getChild( 0 ).getChild( 0 ), 2, viewRoot.getChild( 0 ).getChild( 0 ), 6 )
		] );

		convertSelection( null, { newSelection: viewSelection } );

		expect( modelGetData( model ) ).to.equal( '<paragraph>நி[லைக்]கு</paragraph>' );
	} );

	it( 'should convert multi ranges selection', () => {
		const viewSelection = new ViewSelection( [
			ViewRange._createFromParentsAndOffsets(
				viewRoot.getChild( 0 ).getChild( 0 ), 1, viewRoot.getChild( 0 ).getChild( 0 ), 2 ),
			ViewRange._createFromParentsAndOffsets(
				viewRoot.getChild( 1 ).getChild( 0 ), 1, viewRoot.getChild( 1 ).getChild( 0 ), 2 )
		] );

		convertSelection( null, { newSelection: viewSelection } );

		expect( modelGetData( model ) ).to.equal(
			'<paragraph>f[o]o</paragraph><paragraph>b[a]r</paragraph>' );

		const ranges = Array.from( model.document.selection.getRanges() );
		expect( ranges.length ).to.equal( 2 );

		expect( ranges[ 0 ].start.parent ).to.equal( modelRoot.getChild( 0 ) );
		expect( ranges[ 0 ].start.offset ).to.equal( 1 );
		expect( ranges[ 0 ].end.parent ).to.equal( modelRoot.getChild( 0 ) );
		expect( ranges[ 0 ].end.offset ).to.equal( 2 );

		expect( ranges[ 1 ].start.parent ).to.equal( modelRoot.getChild( 1 ) );
		expect( ranges[ 1 ].start.offset ).to.equal( 1 );
		expect( ranges[ 1 ].end.parent ).to.equal( modelRoot.getChild( 1 ) );
		expect( ranges[ 1 ].end.offset ).to.equal( 2 );
	} );

	it( 'should convert reverse selection', () => {
		const viewSelection = new ViewSelection( [
			ViewRange._createFromParentsAndOffsets(
				viewRoot.getChild( 0 ).getChild( 0 ), 1, viewRoot.getChild( 0 ).getChild( 0 ), 2 ),
			ViewRange._createFromParentsAndOffsets(
				viewRoot.getChild( 1 ).getChild( 0 ), 1, viewRoot.getChild( 1 ).getChild( 0 ), 2 )
		], { backward: true } );

		convertSelection( null, { newSelection: viewSelection } );

		expect( modelGetData( model ) ).to.equal( '<paragraph>f[o]o</paragraph><paragraph>b[a]r</paragraph>' );
		expect( model.document.selection.isBackward ).to.true;
	} );

	it( 'should not enqueue changes if selection has not changed', () => {
		const viewSelection = new ViewSelection( [
			ViewRange._createFromParentsAndOffsets(
				viewRoot.getChild( 0 ).getChild( 0 ), 1, viewRoot.getChild( 0 ).getChild( 0 ), 1 )
		] );

		convertSelection( null, { newSelection: viewSelection } );

		const spy = sinon.spy();

		model.on( 'change', spy );

		convertSelection( null, { newSelection: viewSelection } );

		expect( spy.called ).to.be.false;
	} );
} );

/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: conversion */

import ViewDocument from '/ckeditor5/engine/view/document.js';
import ViewSelection from '/ckeditor5/engine/view/selection.js';
import ViewRange from '/ckeditor5/engine/view/range.js';

import ModelDocument from '/ckeditor5/engine/model/document.js';

import Mapper from '/ckeditor5/engine/conversion/mapper.js';
import { convertSelectionChange } from '/ckeditor5/engine/conversion/view-selection-to-model-converters.js';

import { setData as modelSetData, getData as modelGetData } from '/tests/engine/_utils/model.js';
import { setData as viewSetData } from '/tests/engine/_utils/view.js';

describe( 'convertSelectionChange', () => {
	let model, view, mapper, convertSelection, modelRoot, viewRoot;

	beforeEach( () => {
		model = new ModelDocument();
		modelRoot = model.createRoot();
		model.schema.registerItem( 'paragraph', '$block' );

		modelSetData( model, '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );

		view = new ViewDocument();
		viewRoot = view.createRoot( 'div' );

		viewSetData( view, '<p>foo</p><p>bar</p>' );

		mapper = new Mapper();
		mapper.bindElements( modelRoot, viewRoot );
		mapper.bindElements( modelRoot.getChild( 0 ), viewRoot.getChild( 0 ) );
		mapper.bindElements( modelRoot.getChild( 1 ), viewRoot.getChild( 1 ) );

		convertSelection = convertSelectionChange( model, mapper );
	} );

	it( 'should convert collapsed selection', () => {
		const viewSelection = new ViewSelection();
		viewSelection.addRange( ViewRange.createFromParentsAndOffsets(
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

		const viewSelection = new ViewSelection();
		viewSelection.addRange(
			ViewRange.createFromParentsAndOffsets( viewRoot.getChild( 0 ).getChild( 0 ), 2, viewRoot.getChild( 0 ).getChild( 0 ), 6 )
		);

		convertSelection( null, { newSelection: viewSelection } );

		expect( modelGetData( model ) ).to.equal( '<paragraph>நி[லைக்]கு</paragraph>' );
	} );

	it( 'should convert multi ranges selection', () => {
		const viewSelection = new ViewSelection();
		viewSelection.addRange( ViewRange.createFromParentsAndOffsets(
			viewRoot.getChild( 0 ).getChild( 0 ), 1, viewRoot.getChild( 0 ).getChild( 0 ), 2 ) );
		viewSelection.addRange( ViewRange.createFromParentsAndOffsets(
			viewRoot.getChild( 1 ).getChild( 0 ), 1, viewRoot.getChild( 1 ).getChild( 0 ), 2 ) );

		convertSelection( null, { newSelection: viewSelection } );

		expect( modelGetData( model ) ).to.equal(
			'<paragraph>f[o]o</paragraph><paragraph>b[a]r</paragraph>' );

		const ranges = Array.from( model.selection.getRanges() );
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
		const viewSelection = new ViewSelection();
		viewSelection.addRange( ViewRange.createFromParentsAndOffsets(
			viewRoot.getChild( 0 ).getChild( 0 ), 1, viewRoot.getChild( 0 ).getChild( 0 ), 2 ), true );
		viewSelection.addRange( ViewRange.createFromParentsAndOffsets(
			viewRoot.getChild( 1 ).getChild( 0 ), 1, viewRoot.getChild( 1 ).getChild( 0 ), 2 ), true );

		convertSelection( null, { newSelection: viewSelection } );

		expect( modelGetData( model ) ).to.equal( '<paragraph>f[o]o</paragraph><paragraph>b[a]r</paragraph>' );
		expect( model.selection.isBackward ).to.true;
	} );
} );

/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import { defaultConversion, defaultSchema, modelTable } from './_utils/utils';

import TableSelection from '../src/tableselection';

describe( 'TableSelection', () => {
	let editor, model, root, tableSelection;

	beforeEach( () => {
		return VirtualTestEditor.create( {
			plugins: [ TableSelection ]
		} ).then( newEditor => {
			editor = newEditor;
			model = editor.model;
			root = model.document.getRoot( 'main' );
			tableSelection = editor.plugins.get( TableSelection );

			defaultSchema( model.schema );
			defaultConversion( editor.conversion );
		} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( '#pluginName', () => {
		it( 'should provide plugin name', () => {
			expect( TableSelection.pluginName ).to.equal( 'TableSelection' );
		} );
	} );

	describe( 'start()', () => {
		it( 'should start selection', () => {
			setData( model, modelTable( [
				[ '00[]', '01' ],
				[ '10', '11' ]
			] ) );

			const nodeByPath = root.getNodeByPath( [ 0, 0, 0 ] );

			tableSelection.startSelection( nodeByPath );

			expect( tableSelection.isSelecting ).to.be.true;
		} );

		it( 'update selection to single table cell', () => {
			setData( model, modelTable( [
				[ '00[]', '01' ],
				[ '10', '11' ]
			] ) );

			const nodeByPath = root.getNodeByPath( [ 0, 0, 0 ] );

			tableSelection.startSelection( nodeByPath );

			expect( Array.from( tableSelection.getSelection() ) ).to.deep.equal( [ nodeByPath ] );
		} );
	} );
	describe( 'stop()', () => {
		it( 'should stop selection', () => {
			setData( model, modelTable( [
				[ '00[]', '01' ],
				[ '10', '11' ]
			] ) );

			const nodeByPath = root.getNodeByPath( [ 0, 0, 0 ] );

			tableSelection.startSelection( nodeByPath );
			expect( tableSelection.isSelecting ).to.be.true;

			tableSelection.stopSelection( nodeByPath );

			expect( tableSelection.isSelecting ).to.be.false;
		} );

		it( 'update selection to passed table cell', () => {
			setData( model, modelTable( [
				[ '00[]', '01' ],
				[ '10', '11' ]
			] ) );

			const startNode = root.getNodeByPath( [ 0, 0, 0 ] );
			const endNode = root.getNodeByPath( [ 0, 1, 1 ] );

			tableSelection.startSelection( startNode );
			tableSelection.stopSelection( endNode );

			expect( Array.from( tableSelection.getSelection() ) ).to.deep.equal( [
				startNode,
				root.getNodeByPath( [ 0, 0, 1 ] ),
				root.getNodeByPath( [ 0, 1, 0 ] ),
				endNode
			] );
		} );

		it( 'should not update selection if alredy stopped', () => {
			setData( model, modelTable( [
				[ '00[]', '01', '02' ],
				[ '10', '11', '12' ]
			] ) );

			const startNode = root.getNodeByPath( [ 0, 0, 0 ] );
			const firstEndNode = root.getNodeByPath( [ 0, 0, 1 ] );

			tableSelection.startSelection( startNode );
			tableSelection.stopSelection( firstEndNode );

			expect( tableSelection.isSelecting ).to.be.false;
			expect( Array.from( tableSelection.getSelection() ) ).to.deep.equal( [ startNode, firstEndNode ] );

			const secondEndNode = root.getNodeByPath( [ 0, 0, 2 ] );
			tableSelection.stopSelection( secondEndNode );

			expect( tableSelection.isSelecting ).to.be.false;
			expect( Array.from( tableSelection.getSelection() ) ).to.deep.equal( [ startNode, firstEndNode ] );
		} );

		it( 'should not update selection if table cell is from another parent', () => {
			setData( model, modelTable( [
				[ '00[]', '01' ]
			] ) + modelTable( [
				[ 'aa', 'bb' ]
			] ) );

			tableSelection.startSelection( root.getNodeByPath( [ 0, 0, 0 ] ) );
			tableSelection.stopSelection( root.getNodeByPath( [ 1, 0, 1 ] ) );

			expect( tableSelection.isSelecting ).to.be.false;
			expect( Array.from( tableSelection.getSelection() ) ).to.deep.equal( [ root.getNodeByPath( [ 0, 0, 0 ] ) ] );
		} );
	} );

	describe( 'update()', () => {
		it( 'should update selection', () => {
			setData( model, modelTable( [
				[ '00[]', '01', '02' ],
				[ '10', '11', '12' ]
			] ) );

			const startNode = root.getNodeByPath( [ 0, 0, 0 ] );
			const firstEndNode = root.getNodeByPath( [ 0, 0, 1 ] );

			tableSelection.startSelection( startNode );
			tableSelection.updateSelection( firstEndNode );

			expect( tableSelection.isSelecting ).to.be.true;
			expect( Array.from( tableSelection.getSelection() ) ).to.deep.equal( [ startNode, firstEndNode ] );

			const secondEndNode = root.getNodeByPath( [ 0, 0, 2 ] );
			tableSelection.updateSelection( secondEndNode );

			expect( tableSelection.isSelecting ).to.be.true;
			expect( Array.from( tableSelection.getSelection() ) ).to.deep.equal( [ startNode, firstEndNode, secondEndNode ] );
		} );

		it( 'should not update selection if stopped', () => {
			setData( model, modelTable( [
				[ '00[]', '01', '02' ],
				[ '10', '11', '12' ]
			] ) );

			const startNode = root.getNodeByPath( [ 0, 0, 0 ] );
			const firstEndNode = root.getNodeByPath( [ 0, 0, 1 ] );

			tableSelection.startSelection( startNode );
			tableSelection.updateSelection( firstEndNode );

			expect( tableSelection.isSelecting ).to.be.true;
			expect( Array.from( tableSelection.getSelection() ) ).to.deep.equal( [ startNode, firstEndNode ] );

			tableSelection.stopSelection( firstEndNode );
			expect( tableSelection.isSelecting ).to.be.false;

			const secondEndNode = root.getNodeByPath( [ 0, 0, 2 ] );
			tableSelection.updateSelection( secondEndNode );

			expect( tableSelection.isSelecting ).to.be.false;
			expect( Array.from( tableSelection.getSelection() ) ).to.deep.equal( [ startNode, firstEndNode ] );
		} );

		it( 'should not update selection if table cell is from another parent', () => {
			setData( model, modelTable( [
				[ '00[]', '01' ]
			] ) + modelTable( [
				[ 'aa', 'bb' ]
			] ) );

			tableSelection.startSelection( root.getNodeByPath( [ 0, 0, 0 ] ) );
			tableSelection.updateSelection( root.getNodeByPath( [ 1, 0, 1 ] ) );

			expect( tableSelection.isSelecting ).to.be.true;
			expect( Array.from( tableSelection.getSelection() ) ).to.deep.equal( [ root.getNodeByPath( [ 0, 0, 0 ] ) ] );
		} );
	} );

	describe( 'getSelection()', () => {
		it( 'should return empty array if not started', () => {
			expect( Array.from( tableSelection.getSelection() ) ).to.deep.equal( [] );
		} );

		it( 'should return block of selected nodes', () => {
			setData( model, modelTable( [
				[ '00[]', '01', '02', '03' ],
				[ '10', '11', '12', '13' ],
				[ '20', '21', '22', '23' ],
				[ '30', '31', '32', '33' ]
			] ) );

			tableSelection.startSelection( root.getNodeByPath( [ 0, 1, 1 ] ) );
			tableSelection.updateSelection( root.getNodeByPath( [ 0, 2, 2 ] ) );

			expect( Array.from( tableSelection.getSelection() ) ).to.deep.equal( [
				root.getNodeByPath( [ 0, 1, 1 ] ),
				root.getNodeByPath( [ 0, 1, 2 ] ),
				root.getNodeByPath( [ 0, 2, 1 ] ),
				root.getNodeByPath( [ 0, 2, 2 ] )
			] );
		} );

		it( 'should return block of selected nodes (inverted selection)', () => {
			setData( model, modelTable( [
				[ '00[]', '01', '02', '03' ],
				[ '10', '11', '12', '13' ],
				[ '20', '21', '22', '23' ],
				[ '30', '31', '32', '33' ]
			] ) );

			tableSelection.startSelection( root.getNodeByPath( [ 0, 2, 2 ] ) );
			tableSelection.updateSelection( root.getNodeByPath( [ 0, 1, 1 ] ) );

			expect( Array.from( tableSelection.getSelection() ) ).to.deep.equal( [
				root.getNodeByPath( [ 0, 1, 1 ] ),
				root.getNodeByPath( [ 0, 1, 2 ] ),
				root.getNodeByPath( [ 0, 2, 1 ] ),
				root.getNodeByPath( [ 0, 2, 2 ] )
			] );
		} );
	} );
} );

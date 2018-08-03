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

	describe.only( 'start()', () => {
		it( 'should...', () => {
			setData( model, modelTable( [
				[ { rowspan: 2, colspan: 2, contents: '00[]' }, '02' ],
				[ '12' ]
			] ) );

			const nodeByPath = root.getNodeByPath( [ 0, 0, 0 ] );

			tableSelection.startSelection( nodeByPath );
		} );
	} );
} );

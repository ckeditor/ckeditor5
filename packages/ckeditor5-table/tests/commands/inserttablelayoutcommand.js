/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import TableEditing from '../../src/tableediting.js';
import TableLayoutEditing from '../../src/tablelayout/tablelayoutediting.js';

import InsertTableLayoutCommand from '../../src/commands/inserttablelayoutcommand.js';

describe( 'InsertTableLayoutCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ Paragraph, TableEditing, TableLayoutEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new InsertTableLayoutCommand( editor );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'execute()', () => {
		it( 'should create a single batch', () => {
			setData( model, '<paragraph>foo[]</paragraph>' );

			const spy = sinon.spy();

			model.document.on( 'change', spy );

			command.execute( { rows: 3, columns: 4, layoutType: 'layout' } );

			sinon.assert.calledOnce( spy );
		} );

		// TODO: Add more tests.
	} );
} );

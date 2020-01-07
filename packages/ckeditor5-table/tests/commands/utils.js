/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import { defaultConversion, defaultSchema, modelTable } from '../_utils/utils';

import { findAncestor } from '../../src/commands/utils';

describe( 'commands utils', () => {
	let editor, model;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				defaultSchema( model.schema );
				defaultConversion( editor.conversion );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'getParentTable()', () => {
		it( 'should return undefined if not in table', () => {
			setData( model, '<paragraph>foo[]</paragraph>' );

			expect( findAncestor( 'table', model.document.selection.focus ) ).to.be.undefined;
		} );

		it( 'should return table if position is in tableCell', () => {
			setData( model, modelTable( [ [ '[]' ] ] ) );

			const parentTable = findAncestor( 'table', model.document.selection.focus );

			expect( parentTable ).to.not.be.undefined;
			expect( parentTable.is( 'table' ) ).to.be.true;
		} );
	} );
} );

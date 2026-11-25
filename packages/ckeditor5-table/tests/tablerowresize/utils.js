/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

import { TableRowResizeEditing } from '../../src/tablerowresize/tablerowresizeediting.js';
import { getRowEdgesIndexes } from '../../src/tablerowresize/utils.js';

describe( 'TableRowResize utils', () => {
	let editor, model, tableUtils;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ TableRowResizeEditing, Paragraph ]
		} );

		model = editor.model;
		tableUtils = editor.plugins.get( 'TableUtils' );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'getRowEdgesIndexes()', () => {
		beforeEach( () => {
			_setModelData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell><paragraph>00</paragraph></tableCell>' +
						'<tableCell rowspan="3"><paragraph>01</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow><tableCell><paragraph>10</paragraph></tableCell></tableRow>' +
					'<tableRow><tableCell><paragraph>20</paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );

		function getCell( path ) {
			return model.document.getRoot().getNodeByPath( [ 0, ...path ] );
		}

		it( 'should return the same index for both edges of a cell in a single row', () => {
			expect( getRowEdgesIndexes( getCell( [ 0, 0 ] ), tableUtils ) ).toEqual( { topEdge: 0, bottomEdge: 0 } );
			expect( getRowEdgesIndexes( getCell( [ 2, 0 ] ), tableUtils ) ).toEqual( { topEdge: 2, bottomEdge: 2 } );
		} );

		it( 'should return the last spanned row as the bottom edge of a cell spanning several rows', () => {
			expect( getRowEdgesIndexes( getCell( [ 0, 1 ] ), tableUtils ) ).toEqual( { topEdge: 0, bottomEdge: 2 } );
		} );
	} );
} );

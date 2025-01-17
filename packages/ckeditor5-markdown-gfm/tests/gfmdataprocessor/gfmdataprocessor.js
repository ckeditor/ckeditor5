/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import GFMDataProcessor from '../../src/gfmdataprocessor.js';
import ViewDocument from '@ckeditor/ckeditor5-engine/src/view/document.js';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap.js';

describe( 'GFMDataProcessor', () => {
	let dataProcessor, viewDocument;

	beforeEach( () => {
		viewDocument = new ViewDocument( new StylesProcessor() );
		dataProcessor = new GFMDataProcessor( viewDocument );
	} );

	describe( 'useFillerType()', () => {
		it( 'should have this method to be compatible with `DataProcessor` interface', () => {
			expect( () => {
				dataProcessor.useFillerType( 'default' );
			} ).not.to.throw();
		} );
	} );
} );

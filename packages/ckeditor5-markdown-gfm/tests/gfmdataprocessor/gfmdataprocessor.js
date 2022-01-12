/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import GFMDataProcessor from '../../src/gfmdataprocessor';
import ViewDocument from '@ckeditor/ckeditor5-engine/src/view/document';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap';

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

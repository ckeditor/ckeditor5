/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import EditingController from '../../src/controller/editingcontroller.js';

import Model from '../../src/model/model.js';
import ModelText from '../../src/model/text.js';

import MarkerOperation from '../../src/model/operation/markeroperation.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

describe( 'Bug ckeditor5-engine@1323', () => {
	describe( 'constructor()', () => {
		let model, editing, root, range;

		beforeEach( () => {
			model = new Model();
			editing = new EditingController( model, new StylesProcessor() );
			root = model.document.createRoot();
			root._appendChild( new ModelText( 'foo' ) );
			range = model.createRange( model.createPositionAt( root, 0 ), model.createPositionAt( root, 0 ) );
		} );

		afterEach( () => {
			editing.destroy();
		} );

		it( 'should not fire view#render event before initial model#change block is finished', () => {
			const spy = sinon.spy();

			editing.view.on( 'render', spy );

			model.change( () => {
				// Add marker.
				model.applyOperation( new MarkerOperation( 'name', null, range, model.markers, false, 0 ) );

				// Remove marker.
				model.applyOperation( new MarkerOperation( 'name', range, null, model.markers, false, 1 ) );

				sinon.assert.notCalled( spy );
			} );
		} );
	} );
} );

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-disable new-cap */

import Editor from '../../src/editor/editor';
import DataApiMixin from '../../src/editor/utils/dataapimixin';

/**
 * A simple editor implementation useful for testing the engine part of the features.
 * It contains full data pipepilne and the engine pipeline but without rendering to DOM.
 *
 * Should work in Node.js. If not now, then in the future :).
 *
 * @memberOf tests.core._utils
 */
export default class VirtualTestEditor extends DataApiMixin( Editor ) {
	constructor( config ) {
		super( config );

		// Create the ("main") root element of the model tree.
		this.model.document.createRoot();
	}

	static create( config = {} ) {
		return new Promise( resolve => {
			const editor = new this( config );

			resolve(
				editor.initPlugins()
					.then( () => editor.data.init( config.initialData || '' ) )
					.then( () => {
						editor.fire( 'ready' );
						return editor;
					} )
			);
		} );
	}
}

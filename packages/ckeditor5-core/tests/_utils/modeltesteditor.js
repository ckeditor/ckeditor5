/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Editor from '../../src/editor/editor.js';

/**
 * A simple editor implementation with a functional model part of the engine (the document).
 * It contains a full data pipeline but no editing pipeline.
 *
 * Should work in Node.js. If not now, then in the future :).
 *
 * @memberOf tests.core._utils
 */
export default class ModelTestEditor extends Editor {
	constructor( config ) {
		super( config );

		// Disable editing pipeline.
		this.editing.destroy();

		// Create the ("main") root element of the model tree.
		this.model.document.createRoot();
	}

	static create( config ) {
		return new Promise( resolve => {
			const editor = new this( config );

			resolve(
				editor.initPlugins()
					.then( () => {
						// Fire `data#ready` event manually as `data#init()` method is not used.
						editor.data.fire( 'ready' );
						editor.fire( 'ready' );
					} )
					.then( () => editor )
			);
		} );
	}
}

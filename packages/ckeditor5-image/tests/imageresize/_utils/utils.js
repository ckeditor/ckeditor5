/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ImageLoadObserver from '../../../src/image/imageloadobserver.js';

// A 100x50 black png image
export const IMAGE_SRC_FIXTURE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAQAAAAAPLY1AAAAQklEQVR42u3PQREAAAgDoK1/' +
		'aM3g14MGNJMXKiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiJysRFNMgH0RpujAAAAAElFTkSuQmCC';

export async function waitForAllImagesLoaded( editor ) {
	// Returns a promise that waits for all the images in editor to be loaded.
	// This is needed because resizers are created only after images are loaded.
	const root = editor.model.document.getRoot();
	const editingView = editor.editing.view;
	const images = new Set();

	for ( const curModel of root.getChildren() ) {
		if ( curModel.is( 'element', 'imageBlock' ) ) {
			const imageView = editor.editing.mapper.toViewElement( curModel );
			images.add( editingView.domConverter.mapViewToDom( imageView ).querySelector( 'img' ) );
		}
	}

	editingView.addObserver( ImageLoadObserver );

	return new Promise( resolve => {
		// This listener should execute later than the one in ImageResizeHandles.
		editingView.document.on( 'imageLoaded', ( evt, domEvent ) => {
			images.delete( domEvent.target );

			if ( images.size === 0 ) {
				resolve();
			}
		}, { priority: 'low' } );
	} );
}

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ckfinder/ckfinderediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { Notification } from 'ckeditor5/src/ui.js';
import { CKEditorError } from 'ckeditor5/src/utils.js';

import CKFinderCommand from './ckfindercommand.js';

/**
 * The CKFinder editing feature. It introduces the {@link module:ckfinder/ckfindercommand~CKFinderCommand CKFinder command}.
 */
export default class CKFinderEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'CKFinderEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ Notification, 'LinkEditing' ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		if ( !editor.plugins.has( 'ImageBlockEditing' ) && !editor.plugins.has( 'ImageInlineEditing' ) ) {
			/**
			 * CKFinder requires at least one plugin providing support for images loaded in the editor. Please
			 * make sure either:
			 *
			 * * {@link module:image/image~Image} (which loads both types of images),
			 * * or {@link module:image/imageblock~ImageBlock},
			 * * or {@link module:image/imageinline~ImageInline}.
			 *
			 * is loaded in your editor configuration.
			 *
			 * @error ckfinder-missing-image-plugin
			 */
			throw new CKEditorError( 'ckfinder-missing-image-plugin', editor );
		}

		editor.commands.add( 'ckfinder', new CKFinderCommand( editor ) );
	}
}

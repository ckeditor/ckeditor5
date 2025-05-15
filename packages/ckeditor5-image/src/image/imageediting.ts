/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/image/imageediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import ImageLoadObserver from './imageloadobserver.js';
import InsertImageCommand from './insertimagecommand.js';
import ReplaceImageSourceCommand from './replaceimagesourcecommand.js';
import ImageUtils from '../imageutils.js';

/**
 * The image engine plugin. This module loads common code shared between
 * {@link module:image/image/imageinlineediting~ImageInlineEditing} and
 * {@link module:image/image/imageblockediting~ImageBlockEditing} plugins.
 *
 * This plugin registers the {@link module:image/image/insertimagecommand~InsertImageCommand 'insertImage'} command.
 */
export default class ImageEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ImageEditing' as const;
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
	public init(): void {
		const editor = this.editor;
		const conversion = editor.conversion;

		// See https://github.com/ckeditor/ckeditor5-image/issues/142.
		editor.editing.view.addObserver( ImageLoadObserver );

		conversion.for( 'upcast' )
			.attributeToAttribute( {
				view: {
					name: 'img',
					key: 'alt'
				},
				model: 'alt'
			} )
			.attributeToAttribute( {
				view: {
					name: 'img',
					key: 'srcset'
				},
				model: 'srcset'
			} );

		const insertImageCommand = new InsertImageCommand( editor );
		const replaceImageSourceCommand = new ReplaceImageSourceCommand( editor );

		editor.commands.add( 'insertImage', insertImageCommand );
		editor.commands.add( 'replaceImageSource', replaceImageSourceCommand );

		// `imageInsert` is an alias for backward compatibility.
		editor.commands.add( 'imageInsert', insertImageCommand );
	}
}

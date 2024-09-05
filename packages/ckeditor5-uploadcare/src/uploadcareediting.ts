/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module uploadcare/uploadcareediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { Dialog } from 'ckeditor5/src/ui.js';
import { type ViewElement } from 'ckeditor5/src/engine.js';
import { type DecoratedMethodEvent } from 'ckeditor5/src/utils.js';

import type { ReplaceImageSourceCommand } from '@ckeditor/ckeditor5-image';

import UploadcareCommand from './uploadcarecommand.js';
import UploadcareUploadAdapter from './uploadcareuploadadapter.js';

/**
 * The Uploadcare editing feature. It introduces the {@link module:uploadcare/uploadcarecommand~UploadcareCommand command}.
 */
export default class UploadcareEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'UploadcareEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		// TODO: check if 'PictureEditing' is needed.
		return [ UploadcareUploadAdapter, Dialog ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		editor.commands.add( 'uploadcare', new UploadcareCommand( editor ) );
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		this._initSchema();
		this._initConversion();
	}

	/**
	 * Extends the schema to allow the `uploadcareImageId` attributes for images.
	 */
	private _initSchema() {
		const editor = this.editor;
		const schema = editor.model.schema;

		if ( schema.isRegistered( 'imageBlock' ) ) {
			schema.extend( 'imageBlock', { allowAttributes: [ 'uploadcareImageId' ] } );
		}
	}

	/**
	 * Configures the upcast and downcast conversions for the `uploadcareImageId` attributes.
	 */
	private _initConversion() {
		const editor = this.editor;

		// Convert `uploadcareImageId` => `data-uc-image-id`.
		editor.conversion.for( 'downcast' ).attributeToAttribute( {
			model: 'uploadcareImageId',
			view: 'data-uc-image-id'
		} );

		// Convert `data-uc-image-id` => `uploadcareImageId`.
		editor.conversion.for( 'upcast' ).elementToAttribute( {
			model: {
				key: 'uploadcareImageId',
				value: ( viewElement: ViewElement ) => viewElement.getAttribute( 'data-uc-image-id' )
			},
			view: {
				attributes: {
					'data-uc-image-id': /[a-zA-Z0-9\\-]+/
				}
			}
		} );

		const replaceImageSourceCommand = editor.commands.get( 'replaceImageSource' );
		if ( replaceImageSourceCommand ) {
			this.listenTo<DecoratedMethodEvent<ReplaceImageSourceCommand, 'cleanupImage'>>(
				replaceImageSourceCommand,
				'cleanupImage',
				( _, [ writer, image ] ) => {
					writer.removeAttribute( 'uploadcareImageId', image );
				}
			);
		}
	}
}

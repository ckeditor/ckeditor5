/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, AbortController */

/**
 * @module uploadcare/uploadcareimageedit/uploadcareimageeditcommand
 */

import { Command, type Editor } from 'ckeditor5/src/core.js';
import { Dialog, DialogViewPosition } from 'ckeditor5/src/ui.js';
import { createElement } from 'ckeditor5/src/utils.js';
import UploadcareImageEditFormView from './ui/uploadcareimageeditformview.js';
import type { Element as ModelElement } from 'ckeditor5/src/engine.js';

import type * as UC from '@uploadcare/file-uploader';

import uploadcareImageEditIcon from '../../theme/icons/uploadcare-image-edit.svg';
import { uploadFile } from '../utils/uploadfile.js';

/**
 * The Uploadcare edit image command.
 *
 * Opens the Uploadcare dialog for editing the image.
 */
export default class UploadcareImageEditCommand extends Command {
	/**
	 * @observable
	 * @readonly
	 */
	declare public imageStatus: 'uploading' | 'ready' | 'error';

	/**
	 * @observable
	 * @readonly
	 */
	declare public imageSrc: string | null;

	/**
	 * @observable
	 * @readonly
	 */
	declare public imageUploadProgress: number | null;

	/**
	 * The dialog plugin instance.
	 *
	 * @internal
	 */
	private _dialog!: Dialog;

	/**
	 * The DOM element that represents the Uploadcare config web component.
	 * It is used to pass the initial configuration.
	 *
	 * @internal
	 */
	private _configElement: Element | null = null;

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ Dialog ] as const;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this._dialog = editor.plugins.get( Dialog );

		this.set( 'imageStatus', 'ready' );
		this.set( 'imageSrc', null );
		this.set( 'imageUploadProgress', null );
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		// TODO: improve this logic.
		const editor = this.editor;

		const selectedElement = editor.model.document.selection.getSelectedElement();

		this.isEnabled = !!selectedElement;
	}

	/**
	 * @inheritDoc
	 */
	public override execute(): void {
		if ( !this.isEnabled ) {
			return;
		}

		const imageElement = this.editor.model.document.selection.getSelectedElement()!;

		const processingState: ProcessingState = {
			element: imageElement,
			controller: new AbortController()
		};

		if ( !this._configElement ) {
			this._initConfig();
		}

		this._prepareImage( processingState );
		this._initDialog();
		this._prepareListeners( processingState );
	}

	private _initConfig() {
		this._configElement = createElement( document, 'uc-config', {
			'ctx-name': 'image-edit',
			'removeCopyright': 'true',
			'localeName': this.editor.locale.contentLanguage
		} );

		document.body.appendChild( this._configElement );
	}

	/**
	 * Process the image for Uploadcare Image Editor dialog.
	 */
	private _prepareImage( state: ProcessingState ) {
		const editor = this.editor;
		const { element, controller } = state;

		const uploadcareImageId = element.getAttribute( 'uploadcareImageId' );
		const imageSrc = element.getAttribute( 'src' ) as string;

		if ( uploadcareImageId ) {
			this.imageStatus = 'ready';
			this.imageSrc = imageSrc;
		} else {
			this.imageStatus = 'uploading';
			this.imageUploadProgress = 0;

			uploadFile( {
				publicKey: editor.config.get( 'uploadcare.pubKey' ) as string,
				signal: controller.signal,
				file: imageSrc,
				onProgress: progress => {
					if ( progress && progress.isComputable ) {
						this.imageUploadProgress = progress.value;
					}
				}
			} )
				.then( img => {
					this.imageStatus = 'ready';
					this.imageSrc = img.cdnUrl;
					this.imageUploadProgress = 100;
				} )
				.catch( () => {
					this.imageStatus = 'error';
					this.imageSrc = null;
					this.imageUploadProgress = null;
				} );
		}
	}

	private _initDialog() {
		const { locale } = this.editor;
		const formView = new UploadcareImageEditFormView( locale, this );

		this._dialog.show( {
			id: 'uploadcareImageEdit',
			icon: uploadcareImageEditIcon,
			title: 'Edit image',
			content: formView,
			position: DialogViewPosition.EDITOR_TOP_CENTER,
			onShow: () => {
				formView.focus();
			},
			onHide: () => {
				this.imageStatus = 'ready';
				this.imageSrc = null;
				this.imageUploadProgress = null;
			}
		} );
	}

	private _prepareListeners( state: ProcessingState ) {
		const imageEditor = document.querySelector( 'uc-cloud-image-editor' ) as UC.CloudImageEditor;

		imageEditor.addEventListener<any>( 'apply', ( evt: CustomEvent<UC.OutputFileEntry> ) => {
			this._replaceImage( state.element, evt.detail ); // @TODO no image id in the event, either we gat it from the URL or ???

			this._dialog.hide();
		} );

		imageEditor.addEventListener( 'cancel', () => {
			this._dialog.hide();
		} );

		// Clean up after the editor is destroyed.
		this.listenTo( this.editor, 'destroy', () => {
			this._configElement!.remove();
			this._configElement = null;
		} );
	}

	/**
	 * Replace the edited image with the new one.
	 */
	private _replaceImage( element: ModelElement, asset: UC.OutputFileEntry ) {
		const editor = this.editor;

		const { cdnUrl } = asset;
		const previousSelectionRanges = Array.from( editor.model.document.selection.getRanges() );

		editor.model.change( writer => {
			writer.setSelection( element, 'on' );

			editor.execute( 'insertImage', {
				source: {
					src: cdnUrl,
					uploadcareImageId: cdnUrl
				}
			} );

			const previousChildren = element.getChildren();

			element = editor.model.document.selection.getSelectedElement()!;

			for ( const child of previousChildren ) {
				writer.append( writer.cloneElement( child as ModelElement ), element );
			}

			writer.setSelection( previousSelectionRanges );
		} );
	}
}

interface ProcessingState {
	element: ModelElement;
	controller: AbortController;
}

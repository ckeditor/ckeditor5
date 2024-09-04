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

import type * as UC from '@uploadcare/file-uploader';

import type { Element as ModelElement } from 'ckeditor5/src/engine.js';
import type { UploadcareSource } from '../uploadcareconfig.js';

import uploadcareImageEditIcon from '../../theme/icons/uploadcare-image-edit.svg';

/**
 * The Uploadcare edit image command.
 *
 * Opens the Uploadcare dialog for editing the image.
 */
export default class UploadcareImageEditCommand extends Command {
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
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		// TODO
		this.isEnabled = true;
	}

	/**
	 * @inheritDoc
	 */
	public override execute( type: UploadcareSource ): void {
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

		this._initDialog( imageElement!.getAttribute( 'src' ) as string );
		this._prepareListeners( processingState );
	}

	private _initConfig() {
		this._configElement = createElement( document, 'uc-config', {
			'ctx-name': 'image-edit',
			'removeCopyright': true,
			'localeName': this.editor.locale.contentLanguage
		} );

		document.body.appendChild( this._configElement );
	}

	private _initDialog( src: string ) {
		const { locale } = this.editor;
		const formView = new UploadcareImageEditFormView( locale, src );

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
			}
		} );
	}

	private _prepareListeners( state: ProcessingState ) {
		const imageEditor = document.querySelector( 'uc-cloud-image-editor' );

		imageEditor.addEventListener( 'apply', ( evt: CustomEvent<UC.OutputFileEntry> ) => {
			this._replaceImage( state.element, evt.detail );

			this._dialog.hide();
		} );

		imageEditor.addEventListener( 'cancel', () => {
			this._dialog.hide();
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
					src: cdnUrl
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

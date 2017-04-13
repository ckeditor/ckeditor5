/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

/**
 * @module upload/ui/fileuploadbuttonview
 */

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import View from '@ckeditor/ckeditor5-ui/src/view';
import Template from '@ckeditor/ckeditor5-ui/src/template';

/**
 * File Upload button view.
 *
 * @extends module:ui/button/buttonview~ButtonView
 */
export default class FileUploadButtonView extends ButtonView {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		/**
		 * Hidden input view used to execute file dialog. It will be hidden and added to the end of `document.body`.
		 *
		 * @private
		 * @member module:upload/ui/fileuploadbuttonview~FileDialogButtonView #_fileInputView
		 */
		this._fileInputView = new FileInputView( locale );

		/**
		 * Accepted file types. Can be provided in form of file extensions, media type or one of:
		 * * `audio/*`,
		 * * `video/*`,
		 * * `image/*`.
		 *
		 * @observable
		 * @member {String} #acceptedType
		 */
		this._fileInputView.bind( 'acceptedType' ).to( this, 'acceptedType' );

		/**
		 * Fired when file dialog is closed with file selected.
		 *
		 *	fileUploadButtonView.on( 'done', ( evt, files ) => {
		 *		for ( const file of files ) {
		 *			processFile( file );
		 *		}
		 *	}
		 *
		 * @event done
		 * @param {Array.<File>} files Array of selected files.
		 */
		this._fileInputView.delegate( 'done' ).to( this );

		this.on( 'execute', () => {
			this._fileInputView.open();
		} );

		document.body.appendChild( this._fileInputView.element );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		document.body.removeChild( this._fileInputView.element );

		return super.destroy();
	}
}

/**
 * Hidden file input view class.
 *
 * @private
 * @extends {module:ui/view~View}
 */
class FileInputView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		/**
		 * Accepted file types. Can be provided in form of file extensions, media type or one of:
		 * * `audio/*`,
		 * * `video/*`,
		 * * `image/*`.
		 *
		 * @observable
		 * @member {String} #acceptedType
		 */
		this.set( 'acceptedType' );

		const bind = this.bindTemplate;

		this.template = new Template( {
			tag: 'input',

			attributes: {
				class: [
					'ck-hidden'
				],
				type: 'file',
				tabindex: '-1',
				accept: bind.to( 'acceptedType' )
			},

			on: {
				change: bind.to( () => {
					if ( this.element && this.element.files && this.element.files.length ) {
						this.fire( 'done', this.element.files );
					}

					this.element.value = '';
				} )
			}
		} );
	}

	/**
	 * Opens file dialog.
	 */
	open() {
		this.element.click();
	}
}

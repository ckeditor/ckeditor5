/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

/**
 * @module upload/ui/filedialogbuttonview
 */

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import View from '@ckeditor/ckeditor5-ui/src/view';
import Template from '@ckeditor/ckeditor5-ui/src/template';

/**
 * File Dialog button view.
 *
 * @extends module:ui/button/buttonview~ButtonView
 */
export default class FileDialogButtonView extends ButtonView {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		/**
		 * Hidden input view used to execute file dialog. It will be hidden and added to the end of `document.body`.
		 *
		 * @protected
		 * @member {module:upload/ui/filedialogbuttonview~FileInputView}
		 */
		this.fileInputView = new FileInputView( locale );

		/**
		 * Accepted file types. Can be provided in form of file extensions, media type or one of:
		 * * `audio/*`,
		 * * `video/*`,
		 * * `image/*`.
		 *
		 * @observable
		 * @member {String} #acceptedType
		 */
		this.fileInputView.bind( 'acceptedType' ).to( this, 'acceptedType' );

		/**
		 * Indicates if multiple files can be selected. Defaults to `true`.
		 *
		 * @observable
		 * @member {Boolean} #allowMultipleFiles
		 */
		this.set( 'allowMultipleFiles', false );
		this.fileInputView.bind( 'allowMultipleFiles' ).to( this, 'allowMultipleFiles' );

		/**
		 * Fired when file dialog is closed with file selected.
		 *
		 *	fileDialogButtonView.on( 'done', ( evt, files ) => {
		 *		for ( const file of files ) {
		 *			processFile( file );
		 *		}
		 *	}
		 *
		 * @event done
		 * @param {Array.<File>} files Array of selected files.
		 */
		this.fileInputView.delegate( 'done' ).to( this );

		this.on( 'execute', () => {
			this.fileInputView.open();
		} );

		document.body.appendChild( this.fileInputView.element );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		document.body.removeChild( this.fileInputView.element );

		super.destroy();
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

		/**
		 * Indicates if multiple files can be selected. Defaults to `false`.
		 *
		 * @observable
		 * @member {Boolean} #allowMultipleFiles
		 */
		this.set( 'allowMultipleFiles', false );

		const bind = this.bindTemplate;

		this.template = new Template( {
			tag: 'input',

			attributes: {
				class: [
					'ck-hidden'
				],
				type: 'file',
				tabindex: '-1',
				accept: bind.to( 'acceptedType' ),
				multiple: bind.to( 'allowMultipleFiles' )
			},

			on: {
				// Removing from code coverage since we cannot programmatically set input element files.
				change: bind.to( /* istanbul ignore next */ () => {
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

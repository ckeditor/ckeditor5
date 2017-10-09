/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module upload/ui/filedialogbuttonview
 */

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import View from '@ckeditor/ckeditor5-ui/src/view';
import Template from '@ckeditor/ckeditor5-ui/src/template';

/**
 * File Dialog button view.
 *
 * This component implements wrapper element with {@link module:ui/button/buttonview~ButtonView ButtonView}
 * and and hidden `input[type="file"]` inside.
 *
 * @extends module:ui/view~View
 */
export default class FileDialogButtonView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		/**
		 * Button View.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.buttonView = new ButtonView( locale );

		/**
		 * Hidden input view used to execute file dialog.
		 *
		 * @protected
		 * @member {module:upload/ui/filedialogbuttonview~FileInputView}
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
		this._fileInputView.bind( 'acceptedType' ).to( this );

		/**
		 * Indicates if multiple files can be selected. Defaults to `true`.
		 *
		 * @observable
		 * @member {Boolean} #allowMultipleFiles
		 */
		this._fileInputView.bind( 'allowMultipleFiles' ).to( this );

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
		this._fileInputView.delegate( 'done' ).to( this );

		this.template = new Template( {
			tag: 'span',
			attributes: {
				class: 'ck-file-dialog-button',
			},
			children: [
				this.buttonView,
				this._fileInputView
			]
		} );

		this.buttonView.on( 'execute', () => {
			this._fileInputView.open();
		} );
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

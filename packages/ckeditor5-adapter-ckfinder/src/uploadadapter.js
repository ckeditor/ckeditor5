/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals XMLHttpRequest, FormData */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import { getCSRFToken } from './utils';

export default class CKFinderUploadAdapter extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FileRepository ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const url = this.editor.config.get( 'ckfinder.uploadUrl' ) || '';

		// Register CKFinderAdapter
		this.editor.plugins.get( FileRepository ).createAdapter = loader => new Adapter( loader, url, this.editor.t );
	}
}

class Adapter {
	constructor( loader, uploadURL, t ) {
		// Save Loader instance to update upload progress.
		this.loader = loader;
		this.uploadURL = uploadURL;

		this.t = t;
	}

	upload() {
		return new Promise( ( resolve, reject ) => {
			this._initRequest();
			this._initListeners( resolve, reject );
			this._sendRequest();
		} );
	}

	abort() {
		if ( this.xhr ) {
			this.xhr.abort();
		}
	}

	_initRequest() {
		const xhr = this.xhr = new XMLHttpRequest();

		xhr.open( 'POST', this.uploadURL, true );
		xhr.responseType = 'json';
	}

	_initListeners( resolve, reject ) {
		const xhr = this.xhr;
		const loader = this.loader;
		const t = this.t;
		const genericError = t( 'Cannot upload file:' ) + ` ${ loader.file.name }.`;

		xhr.addEventListener( 'error', () => reject( genericError ) );
		xhr.addEventListener( 'abort', () => reject() );
		xhr.addEventListener( 'load', () => {
			const response = xhr.response;

			if ( !response || !response.uploaded ) {
				return reject( response && response.error && response.error.message ? response.error.message : genericError );
			}

			resolve( {
				original: response.url
			} );
		} );

		// Upload progress when it's supported.
		if ( xhr.upload ) {
			xhr.upload.addEventListener( 'progress', ( evt ) => {
				if ( evt.lengthComputable ) {
					loader.uploadTotal = evt.total;
					loader.uploaded = evt.loaded;
				}
			} );
		}
	}

	_sendRequest() {
		// Prepare form data.
		const data = new FormData();
		data.append( 'upload', this.loader.file );
		data.append( 'ckCsrfToken', getCSRFToken() );

		// Send request.
		this.xhr.send( data );
	}
}

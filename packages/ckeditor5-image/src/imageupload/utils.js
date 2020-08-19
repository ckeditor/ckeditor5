/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageupload/utils
 */

/* global fetch, File, console */

import LabeledFieldView from '@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview';
import { createLabeledInputText } from '@ckeditor/ckeditor5-ui/src/labeledfield/utils';
import { attachLinkToDocumentation } from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Creates a regular expression used to test for image files.
 *
 *		const imageType = createImageTypeRegExp( [ 'png', 'jpeg', 'svg+xml', 'vnd.microsoft.icon' ] );
 *
 *		console.log( 'is supported image', imageType.test( file.type ) );
 *
 * @param {Array.<String>} types
 * @returns {RegExp}
 */
export function createImageTypeRegExp( types ) {
	// Sanitize the MIME type name which may include: "+", "-" or ".".
	const regExpSafeNames = types.map( type => type.replace( '+', '\\+' ) );

	return new RegExp( `^image\\/(${ regExpSafeNames.join( '|' ) })$` );
}

/**
 * Creates a promise that fetches the image local source (Base64 or blob) and resolves with a `File` object.
 *
 * @param {module:engine/view/element~Element} image Image whose source to fetch.
 * @returns {Promise.<File>} A promise which resolves when an image source is fetched and converted to a `File` instance.
 * It resolves with a `File` object. If there were any errors during file processing, the promise will be rejected.
 */
export function fetchLocalImage( image ) {
	return new Promise( ( resolve, reject ) => {
		const imageSrc = image.getAttribute( 'src' );

		// Fetch works asynchronously and so does not block browser UI when processing data.
		fetch( imageSrc )
			.then( resource => resource.blob() )
			.then( blob => {
				const mimeType = getImageMimeType( blob, imageSrc );
				const ext = mimeType.replace( 'image/', '' );
				const filename = `image.${ ext }`;
				const file = new File( [ blob ], filename, { type: mimeType } );

				resolve( file );
			} )
			.catch( reject );
	} );
}

/**
 * Checks whether a given node is an image element with a local source (Base64 or blob).
 *
 * @param {module:engine/view/node~Node} node The node to check.
 * @returns {Boolean}
 */
export function isLocalImage( node ) {
	if ( !node.is( 'element', 'img' ) || !node.getAttribute( 'src' ) ) {
		return false;
	}

	return node.getAttribute( 'src' ).match( /^data:image\/\w+;base64,/g ) ||
		node.getAttribute( 'src' ).match( /^blob:/g );
}

// Extracts an image type based on its blob representation or its source.
//
// @param {String} src Image `src` attribute value.
// @param {Blob} blob Image blob representation.
// @returns {String}
function getImageMimeType( blob, src ) {
	if ( blob.type ) {
		return blob.type;
	} else if ( src.match( /data:(image\/\w+);base64/ ) ) {
		return src.match( /data:(image\/\w+);base64/ )[ 1 ].toLowerCase();
	} else {
		// Fallback to 'jpeg' as common extension.
		return 'image/jpeg';
	}
}

/**
 * Creates integrations object that will be passed to the
 * {@link module:image/imageupload/ui/imageuploadpanelview~ImageUploadPanelView}.
 *
 * @param {module:core/editor/editor~Editor} editor Editor instance.
 *
 * @returns {Object.<String, module:ui/view~View>} Integrations object.
 */
export function prepareIntegrations( editor ) {
	const panelItems = editor.config.get( 'image.upload.panel.items' );
	const imageUploadUIPlugin = editor.plugins.get( 'ImageUploadUI' );

	const PREDEFINED_INTEGRATIONS = {
		'insertImageViaUrl': createLabeledInputView( editor.locale )
	};

	if ( !panelItems ) {
		return PREDEFINED_INTEGRATIONS;
	}

	// Prepares ckfinder component for the `openCKFinder` integration token.
	if ( panelItems.find( item => item === 'openCKFinder' ) && editor.ui.componentFactory.has( 'ckfinder' ) ) {
		const ckFinderButton = editor.ui.componentFactory.create( 'ckfinder' );
		ckFinderButton.set( {
			withText: true,
			class: 'ck-image-upload__ck-finder-button'
		} );

		// We want to close the dropdown panel view when user clicks the ckFinderButton.
		ckFinderButton.delegate( 'execute' ).to( imageUploadUIPlugin, 'cancel' );

		PREDEFINED_INTEGRATIONS.openCKFinder = ckFinderButton;
	}

	// Creates integrations object of valid views to pass it to the ImageUploadPanelView.
	return panelItems.reduce( ( object, key ) => {
		if ( PREDEFINED_INTEGRATIONS[ key ] ) {
			object[ key ] = PREDEFINED_INTEGRATIONS[ key ];
		} else if ( editor.ui.componentFactory.has( key ) ) {
			object[ key ] = editor.ui.componentFactory.create( key );
		} else {
			/**
			 * The specified name of the view cannot be created by the
			 * {@link module:ui/componentfactory~ComponentFactory component factory}.
			 *
			 * Check whether:
			 * * you passed the proper integration name as the
			 *    `{@link module:image/imageupload~ImageUploadPanelConfig#items image.upload.panel.items}`,
			 * * the plugin that registers the component was loaded to the editor,
			 * * integration component was properly registered by the plugin.
			 *
			 * @error image-upload-integrations-invalid-view
			 */
			console.warn( attachLinkToDocumentation(
				'image-upload-integrations-invalid-view: Trying to use a view that does not exist.'
			), { key } );
		}

		return object;
	}, {} );
}

/**
 * Creates labeled field view.
 *
 * @param {module:utils/locale~Locale} locale The localization services instance.
 *
 * @returns {module:ui/labeledfield/labeledfieldview~LabeledFieldView}
 */
export function createLabeledInputView( locale ) {
	const t = locale.t;
	const labeledInputView = new LabeledFieldView( locale, createLabeledInputText );

	labeledInputView.set( {
		label: t( 'Insert image via URL' )
	} );
	labeledInputView.fieldView.placeholder = 'https://example.com/src/image.png';
	labeledInputView.infoText = t( 'Paste the image source URL.' );

	return labeledInputView;
}

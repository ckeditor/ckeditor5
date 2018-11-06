/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module paste-from-office/filters/image
 */

/* globals XMLHttpRequest, FileReader */

import ViewMatcher from '@ckeditor/ckeditor5-engine/src/view/matcher';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';

import { convertHexToBase64 } from './utils';

/**
 * Replaces source attribute of all `<img>` elements representing regular
 * images (not the Word shapes) with inlined base64 image representation extracted from RTF or Blob data.
 *
 * @param {module:engine/view/documentfragment~DocumentFragment} documentFragment Document fragment on which transform images.
 * @param {String} rtfData The RTF data from which images representation will be used.
 * @param {module:engine/model/model~Model} model Editor model.
 */
export function replaceImagesSourceWithBase64( documentFragment, rtfData, model ) {
	if ( !documentFragment.childCount ) {
		return;
	}

	const upcastWriter = new UpcastWriter();
	const shapesIds = findAllShapesIds( documentFragment, upcastWriter );

	removeAllImgElementsRepresentingShapes( shapesIds, documentFragment, upcastWriter );
	removeAllShapeElements( documentFragment, upcastWriter );

	const images = findAllImageElementsWithLocalSource( documentFragment, upcastWriter );

	if ( images.file.length ) {
		replaceImagesFileSourceWithInlineRepresentation( images.file, extractImageDataFromRtf( rtfData ), upcastWriter );
	}

	if ( images.blob.length ) {
		replaceImagesBlobSourceWithInlineRepresentation( images.blob, model );
	}
}

// Finds all shapes (`<v:*>...</v:*>`) ids. Shapes can represent images (canvas)
// or Word shapes (which does not have RTF or Blob representation).
//
// @param {module:engine/view/documentfragment~DocumentFragment} documentFragment Document fragment
// from which to extract shape ids.
// @param {module:engine/view/upcastwriter~UpcastWriter} writer
// @returns {Array.<String>} Array of shape ids.
function findAllShapesIds( documentFragment, writer ) {
	const range = writer.createRangeIn( documentFragment );

	const shapeElementsMatcher = new ViewMatcher( {
		name: /v:(.+)/
	} );

	const shapesIds = [];

	for ( const value of range ) {
		const el = value.item;
		const prevSiblingName = el.previousSibling && el.previousSibling.name || null;

		// If shape element have 'o:gfxdata' attribute and is not directly before `<v:shapetype>` element it means it represent Word shape.
		if ( shapeElementsMatcher.match( el ) && el.getAttribute( 'o:gfxdata' ) && prevSiblingName !== 'v:shapetype' ) {
			shapesIds.push( value.item.getAttribute( 'id' ) );
		}
	}

	return shapesIds;
}

// Removes all `<img>` elements which represents Word shapes and not regular images.
//
// @param {Array.<String>} shapesIds Shape ids which will be checked against `<img>` elements.
// @param {module:engine/view/documentfragment~DocumentFragment} documentFragment Document fragment from which to remove `<img>` elements.
// @param {module:engine/view/upcastwriter~UpcastWriter} writer
function removeAllImgElementsRepresentingShapes( shapesIds, documentFragment, writer ) {
	const range = writer.createRangeIn( documentFragment );

	const imageElementsMatcher = new ViewMatcher( {
		name: 'img'
	} );

	const imgs = [];

	for ( const value of range ) {
		if ( imageElementsMatcher.match( value.item ) ) {
			const el = value.item;
			const shapes = el.getAttribute( 'v:shapes' ) ? el.getAttribute( 'v:shapes' ).split( ' ' ) : [];

			if ( shapes.length && shapes.every( shape => shapesIds.indexOf( shape ) > -1 ) ) {
				imgs.push( el );
			// Shapes may also have empty source while content is paste in some browsers (Safari).
			} else if ( !el.getAttribute( 'src' ) ) {
				imgs.push( el );
			}
		}
	}

	for ( const img of imgs ) {
		writer.remove( img );
	}
}

// Removes all shape elements (`<v:*>...</v:*>`) so they do not pollute the output structure.
//
// @param {module:engine/view/documentfragment~DocumentFragment} documentFragment Document fragment from which to remove shape elements.
// @param {module:engine/view/upcastwriter~UpcastWriter} writer
function removeAllShapeElements( documentFragment, writer ) {
	const range = writer.createRangeIn( documentFragment );

	const shapeElementsMatcher = new ViewMatcher( {
		name: /v:(.+)/
	} );

	const shapes = [];

	for ( const value of range ) {
		if ( shapeElementsMatcher.match( value.item ) ) {
			shapes.push( value.item );
		}
	}

	for ( const shape of shapes ) {
		writer.remove( shape );
	}
}

// Finds all `<img>` elements in a given document fragment which have source pointing to local `file://` or `blob:` resource.
//
// @param {module:engine/view/documentfragment~DocumentFragment} documentFragment Document fragment in which to look for `<img>` elements.
// @param {module:engine/view/upcastwriter~UpcastWriter} writer
// @returns {Object} result All found images grouped by source type.
// @returns {Array.<module:engine/view/element~Element>} result.file Array of found `<img>` elements with `file://` source.
// @returns {Array.<module:engine/view/element~Element>} result.blob Array of found `<img>` elements with `blob:` source.
function findAllImageElementsWithLocalSource( documentFragment, writer ) {
	const range = writer.createRangeIn( documentFragment );

	const imageElementsMatcher = new ViewMatcher( {
		name: 'img'
	} );

	const imgs = {
		file: [],
		blob: []
	};

	for ( const value of range ) {
		if ( imageElementsMatcher.match( value.item ) ) {
			if ( value.item.getAttribute( 'src' ).indexOf( 'file://' ) === 0 ) {
				imgs.file.push( value.item );
			} else if ( value.item.getAttribute( 'src' ).indexOf( 'blob:' ) === 0 ) {
				imgs.blob.push( value.item );
			}
		}
	}

	return imgs;
}

// Extracts all images HEX representations from a given RTF data.
//
// @param {String} rtfData The RTF data from which to extract images HEX representation.
// @returns {Array.<Object>} Array of found HEX representations. Each array item is an object containing:
//
// 		* {String} hex Image representation in HEX format.
// 		* {string} type Type of image, `image/png` or `image/jpeg`.
function extractImageDataFromRtf( rtfData ) {
	if ( !rtfData ) {
		return [];
	}

	const regexPictureHeader = /{\\pict[\s\S]+?\\bliptag-?\d+(\\blipupi-?\d+)?({\\\*\\blipuid\s?[\da-fA-F]+)?[\s}]*?/;
	const regexPicture = new RegExp( '(?:(' + regexPictureHeader.source + '))([\\da-fA-F\\s]+)\\}', 'g' );
	const images = rtfData.match( regexPicture );
	const result = [];

	if ( images ) {
		for ( const image of images ) {
			let imageType = false;

			if ( image.indexOf( '\\pngblip' ) !== -1 ) {
				imageType = 'image/png';
			} else if ( image.indexOf( '\\jpegblip' ) !== -1 ) {
				imageType = 'image/jpeg';
			}

			if ( imageType ) {
				result.push( {
					hex: image.replace( regexPictureHeader, '' ).replace( /[^\da-fA-F]/g, '' ),
					type: imageType
				} );
			}
		}
	}

	return result;
}

// Replaces `src` attribute value of all given images with the corresponding base64 image representation.
//
// @param {Array.<module:engine/view/element~Element>} imageElements Array of image elements which will have its source replaced.
// @param {Array.<Object>} imagesHexSources Array of images hex sources (usually the result of `extractImageDataFromRtf()` function).
// The array should be the same length as `imageElements` parameter.
// @param {module:engine/view/upcastwriter~UpcastWriter} writer
function replaceImagesFileSourceWithInlineRepresentation( imageElements, imagesHexSources, writer ) {
	// Assume there is an equal amount of image elements and images HEX sources so they can be matched accordingly based on existing order.
	if ( imageElements.length === imagesHexSources.length ) {
		for ( let i = 0; i < imageElements.length; i++ ) {
			const newSrc = `data:${ imagesHexSources[ i ].type };base64,${ convertHexToBase64( imagesHexSources[ i ].hex ) }`;
			writer.setAttribute( 'src', newSrc, imageElements[ i ] );
		}
	}
}

// Extracts all view images sources data from blob url, converts it to base64 and replaces source in the corresponding model images.
//
// @param {Array.<module:engine/view/element~Element>} imageElements Image elements from which sources extract blob data.
// @param {module:engine/model/model~Model} model Model containing corresponding image elements which sources will be updated.
function replaceImagesBlobSourceWithInlineRepresentation( imageElements, model ) {
	for ( const img of imageElements ) {
		const src = img.getAttribute( 'src' );

		fetchImageDataFromBlobUrlAsBase64( src )
			.then( data => {
				model.enqueueChange( 'transparent', writer => {
					const root = model.document.getRoot();
					const range = writer.createRangeIn( root );

					for ( const value of range ) {
						if ( value.item.is( 'element', 'image' ) && value.item.getAttribute( 'src' ) === src ) {
							writer.setAttribute( 'src', data, value.item );
						}
					}
				} );
			} )
			// In case of error we basically can't do nothing. Still images with blob URLs are locally
			// visible so it is not noticeable until the content will be opened in a new browser tab.
			.catch();
	}
}

// Fetches blob data via XHR and converts it to base64 representation.
//
// @param {String} url Blob url from which to fetch blob data.
// @returns {Promise} A promise which resolves once blob data is successfully fetched and converted to base64.
function fetchImageDataFromBlobUrlAsBase64( url ) {
	return new Promise( ( resolve, reject ) => {
		const xhr = new XMLHttpRequest();

		xhr.open( 'GET', url, true );

		xhr.responseType = 'blob';

		xhr.addEventListener( 'error', () => reject() );
		xhr.addEventListener( 'abort', () => reject() );
		xhr.addEventListener( 'load', () => {
			const reader = new FileReader();

			reader.onloadend = () => {
				resolve( reader.result );
			};

			reader.readAsDataURL( xhr.response );
		} );

		xhr.send();
	} );
}

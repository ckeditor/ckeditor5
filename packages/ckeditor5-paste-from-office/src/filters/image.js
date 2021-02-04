/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/filters/image
 */

/* globals btoa */

import { Matcher, UpcastWriter } from 'ckeditor5/src/engine';

/**
 * Replaces source attribute of all `<img>` elements representing regular
 * images (not the Word shapes) with inlined base64 image representation extracted from RTF or Blob data.
 *
 * @param {module:engine/view/documentfragment~DocumentFragment} documentFragment Document fragment on which transform images.
 * @param {String} rtfData The RTF data from which images representation will be used.
 */
export function replaceImagesSourceWithBase64( documentFragment, rtfData ) {
	if ( !documentFragment.childCount ) {
		return;
	}

	const upcastWriter = new UpcastWriter();
	const shapesIds = findAllShapesIds( documentFragment, upcastWriter );

	removeAllImgElementsRepresentingShapes( shapesIds, documentFragment, upcastWriter );
	removeAllShapeElements( documentFragment, upcastWriter );

	const images = findAllImageElementsWithLocalSource( documentFragment, upcastWriter );

	if ( images.length ) {
		replaceImagesFileSourceWithInlineRepresentation( images, extractImageDataFromRtf( rtfData ), upcastWriter );
	}
}

/**
 * Converts given HEX string to base64 representation.
 *
 * @protected
 * @param {String} hexString The HEX string to be converted.
 * @returns {String} Base64 representation of a given HEX string.
 */
export function _convertHexToBase64( hexString ) {
	return btoa( hexString.match( /\w{2}/g ).map( char => {
		return String.fromCharCode( parseInt( char, 16 ) );
	} ).join( '' ) );
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

	const shapeElementsMatcher = new Matcher( {
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

	const imageElementsMatcher = new Matcher( {
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

	const shapeElementsMatcher = new Matcher( {
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

// Finds all `<img>` elements in a given document fragment which have source pointing to local `file://` resource.
//
// @param {module:engine/view/documentfragment~DocumentFragment} documentFragment Document fragment in which to look for `<img>` elements.
// @param {module:engine/view/upcastwriter~UpcastWriter} writer
// @returns {Object} result All found images grouped by source type.
// @returns {Array.<module:engine/view/element~Element>} result.file Array of found `<img>` elements with `file://` source.
// @returns {Array.<module:engine/view/element~Element>} result.blob Array of found `<img>` elements with `blob:` source.
function findAllImageElementsWithLocalSource( documentFragment, writer ) {
	const range = writer.createRangeIn( documentFragment );

	const imageElementsMatcher = new Matcher( {
		name: 'img'
	} );

	const imgs = [];

	for ( const value of range ) {
		if ( imageElementsMatcher.match( value.item ) ) {
			if ( value.item.getAttribute( 'src' ).startsWith( 'file://' ) ) {
				imgs.push( value.item );
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

			if ( image.includes( '\\pngblip' ) ) {
				imageType = 'image/png';
			} else if ( image.includes( '\\jpegblip' ) ) {
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
			const newSrc = `data:${ imagesHexSources[ i ].type };base64,${ _convertHexToBase64( imagesHexSources[ i ].hex ) }`;
			writer.setAttribute( 'src', newSrc, imageElements[ i ] );
		}
	}
}

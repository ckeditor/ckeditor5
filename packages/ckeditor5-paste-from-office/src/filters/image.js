/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module paste-from-office/filters/image
 */

import Matcher from '@ckeditor/ckeditor5-engine/src/view/matcher';
import Range from '@ckeditor/ckeditor5-engine/src/view/range';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';

import { convertHexToBase64 } from './utils';

export function transformImages( documentFragment, dataTransfer ) {
	if ( !documentFragment.childCount ) {
		return;
	}

	const imageElements = findAllImageElements( documentFragment );

	if ( imageElements.length ) {
		const upcastWriter = new UpcastWriter();
		const imageData = extractImageDataFromRtf( dataTransfer.getData( 'text/rtf' ) );

		replaceImageSourceWithInlineData( imageElements, imageData, upcastWriter );
	}
}

function findAllImageElements( documentFragment ) {
	const range = Range.createIn( documentFragment );

	const listItemLikeElementsMatcher = new Matcher( {
		name: 'img'
	} );

	const imgs = [];

	for ( const value of range ) {
		if ( value.type === 'elementStart' && listItemLikeElementsMatcher.match( value.item ) ) {
			imgs.push( value.item );
		}
	}

	return imgs;
}

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
			if ( regexPictureHeader.test( image ) ) {
				let imageType = false;

				if ( image.indexOf( '\\pngblip' ) !== -1 ) {
					imageType = 'image/png';
				} else if ( image.indexOf( '\\jpegblip' ) !== -1 ) {
					imageType = 'image/jpeg';
				}

				if ( imageType ) {
					result.push( {
						hex: imageType ? image.replace( regexPictureHeader, '' ).replace( /[^\da-fA-F]/g, '' ) : null,
						type: imageType
					} );
				}
			}
		}
	}

	return result;
}

function replaceImageSourceWithInlineData( imageElements, imagesRtfData, upcastWriter ) {
	// Assuming there is equal amount of Images in RTF and HTML source, so we can match them accordingly to the existing order.
	if ( imageElements.length === imagesRtfData.length ) {
		for ( let i = 0; i < imageElements.length; i++ ) {
			// Replace only `file` urls of images (shapes get newSrcValue with null).
			if ( ( imageElements[ i ].getAttribute( 'src' ).indexOf( 'file://' ) === 0 ) && imagesRtfData[ i ] ) {
				upcastWriter.setAttribute( 'src', createSrcWithBase64( imagesRtfData[ i ] ), imageElements[ i ] );
			}
		}
	}
}

function createSrcWithBase64( img ) {
	return img.type ? 'data:' + img.type + ';base64,' + convertHexToBase64( img.hex ) : null;
}

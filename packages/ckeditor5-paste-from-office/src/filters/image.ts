/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/filters/image
 */

import {
	Matcher,
	UpcastWriter,
	type ViewDocumentFragment,
	type ViewElement,
	type ViewNode
} from 'ckeditor5/src/engine.js';

/**
 * Replaces source attribute of all `<img>` elements representing regular
 * images (not the Word shapes) with inlined base64 image representation extracted from RTF or Blob data.
 *
 * @param documentFragment Document fragment on which transform images.
 * @param rtfData The RTF data from which images representation will be used.
 */
export function replaceImagesSourceWithBase64( documentFragment: ViewDocumentFragment, rtfData: string ): void {
	if ( !documentFragment.childCount ) {
		return;
	}

	const upcastWriter = new UpcastWriter( documentFragment.document );
	const shapesIds = findAllShapesIds( documentFragment, upcastWriter );

	removeAllImgElementsRepresentingShapes( shapesIds, documentFragment, upcastWriter );
	insertMissingImgs( shapesIds, documentFragment, upcastWriter );
	removeAllShapeElements( documentFragment, upcastWriter );

	const images = findAllImageElementsWithLocalSource( documentFragment, upcastWriter );

	if ( images.length ) {
		replaceImagesFileSourceWithInlineRepresentation( images, extractImageDataFromRtf( rtfData ), upcastWriter );
	}
}

/**
 * Converts given HEX string to base64 representation.
 *
 * @internal
 * @param hexString The HEX string to be converted.
 * @returns Base64 representation of a given HEX string.
 */
export function _convertHexToBase64( hexString: string ): string {
	return btoa( hexString.match( /\w{2}/g )!.map( char => {
		return String.fromCharCode( parseInt( char, 16 ) );
	} ).join( '' ) );
}

/**
 * Finds all shapes (`<v:*>...</v:*>`) ids. Shapes can represent images (canvas)
 * or Word shapes (which does not have RTF or Blob representation).
 *
 * @param documentFragment Document fragment from which to extract shape ids.
 * @returns Array of shape ids.
 */
function findAllShapesIds( documentFragment: ViewDocumentFragment, writer: UpcastWriter ): Array<string> {
	const range = writer.createRangeIn( documentFragment );

	const shapeElementsMatcher = new Matcher( {
		name: /v:(.+)/
	} );

	const shapesIds = [];

	for ( const value of range ) {
		if ( value.type != 'elementStart' ) {
			continue;
		}

		const el = value.item as ViewElement;
		const previousSibling = el.previousSibling;
		const prevSiblingName = previousSibling && previousSibling.is( 'element' ) ? previousSibling.name : null;
		// List of ids which should not be considered as shapes.
		// https://github.com/ckeditor/ckeditor5/pull/15847#issuecomment-1941543983
		const exceptionIds = [ 'Chart' ];

		const isElementAShape = shapeElementsMatcher.match( el );
		const hasElementGfxdataAttribute = el.getAttribute( 'o:gfxdata' );
		const isPreviousSiblingAShapeType = prevSiblingName === 'v:shapetype';
		const isElementIdInExceptionsArray = hasElementGfxdataAttribute &&
			exceptionIds.some( item => el.getAttribute( 'id' )!.includes( item ) );

		// If shape element has 'o:gfxdata' attribute and is not directly before
		// `<v:shapetype>` element it means that it represents a Word shape.
		if (
			isElementAShape &&
			hasElementGfxdataAttribute &&
			!isPreviousSiblingAShapeType &&
			!isElementIdInExceptionsArray
		) {
			shapesIds.push( ( value.item as ViewElement ).getAttribute( 'id' )! );
		}
	}

	return shapesIds;
}

/**
 * Removes all `<img>` elements which represents Word shapes and not regular images.
 *
 * @param shapesIds Shape ids which will be checked against `<img>` elements.
 * @param documentFragment Document fragment from which to remove `<img>` elements.
 */
function removeAllImgElementsRepresentingShapes(
	shapesIds: Array<string>,
	documentFragment: ViewDocumentFragment,
	writer: UpcastWriter
): void {
	const range = writer.createRangeIn( documentFragment );

	const imageElementsMatcher = new Matcher( {
		name: 'img'
	} );

	const imgs = [];

	for ( const value of range ) {
		if ( value.item.is( 'element' ) && imageElementsMatcher.match( value.item ) ) {
			const el = value.item;
			const shapes = el.getAttribute( 'v:shapes' ) ? el.getAttribute( 'v:shapes' )!.split( ' ' ) : [];

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

/**
 * Removes all shape elements (`<v:*>...</v:*>`) so they do not pollute the output structure.
 *
 * @param documentFragment Document fragment from which to remove shape elements.
 */
function removeAllShapeElements( documentFragment: ViewDocumentFragment, writer: UpcastWriter ) {
	const range = writer.createRangeIn( documentFragment );

	const shapeElementsMatcher = new Matcher( {
		name: /v:(.+)/
	} );

	const shapes = [];

	for ( const value of range ) {
		if ( value.type == 'elementStart' && shapeElementsMatcher.match( value.item as ViewElement ) ) {
			shapes.push( value.item as ViewElement );
		}
	}

	for ( const shape of shapes ) {
		writer.remove( shape );
	}
}

/**
 * Inserts `img` tags if there is none after a shape.
 */
function insertMissingImgs( shapeIds: Array<string>, documentFragment: ViewDocumentFragment, writer: UpcastWriter ) {
	const range = writer.createRangeIn( documentFragment );

	const shapes: Array<ViewElement> = [];

	for ( const value of range ) {
		if ( value.type == 'elementStart' && value.item.is( 'element', 'v:shape' ) ) {
			const id = value.item.getAttribute( 'id' )!;

			if ( shapeIds.includes( id ) ) {
				continue;
			}

			if ( !containsMatchingImg( value.item.parent!.getChildren(), id ) ) {
				shapes.push( value.item );
			}
		}
	}

	for ( const shape of shapes ) {
		const attrs: Record<string, unknown> = {
			src: findSrc( shape )
		};

		if ( shape.hasAttribute( 'alt' ) ) {
			attrs.alt = shape.getAttribute( 'alt' );
		}

		const img = writer.createElement( 'img', attrs );

		writer.insertChild( shape.index! + 1, img, shape.parent! );
	}

	function containsMatchingImg( nodes: Iterable<ViewNode>, id: string ): boolean {
		for ( const node of nodes ) {
			/* istanbul ignore else -- @preserve */
			if ( node.is( 'element' ) ) {
				if ( node.name == 'img' && node.getAttribute( 'v:shapes' ) == id ) {
					return true;
				}

				if ( containsMatchingImg( node.getChildren(), id ) ) {
					return true;
				}
			}
		}

		return false;
	}

	function findSrc( shape: ViewElement ) {
		for ( const child of shape.getChildren() ) {
			/* istanbul ignore else -- @preserve */
			if ( child.is( 'element' ) && child.getAttribute( 'src' ) ) {
				return child.getAttribute( 'src' );
			}
		}
	}
}

/**
 * Finds all `<img>` elements in a given document fragment which have source pointing to local `file://` resource.
 * This function also tracks the index position of each image in the document, which is essential for
 * precise matching with hexadecimal representations in RTF data.
 *
 * @param documentFragment Document fragment in which to look for `<img>` elements.
 * @returns Array of found images along with their position index in the document.
 */
function findAllImageElementsWithLocalSource(
	documentFragment: ViewDocumentFragment,
	writer: UpcastWriter
): Array<ImageWithIndex> {
	const range = writer.createRangeIn( documentFragment );

	const imageElementsMatcher = new Matcher( {
		name: 'img'
	} );

	const imgs: Array<ImageWithIndex> = [];
	let currentImageIndex = 0;

	for ( const value of range ) {
		if ( value.item.is( 'element' ) && imageElementsMatcher.match( value.item ) ) {
			if ( value.item.getAttribute( 'src' )!.startsWith( 'file://' ) ) {
				imgs.push( {
					element: value.item,
					imageIndex: currentImageIndex
				} );
			}

			currentImageIndex++;
		}
	}

	return imgs;
}

/**
 * Represents an image element with its index position in the document.
 * This index is crucial for correctly matching images with their
 * corresponding hexadecimal representations in RTF data.
 */
type ImageWithIndex = {

	/**
     * The position index of the image in the document.
     * Used to map the image to its corresponding hexadecimal representation in RTF data.
     * RTF data contains hexadecimal representations of ALL images in the document,
     * not just those with file:// URLs.
     */
	imageIndex: number;

	/**
     * The image element.
     */
	element: ViewElement;
};

/**
 * Extracts all images HEX representations from a given RTF data.
 *
 * @param rtfData The RTF data from which to extract images HEX representation.
 * @returns Array of found HEX representations. Each array item is an object containing:
 *
 * * hex Image representation in HEX format.
 * * type Type of image, `image/png` or `image/jpeg`.
 */
function extractImageDataFromRtf( rtfData: string ): Array<{ hex: string; type: string }> {
	if ( !rtfData ) {
		return [];
	}

	const regexPictureHeader = /{\\pict[\s\S]+?\\bliptag-?\d+(\\blipupi-?\d+)?({\\\*\\blipuid\s?[\da-fA-F]+)?[\s}]*?/;
	const regexPicture = new RegExp( '(?:(' + regexPictureHeader.source + '))([\\da-fA-F\\s]+)\\}', 'g' );
	const images = rtfData.match( regexPicture );
	const result = [];

	if ( images ) {
		for ( const image of images ) {
			let imageType: string | false = false;

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

/**
 * Replaces `src` attribute value of all given images with the corresponding base64 image representation.
 * Uses the image index to precisely match with the correct hexadecimal representation from RTF data.
 *
 * @param imageElements Array of image elements along with their indices which will have their sources replaced.
 * @param imagesHexSources Array of images hex sources (usually the result of `extractImageDataFromRtf()` function).
 * Contains hexadecimal representations of ALL images in the document, not just those with `file://` URLs.
 * In XML documents, the same image might be defined both as base64 in HTML and as hexadecimal in RTF data.
 */
function replaceImagesFileSourceWithInlineRepresentation(
	imageElements: Array<ImageWithIndex>,
	imagesHexSources: ReturnType<typeof extractImageDataFromRtf>,
	writer: UpcastWriter
) {
	for ( let i = 0; i < imageElements.length; i++ ) {
		const { element, imageIndex } = imageElements[ i ];
		const rtfHexSource = imagesHexSources[ imageIndex ];

		if ( rtfHexSource ) {
			const newSrc = `data:${ rtfHexSource.type };base64,${ _convertHexToBase64( rtfHexSource.hex ) }`;
			writer.setAttribute( 'src', newSrc, element );
		}
	}
}

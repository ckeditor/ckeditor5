/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global atob, URL */

/**
 * @module ckbox/utils
 */

const IMAGE_BREAKPOINT_MAX_WIDTH = 4000;
const IMAGE_BREAKPOINT_PIXELS_THRESHOLD = 80;
const IMAGE_BREAKPOINT_PERCENTAGE_THRESHOLD = 10;

/**
 * Creates URLs for the image:
 * - responsive URLs for the "webp" image format,
 * - one fallback URL for browsers that do not support the "webp" format.
 *
 * @param {Object} data
 * @param {module:cloud-services/token~Token} data.token
 * @param {String} data.id
 * @param {String} data.origin
 * @param {Number} data.width
 * @param {String} data.extension
 * @returns {Object}
 */
export function getImageUrls( { token, id, origin, width, extension } ) {
	const environmentId = getEnvironmentId( token );
	const imageBreakpoints = getImageBreakpoints( width );
	const imageFallbackExtension = getImageFallbackExtension( extension );
	const imageFallbackUrl = getResponsiveImageUrl( { environmentId, id, origin, width, extension: imageFallbackExtension } );
	const imageResponsiveUrls = imageBreakpoints.map( imageBreakpoint => {
		const responsiveImageUrl = getResponsiveImageUrl( { environmentId, id, origin, width: imageBreakpoint, extension: 'webp' } );

		return `${ responsiveImageUrl } ${ imageBreakpoint }w`;
	} );

	// Create just one image source definition containing all calculated URLs for each image breakpoint. Additionally, limit this source
	// image width by defining two allowed slot sizes:
	// - If the viewport width is not greater than the image width, make the image occupy the whole slot.
	// - Otherwise, limit the slot width to be equal to the image width, to avoid enlarging the image beyond its width.
	//
	// This is a kind of a workaround. In a perfect world we could use `sizes="100vw" width="real image width"` on our single `<source>`
	// element, but at the time of writing this code the `width` attribute is not supported in the `<source>` element in Firefox yet.
	const imageSources = [ {
		srcset: imageResponsiveUrls.join( ',' ),
		sizes: `(max-width: ${ width }px) 100vw, ${ width }px`,
		type: 'image/webp'
	} ];

	return {
		imageFallbackUrl,
		imageSources
	};
}

/**
 * Returns an environment id from a token used for communication with the CKBox service.
 *
 * @param {module:cloud-services/token~Token} token
 * @returns {String}
 */
export function getEnvironmentId( token ) {
	const [ , binaryTokenPayload ] = token.value.split( '.' );
	const payload = JSON.parse( atob( binaryTokenPayload ) );

	return payload.aud;
}

// Calculates the image breakpoints for the provided image width in the following way:
//
// 1) The breakpoint threshold (the breakpoint step in the calculations) should be equal to 10% of the image width, but not less than 80
// pixels.
//
// 2) Set the max. allowed image breakpoint (4000px) or the image width (if it is smaller than 4000px) as the first calculated breakpoint.
//
// 3) From the last computed image breakpoint subtract the computed breakpoint threshold, as long as the calculated new breakpoint value is
// greater than the threshold.
//
// @private
// @param {Number} width
// @returns {Array.<Number>}
function getImageBreakpoints( width ) {
	// Step 1) - calculating the breakpoint threshold.
	const imageBreakpointThresholds = [
		width * IMAGE_BREAKPOINT_PERCENTAGE_THRESHOLD / 100,
		IMAGE_BREAKPOINT_PIXELS_THRESHOLD
	];
	const imageBreakpointThreshold = Math.floor( Math.max( ...imageBreakpointThresholds ) );

	// Step 2) - set the first breakpoint.
	const imageBreakpoints = [ Math.min( width, IMAGE_BREAKPOINT_MAX_WIDTH ) ];

	// Step 3) - calculate the next breakpoint as long as it is greater than the breakpoint threshold.
	let lastBreakpoint = imageBreakpoints[ 0 ];

	while ( lastBreakpoint - imageBreakpointThreshold >= imageBreakpointThreshold ) {
		lastBreakpoint -= imageBreakpointThreshold;
		imageBreakpoints.unshift( lastBreakpoint );
	}

	return imageBreakpoints;
}

// Returns the image extension for the fallback URL.
//
// @private
// @param {String} extension
// @returns {String}
function getImageFallbackExtension( extension ) {
	if ( extension === 'bmp' || extension === 'tiff' || extension === 'jpg' ) {
		return 'jpeg';
	}

	return extension;
}

// Creates the URL for the given image.
//
// @private
// @param {Object} options
// @param {String} options.environmentId
// @param {String} options.id
// @param {String} options.origin
// @param {Number} options.width
// @param {String} options.extension
// @returns {String}
function getResponsiveImageUrl( { environmentId, id, origin, width, extension } ) {
	const endpoint = `${ environmentId }/assets/${ id }/images/${ width }.${ extension }`;

	return new URL( endpoint, origin ).toString();
}

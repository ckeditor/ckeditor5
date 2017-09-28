/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import placeholder from '../../theme/icons/image_placeholder.svg';

const img = document.createElement( 'img' );
img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent( placeholder );

document.getElementById( 'container' ).appendChild( img );

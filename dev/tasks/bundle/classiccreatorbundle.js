/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Bundle configuration for {@link ckeditor5.creator-classic.ClassiCcreator}.
 *
 * At this moment we don't know a list of every dependency needed in the bundle. It is because
 * editor features load automatically during initialization process. To work around this problem
 * we have created a custom entry file where we defined some of imports with features
 * needed to initialize editor.
 */

import CKEDITOR from '../../../build/esnext/ckeditor.js';
import ClassicCreator from '../../../build/esnext/ckeditor5/creator-classic/classiccreator.js';

/**
 * Wrapper for {@link CKEDITOR.create} which passes default setting
 * for {@link ckeditor5.creator-classic.ClassiCcreator}. This settings could be extended.
 * API of this function is exactly the same as {@link CKEDITOR.create}.
 */
export default function createEditor( element, config ) {
	return CKEDITOR.create( element, Object.assign( {
		creator: ClassicCreator,
		toolbar: [ 'bold', 'italic' ]
	}, config ) );
}

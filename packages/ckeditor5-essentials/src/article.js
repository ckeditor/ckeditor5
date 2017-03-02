/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module presets/article
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TextboxPreset from './textbox';

import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';

/**
 * Article editor preset. Represents a set of features which enable in the editor
 * all functionalities of a simple article editor.
 * This preset follows [Editor Recommendations](https://github.com/ckeditor/editor-recommendations).
 *
 * @extends module:core/plugin~Plugin
 */
export default class Article extends Plugin {
	static get requires() {
		return [ TextboxPreset, Bold, Heading, Image, ImageStyle, ImageToolbar, Italic, Link, List ];
	}
}

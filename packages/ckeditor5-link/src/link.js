/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/link
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import LinkEditing from './linkediting';
import LinkUI from './linkui';

/**
 * The link plugin.
 *
 * This is a "glue" plugin which loads the {@link module:link/linkediting~LinkEditing link editing feature}
 * and {@link module:link/linkui~LinkUI link UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Link extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ LinkEditing, LinkUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Link';
	}
}

/**
 * The configuration of the {@link module:link/link~Link} feature.
 *
 * Read more in {@link module:link/link~LinkConfig}.
 *
 * @member {module:link/link~LinkConfig} module:core/editor/editorconfig~EditorConfig#link
 */

/**
 * The configuration of the {@link module:link/link~Link link feature}.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				link:  ... // Link feature configuration.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 * @interface LinkConfig
 */

/**
 * Configuration of the {@link module:link/link~Link} feature. If set to `true`,
 * then default 'automatic' decorator is added to the link.
 *
 * @member {Boolean} module:link/link~LinkConfig#targetDecorator
 */

/**
 * Custom link decorators.
 *
 * **Warning** Currently there is no integration between 'automatic' and 'manual' decorators,
 * which transforms the same attribute. For example, configuring `target` attribute through both
 * 'automatic' and 'manual' decorator might result with quirk behavior.
 *
 * Decorators provides:
 *   * simple automatic rules based on url address to apply customized and predefined additional attributes.
 *   * manual rules, which adds UI checkbox, where user can simply trigger predefined attributes for given link.
 *
 *
 * ```js
 * const link.decorators = [
 * 	{
 * 		mode: 'automatic',
 * 		callback: url => url.startsWith( 'http://' ),
 * 		attributes: {
 * 			target: '_blank',
 * 			rel: 'noopener noreferrer'
 * 		}
 * 	},
 * 	{
 * 		mode: 'automatic',
 * 		callback: url => url.includes( 'download' ) && url.endsWith( '.pdf' ),
 * 		attributes: {
 * 			download: 'download'
 * 		}
 * 	},
 * 	{
 * 		mode: 'automatic',
 * 		callback: url => url.includes( 'image' ) && url.endsWith( '.png' ),
 * 		attributes: {
 * 			class: 'light-gallery'
 * 		}
 * 	}
 * ]
 * ```
 * @member {Array.<module:link/link~LinkDecoratorAutomaticOption>} module:link/link~LinkConfig#decorators
 */

/**
 * This object defining automatic decorator for the links. Based on this option data pipeline will extend links with proper attributes.
 * For example, you can define rules, when attribute `target="_blank"` will be added to links.
 * There is a default option which might be activated with {@link module:link/link~LinkConfig#targetDecorator},
 * which automatically adds attributes:
 *   * `target="_blank"`
 *   * `rel="noopener noreferrer"`
 * for all links started with: `http://`, `https://` or `//`.
 *
 * ```js
 * 	{
 * 		mode: 'automatic',
 * 		callback: url => /^(https?:)?\/\//.test( url ),
 * 		attributes: {
 * 			target: '_blank',
 * 			rel: 'noopener noreferrer'
 * 		}
 * 	}
 * ```
 *
 * @typedef {Object} module:link/link~LinkDecoratorAutomaticOption
 * @property {'automatic'} mode it should has always string value 'automatic' for automatic decorators
 * @property {Function} callback takes `url` as parameter and should return `true`
 * for urls that be decorate with this decorator.
 * @property {Object} attributes key-value pairs used as attributes added to anchor during downcasting.
 */

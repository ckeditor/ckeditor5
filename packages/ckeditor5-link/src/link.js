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
 * Target decorator option solves one of the most popular cases, which is adding automatically `target` attribute to all external links.
 * It activates predefined {@link module:link/link~LinkDecoratorAutomaticOption automatic decorator}, which decorates all
 * external links with `target="blank"` and `rel="noopener noreferrer"` attributes, so there is no need to invent own decorator
 * for such case. As external links are recognized those which starts with: `http`, `https` or `//`.
 * There remains the possibility to add other {@link module:link/link~LinkDecoratorAutomaticOption automatic}
 * or {@link module:link/link~LinkDecoratorManualOption manual} decorators.
 *
 * When there is need to apply target attribute manually, then {@link module:link/link~LinkDecoratorManualOption manual} decorator should
 * be provided with the {@link module:link/link~LinkConfig link configuration} in {@link module:link/link~LinkConfig#decorators} array.
 * In this scenario, `targetDecorator` option should remain `undefined` or `false` to not interfere with a created decorator.
 *
 * More information about decorators might be found in {@link module:link/link~LinkConfig#decorators}.
 *
 * @member {Boolean} module:link/link~LinkConfig#targetDecorator
 */

/**
 * Decorators are {@link module:link/link~Link link's} plugin feature which can extend anchor with additional attributes.
 * Decorators provide an easy way to configure and manage those attributes automatically or manually with the UI.
 *
 * For example, there is a quite common topic to add the `target="_blank"` attribute to only some of the links in the editor.
 * Decorators help in mentioned case with either: added automatic rules based on link's href (URL),
 * or added a toggleable UI switch for the user.
 *
 * **Warning:** Currently, there is no integration in-between decorators for any mix of decorators' types.
 * For example, configuring `target` attribute through both 'automatic' and 'manual' decorators might result with quirk behavior
 * as well as defining 2 manual or 2 automatic decorators for the same attribute.
 *
 * # Automatic decorators
 * This type of decorators takes an object with key-value pairs of attributes and
 * a {@link module:link/link~LinkDecoratorAutomaticOption callback} function. The function has to return boolean value based on link's href.
 * If a given set of attributes should be applied to the link, then callback has to return the `true` value.
 * For example, if there is a need to add the `target="_blank"` attribute to all links in the editor started with the `http://`,
 * then configuration might look like this:
 *
 * 	const link.decorators = [
 * 		{
 * 			mode: 'automatic',
 * 			callback: url => url.startsWith( 'http://' ),
 * 			attributes: {
 * 				target: '_blank'
 * 			}
 * 		}
 * 	]
 *
 * **Please notice:** As configuring target attribute for external links is a quite common situation,
 * there is predefined automatic decorator, which might be turned on with even simpler option,
 * just by setting {@link #targetDecorator} to `true`. More information might be found in the {@link #targetDecorator} description.
 *
 * # Manual decorators
 * This type of decorators also takes an object with key-value pair of attributes, however, those are applied based on user choice.
 * Manual decorator is defined with a {@link module:link/link~LinkDecoratorManualOption label},
 * which describes the given option for the user. Manual decorators are possible to toggle for the user in editing view of the link plugin.
 * For example, if there is a need to give user full control over this which links should be opened in a new window,
 * then configuration might looks as followed:
 *
 * 	const link.decorators = [
 * 		{
 * 			mode: 'manual',
 * 			label: 'Open in new window',
 * 			attributes: {
 * 				target: '_blank'
 * 			}
 * 		}
 * 	]
 *
 * @member {Array.<module:link/link~LinkDecoratorAutomaticOption|module:link/link~LinkDecoratorManualOption>}
 * module:link/link~LinkConfig#decorators
 */

/**
 * This object describes automatic {@link module:link/link~LinkConfig#decorators} for the links. Based on this option,
 * output data will extend links with proper attributes.
 *
 * For example, if there is need to define a rule that automatically adds attribute `target="_blank"` and `rel="noopener noreferrer"`
 * to the external links, then automatic decorator might looks as follows:
 *
 *	{
 *		mode: 'automatic',
 *		callback: url => /^(https?:)?\/\//.test( url ),
 *		attributes: {
 *			target: '_blank',
 *			rel: 'noopener noreferrer'
 *		}
 *	}
 *
 * **Please notice**, there is a {@link module:link/link~LinkConfig#targetDecorator configuration option},
 * which automatically adds attributes: `target="_blank"` and `rel="noopener noreferrer"` for all links started with:
 * `http://`, `https://` or `//`.
 *
 * @typedef {Object} module:link/link~LinkDecoratorAutomaticOption
 * @property {'automatic'} mode should have string value equal 'automatic' for automatic decorators
 * @property {Function} callback takes an `url` as a parameter and returns `true`
 * for urls where given attributes should be applied.
 * @property {Object} attributes key-value pairs used as attributes added to output data during
 * {@glink framework/guides/architecture/editing-engine#conversion downcasting}.
 * Attributes should have form of attributes defined in {@link module:engine/view/elementdefinition~ElementDefinition}.
 */

/**
 * This object describes manual {@link module:link/link~LinkConfig#decorators} for the links. Based on this definition,
 * there is added switch button in editing form for the link. This button poses label define here. After toggling and confirming it,
 * preconfigured attributes are added to a selected link.
 *
 * For example, if there is need to define a rule, which adds a switch button to apply `target="_blank"` and
 * `rel="noopener noreferrer"`, then manual decorator might be helpful and can look as follows:
 *
 *	{
 *		mode: 'manual',
 *		label: 'Open link in new window',
 *		attributes: {
 *			target: '_blank',
 *			rel: 'noopener noreferrer'
 *		}
 *	}
 *
 * @typedef {Object} module:link/link~LinkDecoratorManualOption
 * @property {'manual'} mode should have string value equal 'manual' for manual decorators
 * @property {String} label the label for the UI switch button, which will be responsible for applying defined attributes
 * to a currently edited link.
 * @property {Object} attributes attributes key-value pairs used as attributes added to output data during
 * {@glink framework/guides/architecture/editing-engine#conversion downcasting}.
 * Attributes should have form of attributes defined in {@link module:engine/view/elementdefinition~ElementDefinition}.
 */

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
 * When set `true`, the `target="blank"` and `rel="noopener noreferrer"` attributes are automatically added to all external links
 * in the editor. By external are meant all links in the editor content starting with `http`, `https`, or `//`.
 *
 * Internally, this option activates a predefined {@link module:link/link~LinkDecoratorAutomaticOption automatic link decorator},
 * which extends all external links with the `target` and `rel` attributes without additional configuration.
 *
 * **Note**: To control the `target` and `rel` attributes of specific links in the edited content, a dedicated
 * {@link module:link/link~LinkDecoratorManualOption manual} decorator must be defined in the
 * {@link module:link/link~LinkConfig#decorators `config.link.decodators`} array. In such scenario,
 * the `config.link.targetDecorator` option should remain `undefined` or `false` to not interfere with the manual decorator.
 *
 * **Note**: It is possible to add other {@link module:link/link~LinkDecoratorAutomaticOption automatic}
 * or {@link module:link/link~LinkDecoratorManualOption manual} link decorators when this option is active.
 *
 * More information about decorators can be found in the {@link module:link/link~LinkConfig#decorators decorators configuration}
 * reference.
 *
 * @member {Boolean} module:link/link~LinkConfig#targetDecorator
 */

/**
 * Decorators provide an easy way to configure and manage additional link attributes in the editor content. There are
 * two types of link decorators:
 *
 * * **automatic** – they match links against pre–defined rules and manage the attributes based on the results,
 * * **manual** – they allow users to control link attributes individually using the editor UI.
 *
 * The most common use case for decorators is applying the `target="_blank"` attribute to links in the content
 * (`<a href="..." target="_blank">Link</a>`).
 *
 * # {@link module:link/link~LinkDecoratorAutomaticOption Automatic decorators}
 *
 * This kind of a decorator matches all links in the editor content against a function which decides whether the link
 * should gain a pre–defined set of attributes or not.
 *
 * It takes an object with key-value pairs of attributes and a {@link module:link/link~LinkDecoratorAutomaticOption `callback`} function
 * which must return a boolean based on link's `href`. When the callback returns `true`, the `attributes` are applied
 * to the link.
 *
 * For example, to add the `target="_blank"` attribute to all links starting with the `http://` in the content,
 * the configuration could look as follows:
 *
 *		const link.decorators = [
 *			{
 *				mode: 'automatic',
 *				callback: url => url.startsWith( 'http://' ),
 *				attributes: {
 *					target: '_blank'
 *				}
 *			}
 *		]
 *
 * **Note**: Since the `target` attribute management for external links is a common use case, there is a predefined automatic decorator
 * dedicated for that purpose which can be enabled by turning a single option on. Check out the
 * {@link module:link/link~LinkConfig#targetDecorator `config.link.targetDecorator`} configuration description to learn more.
 *
 * # {@link module:link/link~LinkDecoratorManualOption Manual decorators}
 *
 * This type of a decorator takes an object with key-value pair of attributes, but those are applied based on the user choice.
 *
 * Manual decorators are represented as switch buttons in the {@link module:link/linkui user interface} of the link feature.
 * This is why each manual decorator requires a {@link module:link/link~LinkDecoratorManualOption label} which describes its purpose
 * to the users.
 *
 * For example, if users are to be allowed to control which particular links should be opened in a new window, the configuration
 * could look as follows:
 *
 *		const link.decorators = [
 *			{
 *				mode: 'manual',
 *				label: 'Open in new window',
 *				attributes: {
 *					target: '_blank'
 *				}
 *			}
 *		]
 *
 * **Warning:** Currently, link decorators work independently and no conflict resolution mechanism exists.
 * For example, configuring the `target` attribute using both an automatic and a manual decorator at a time could end up with a
 * quirky behavior. The same applies if multiple manual or automatic decorators were defined for the same attribute.
 *
 * @member {Array.<module:link/link~LinkDecoratorAutomaticOption|module:link/link~LinkDecoratorManualOption>}
 * module:link/link~LinkConfig#decorators
 */

/**
 * Describes an automatic link {@link module:link/link~LinkConfig#decorators decorator}. This kind of a decorator matches
 * all links in the editor content against a function which decides whether the link should gain a pre–defined set of attributes
 * or not.
 *
 * For example, to add the `target="_blank"` attribute to all links in the editor starting with the `http://`,
 * then configuration could look like this:
 *
 *		{
 *			mode: 'automatic',
 *			callback: url => url.startsWith( 'http://' ),
 *			attributes: {
 *				target: '_blank'
 *			}
 *		}
 *
 * **Note**: Since the `target` attribute management for external links is a common use case, there is a predefined automatic decorator
 * dedicated for that purpose which can be enabled by turning a single option on. Check out the
 * {@link module:link/link~LinkConfig#targetDecorator `config.link.targetDecorator`} configuration description to learn more.
 *
 * @typedef {Object} module:link/link~LinkDecoratorAutomaticOption
 * @property {'automatic'} mode The kind of the decorator. `'automatic'` for all automatic decorators.
 * @property {Function} callback Takes an `url` as a parameter and returns `true` if the `attributes` should be applied to the link.
 * @property {Object} attributes Key-value pairs used as link attributes added to the output during the
 * {@glink framework/guides/architecture/editing-engine#conversion downcasting}.
 * Attributes should follow the {@link module:engine/view/elementdefinition~ElementDefinition} syntax.
 */

/**
 * Describes a manual link {@link module:link/link~LinkConfig#decorators decorator}. This kind of a decorator is represented in
 * the link feature's {@link module:link/linkui user interface} as a switch the user can use to control the presence
 * of a pre–defined set of attributes.
 *
 * For instance, to allow users to manually control the presence of the `target="_blank"` and
 * `rel="noopener noreferrer"` attributes on specific links, the decorator could look as follows:
 *
 *		{
 *			mode: 'manual',
 *			label: 'Open link in new window',
 *			attributes: {
 *				target: '_blank',
 *				rel: 'noopener noreferrer'
 *			}
 *		}
 *
 * @typedef {Object} module:link/link~LinkDecoratorManualOption
 * @property {'automatic'} mode The kind of the decorator. `'manual'` for all manual decorators.
 * @property {String} label The label of the UI button the user can use to control the presence of link attributes.
 * @property {Object} attributes Key-value pairs used as link attributes added to the output during the
 * {@glink framework/guides/architecture/editing-engine#conversion downcasting}.
 * Attributes should follow the {@link module:engine/view/elementdefinition~ElementDefinition} syntax.
 */

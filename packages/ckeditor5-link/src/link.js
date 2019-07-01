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
 *		ClassicEditor
 *			.create( editorElement, {
 *				link: {
 *					addTargetToExternalLinks: true
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * Internally, this option activates a predefined {@link module:link/link~LinkConfig#decorators automatic link decorator},
 * which extends all external links with the `target` and `rel` attributes without additional configuration.
 *
 * **Note**: To control the `target` and `rel` attributes of specific links in the edited content, a dedicated
 * {@link module:link/link~LinkDecoratorManualDefinition manual} decorator must be defined in the
 * {@link module:link/link~LinkConfig#decorators `config.link.decorators`} array. In such scenario,
 * the `config.link.addTargetToExternalLinks` option should remain `undefined` or `false` to not interfere with the manual decorator.
 *
 * **Note**: It is possible to add other {@link module:link/link~LinkDecoratorAutomaticDefinition automatic}
 * or {@link module:link/link~LinkDecoratorManualDefinition manual} link decorators when this option is active.
 *
 * More information about decorators can be found in the {@link module:link/link~LinkConfig#decorators decorators configuration}
 * reference.
 *
 * @default false
 * @member {Boolean} module:link/link~LinkConfig#addTargetToExternalLinks
 */

/**
 * Decorators provide an easy way to configure and manage additional link attributes in the editor content. There are
 * two types of link decorators:
 *
 * * {@link module:link/link~LinkDecoratorAutomaticDefinition automatic} – they match links against pre–defined rules and
 * manage their attributes based on the results,
 * * {@link module:link/link~LinkDecoratorManualDefinition manual} – they allow users to control link attributes individually
 *  using the editor UI.
 *
 * Link decorators are defined as an object with key-value pairs, where the key is a name provided for a given decorator and the
 * value is the decorator definition.
 *
 * The name of the decorator also corresponds to the {@glink framework/guides/architecture/editing-engine#text-attributes text attribute}
 * in the model. For instance, the `isExternal` decorator below is represented as a `linkIsExternal` attribute in the model.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				link: {
 *					decorators: {
 *						isExternal: {
 *							mode: 'automatic',
 *							callback: url => url.startsWith( 'http://' ),
 *							attributes: {
 *								target: '_blank',
 *								rel: 'noopener noreferrer'
 *							}
 *						},
 *						isDownloadable: {
 *							mode: 'manual',
 *							label: 'Downloadable',
 *							attributes: {
 *								download: 'file.png',
 *							}
 *						},
 *						// ...
 *					}
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * To learn more about the configuration syntax, check out the {@link module:link/link~LinkDecoratorAutomaticDefinition automatic}
 * and {@link module:link/link~LinkDecoratorManualDefinition manual} decorator option reference.
 *
 * **Warning:** Currently, link decorators work independently and no conflict resolution mechanism exists.
 * For example, configuring the `target` attribute using both an automatic and a manual decorator at a time could end up with
 * quirky results. The same applies if multiple manual or automatic decorators were defined for the same attribute.
 *
 * **Note**: Since the `target` attribute management for external links is a common use case, there is a predefined automatic decorator
 * dedicated for that purpose which can be enabled by turning a single option on. Check out the
 * {@link module:link/link~LinkConfig#addTargetToExternalLinks `config.link.addTargetToExternalLinks`}
 * configuration description to learn more.
 *
 * See also {@glink features/link#custom-link-attributes-decorators link's feature} guide for more information.
 *
 * @member {Object.<String, module:link/link~LinkDecoratorDefinition>} module:link/link~LinkConfig#decorators
 */

/**
 * Represents a link decorator definition ({@link module:link/link~LinkDecoratorManualDefinition `'manual'`}
 * or {@link module:link/link~LinkDecoratorAutomaticDefinition `'automatic'`}).
 *
 * @interface LinkDecoratorDefinition
 */

/**
 * The kind of the decorator.
 *
 * Check out the {@glink features/link#custom-link-attributes-decorators link feature} guide for more information.
 *
 * @member {'manual'|'automatic'} module:link/link~LinkDecoratorDefinition#mode
 */

/**
 * Describes an automatic link {@link module:link/link~LinkConfig#decorators decorator}. This kind of a decorator matches
 * all links in the editor content against a function which decides whether the link should gain a pre–defined set of attributes
 * or not.
 *
 * It takes an object with key-value pairs of attributes and a callback function which must return a boolean based on link's
 * `href` (URL). When the callback returns `true`, attributes are applied to the link.
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
 * {@link module:link/link~LinkConfig#addTargetToExternalLinks `config.link.addTargetToExternalLinks`}
 * configuration description to learn more.
 *
 * @typedef {Object} module:link/link~LinkDecoratorAutomaticDefinition
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
 *			label: 'Open in a new tab',
 *			attributes: {
 *				target: '_blank',
 *				rel: 'noopener noreferrer'
 *			}
 *		}
 *
 * @typedef {Object} module:link/link~LinkDecoratorManualDefinition
 * @property {'manual'} mode The kind of the decorator. `'manual'` for all manual decorators.
 * @property {String} label The label of the UI button the user can use to control the presence of link attributes.
 * @property {Object} attributes Key-value pairs used as link attributes added to the output during the
 * {@glink framework/guides/architecture/editing-engine#conversion downcasting}.
 * Attributes should follow the {@link module:engine/view/elementdefinition~ElementDefinition} syntax.
 */

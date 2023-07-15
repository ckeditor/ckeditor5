/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module link/linkconfig
 */
import type { ArrayOrItem } from 'ckeditor5/src/utils';
/**
 * The configuration of the {@link module:link/link~Link link feature}.
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		link:  ... // Link feature configuration.
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface LinkConfig {
    /**
     * When set, the editor will add the given protocol to the link when the user creates a link without one.
     * For example, when the user is creating a link and types `ckeditor.com` in the link form input, during link submission
     * the editor will automatically add the `http://` protocol, so the link will look as follows: `http://ckeditor.com`.
     *
     * The feature also provides email address auto-detection. When you submit `hello@example.com`,
     * the plugin will automatically change it to `mailto:hello@example.com`.
     *
     * ```ts
     * ClassicEditor
     * 	.create( editorElement, {
     * 		link: {
     * 			defaultProtocol: 'http://'
     * 		}
     * 	} )
     * 	.then( ... )
     * 	.catch( ... );
     * ```
     *
     * **NOTE:** If no configuration is provided, the editor will not auto-fix the links.
     */
    defaultProtocol?: string;
    /**
     * When set to `true`, the `target="blank"` and `rel="noopener noreferrer"` attributes are automatically added to all external links
     * in the editor. "External links" are all links in the editor content starting with `http`, `https`, or `//`.
     *
     * ```ts
     * ClassicEditor
     * 	.create( editorElement, {
     * 		link: {
     * 			addTargetToExternalLinks: true
     * 		}
     * 	} )
     * 	.then( ... )
     * 	.catch( ... );
     * ```
     *
     * Internally, this option activates a predefined {@link module:link/linkconfig~LinkConfig#decorators automatic link decorator}
     * that extends all external links with the `target` and `rel` attributes.
     *
     * **Note**: To control the `target` and `rel` attributes of specific links in the edited content, a dedicated
     * {@link module:link/linkconfig~LinkDecoratorManualDefinition manual} decorator must be defined in the
     * {@link module:link/linkconfig~LinkConfig#decorators `config.link.decorators`} array. In such scenario,
     * the `config.link.addTargetToExternalLinks` option should remain `undefined` or `false` to not interfere with the manual decorator.
     *
     * It is possible to add other {@link module:link/linkconfig~LinkDecoratorAutomaticDefinition automatic}
     * or {@link module:link/linkconfig~LinkDecoratorManualDefinition manual} link decorators when this option is active.
     *
     * More information about decorators can be found in the {@link module:link/linkconfig~LinkConfig#decorators decorators configuration}
     * reference.
     *
     * @default false
     */
    addTargetToExternalLinks?: boolean;
    /**
     * Decorators provide an easy way to configure and manage additional link attributes in the editor content. There are
     * two types of link decorators:
     *
     * * {@link module:link/linkconfig~LinkDecoratorAutomaticDefinition Automatic} &ndash; They match links against pre–defined rules and
     * manage their attributes based on the results.
     * * {@link module:link/linkconfig~LinkDecoratorManualDefinition Manual} &ndash; They allow users to control link attributes
     * individually, using the editor UI.
     *
     * Link decorators are defined as objects with key-value pairs, where the key is the name provided for a given decorator and the
     * value is the decorator definition.
     *
     * The name of the decorator also corresponds to the {@glink framework/architecture/editing-engine#text-attributes text
     * attribute} in the model. For instance, the `isExternal` decorator below is represented as a `linkIsExternal` attribute in the model.
     *
     * ```ts
     * ClassicEditor
     * 	.create( editorElement, {
     * 		link: {
     * 			decorators: {
     * 				isExternal: {
     * 					mode: 'automatic',
     * 					callback: url => url.startsWith( 'http://' ),
     * 					attributes: {
     * 						target: '_blank',
     * 						rel: 'noopener noreferrer'
     * 					}
     * 				},
     * 				isDownloadable: {
     * 					mode: 'manual',
     * 					label: 'Downloadable',
     * 					attributes: {
     * 						download: 'file.png',
     * 					}
     * 				},
     * 				// ...
     * 			}
     * 		}
     * 	} )
     * 	.then( ... )
     * 	.catch( ... );
     * ```
     *
     * To learn more about the configuration syntax, check out the {@link module:link/linkconfig~LinkDecoratorAutomaticDefinition automatic}
     * and {@link module:link/linkconfig~LinkDecoratorManualDefinition manual} decorator option reference.
     *
     * **Warning:** Currently, link decorators work independently of one another and no conflict resolution mechanism exists.
     * For example, configuring the `target` attribute using both an automatic and a manual decorator at the same time could end up with
     * quirky results. The same applies if multiple manual or automatic decorators were defined for the same attribute.
     *
     * **Note**: Since the `target` attribute management for external links is a common use case, there is a predefined automatic decorator
     * dedicated for that purpose which can be enabled by turning a single option on. Check out the
     * {@link module:link/linkconfig~LinkConfig#addTargetToExternalLinks `config.link.addTargetToExternalLinks`}
     * configuration description to learn more.
     *
     * See also the {@glink features/link#custom-link-attributes-decorators link feature guide} for more information.
     */
    decorators?: Record<string, LinkDecoratorDefinition>;
}
/**
 * A link decorator definition. Two types implement this definition:
 *
 * * {@link module:link/linkconfig~LinkDecoratorManualDefinition}
 * * {@link module:link/linkconfig~LinkDecoratorAutomaticDefinition}
 *
 * Refer to their document for more information about available options or to the
 * {@glink features/link#custom-link-attributes-decorators link feature guide} for general information.
 */
export type LinkDecoratorDefinition = LinkDecoratorAutomaticDefinition | LinkDecoratorManualDefinition;
/**
 * Describes an automatic {@link module:link/linkconfig~LinkConfig#decorators link decorator}. This decorator type matches
 * all links in the editor content against a function that decides whether the link should receive a pre–defined set of attributes.
 *
 * It takes an object with key-value pairs of attributes and a callback function that must return a Boolean value based on the link's
 * `href` (URL). When the callback returns `true`, attributes are applied to the link.
 *
 * For example, to add the `target="_blank"` attribute to all links in the editor starting with `http://`, the
 * configuration could look like this:
 *
 * ```ts
 * {
 * 	mode: 'automatic',
 * 	callback: url => url.startsWith( 'http://' ),
 * 	attributes: {
 * 		target: '_blank'
 * 	}
 * }
 * ```
 *
 * **Note**: Since the `target` attribute management for external links is a common use case, there is a predefined automatic decorator
 * dedicated for that purpose that can be enabled by turning a single option on. Check out the
 * {@link module:link/linkconfig~LinkConfig#addTargetToExternalLinks `config.link.addTargetToExternalLinks`}
 * configuration description to learn more.
 */
export interface LinkDecoratorAutomaticDefinition {
    /**
     * Link decorator type. It is `'automatic'` for all automatic decorators.
     */
    mode: 'automatic';
    /**
     * Takes a `url` as a parameter and returns `true` if the `attributes` should be applied to the link.
     */
    callback: (url: string | null) => boolean;
    /**
     * Key-value pairs used as link attributes added to the output during the
     * {@glink framework/architecture/editing-engine#conversion downcasting}.
     * Attributes should follow the {@link module:engine/view/elementdefinition~ElementDefinition} syntax.
     */
    attributes?: Record<string, string>;
    /**
     * Key-value pairs used as link styles added to the output during the
     * {@glink framework/architecture/editing-engine#conversion downcasting}.
     * Styles should follow the {@link module:engine/view/elementdefinition~ElementDefinition} syntax.
     */
    styles?: Record<string, string>;
    /**
     * Class names used as link classes added to the output during the
     * {@glink framework/architecture/editing-engine#conversion downcasting}.
     * Classes should follow the {@link module:engine/view/elementdefinition~ElementDefinition} syntax.
     */
    classes?: ArrayOrItem<string>;
}
/**
 * Describes a manual {@link module:link/linkconfig~LinkConfig#decorators link decorator}. This decorator type is represented in
 * the link feature's {@link module:link/linkui user interface} as a switch that the user can use to control the presence
 * of a predefined set of attributes.
 *
 * For instance, to allow the users to manually control the presence of the `target="_blank"` and
 * `rel="noopener noreferrer"` attributes on specific links, the decorator could look as follows:
 *
 * ```ts
 * {
 * 	mode: 'manual',
 * 	label: 'Open in a new tab',
 * 	defaultValue: true,
 * 	attributes: {
 * 		target: '_blank',
 * 		rel: 'noopener noreferrer'
 * 	}
 * }
 * ```
 */
export interface LinkDecoratorManualDefinition {
    /**
     * Link decorator type. It is `'manual'` for all manual decorators.
     */
    mode: 'manual';
    /**
     * The label of the UI button that the user can use to control the presence of link attributes.
     */
    label: string;
    /**
     * Key-value pairs used as link attributes added to the output during the
     * {@glink framework/architecture/editing-engine#conversion downcasting}.
     * Attributes should follow the {@link module:engine/view/elementdefinition~ElementDefinition} syntax.
     */
    attributes?: Record<string, string>;
    /**
     * Key-value pairs used as link styles added to the output during the
     * {@glink framework/architecture/editing-engine#conversion downcasting}.
     * Styles should follow the {@link module:engine/view/elementdefinition~ElementDefinition} syntax.
     */
    styles?: Record<string, string>;
    /**
     * Class names used as link classes added to the output during the
     * {@glink framework/architecture/editing-engine#conversion downcasting}.
     * Classes should follow the {@link module:engine/view/elementdefinition~ElementDefinition} syntax.
     */
    classes?: ArrayOrItem<string>;
    /**
     * Controls whether the decorator is "on" by default.
     */
    defaultValue?: boolean;
}

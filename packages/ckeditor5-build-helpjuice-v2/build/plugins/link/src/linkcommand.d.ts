/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module link/linkcommand
 */
import { Command } from 'ckeditor5/src/core';
import { Collection } from 'ckeditor5/src/utils';
import AutomaticDecorators from './utils/automaticdecorators';
import type ManualDecorator from './utils/manualdecorator';
/**
 * The link command. It is used by the {@link module:link/link~Link link feature}.
 */
export default class LinkCommand extends Command {
    /**
     * The value of the `'linkHref'` attribute if the start of the selection is located in a node with this attribute.
     *
     * @observable
     * @readonly
     */
    value: string | undefined;
    /**
     * A collection of {@link module:link/utils/manualdecorator~ManualDecorator manual decorators}
     * corresponding to the {@link module:link/linkconfig~LinkConfig#decorators decorator configuration}.
     *
     * You can consider it a model with states of manual decorators added to the currently selected link.
     */
    readonly manualDecorators: Collection<ManualDecorator>;
    /**
     * An instance of the helper that ties together all {@link module:link/linkconfig~LinkDecoratorAutomaticDefinition}
     * that are used by the {@glink features/link link} and the {@glink features/images/images-linking linking images} features.
     */
    readonly automaticDecorators: AutomaticDecorators;
    /**
     * Synchronizes the state of {@link #manualDecorators} with the currently present elements in the model.
     */
    restoreManualDecoratorStates(): void;
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * When the selection is non-collapsed, the `linkHref` attribute will be applied to nodes inside the selection, but only to
     * those nodes where the `linkHref` attribute is allowed (disallowed nodes will be omitted).
     *
     * When the selection is collapsed and is not inside the text with the `linkHref` attribute, a
     * new {@link module:engine/model/text~Text text node} with the `linkHref` attribute will be inserted in place of the caret, but
     * only if such element is allowed in this place. The `_data` of the inserted text will equal the `href` parameter.
     * The selection will be updated to wrap the just inserted text node.
     *
     * When the selection is collapsed and inside the text with the `linkHref` attribute, the attribute value will be updated.
     *
     * # Decorators and model attribute management
     *
     * There is an optional argument to this command that applies or removes model
     * {@glink framework/architecture/editing-engine#text-attributes text attributes} brought by
     * {@link module:link/utils/manualdecorator~ManualDecorator manual link decorators}.
     *
     * Text attribute names in the model correspond to the entries in the {@link module:link/linkconfig~LinkConfig#decorators
     * configuration}.
     * For every decorator configured, a model text attribute exists with the "link" prefix. For example, a `'linkMyDecorator'` attribute
     * corresponds to `'myDecorator'` in the configuration.
     *
     * To learn more about link decorators, check out the {@link module:link/linkconfig~LinkConfig#decorators `config.link.decorators`}
     * documentation.
     *
     * Here is how to manage decorator attributes with the link command:
     *
     * ```ts
     * const linkCommand = editor.commands.get( 'link' );
     *
     * // Adding a new decorator attribute.
     * linkCommand.execute( 'http://example.com', {
     * 	linkIsExternal: true
     * } );
     *
     * // Removing a decorator attribute from the selection.
     * linkCommand.execute( 'http://example.com', {
     * 	linkIsExternal: false
     * } );
     *
     * // Adding multiple decorator attributes at the same time.
     * linkCommand.execute( 'http://example.com', {
     * 	linkIsExternal: true,
     * 	linkIsDownloadable: true,
     * } );
     *
     * // Removing and adding decorator attributes at the same time.
     * linkCommand.execute( 'http://example.com', {
     * 	linkIsExternal: false,
     * 	linkFoo: true,
     * 	linkIsDownloadable: false,
     * } );
     * ```
     *
     * **Note**: If the decorator attribute name is not specified, its state remains untouched.
     *
     * **Note**: {@link module:link/unlinkcommand~UnlinkCommand#execute `UnlinkCommand#execute()`} removes all
     * decorator attributes.
     *
     * @fires execute
     * @param href Link destination.
     * @param manualDecoratorIds The information about manual decorator attributes to be applied or removed upon execution.
     */
    execute(href: string, manualDecoratorIds?: Record<string, boolean>): void;
    /**
     * Provides information whether a decorator with a given name is present in the currently processed selection.
     *
     * @param decoratorName The name of the manual decorator used in the model
     * @returns The information whether a given decorator is currently present in the selection.
     */
    private _getDecoratorStateFromModel;
    /**
     * Checks whether specified `range` is inside an element that accepts the `linkHref` attribute.
     *
     * @param range A range to check.
     * @param allowedRanges An array of ranges created on elements where the attribute is accepted.
     */
    private _isRangeToUpdate;
    /**
     * Updates selected link with a new value as its content and as its href attribute.
     *
     * @param model Model is need to insert content.
     * @param writer Writer is need to create text element in model.
     * @param range A range where should be inserted content.
     * @param href A link value which should be in the href attribute and in the content.
     */
    private _updateLinkContent;
}

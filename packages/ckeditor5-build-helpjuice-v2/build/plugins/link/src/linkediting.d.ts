/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module link/linkediting
 */
import { Plugin, type Editor } from 'ckeditor5/src/core';
import { Input, TwoStepCaretMovement } from 'ckeditor5/src/typing';
import { ClipboardPipeline } from 'ckeditor5/src/clipboard';
import '../theme/link.css';
/**
 * The link engine feature.
 *
 * It introduces the `linkHref="url"` attribute in the model which renders to the view as a `<a href="url">` element
 * as well as `'link'` and `'unlink'` commands.
 */
export default class LinkEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): 'LinkEditing';
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof TwoStepCaretMovement, typeof Input, typeof ClipboardPipeline];
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Processes an array of configured {@link module:link/linkconfig~LinkDecoratorAutomaticDefinition automatic decorators}
     * and registers a {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher downcast dispatcher}
     * for each one of them. Downcast dispatchers are obtained using the
     * {@link module:link/utils/automaticdecorators~AutomaticDecorators#getDispatcher} method.
     *
     * **Note**: This method also activates the automatic external link decorator if enabled with
     * {@link module:link/linkconfig~LinkConfig#addTargetToExternalLinks `config.link.addTargetToExternalLinks`}.
     */
    private _enableAutomaticDecorators;
    /**
     * Processes an array of configured {@link module:link/linkconfig~LinkDecoratorManualDefinition manual decorators},
     * transforms them into {@link module:link/utils/manualdecorator~ManualDecorator} instances and stores them in the
     * {@link module:link/linkcommand~LinkCommand#manualDecorators} collection (a model for manual decorators state).
     *
     * Also registers an {@link module:engine/conversion/downcasthelpers~DowncastHelpers#attributeToElement attribute-to-element}
     * converter for each manual decorator and extends the {@link module:engine/model/schema~Schema model's schema}
     * with adequate model attributes.
     */
    private _enableManualDecorators;
    /**
     * Attaches handlers for {@link module:engine/view/document~Document#event:enter} and
     * {@link module:engine/view/document~Document#event:click} to enable link following.
     */
    private _enableLinkOpen;
    /**
     * Starts listening to {@link module:engine/model/model~Model#event:insertContent} and corrects the model
     * selection attributes if the selection is at the end of a link after inserting the content.
     *
     * The purpose of this action is to improve the overall UX because the user is no longer "trapped" by the
     * `linkHref` attribute of the selection and they can type a "clean" (`linkHref`–less) text right away.
     *
     * See https://github.com/ckeditor/ckeditor5/issues/6053.
     */
    private _enableInsertContentSelectionAttributesFixer;
    /**
     * Starts listening to {@link module:engine/view/document~Document#event:mousedown} and
     * {@link module:engine/view/document~Document#event:selectionChange} and puts the selection before/after a link node
     * if clicked at the beginning/ending of the link.
     *
     * The purpose of this action is to allow typing around the link node directly after a click.
     *
     * See https://github.com/ckeditor/ckeditor5/issues/1016.
     */
    private _enableClickingAfterLink;
    /**
     * Starts listening to {@link module:engine/model/model~Model#deleteContent} and {@link module:engine/model/model~Model#insertContent}
     * and checks whether typing over the link. If so, attributes of removed text are preserved and applied to the inserted text.
     *
     * The purpose of this action is to allow modifying a text without loosing the `linkHref` attribute (and other).
     *
     * See https://github.com/ckeditor/ckeditor5/issues/4762.
     */
    private _enableTypingOverLink;
    /**
     * Starts listening to {@link module:engine/model/model~Model#deleteContent} and checks whether
     * removing a content right after the "linkHref" attribute.
     *
     * If so, the selection should not preserve the `linkHref` attribute. However, if
     * the {@link module:typing/twostepcaretmovement~TwoStepCaretMovement} plugin is active and
     * the selection has the "linkHref" attribute due to overriden gravity (at the end), the `linkHref` attribute should stay untouched.
     *
     * The purpose of this action is to allow removing the link text and keep the selection outside the link.
     *
     * See https://github.com/ckeditor/ckeditor5/issues/7521.
     */
    private _handleDeleteContentAfterLink;
    /**
     * Enables URL fixing on pasting.
     */
    private _enableClipboardIntegration;
}

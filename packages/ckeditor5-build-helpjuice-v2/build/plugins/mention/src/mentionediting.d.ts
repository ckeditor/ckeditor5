export function _addMentionAttributes(baseMentionData: any, data: any): any;
/**
 * Creates a mention attribute value from the provided view element and optional data.
 *
 * This function is exposed as
 * {@link module:mention/mention~Mention#toMentionAttribute `editor.plugins.get( 'Mention' ).toMentionAttribute()`}.
 *
 * @protected
 * @param {module:engine/view/element~Element} viewElementOrMention
 * @param {String|Object} [data] Mention data to be extended.
 * @returns {module:mention/mention~MentionAttribute}
 */
export function _toMentionAttribute(viewElementOrMention: any, data?: string | Object | undefined): any;
/**
 * The mention editing feature.
 *
 * It introduces the {@link module:mention/mentioncommand~MentionCommand command} and the `mention`
 * attribute in the {@link module:engine/model/model~Model model} which renders in the {@link module:engine/view/view view}
 * as a `<span class="mention" data-mention="@mention">`.
 *
 * @extends module:core/plugin~Plugin
 */
export default class MentionEditing {
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
    /**
     * @inheritDoc
     */
    init(): void;
}

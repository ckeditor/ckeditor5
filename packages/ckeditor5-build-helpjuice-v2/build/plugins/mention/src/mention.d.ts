/**
 * The mention plugin.
 *
 * For a detailed overview, check the {@glink features/mentions Mention feature documentation}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Mention {
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
    /**
     * @inheritDoc
     */
    static get requires(): (typeof MentionEditing | typeof MentionUI)[];
    /**
     * Creates a mention attribute value from the provided view element and optional data.
     *
     *		editor.plugins.get( 'Mention' ).toMentionAttribute( viewElement, { userId: '1234' } );
     *
     *		// For a view element: <span data-mention="@joe">@John Doe</span>
     *		// it will return:
     *		// { id: '@joe', userId: '1234', uid: '7a7bc7...', _text: '@John Doe' }
     *
     * @param {module:engine/view/element~Element} viewElement
     * @param {String|Object} [data] Additional data to be stored in the mention attribute.
     * @returns {module:mention/mention~MentionAttribute}
     */
    toMentionAttribute(viewElement: any, data?: string | Object | undefined): any;
}
/**
 * :mention/mention~MentionFeed
 */
export type module = {
    /**
     * The character which triggers autocompletion for mention. It must be a single character.
     */
    marker?: string | undefined;
    /**
     * :mention/mention~MentionFeedItem>|Function} feed Autocomplete items. Provide an array for
     * a static configuration (the mention feature will show matching items automatically) or a function which returns an array of
     * matching items (directly, or via a promise). If a function is passed, it is executed in the context of the editor instance.
     */
    "": Array<module>;
    /**
     * Specifies after how many characters the autocomplete panel should be shown.
     */
    minimumCharacters?: number | undefined;
    /**
     * A function that renders a {@link module :mention/mention~MentionFeedItem}to the autocomplete panel.
     */
    itemRenderer?: Function | undefined;
};
import MentionEditing from "./mentionediting";
import MentionUI from "./mentionui";

/**
 * The mention command.
 *
 * The command is registered by {@link module:mention/mentionediting~MentionEditing} as `'mention'`.
 *
 * To insert a mention onto a range, execute the command and specify a mention object with a range to replace:
 *
 *		const focus = editor.model.document.selection.focus;
 *
 *		// It will replace one character before the selection focus with the '#1234' text
 *		// with the mention attribute filled with passed attributes.
 *		editor.execute( 'mention', {
 *			marker: '#',
 *			mention: {
 *				id: '#1234',
 *				name: 'Foo',
 *				title: 'Big Foo'
 *			},
 *			range: editor.model.createRange( focus, focus.getShiftedBy( -1 ) )
 *		} );
 *
 *		// It will replace one character before the selection focus with the 'The "Big Foo"' text
 *		// with the mention attribute filled with passed attributes.
 *		editor.execute( 'mention', {
 *			marker: '#',
 *			mention: {
 *				id: '#1234',
 *				name: 'Foo',
 *				title: 'Big Foo'
 *			},
 *			text: 'The "Big Foo"',
 *			range: editor.model.createRange( focus, focus.getShiftedBy( -1 ) )
 *		} );
 *
 * @extends module:core/command~Command
 */
export default class MentionCommand {
    /**
     * @inheritDoc
     */
    refresh(): void;
    isEnabled: any;
    /**
     * Executes the command.
     *
     * @param {Object} [options] Options for the executed command.
     * @param {Object|String} options.mention The mention object to insert. When a string is passed, it will be used to create a plain
     * object with the name attribute that equals the passed string.
     * @param {String} options.marker The marker character (e.g. `'@'`).
     * @param {String} [options.text] The text of the inserted mention. Defaults to the full mention string composed from `marker` and
     * `mention` string or `mention.id` if an object is passed.
     * @param {module:engine/model/range~Range} [options.range] The range to replace.
     * Note that the replaced range might be shorter than the inserted text with the mention attribute.
     * @fires execute
     */
    execute(options?: {
        mention: Object | string;
        marker: string;
        text?: string | undefined;
        range?: any;
    } | undefined): void;
}

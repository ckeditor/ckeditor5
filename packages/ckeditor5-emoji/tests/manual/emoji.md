## The Emoji feature

This test allows for testing of both `EmojiMention` and `EmojiPicker` plugins - both loaded in the editor or separately.

### EmojiPicker

The `EmojiPicker` plugin creates a dropdown that allows inserting an emoji or filtering them by a category or a name.

It can be accessed via the main toolbar button and the menu bar under `Insert > Emoji`.

### EmojiMention

The `EmojiMention` plugin allows by inserting emoji directly via typing.

To test it, write the default marker `:` followed by at least first two letters of desired emoji.

**Note**: The plugin does not register its integration with the Mention feature in case of a configuration conflict. It touches the Mention feature, but also `MergeFields`.

Make sure to include at least one space before the marker, otherwise the mention plugin does not kick in. 

Then, you can either choose which emoji to insert, or choose the last option: `Show all emojis...` to open the `EmojiPicker` plugin, which should then have the same text in its search bar.

**Note**: The `Show all emojis...` option does not show up when the `EmojiPicker` plugin is not available.

## The Emoji feature

This test allows for testing of both `EmojiMention` and `EmojiPicker` plugins - both loaded in the editor or separately.

### 👉️ `EmojiPicker`

The `EmojiPicker` plugin creates a dropdown that allows inserting an emoji or filtering them by a category or a name.

It can be accessed via the main toolbar button and the menu bar under `Insert > Emoji`.

### 👉️ `EmojiMention`

The `EmojiMention` plugin allows by inserting emoji directly via typing.

To test it, write the default marker `:` followed by at least first two letters of desired emoji.

**Note**: The plugin does not register its integration with the Mention feature in case of a configuration conflict. It touches the Mention feature, but also `MergeFields`.

Make sure to include at least one space before the marker, otherwise the mention plugin does not kick in. 

Then, you can either choose which emoji to insert, or choose the last option: `Show all emoji...` to open the `EmojiPicker` plugin, which should then have the same text in its search bar.

**Note**: The `Show all emoji...` option does not show up when the `EmojiPicker` plugin is not available.

### 👉️ `EmojiRepository`

Both emoji plugin based on the `EmojiRepository` plugin that keeps the available emoji.

If it couldn't be loaded, `EmojiMention` should not show auto-complete options, and `EmojiPicker` should not display a toolbar icon.

---

#### Configurable options:

* **`Unicode version`** - its value is passed as `emoji.version` in the configuration.
* **`Default skin tone`** - its value is passed as `emoji.skinTone` in the configuration.
* **Use "Noto Color Emoji" font** - this option allow using the `Noto Color Emoji` font in the editor. It applies the following CSS rules to the document
    ```css
    :root {
        --ck-font-face: Helvetica, Arial, Tahoma, Verdana, 'Noto Color Emoji';
    }
    
    body {
        font-family: Helvetica, Arial, Tahoma, Verdana, 'Noto Color Emoji';
    }
    ```

Selecting the `use the plugin default` option does not pass anything. This way plugins use the default values.

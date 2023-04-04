### Loading

The data should be loaded with paragraphs, each with different font.
Also the image caption should have "changed font" string with different font.

### Testing

Try to:
- Change font size by selecting many paragraphs.
- Change font size by selecting some text.
- Change to default font size by selecting many paragraphs.
- Change to default font size by selecting some text.

### Converters mode

The "Restricted value matching" option means that all font-family values that aren't defined in the plugin's configuration will be removed (e.g. when pasted from Google Docs).

This behaviour can be disabled by selecting the "Disabled value matching" option, which sets ["`supportAllValues: true`"](https://ckeditor.com/docs/ckeditor5/latest/api/module_font_fontfamily-FontFamilyConfig.html#member-supportAllValues) in the font family configuration.

The `Docs-Roboto, Arial` font-family is not specified in the plugin's configuration and should be restored to default font when the "Restricted value matching" option is selected.

By default editor should load with the "Disabled value matching" option.

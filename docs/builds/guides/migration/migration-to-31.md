
---
category: builds-migration
menu-title: Migration to v31.x
order: 93
modified_at: 2021-10-25
---

# Migration to CKEditor 5 v31.0.0

<info-box>
	When updating your CKEditor 5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

For the entire list of changes introduced in version 31.0.0, see the [changelog for CKEditor 5 v31.0.0](https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md#3100-2021-10-25).

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v31.0.0.

### HTML embed commands

Starting from v31.0.0, the `'insertHtmlEmbed'` and `'updateHtmlEmbed'` commands are no longer available. They have been replaced with a new, unified command: `'htmlEmbed'`.

```js
/* Before v31.0.0. */

// Inserts an empty HTML embed.
editor.execute( 'insertHtmlEmbed' );

// Updates the content of a selected HTML embed.
editor.execute( 'updateHtmlEmbed', '<p>HTML string</p>' );

/* After v31.0.0. */

// Inserts an empty HTML embed.
editor.execute( 'htmlEmbed' );

// Inserts an HTML embed with some initial content.
editor.execute( 'htmlEmbed', '<b>Initial content</b>.' );

// Updates the content of a selected HTML embed.
editor.execute( 'htmlEmbed', '<b>New content.</b>' );
```

The `InsertHtmlEmbedCommand` and `UpdateHtmlEmbedCommand` classes have been removed, too. Use the `HtmlEmbedCommand` class for integration with the HTML embed feature.

---
category: update-guides
meta-title: Update to version 45.x | CKEditor 5 Documentation
menu-title: Update to v45.x
order: 79
modified_at: 2024-11-28
---

# Update to CKEditor&nbsp;5 v45.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	You may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v45.0.0

_Released on Month X, 2024._

For the entire list of changes introduced in version 45.0.0, see the [release notes for CKEditor&nbsp;5 v45.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v45.0.0).

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v45.0.0.

### UI toolbar refactoring

Link and Bookmark features have been refactored to use standard toolbar components, making them more customizable and consistent:

#### Link feature changes

The Link UI has been refactored to allow for easier customization of the link toolbar through configuration. The most notable changes include:

* The custom `LinkActionsView` has been replaced with a standard `ToolbarView`. The toolbar is accessible via `LinkUI#toolbarView` instead of `LinkUI#actionsView` and configurable through the `link.toolbar` configuration option.
* Link properties (decorators) are now accessed through the toolbar instead of a separate settings panel.
* The link toolbar now uses components registered in `ComponentFactory`, making it more extensible.

Here's how to configure the link toolbar:

```js
ClassicEditor
    .create( document.querySelector( '#editor' ), {
        link: {
            toolbar: [ 'myCustomLinkInfo', '|', 'editLink', 'linkProperties', 'unlink' ]
        }
    } )
    .then( /* ... */ )
    .catch( /* ... */ );
```

#### Bookmark feature changes

The Bookmark UI has been refactored to use the `WidgetToolbarRepository` instead of a custom `ActionsView`. Key changes include:

* The custom `BookmarkUI#actionsView` has been removed in favor of using the standard widget toolbar system.
* The bookmark toolbar is configurable through the `bookmark.toolbar` configuration option.
* The toolbar items are registered in `ComponentFactory` and can be customized.

For bookmark features, you can configure the toolbar like this:

```js
ClassicEditor
    .create( document.querySelector( '#editor' ), {
        bookmark: {
            toolbar: [ 'bookmarkPreview', '|', 'editBookmark', 'removeBookmark' ]
        }
    } )
    .then( /* ... */ )
    .catch( /* ... */ );
```

### Custom toolbar components

Link and Bookmark features allow custom toolbar items to be registered in their respective toolbars. To add a custom item:

1. Register it in the component factory
2. Add it to the toolbar configuration

Here's an example of registering a custom component:

```js
editor.ui.componentFactory.add( 'myCustomLinkInfo', locale => {
    const button = new ButtonView( locale );
    const linkCommand = editor.commands.get( 'link' );

    button.bind( 'isEnabled' ).to( linkCommand, 'value', href => !!href );
    button.bind( 'label' ).to( linkCommand, 'value' );

    button.on( 'execute', () => {
        // Add your custom component logic here
    } );

    return button;
} );
```

Once registered, the component can be used in the toolbar configuration:

```js
ClassicEditor
    .create( document.querySelector( '#editor' ), {
        link: {
            toolbar: [ 'myCustomLinkInfo', '|', 'editLink', 'unlink' ]
        }
    } )
    .then( /* ... */ )
    .catch( /* ... */ );
```

For a complete list of available toolbar items and configuration options, see the {@link module:link/linkconfig~LinkConfig#toolbar link configuration documentation} and {@link module:bookmark/bookmarkconfig~BookmarkConfig#toolbar bookmark configuration documentation}.

### Link provider registration

The Link UI now supports registering custom link providers through the new `LinkUI#registerLinksListProvider` method. This allows adding a list of predefined links available in the link form. Here's a simple example:

```js
editor.plugins.get( 'LinkUI' ).registerLinksListProvider( {
    label: 'My links',

    // Return a list of links to display in the link form
    getListItems: () => [
        {
            id: 'homepage',
            href: 'https://example.com',
            label: 'Homepage',
            icon: linkIcon
        }
    ],

    // Optional: Customize how links are displayed in preview
    getItem: href => {
        return {
            href,
            label: 'My custom label',
            tooltip: 'Open link'
        };
    }
} );
```

The registered links will appear as a button in the link form, allowing users to quickly insert commonly used links.

#### Other code changes

* The `createBookmarkCallbacks()` helper has been replaced with `isScrollableToTarget()` and `scrollToTarget()` helpers.

### Unified form styles

Form components across various features (Link, Bookmark, Image, Table) have been unified using the new `ck-form` and `ck-form__row` classes. The form styling has been centralized in the theme-lark package.

Notable changes:

* A new `FormRowView` class has been introduced in the UI package for consistent form row layouts
* All balloon panels now have consistent headers with back buttons
* Form styles have been moved to a dedicated `form.css` in the theme-lark package

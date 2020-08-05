---
# Scope:
# * Introduction to custom builds and why one would create them.
# * Introduction to online builder
# * Step-by-step instructions on using online builder.

menu-title: Online builder
category: builds-development
order: 10
---

# Creating custom builds

Although the CKEditor 5 WYSIWYG editor comes with handy preconfigured builds, sometimes these predefined versions are not enough and a need for custom builds arises. Some of the reasons for creating custom builds are:

* Adding features which are not included in the existing builds, either from a third party or custom developed.
* Removing unnecessary features present in a build.
* Changing the {@link builds/guides/integration/basic-api#creating-an-editor editor creator}.
* Changing the {@link framework/guides/theme-customization editor theme}.
* Changing the {@link features/ui-language localization language} of the editor.
* Enabling bug fixes which are still not a part of any public release.

This is where the online builder comes to aid the users needs.

## Using online builder to create custom CKEditor 5 WYSIWYG editor build

The [online builder](https://ckeditor.com/ckeditor-5/online-builder/) lets you download CKEditor 5 builds and also allows you to create your own, customized builds (with a different set of plugins) in a few easy steps, through a simple and intuitive UI.

### Choosing editor type

The following CKEditor 5 Builds are currently available to choose from:

 * [Classic editor](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#classic-editor)
 * [Inline editor](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#inline-editor)
 * [Balloon editor](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#balloon-editor)
 * [Balloon block editor](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#balloon-block-editor)
 * [Document editor](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#document-editor)

 Refer to the documentation to check what kind of WYSIWYG editor suits your needs best. Once you choose the desired editor type, press the **Next step** button on the top right.

 For the sake of clarity, this guide will use the Classic build as an example.

 {@img assets/img/online-builder-01-editor-type-choice.png 778 Editor type selection.}

 <!-- What do the numbers stand for in the image link? Nevermind, figured it all myself -->

### Choosing plugins

The basic build comes with a predefined set of plugins grouped in the bar at the top of the page. Take a moment to check these options out. You can freely remove the ones that will not be used in your build.

{@img assets/img/online-builder-02-predefined-plugins.png 778 Predefined plugins. Feel free to remove unneded ones.}

Below the top bar with preselected plugins, you will find a large collection of features that can be added to the custom build. Choose the ones that best suit your needs.

{@img assets/img/online-builder-03-plugin-choice.png 778 Predefined plugins. SOme of the plugins to choose from.}

<info-box hint>
	Note that some of the plugins require other plugins to work. These dependencies are mentioned in the **Require plugin** section of the description box for each plugin. If this section is not present - the plugin doesn't need any other plugin to work.
</info-box>

Once you choose all the desired plugins, press the **Next step** button on the top right.

### Toolbar composition

Next step allows you to compose the toolbar. A simple drag-and-drop workspace allows for adding buttons (representing the plugins chosen in the previous step) to the toolbars. The user may change the order of the buttons and group them accordingly.

{@img assets/img/online-builder-04-toolbar-configurator.png 753 The toolbar drag-and-drop configurator.}

<info-box hint>
	Some of the buttons are pre-placed and are grayed out. To move one of these, drag them from the lower bar into the upper bar - they will become focused and can be then moved around.
</info-box>

Once you finish designing the toolbar, press the **Next step** button on the top right.

### Choosing the defaut language

Scroll the list of available languages and check the one you want to be the main language of your editor build.

{@img assets/img/online-builder-05-language-selection.png 365 Language selector list.}

<info-box hint>
	All other languages will still be available in the `translations` folder.
</info-box>

### Download the customized build

This is as simple as it gets: just press the **Start** button to download your customized package.

Refer to the [Installation page](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/installation.html#zip-download) for further instructions on installing the custom build.



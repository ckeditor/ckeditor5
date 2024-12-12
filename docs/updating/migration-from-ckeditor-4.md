---
# Scope:
# Support migration from CKEditor 4 to CKEditor&nbsp;5.

category: ckeditor4-migration
order: 10
modified_at: 2023-03-21
meta-title: Migration from CKEditor 4 | CKEditor 5 Documentation
meta-description: Learn how the migrate from CKEditor 4 to the latest CKEditor 5 version without problems.
---

# Migration from CKEditor 4

This section of the documentation explains how to migrate to CKEditor&nbsp;5.

<info-box hint>
	**CKEditor 4 reached its End of Life (EOL) in June 2023**, with no future updates, bug fixes, and security patches. Learn how to migrate to CKEditor&nbsp;5 [here](https://ckeditor.com/docs/ckeditor5/latest/updating/ckeditor4/migration-from-ckeditor-4.html).

	If you are not ready to migrate yet, we offer an **[Extended Support Model Package](https://ckeditor.com/ckeditor-4-support/)** that protects against security vulnerabilities and third-party API changes.

	Contact our Sales team for [more details](https://ckeditor.com/contact/).
</info-box>

When compared to its predecessor, you should treat CKEditor&nbsp;5 as **a totally new editor**. We have redesigned every single aspect of it &ndash; from installation, to integration, to features, to its data model, and finally to its API.

There is no automatic solution for migrating. This section summarizes the most important aspects you need to consider before you proceed with moving to CKEditor&nbsp;5.
## Differences between CKEditor 4 and CKEditor&nbsp;5

What differentiates CKEditor&nbsp;5 from its predecessor the most is its core architecture. CKEditor&nbsp;5 is a highly flexible and extensible editing framework with a powerful API. You can use it to create any WYSIWYG editor implementation, from a lightweight chat to a complex Google Docs-like solution. CKEditor&nbsp;5 is also collaboration-ready and offers features such as real-time collaboration, comments, or track changes.

Here are the key differences between the two editor versions:

<figure class="table" style="width:100%;">
    <table>
        <tbody>
            <tr>
                <td>
                    &nbsp;
                </td>
                <td>
                    <strong>CKEditor 4</strong>
                </td>
                <td>
                    <strong>CKEditor&nbsp;5</strong>
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Programming language</strong>
                </td>
                <td>
                    JavaScript
                </td>
                <td>
                    TypeScript
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Data model</strong>
                </td>
                <td>
                    HTML/DOM
                </td>
                <td>
                    Custom data model and virtual DOM implementation
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Architecture</strong>
                </td>
                <td>
                    Plugin-based
                </td>
                <td>
                    Plugin-based, MVC
                </td>
            </tr>
			<tr>
                <td>
                    <strong>Editor types</strong>
                </td>
                <td>
                    Classic, inline
                </td>
                <td>
                    Classic, inline, decoupled (document), balloon, balloon block, multi-root
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Collaboration-ready</strong>
                </td>
                <td>
                    ❌
                </td>
                <td>
                    ✅
                </td>
            </tr>
            <tr>
                <td>
                    <strong>File management and image upload</strong>
                </td>
                <td>
                    CKFinder
                </td>
                <td>
                    CKBox, CKFinder
                </td>
            </tr>
            <tr>
                <td>
                    <strong>UI</strong>
                </td>
                <td>
                    Toolbar, dialogs, and features manipulated through right-click context menu
                </td>
                <td>
                    Toolbar, dropdowns, balloons, and features manipulated through on-click feature toolbars
                </td>
            </tr>
            <tr>
                <td>
                    <strong>UI customization</strong>
                </td>
                <td>
                    Skins, UI color change
                </td>
                <td>
                    Themes, customization with CSS variables
                </td>
            </tr>
            <tr>
                <td>
                    <strong>License</strong>
                </td>
                <td>
                    GPL, MPL, LGPL, commercial license
                </td>
                <td>
                    GPL 2+ or commercial license
                </td>
            </tr>
        </tbody>
    </table>
</figure>

## Feature comparison of CKEditor 4 and CKEditor&nbsp;5

Digital content editing paradigms have changed a lot between the times of CKEditor 4 and now. We designed and built CKEditor&nbsp;5 from scratch, taking into account the possibilities of modern web apps, current web standards, and the needs of today's users.

This new approach affects the {@link features/index available feature set}, how features were implemented, and what configuration options are available for them. To make it easier to compare both editor versions, we have created the following compatibility tables:
* {@link updating/ckeditor4-plugin-compatibility CKEditor 4 plugin equivalents}
* {@link updating/ckeditor4-configuration-compatibility CKEditor 4 configuration options compatibility}

You can use them to check the CKEditor&nbsp;5 equivalents of some features or configuration options from CKEditor 4. If there is no direct equivalent, the tables will point you to a solution recommended in CKEditor&nbsp;5. We strongly advise you to treat the migration to CKEditor&nbsp;5 as an opportunity to modernize your application and rethink your editing solutions.

## Before you migrate

CKEditor 4 and CKEditor&nbsp;5 are two different products. Here are the most important aspects you need to consider before you migrate.

### Migrating existing data

<info-box warning>
	Engine and architecture differences between CKEditor&nbsp;4 and CKEditor&nbsp;5 affect how content is processed and represented in HTML. CKEditor&nbsp;5 will adapt and transform the data to align it with its supported features, so changes in data representation may happen during the migration. Content not compatible with the enabled features in CKEditor&nbsp;5 may be lost, so make sure you read this migration guide fully.
</info-box>

Perform extensive analysis, data verification, and tests on existing data. If necessary, you will need to develop conversion procedures to avoid data loss. You can use the {@link features/general-html-support General HTML Support} feature to introduce HTML markup that is present in the legacy content but is not yet fully covered by CKEditor&nbsp;5 features.

The {@link framework/architecture/plugins#plugins-and-html-output Plugins and HTML output} article lists all official CKEditor&nbsp;5 plugins and the HTML output they produce. You can use it to check the compatibility of legacy data with what is supported in CKEditor&nbsp;5.

A simple yet efficient strategy for adopting CKEditor&nbsp;5 into existing systems might be using CKEditor&nbsp;5 for creating new content and the old editor for editing legacy content.

### Installation and integration

The first aspect that changed with CKEditor&nbsp;5 is its installation procedure. It became much more modern with the introduction of modular patterns, UMD, npm, etc. Refer to the {@link getting-started/index Getting started} section to explore all available installation and integration options.

The API for integrating CKEditor with your pages changed, too. Check the {@link getting-started/setup/editor-lifecycle Editor lifecycle} and {@link getting-started/setup/getting-and-setting-data Getting and setting data} articles for an introduction to this topic.

### Custom plugins

Any custom plugins you have developed for CKEditor 4 will not be compatible with CKEditor&nbsp;5. Although their idea may stay the same, their implementation will certainly be different and will require rewriting them from scratch.

The same may apply to third-party plugins. They may not have been ported to CKEditor&nbsp;5 yet.

Check the {@link framework/architecture/plugins#creating-plugins Creating plugins} section for more information on the development of plugins.

### Custom themes (skins)

In CKEditor&nbsp;5, the earlier concept of "skins" was reviewed and is now called "themes."

If you have custom skins for CKEditor 4, you need to re-create them for CKEditor&nbsp;5. Fortunately, custom theming in CKEditor&nbsp;5 is much more powerful and simpler than before.

What's new: you can use CKEditor&nbsp;5 as a {@link framework/external-ui headless editor integrated with an external UI}, for example, created in React. Many projects use the powerful editing engine of CKEditor&nbsp;5 coupled with a custom UI for seamless integration with their application.

For more information, check how to {@link framework/theme-customization customize the themes} in the CKEditor&nbsp;5 Framework documentation.

### Image upload

CKEditor&nbsp;5 supports several different image upload strategies. Check out the {@link features/image-upload comprehensive "Image upload" guide} to find out the best option for your project.

### License

CKEditor 4 was licensed under GPL, LGPL, and MPL Open Source licenses.

CKEditor&nbsp;5 is licensed under GPL2+ Open Source license only. If you are running an Open Source project under an OSI-approved license incompatible with GPL, we will be happy to [support you with a no-cost license](https://ckeditor.com/contact/). If your project is a commercial one, you will need to [get a commercial license](https://ckeditor.com/contact/).

## Recommended migration strategy

You can approach moving from CKEditor 4 to CKEditor&nbsp;5 as follows:

1. **Back up all your data.**
2. Learn about CKEditor&nbsp;5. Check the [demos](https://ckeditor.com/ckeditor-5/demo/), read about its {@link framework/architecture/intro architecture}, and review the {@link features/index available features} and {@link getting-started/index integration methods}.
3. Create a custom preset containing all the plugins you need the [Builder](https://ckeditor.com/ckeditor-5/builder/?redirect=docs).
4. Test loading pre-existing content created in CKEditor 4 into CKEditor&nbsp;5. Adjust the editor configuration and plugin set. If needed, enable the missing elements, classes, or attributes via the {@link features/general-html-support General HTML Support} feature.
5. When you are sure no data loss will occur, you can focus on customizing your CKEditor&nbsp;5 preset even more by changing the integration method, creating custom plugins, adjusting the theme, and enabling new features.

CKEditor&nbsp;5 is a great, modern editing framework so migrating is a fantastic opportunity to level your content editing experience up. {@link features/collaboration Collaboration} with real-time collaborative editing, comments and track changes, {@link features/revision-history revision history}, {@link features/autoformat autoformatting}, {@link features/import-word import from Word}, export to {@link features/export-pdf PDF} and {@link features/export-word Word}, {@link features/word-count word and character count}, and {@link features/ckbox CKBox} file manager are just a few examples of new features that were not available in CKEditor 4. Try them out!

## Support

If you are missing any particular features or settings, feel free to {@link support/index#reporting-issues report an issue}. Search the [issues section in the repository](https://github.com/ckeditor/ckeditor5/issues) first. The feature you are after may have already been reported &ndash; you can support it by upvoting the issue with &nbsp;👍. Be as precise as possible, explaining the exact use case, the context where you use the editor, and the expected behavior.

The {@link updating/ckeditor4-troubleshooting Troubleshooting migration from CKEditor 4} article answers some frequently asked questions about the migration.

[Contact the support team](https://ckeditor.com/contact/) if you want to learn more about licensing or the [Extended Support Model](https://ckeditor.com/ckeditor-4-support/).

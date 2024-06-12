---
category: nim-migration
order: 50
menu-title: Migrating custom plugins
meta-title: Migrating custom plugins to new installation methods | CKEditor 5 documentation
meta-description: Learn how to upgrade custom plugins to the new installation methods.
modified_at: 2024-06-06
---

# Migrating custom plugins

If you have created custom plugins for CKEditor&nbsp;5, you will need to adjust them to work with the new installation methods. However, the migration process is different depending on whether you want to keep providing support for the old installation methods or want to drop that kind of support and just migrate them to the new installation methods only.

You should consider maintaining backward compatibility with the old installation methods if your plugin is used in projects that are outside your control and that may still use old installation methods, for example if your plugin is open-source.

<info-box warning>
	This migration guide assumes that you created a custom plugin using our {@link framework/development-tools/package-generator/using-package-generator package generator}. If you created your plugin in any other way, you will need to adjust the steps accordingly.
</info-box>

## Prerequisites

Before you start, follow the usual upgrade path to update your plugin to use the latest version of CKEditor&nbsp;5. This will rule out any problems that may be caused by upgrading from an outdated version of CKEditor&nbsp;5.

## Migration steps

### Common steps

Below are the steps that you need to follow regardless of whether you still want to provide support for the old installation methods or want to drop support for them and migrate to the new installation methods only.

### Supporting only the new installation methods

If you want to drop support for the old installation methods and migrate your plugin to the new installation methods only, follow the steps below:

1. 

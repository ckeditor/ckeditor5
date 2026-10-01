---
category: getting-started
order: 20
menu-title: Build with AI ✨
meta-title: CKEditor 5 skills for AI coding agents | CKEditor 5 Documentation
meta-description: Install the official CKEditor 5 skills in Claude Code, Cursor, Codex, OpenCode, or Copilot to set up, configure, and update CKEditor 5.
modified_at: 2026-09-30
---

# Using CKEditor&nbsp;5 with AI coding agents

The official **CKEditor skills** teach your AI coding agent how to work with CKEditor&nbsp;5. There are two skills:

* `ckeditor` adds CKEditor&nbsp;5 to a project: it selects an installation method, wires up the editor, maps features to your use case, loads the styles, and sets the license key.
* `ckeditor-update` updates an existing CKEditor&nbsp;5 integration to the latest version or to a version that you name.

Install them with one command:

```bash
npx skills add ckeditor/skills
```

<info-box>
	This guide covers **AI agent skills** that help you integrate CKEditor&nbsp;5 into your application or update it to the version you want. It is not the in-editor {@link features/ckeditor-ai-overview CKEditor AI} feature that helps you with content workflow.
</info-box>

## What the skills do

Your agent loads the correct skill automatically, based on what you ask it to do.

### Set up CKEditor&nbsp;5

The `ckeditor` skill loads when you ask your agent to install, set up, configure, or troubleshoot CKEditor&nbsp;5. It will:

* Choose an install method &ndash; npm, CDN, or ZIP.
* Wire up the editor in vanilla JavaScript or an official React, Angular, or Vue wrapper.
* Configure plugins, the toolbar, content styles, and the UI language.
* Set the license key and unlock premium features.
* Send version-specific questions to the live documentation instead of guessing.

### Update CKEditor&nbsp;5

The `ckeditor-update` skill loads when you ask your agent to update, upgrade, or migrate CKEditor&nbsp;5, for example: _"Update CKEditor&nbsp;5 to the latest version."_ You can also name the version you want. It will:

* Find the installed version, the installation method, and the framework wrappers, and record what the editor does today.
* Read the {@link updating/index update guides} for every version between yours and the target one, from the oldest to the newest.
* Apply the changes to your code, including a move off legacy installation methods, such as predefined builds, when the target version needs it.
* Put all CKEditor&nbsp;5 packages on the same version and update the framework wrappers.
* Verify that the editor still has the same features and content, and report every change with the guide section that made it necessary.

Review the changes before you commit them. The skill does not cover downgrades or migration from CKEditor&nbsp;4. For CKEditor&nbsp;4, see the {@link updating/migration-from-ckeditor-4 Migration from CKEditor&nbsp;4} guide.

## Supported agents

The skills use the open [Agent Skills](https://agentskills.io/home) format, so they work in any agent that supports it &ndash; including **Claude Code**, **Cursor**, **Codex**, **OpenCode**, **GitHub Copilot**, **Windsurf**, **Gemini**, **Cline**, **AMP**, **Zed**, and more.

## Other ways to install

Besides [skills.sh](https://skills.sh), which installs the skills into every supported agent it detects, you have two more options.

### Claude Code plugin marketplace

```text
/plugin marketplace add ckeditor/skills
/plugin install ckeditor@ckeditor
```

### Manual installation

Copy the `skills/ckeditor/` and `skills/ckeditor-update/` directories from the [`ckeditor/skills`](https://github.com/ckeditor/skills) repository into your agent's skills directory, for example `.claude/skills/ckeditor/` and `.claude/skills/ckeditor-update/`.

## Connect the documentation MCP server

The skills work on their own, but they are more effective when your agent can search the live documentation. The hosted **CKEditor 5 documentation MCP server** (powered by Kapa.ai) gives agents semantic search over the docs, returned as relevant snippets with source links.

<info-box note>
	This optional server is for your coding agent and is separate from the {@link features/ckeditor-ai-mcp CKEditor AI MCP} feature inside the editor.
</info-box>

* **Endpoint:** `https://ckeditor5.mcp.kapa.ai`
* **Authentication:** Google or GitHub SSO, which Kapa uses to control abuse of the MCP server.

The server requires a one-time sign-in. The first time your agent calls it, a browser window opens – sign in with your Google or GitHub account, then retry the question. If no prompt appears in Claude Code, run `/mcp`, select `ckeditor5`, and choose **Authenticate**.

### Add the server to your agent's MCP configuration

#### Claude Code

```bash
claude mcp add --transport http --scope project ckeditor5 https://ckeditor5.mcp.kapa.ai
```

<details>
<summary>Or add it manually to <code>.mcp.json</code></summary>

```json
{
	"mcpServers": {
		"ckeditor5": {
			"type": "http",
			"url": "https://ckeditor5.mcp.kapa.ai"
		}
	}
}
```

</details>

#### Cursor

Add it to `.cursor/mcp.json`:

```json
{
	"mcpServers": {
		"ckeditor5": {
			"url": "https://ckeditor5.mcp.kapa.ai"
		}
	}
}
```

#### Codex

```bash
codex mcp add ckeditor5-docs --url https://ckeditor5.mcp.kapa.ai
```

<details>
<summary>Or add it manually to <code>~/.codex/config.toml</code></summary>

```toml
[mcp_servers.ckeditor5-docs]
url = "https://ckeditor5.mcp.kapa.ai"
startup_timeout_sec = 20
tool_timeout_sec = 60
enabled = true
```

</details>

#### OpenCode

Add it to `opencode.json`:

```json
{
	"$schema": "https://opencode.ai/config.json",
	"mcp": {
		"ckeditor5-docs": {
			"type": "remote",
			"url": "https://ckeditor5.mcp.kapa.ai",
			"enabled": true
		}
	}
}
```

For any other agent, point its MCP client at the streamable HTTP endpoint above and authenticate with Google or GitHub SSO.

## Read the documentation as markdown

Even without the MCP server, agents can read the documentation efficiently: every page of the **latest** documentation is also served as clean, token-friendly markdown, in two ways. Replace `.html` with `.md` in the page URL, for example:

```text
https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/editor-types.md
```

Alternatively, request the original `.html` page with an `Accept: text/markdown` header and the server returns the markdown version.

To find a page, start from the index of the project you need. Each one lists every page with its summary, and every markdown page links back to it:

* [https://ckeditor.com/docs/ckeditor5/llms.txt](https://ckeditor.com/docs/ckeditor5/llms.txt) &ndash; the CKEditor&nbsp;5 guides.
* [https://ckeditor.com/docs/ckeditor5/latest/api/llms.txt](https://ckeditor.com/docs/ckeditor5/latest/api/llms.txt) &ndash; the API reference, which is too large to share a file with the guides.
* [https://ckeditor.com/docs/cs/llms.txt](https://ckeditor.com/docs/cs/llms.txt) &ndash; CKEditor Cloud Services.
* [https://ckeditor.com/docs/ckbox/llms.txt](https://ckeditor.com/docs/ckbox/llms.txt) &ndash; CKBox.

For bulk access, [https://ckeditor.com/docs/llms-full.txt](https://ckeditor.com/docs/llms-full.txt) bundles all the guides in a single plain-text file.

## Feedback

Found wrong, stale, or missing guidance? [Open an issue](https://github.com/ckeditor/skills/issues/new?template=skill-feedback.yml) in the [`ckeditor/skills`](https://github.com/ckeditor/skills) repository. Agents are encouraged to file these when reality contradicts the skills.

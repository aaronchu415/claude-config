---
name: repo-explorer
description: Explore a Git repository that is not the current project (a dependency's source, a GitHub repo) from the clone cache at ~/.explore/repos. Use when asked to read, inspect, or understand external repo source.
---

# Repo explorer

Cache is `~/.explore/repos`, one directory per repo named `<owner>__<repo>`.

## Current cache contents

```!
mkdir -p ~/.explore/repos
ls -la ~/.explore/repos
```

## Flow

1. **Pick the ref.** Exploring a dependency to understand how it behaves for the current project: the resolved version in the project's lockfile (`yarn.lock`, `pnpm-lock.yaml`, `package-lock.json`, `Cargo.lock`, `go.sum`) is authoritative, not the latest release. A general look: the default branch.
2. **Check the cache** (the rendered section above, or `ls -la ~/.explore/repos` where the host does not inject it). A copy present from earlier may sit on `main` or an older tag; confirm it matches the ref from step 1 before trusting it:

   ```bash
   git -C ~/.explore/repos/<owner>__<repo> describe --tags --always
   ```

   Drifted: move it to the tag.

   ```bash
   DIR=~/.explore/repos/<owner>__<repo>
   git -C "$DIR" fetch --depth 1 origin tag <tag>
   git -C "$DIR" checkout <tag>
   ```

3. **Clone if absent**, shallow and pinned. Tags are usually `v<version>` (`v5.37.1`); if a guess fails, `git ls-remote --tags <repo-url>`.

   ```bash
   git clone --depth 1 --branch <tag> <repo-url> ~/.explore/repos/<owner>__<repo>
   # general look:
   git clone --depth 1 <repo-url> ~/.explore/repos/<owner>__<repo>
   ```

4. **Explore.** Read `README`, `AGENTS.md`, `CLAUDE.md`, and `package.json` before searching. The summary names the version or ref explored.

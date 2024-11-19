# Typing Effect Dev Notes

Here I will describe certain aspects of TypingEffect development, things, I think, may be interesting for other developers (and not to forget them myself). I've found all this information in various sources, mostly in [GitHub Docs](https://docs.github.com/en), but also in GitHub issuies/comments, Stack Overflow, Medium, and some other places, as well as trial and error. 
So I felt like combining it all here in one place.

## GitHub actions git setup

To make automatic modifications to the code I use git and [GitHub CLI](https://cli.github.com/) + [GitHub API](https://docs.github.com/en/rest).

One important thing is to set git user. I use this configuration in all workflows:
```bash
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
```
The `41898282` part is this user's ID, which was not necessary at the time of writing, but I've added it just in case.

It gives the automated commits a more 'official' appearance by attributing them to an actual existing GitHub user. It is a bot user and you can can check it's info [here](https://api.github.com/users/github-actions[bot]).

<img src="/example_demos/gh_bot_commit_example.png" width="400px" />

And in contributors section:

<img src="/example_demos/gh_bot_contributors_example.png" width="400px" />

I've also set the default workflow permissions in repo settings as `Read and write permissions`, which is a lazy way. Recommended way is to set granular permissions in workflow files.

And check the `Allow GitHub Actions to create and approve pull requests` box below.

---

## GitHub Pages deploy

In this project I use GitHub Pages to store coverage artifacts and coverage badge info for main branch and for the latest release, as well as hosting the [demo page](https://ydernov.github.io/typing-effect/).

Below are the steps to create a similar coverage/deploy in no particular order, except for the first one, because without the pages branch deploys won't work.

### Create a branch for deploys

We need an empty branch, not related to other branches. This is where `git checkout --orphan` comes to use. This is a one-time operation, so it can be done on a local machine.

Here I use `gh-pages` as the name for the branch:
```bash
git checkout --orphan gh-pages
```

Then we clean the git repo:
```bash
git rm -rf .
```

And commit with `--allow-empty` flag:
```bash
git commit --allow-empty -m "Initial commit"
```

And lastly, push the branch to `origin`:
```bash
git push origin gh-pages
```

To determine the name of your `origin` use this command:
```bash
git remote -v
```
Now you should see your branch in your remote repo in GitHub UI.

Then go to repository Settings -> Code and automation -> Pages. Under Build and deployment select `Deploy from a branch` for Source, then select your branch and `/ (root)`, click Save.

Now, every time there is a push to this branch, it's going to be published to GitHub Pages.

### Coverage

So, I've decided to create my own coverage badges, just because. To do this, I plan to use the [endpoint badge](https://img.shields.io/badges/endpoint-badge) feature from [shields.io](https://shields.io/). It's not entirely custom, but it's easy to use - simply a link with a JSON configuration as a query parameter, and it's customizable within that JSON file.

This is a description/explanation for a workflow. A workflow is required here because I wanted it to run every time there ara updates to `main` and for every created release. More on those later.
Full workflow file is [here](https://github.com/ydernov/typing-effect/blob/main/.github/workflows/coverage-and-badge.yml).

The plan is to have a badge in README, that displays coverage, and you can click on it to view the full coverage report.

To do this, we need:
- [GitHub pages](#github-pages-deploy) branch to be set up
- Create coverage report
- Build JSON config for the badge base on the report
- Push it to `gh-pages` branch

#### Coverage reports

Nothing special here. I use [Vitest](https://vitest.dev/) for testing and coverage in this project, so I just neede to add a line or two in [vite.config.ts](https://github.com/ydernov/typing-effect/blob/main/vite.config.ts).
```ts
    coverage: {
      reporter: ["text", "json-summary", "html"],
      exclude: ["src/main.ts", "**/types.ts", "**/*.d.ts"],
    }
```
For `reporter` in `coverage` we set:
- `json-summary` - this one will create `coverage-summary.json` a barebones summury info, which we'll use to build a badge config
- `html` - produces HTML page with user-friendly info on coverage, we will link to this one from the badge
- `text` - not needed here, but I use the same coverage command on local for testing, just ouputs the info to console

And add this to scripts in package.json:
```json
"coverage": "vitest run --coverage"
```

#### Badge JSON config

The config needs just four fields, only the first 3 are required:
```json
{
  "schemaVersion": 1,
  "label": "Label",
  "message": "Message",
  "color": "green"
}
```
Important! "schemaVersion" must be 1, and it must be a number, it won't work if you supply string, like this:
```json
"schemaVersion": "1"
```
For this task, I initially used [jq](https://jqlang.github.io/jq/), which is a CLI tool for working with JSON and is available in GitHub Actions by default. I created a script that parsed the `coverage-summary.json` file, extracted the necessary values, performed the required calculations, assigned colors, and generated a JSON output based on that.

I used [this playgroung](https://jqplay.org/) for writing the script and a local jq installation for testing said script. And it worked, but not on GitHub. Because both local jq and playground's jq were on version 1.7.1, while GitHub only had 1.6 (with no plans for updates, as I read in one post). So I've scrapped it and rewrote it in JS with [actions/github-script](https://github.com/actions/github-script).
The code does the following:
- gathers total percentage values from four main categories - "lines", "statements", "functions", "branches" and calculates their average
- runs the average against colorRanges keys, to get the matching key:
```js
const colorKey = (
  Object.keys(colorRanges)
    .filter((key) => Number(key) <= total)
    // probably should add sort here to guarantee the order
    .pop() || 0
).toString();
```
- rounds the average to one decimal
- creates JSON string and returns it, the github-script action puts the value returned from script into result key in step's output.

We use this output in the next step to write the JSON string to the `badge.json` file. The `>` command will create the file if it doesn't exist. Next we create a folder inside insode a coverage folder. This folder name depends on the git ref - which for this workflow can be either `refs/heads/main` or `refs/tags/TAG_NAME`. And so if ref is tag we create `release` directory, otherwise `main`.

Next we switch to the branch, [set the user](#GitHub-actions-git-setup), commit the changes and push them. This works if branch doesn't have push protection rules. So I recommend creating a pull request amd merging it with GitHub CLI. As done in [this workflow](https://github.com/ydernov/typing-effect/blob/main/.github/workflows/build-demo-for-main.yml).

> Note: A thing I've noticed while working on this workflow is that every step sets its current Bash shell directory to the repository root.
>
> Hence the repeated:
> ```bash
> cd coverage
> ```
> While for Node scripts (at least in github-script action) you need to resolve path, like this:
> ```js
> const path = require('path');
> const summaryTotal = require(path.join(path.resolve(), '/coverage/coverage-summary.json')).total;
> ```

Now only a couple of steps left to get the bade:
- Run the workflow and check that deployment to pages was successful
- Navigate to [shields endpoint-badge](https://img.shields.io/badges/endpoint-badge) and construct markdown badge with URL to badge.json in your pages deployment
- Now add to your readme `[markdown_badge](link_to_coverage)`, where `link_to_coverage` is a link to your coverage html file in pages deployment

Example: 
```markdown
[![Coverage main](https://img.shields.io/endpoint?url=https%3A%2F%2Fydernov.github.io%2Ftyping-effect%2Fcoverage%2Fmain%2Fbadge.json)](https://ydernov.github.io/typing-effect/coverage/main/index.html)
```

### Demo

Here I'll cover the [demo publishing workflow](https://github.com/ydernov/typing-effect/blob/main/.github/workflows/build-demo-for-main.yml). It serves the same purpose as the coverage workflow - to push some files to `gh-pages` branch. But it does it in a different way, a more correct approach.

This one is rather simple: after checking-out the `main` branch and building the demo artifacts, we switch to a local copy of `gh-pages` branch.
Since `gh-pages` and `main` are unrelated, all files and directories from `main`, including the `dist-demo` folder containing the demo artifacts, are considered new and untracked files.

We're interested only in `dist-demo`, everything else must go, so we use `git stash`. First, stash `dist-demo`:
```bash
git add dist-demo
git stash
```
Then, stash everything else and remove the stash:
```bash
git stash -u && git stash drop
```
The `-u` flag tells git to also stash untracked files. Then we delete the latest stash with `git stash drop`.
Now `pop` the last stash, which is now the `dist-demo` stash.

Since I wanted the demo to be in the root directory, I added some commands to copy the folder's contents to the root and then delete the original folder.

Then there is a check for actual updates to commit:
```bash
if [ $(git add . && git diff --quiet && git diff --cached --quiet; echo $?) -eq 1 ]; then
...
```

If there are updates, we push the local branch, and with GitHub CLI create PR into `gh-pages` and merge it. For this approach you need `Allow GitHub Actions to create and approve pull requests` in project settings to be checked.

### Application

#### Main

Both of these workflows/processes are used in a [workflow](https://github.com/ydernov/typing-effect/blob/main/.github/workflows/on-main-update.yml) for updates to the `main` branch. Which triggers every time there is a push/merge to `main`. In this workflow, notice that the job `create-and-publish-coverage` depends on `build-demo`:
```yaml
create-and-publish-coverage:
    needs: build-demo
    ...
```
Since jobs naturally execute in parallel, and both of these jobs make changes to the same branch `gh-pages`, I decided to run them consecutively. This way, merge conflicts can be avoided. Although **I DID NOT** test them running in parallel, I cannot say for sure if there are any conflicts.

#### Release

The coverage and badge workflow, also is used in [workflow for release](https://github.com/ydernov/typing-effect/blob/main/.github/workflows/on-release.yml). Because every time there is a new release, I need to "recalculate" it's coverage and badge.

---

## Release workflow

[This one](https://github.com/ydernov/typing-effect/blob/main/.github/workflows/on-release.yml).

I wanted certain behavior every time relese is created (in GitHub UI):
1. Update version in package.json to match the release tag
2. Create coverage + badge
3. Publish release artifacts to NPM and GitHub packages

In reality, there are a bit more steps. And publishing is on it's [separate workflow](https://github.com/ydernov/typing-effect/blob/main/.github/workflows/publish-package.yml).

### Version update

I didn't want to manualy change the version in package.json and match their versions every time before creating a new release, so I created [this workflow](https://github.com/ydernov/typing-effect/blob/main/.github/workflows/set-version-to-tag.yml).

What it does:
1. Takes in `ref` - tag reference like `refs/tags/v1.0.1`, `ref_name` - just `v1.0.1` part of the ref
2. Checks that reference is a tag
3. Extracts version number from `ref_name` (tag name), and updates version field in package.json with this value
4. Updates package-lock.json, so it's version matches package.json's
5. Creates local branch and pushes it to remote, then merges it
6. Sets merge commit SHA as workflow output

Nothing really special here, probably can benefit from less inputs (just ref) and additional checks for tag name.

#### Check tag

GitHub provides a variety of [functions and expressions](https://docs.github.com/en/actions/learn-github-actions/expressions), one of which `startsWith` helps to determine that ref is a tag. This is a negative condition step, so there's `!` before `startsWith`.
Note `&& exit 1` in run. It stops the workflow and prevent other steps from executing. The other way to do this is, probably, to add running condition to other steps via `if`, which checks that this step did not run. But I find `&& exit 1` simpler.

#### Update package.json

Here, the version number is extracted from `ref_name` using substitution. Since this method works only on bash variables, we first assign `ref_name` to the `TAG` variable. This transforms the `v1.0.1` tag name to `1.0.1`, which is then assigned to the `VERSION` variable.

Then, using `sed`, we search for the pattern inside package.json and replase the whole match:
```bash
sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json
```
> Note: This will replace all matches in package.json, which might be a problem - don't really know if there are any other `"version": "version_value"` key/value pairs.

Additionally, write the extracted version to the output for downstream use:
```bash
echo "version=$VERSION" >> $GITHUB_OUTPUT
```
Next, we update package-lock.json. There are definitely more than one occurrence of `"version": "version_value"` in it, so the simplest way is to update it using the `npm i` command with a specific flag:"
```bash
npm i --package-lock-only
```

#### Commit and push changes

First, we find what branch has our ref (tag):
```bash
raw=$(git branch -r --contains ${{ inputs.ref }})
```
In this project, tags are set on `main`, so there is no actual need to dynamically determine the branch. However, I do it for potential reusability. List only remote branches with the `-r` flag. It returns something like `typing-effect/main`, but we only need `main`, so we perform a substitution:

```bash
BRANCH=${raw##*/}
```

`${raw##*/}` does the same thing as `${raw#*/*/}`, transforming `typing-effect/main` into `main`. The second `#` is unnecessary in this case but can be useful if the remote has additional slashes, such as `my-company/typing-effect/main`. However, it can also be detrimental if the branch name itself contains slashes.

> Note: This approach works here, because this workflow is triggered on release creation, which means at the time of execution only one branch contains this ref (tag). Otherwise it returns a list of branches.

Next we create local branch, set git user, commit and push updated package.json and package-lock.json. 

Then we create a pull request request on the base brach:

```bash
PR_URL=$(gh pr create --title "$PR_TITLE" --body "This is an automated PR to update package.json and package-lock.json version" --base "$BRANCH")
```

It returns a pull request URL, which is later used to merge the PR:

```bash
gh pr merge $PR_URL --auto --delete-branch --squash
```

There's also a redundant check with timeout for PR status:

```bash
while [[ "$(gh pr view $PR_URL --json state --template '{{.state}}')" != 'MERGED' ]];
  do
    if [ $CURRENT_TIME -lt 60 ]; then
      echo "Still not merged: retrying in 10 seconds...\n" 
      CURRENT_TIME=$((CURRENT_TIME+10))
      sleep 10
    else 
      echo "::error::The merge process took longer than the 60-second timeout limit."
      exit 1
    fi
done
```

Redundant because:
- The repository does not have any additional checks for PR, except [`test-on-push.yml`](https://github.com/ydernov/typing-effect/blob/ydernov-patch-1/.github/workflows/test-on-push.yml). Nor does it have [merge queue](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue) set up.
- [`test-on-push.yml`](https://github.com/ydernov/typing-effect/blob/ydernov-patch-1/.github/workflows/test-on-push.yml), will not trigger for the pushed `LOCAL_BRANCH` because the push was made from the workflow with `GITHUB_TOKEN`. More info in [the docs](https://docs.github.com/en/actions/using-workflows/triggering-a-workflow#triggering-a-workflow-from-a-workflow).

So, because of the ppoints listed above, the merge happens instantly.

At last, we then request the SHA of the merge commit on the base branch:

```bash
MERGE_COMMIT=$(gh pr view $PR_URL --json mergeCommit --template '{{.mergeCommit.oid}}')
```

And supply it to the workflow output:

```bash
echo "commit_sha=$MERGE_COMMIT" >> $GITHUB_OUTPUT
```

This SHA is used in another workflow to update the tag and release commit.

### Tag and release update

After getting the merge commit SHA it is then supplied to the tag updater [workflow](https://github.com/ydernov/typing-effect/blob/ydernov-patch-1/.github/workflows/point-tag-to-new-commit.yml). Along with commit sha this workflow also requires tag name to be passed, and a personal access token (if called from another workflow).

#### Get tag's current commit

At first we check that the tag with provided name exists, and if it does get it's current commit:

```bash
TAG=${{ inputs.tag_name }}
TAG_COMMIT=$( gh api \
--method GET \
-H "Accept: application/vnd.github+json" \
-H "X-GitHub-Api-Version: 2022-11-28" \
/repos/ydernov/typing-effect/git/refs/tags/$TAG | jq '.object.sha' | tr -d '"' )
```

Here we use GitHub CLI to request info about a tag from GitHub API. It returns a JSON encoded object, which then piped to `jq` to access the commit sha. Also `tr -d '"'` is performed on the resulting string to remove `"` from it, because `jq` will return a `quoted string`, like `"f88e70a6af3814417955dca6ebc451b83fcb91d2"`. Which bash then interpretes as `"f88e70a6af3814417955dca6ebc451b83fcb91d2"` instead of `f88e70a6af3814417955dca6ebc451b83fcb91d2`.

> Note: You can find more information about this endpoint in the [GitHub REST API docs](https://docs.github.com/en/rest/git/refs?apiVersion=2022-11-28#get-a-reference).
> You can also access this endpoint from a browser, for example: https://api.github.com/repos/ydernov/typing-effect/git/refs/tags/v1.3.5.

Next we check that `TAG_COMMIT` is not empty:

```bash
[ -z "$TAG_COMMIT" ]
```

And that it is not a string with value `null`:

```bash
[ "$TAG_COMMIT" = null ]
```

This happens if `jq` fails to find the key `'.object.sha'`. Which probably means that the tag was not found, like with this response:

```json
{
  "message": "Not Found",
  "documentation_url": "https://docs.github.com/rest/git/refs#get-all-references-in-a-namespace"
}
```

If the commit was found it then passed to `$GITHUB_OUTPUT` for the next step.

#### Check the relationship

This step ensures that the two commits exist, and are on the same branch. More accurately, it verifies that they share a common history and one is a descendant of the other. It is done by checking the commits against each other twice:

```bash
FIRST=$( git merge-base --is-ancestor $TAG_COMMIT $NEW_COMMIT;  echo $?)
# and
SECOND=$( git merge-base --is-ancestor $NEW_COMMIT $TAG_COMMIT;  echo $?)
```

The command `git merge-base --is-ancestor` does not have a return value, only a status code. By convention `0` - `success`, `1` - `error`. To capture it for a variable ` echo $?` is used. Then the results are added together:

```bash
if [ $((FIRST + SECOND)) -ne 1 ]; then
  echo "::error::Either the commits are not related or the references do not exist."
  exit 1
fi
```

The idea is that the sum must be `1`, meaning, the commits are related because one of them is an ancestor of another. If `0` - there is no relation, and everything else is just some sort of error. This prevents only unrelated commits from being set as the tag's commit. It allows an older commit (an ancestor of the current tag commit) to be set as the new tag commit.

#### Update tag and release

The tag update is done with REST API via Github CLI:

```bash
gh api \
  --method PATCH \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/ydernov/typing-effect/git/refs/tags/$TAG \
  -f sha=$COMMIT -F force=true
```

This works for protected branches (this repos's `main` branch does not have `Allow force pushes` checked in it's protection rules in setting). This request is the only reason I use [PAT](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) in the workflow instead of `GITHUB_TOKEN`. First time I tested it it worked fine with `GITHUB_TOKEN`, but then, couple of weeks later it just stoped working, so I swithced to personal access token. I've created fine grained token with these permissions:

- Contents - Access: Read and write
- Metadata - Access: Read-only
- Workflows - Access: Read and write

More about reference endpoint [here](https://docs.github.com/en/rest/git/refs?apiVersion=2022-11-28#update-a-reference). The docs provide information about whoat kind of tokenn this endpoint woks with. And what permission does the token require.

After updating the tag we should also update the GitHub release object:

```bash
gh release edit $TAG --target $COMMIT
```

You can check release info by tag name with this [endpoint](https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#get-a-release-by-tag-name). For example - https://api.github.com/repos/ydernov/typing-effect/releases/tags/v1.3.5.

This concludes the "on-release" workflow. It also has coverage-and-badge job, but it is described [here](#coverage). With this workflow complete, every time you create a release on GitHub you get:

1. Auomatic updates to your package.json and package-lock.json, matching your tag name
2. Verified tag and release commit, because it is a merge commit created with GitHub CLI
3. Release artifacts with updated package.json and package-lock.json

---

## Publishing

I decided to step away from the original idea of autopublishing on release creation because I figured:

1. I want an option not to publish, or more accurately, I want the ability to choose what to publish.
2. I didn't want to create a release every time I needed to publish. Usually, this need arose not because of changes to the actual "business function" code of the project, but due to issues with workflows, which were abundant.

So I created a separate [workflow](https://github.com/ydernov/typing-effect/blob/ydernov-patch-1/.github/workflows/publish-package.yml) with manual trigger. It needs only a tag name as input to know what to publish.

In the first job we check that there is a release associated with given tag. Get the commit SHA and output it. Basically recycling the code from [here](#get-tags-current-commit).

Note that the two publishing jobs have their `needs` set to this job ID. This ensures they will run only if the first job is successful and allows them to access its output (commit SHA).

### Publish to GitHub Packages

Points of interest in [this workflow](https://github.com/ydernov/typing-effect/blob/ydernov-patch-1/.github/workflows/publish-to-github-packages.yml):

1. Set `env.NODE_AUTH_TOKEN` to `GITHUB_TOKEN`:

```yml
env:
  NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
Reusable workflows, like this one, have access to `GITHUB_TOKEN` in [secters context](https://docs.github.com/en/actions/learn-github-actions/contexts#secrets-context).

2. In `setup-node` action, set `registry-url` to "https://npm.pkg.github.com":

```yml
uses: actions/setup-node@v4
with:
  node-version: '20'
  registry-url: 'https://npm.pkg.github.com'
```

When `registry-url` set to "https://npm.pkg.github.com", `setup-node` action creates `.npmrc` file with project owner's [scope](https://docs.npmjs.com/cli/v10/using-npm/scope). The scope is required by GitHub Packages.

3. The scope also needs to be set for `name` in `package.json`. Luckily, you don't have to set the scope in the actual code of the project, just for curren publish:

```bash
run: |
  # capture current name, then prepend owner name for scope
  sed -i 's/"name": "\(.*\)"/"name": "@ydernov\/\1"/' package.json
  npm i
```

Here I use `sed` to prepend my GitHub user name with `@` symbol and forward slash to the package name, transforming this:

```json
"name": "typing-effect-ts",
```

into this:
```json
"name": "@ydernov/typing-effect-ts",
```

At this point everything is set up, all there is to do is just to run:

```bash
npm run build
npm publish
```

Remember that `npm run build` depends on your `package.json`'s `scripts` setup.

In my case there is one additional intermediate step. In my README, I use a couple of GIF's as examples. I add them with `<img>` tag, and I use relative path for `src`, because they are located in `example_demos` directory in my project's code:

```markdown
<img src="example_demos/first_example.gif"  />
```

While this works when publishing to NPM, GitHub Packages fails to resolve the URL's, so the package page shows empty images. To fix it, I added a step to transform relative imge URL's to absolute:

```bash
REPO_LINK=https://github.com/ydernov/typing-effect/raw/main/
sed -i "s|\(\<img src\=\"\)\(example_demos\)|\1$REPO_LINK\2|" README.md
```

Yet again with `sed`. Here it matches `<img src="` with `example_demos` in it's path and inserts predefined `REPO_LINK` at the start of `src="`. Also, here the `|` character is used as a delimiter for `sed`.

More info on publishing NPM package to GitHub packages [here](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#publishing-a-package).

### Publish to NPM

TypingEffect is published to NPM with [provenance statements](https://docs.npmjs.com/generating-provenance-statements).

To do so as well, you need to update your `package.json`. Set the [`repository` field](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#repository). Like so:

```json
"repository": {
    "type": "git",
    "url": "https://github.com/ydernov/typing-effect.git"
}
```

Specifying this field allows the relative paths for images in README to work on published package's page on NPM right away. It also adds links to the GitHub repo on the page:

<img src="/example_demos/npm_gh_repo_links.png" width="400px" />

Now this [workflow](https://github.com/ydernov/typing-effect/blob/ydernov-patch-1/.github/workflows/publish-to-npm.yml) requires you to provide NPM token. Generate token (I use classic token, for automation) in your NPM account settings. And add it to you repository secrets. And set as `env.NODE_AUTH_TOKEN`:

```yml
env:
  NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Notice that on `workflow_call`, - when it's called by another workflow, it has `secrets` "input" and requires `NPM_TOKEN` to be provided. While on `workflow_dispatch`, - whe it is triggered manualy, it only needs a `ref` `input`. That is because as a manualy triggered workflow it has access to repository [secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions). But as a reusable workflow it only has access to [secters context](https://docs.github.com/en/actions/learn-github-actions/contexts#secrets-context).

That is why NPM token secret needs to be provided from the caller workflow:

```yml
publish-to-npm:
  needs: check-release-and-get-commit
  uses: ./.github/workflows/publish-to-npm.yml
  with:
    ref: ${{ needs.check-release-and-get-commit.outputs.sha }}
  secrets:
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Also notice:

```yml
permissions:
  id-token: write
```

Despite default write permissions set for `GITHUB_TOKEN` in repository settings, `id-token: write` still has to be set here. Otherwise it wouldn't work, at least if publishing with provenance. I **DID NOT** test without provenance.

Next is pretty straightforward:
1. Set `registry-url` to "https://registry.npmjs.org" in `setup-node` action.
2. Then install and build:
```bash
npm ci
npm run build
```

3. And publish with provenance:
```bash
npm publish --provenance --access public
```

TypingEffect package is public, so I add flag `--access` with value `public`.

With this workflow complete we now can publish to NPM by tag. And provenance adds some nice green check marks.

Such as verified version:

<img src="/example_demos/npm_verified_version.png" width="400px" />

And a provenance box with detailed build information at the bottom of the page:

<img src="/example_demos/npm_provenance.png" />

### ToDo

Additional things to do for publishing:
- Look into [artifact attestations](https://docs.github.com/en/actions/security-guides/using-artifact-attestations-to-establish-provenance-for-builds)
- Create badges for versions published to NPM and GitHub packages
- Create badges indicating successful or failing publishes of a release
---

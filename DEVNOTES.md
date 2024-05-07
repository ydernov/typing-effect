# Typing Effect Dev Notes

Here I will describe certain aspects of TypingEffect development, things, I think, may be interesting for other developers (and not to forget them myself). I've found all this information in various sources but felt like combining it all here in one place.

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

Now only a couple of steps left to get the bade:
- Run the workflow and check that deployment to pages was successful
- Navigate to [shields endpoint-badge](https://img.shields.io/badges/endpoint-badge) and construct markdown badge with URL to badge.json in your pages deployment
- Now add to your readme `[markdown_badge](link_to_coverage)`, where `link_to_coverage` is a link to your coverage html file in pages deployment

Example: 
```markdown
[![Coverage main](https://img.shields.io/endpoint?url=https%3A%2F%2Fydernov.github.io%2Ftyping-effect%2Fcoverage%2Fmain%2Fbadge.json)](https://ydernov.github.io/typing-effect/coverage/main/index.html)
```


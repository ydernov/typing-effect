# Typing Effect Dev Notes

Here I will describe certain aspects of TypingEffect development, things, I think, may be interesting for other developers (and not to forget them myself). I've found all this information in various sources but felt like combining it all here in one place.

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

I used [this playgroung](https://jqplay.org/) for writing the script and a local jq installation for testing said script. And it worked, but not on GitHub. Because both local jq and playground's jq are on were on version 1.7.1, while GitHub only had 1.6 (with no plans for updates, as I read in one post). So I've scrapped it and rewrote it in JS with [actions/github-script](https://github.com/actions/github-script).
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
- creates JSON string and returns it
The github-script action puts the value returned from script into result key in step's output.



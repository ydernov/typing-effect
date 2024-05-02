# Typing Effect Dev Notes

Here I will describe certain aspects of TypingEffect development, things, I think, may be interesting for other developers (and not to forget them myself). I've found all this information in various sources but felt like combining it all here in one place.

## GitHub Pages deploy
In this project I use GitHub Pages to

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

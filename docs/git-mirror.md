# GIT MIRROR CONFIG

Git is configured so that pushes are mirrored across multiple git servers.

```
$ git remote -v
rigin  git@github.com:llharris/lab-200a.git (fetch)
origin  ssh://git@gitlab.gsclabs.cc:43700/llharris/lab-200a.git (push)
origin  git@github.com:llharris/lab-200a.git (push)
origin  ssh://git@gitlab.200a.co.uk:2222/llharris/lab-200a.git (push)
```

When performing a `git push` this configuration pushes the updates to all three configured remotes.
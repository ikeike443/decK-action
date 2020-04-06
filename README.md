# decK-action
GitHub Action for [decK](https://deck.yolo42.com/) ( Configuration management and drift detection for Kong and Kong Enterprise ) 

With decK, you can manage the configutaions of your Kong instance in a declarative manner.  -- a.k.a. GitOps 

This action is meant for your convinience to easily create your CI/CD pipelines for your Kong configutations.

Let's start GitOps with decK and GitHub Actions!

## Typical use cases

- Check diff between the declarative files in the repo and the Kong instance confituration when you open a pull request
- Sync the state of the declarative files to the Kong instance configuration when you merge a pull request
- Open a pull request to reverse-sync automatically whenever the changes are detected in the Kong instance


## Getting started
### Setup your first CI check with decK diff
To check diff on a pull request, you can create CI.yaml under `.github/workflows` directory of your repo like below:
```yaml
name: CI
on:
  pull_request:
    branches: [ master ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    # Make sure checkout your git repository
    - uses: actions/checkout@v2
      name: "checkout"
    # Ping to your Kong instance
    - name: decK ping
      id: decK_ping
      uses: ikeike443/decK-action@master
      with:
        command: "ping"
        options: "--kong-addr ${{ secrets.KONG_ADDR }} --headers ${{ secrets.KONG_HEADERS }}"  # This option can be ommited.  But if you want to use this you need to set the secrets in your repo settings to make it work
    # Check the structure of your files
    - name: decK validate
      id: decK_validate
      uses: ikeike443/decK-action@master 
      with:
        command: "validate"
        options: "--kong-addr ${{ secrets.KONG_ADDR }} --headers ${{ secrets.KONG_HEADERS }}" 
        kong_workspaces: "test/kong"
        github_token: ${{ secrets.GITHUB_TOKEN }}
    # Check diff between the files and the Kong instance
    - name: decK diff
      id: decK_diff
      uses: ikeike443/decK-action@master
      with:
        command: "diff"
        options: "--kong-addr ${{ secrets.KONG_ADDR }} --headers ${{ secrets.KONG_HEADERS }}" 
        kong_workspaces: "test/kong"
        github_token: ${{ secrets.GITHUB_TOKEN }}
```

Then you need to set the secrets that are referred in the yaml file such as `secrets.KONG_ADDR` and `secrets.KONG_HEADERS` in this case. While you don't need to set `secrets.GITHUB_TOKEN` that is [automatically set by GitHub Actions](https://help.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token#about-the-github_token-secret). 

About how to set the secrets, please see [the documentation](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets) for the details.

That's it.  Whenever you push the changes of the declarative files, the decK-action will check the diff and report back to you on the pull request.

### Sync when the pull requst is merged
To sync the state of the files to the Kong instance you typically create Sync.yaml under `.github/workflows` directory like below:

```yaml
name: Sync
on:
  push:
    branches: [ master ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    # Make sure checkout your git repository
    - uses: actions/checkout@v2
      name: "checkout"
    # Ping to your Kong instance
    - name: decK ping
      id: decK_ping
      uses: ikeike443/decK-action@master
      with:
        command: "ping"
        options: "--kong-addr ${{ secrets.KONG_ADDR }} --headers ${{ secrets.KONG_HEADERS }}"
    # Check the structure of your files 
    - name: decK validate
      id: decK_validate
      uses: ikeike443/decK-action@master
      with:
        command: "validate"
        options: "--kong-addr ${{ secrets.KONG_ADDR }} --headers ${{ secrets.KONG_HEADERS }}" 
        kong_workspaces: "test/kong"
        github_token: ${{ secrets.GITHUB_TOKEN }}
    # Sync the state of the files to the Kong instance and update the deployment status in your repo by GitHub Deployment API
    - name: decK sync
      id: decK_sync
      uses: ikeike443/decK-action@master
      env:
        ENV_URL: "http://ikeike443-demo.net:8002" # Option: being used in the deployment status
      with:
        command: "sync"
        options: "--kong-addr ${{ secrets.KONG_ADDR }} --headers ${{ secrets.KONG_HEADERS }}" 
        kong_workspaces: "test/kong"
        github_token: ${{ secrets.GITHUB_TOKEN }}
```

### Automatically open a pull request to reverse-sync from the Kong instance 
To reverse-sync the state from the Kong instance, typically when you configured it through the Kong Manager UI, you may want to create Rev-sync.yaml under `.github/workflows` directory like below:

```yaml

name: Dump
on:
  # I recommend you to use "schedule" event to continuously check the state of the Kong instance
  schedule:
    - cron: '*/15 * * * *'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
      name: "checkout"
    - name: decK ping
      id: decK_ping
      uses: ikeike443/decK-action@master
      with:
        command: "ping"
        options: "--kong-addr ${{ secrets.KONG_ADDR }} --headers ${{ secrets.KONG_HEADERS }}"
    # This step will dump the files and then open a pull request if needed
    - name: decK dump
      id: decK_dump
      uses: ikeike443/decK-action@master
      with:
        command: "dump"
        options: "--kong-addr ${{ secrets.KONG_ADDR }} --headers ${{ secrets.KONG_HEADERS }} --all-workspaces" 
        kong_workspaces: "test/kong"
        github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Parameters you can set

### command
You can set either "ping", "validate", "diff" or "sync" commands.  Default: `ping`

### options
This field could accept any option parameters the original decK defines.  Please see `deck --help` and `deck <command> --help` for the details.

### kong_workspaces
This is mandatory to specify where the declarative files of Kong are located in the repo.  Default: `kong`

### github_token
This is also mandatory to call several GitHub API inside of the action.  Please set as `${{ secrets.GITHUB_TOKEN }}`

### ENV_URL
This is optional, if you set this, will be passed to GitHub Deployment API.  That will generate a convinient link to your Kong instance in the environment menu of the GitHub repo. 

## License

decK-action is licensed with MIT.
Please read the [LICENSE](LICENSE) file for more details.

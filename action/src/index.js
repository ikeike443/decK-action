const core = require('@actions/core');
const github = require('@actions/github');
const {decK, GHContext} = require('./main.js');
const env = process.env;

try {
    if(env.GITHUB_EVENT_NAME != "pull_request" &&
       env.GITHUB_EVENT_NAME != "push" &&
       env.GITHUB_EVENT_NAME != "schedule"){
        throw new Error(`Event ${env.GITHUB_EVENT_NAME} is not supported`);
    }

    const ghcontext = new GHContext(core.getInput("github_token"), env.GITHUB_ACTOR, env.GITHUB_EVENT_NAME, env.GITHUB_EVENT_PATH, env.GITHUB_REPOSITORY, env.GITHUB_SHA);

    const deck = new decK(core.getInput("kong_workspaces"), core.getInput("options"), ghcontext);

    switch (core.getInput("command")) {
        case "ping":
            deck.ping();
            break;
        case "validate":
            deck.validate();
            break;
        case "diff":
            deck.diff();
            break;
        case "sync":
            deck.sync();
            break;
        case "dump":
            deck.dump();
            break;
        case "version":
            deck.version();
            break;
        default:
            break;
    }
} catch (error) {
    core.setFailed(error.message);
}



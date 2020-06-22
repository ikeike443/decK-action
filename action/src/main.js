    const exec = require('child_process').execSync;
    const fs = require('fs');
    const { Octokit } = require("@octokit/rest");
    const core = require('@actions/core');

    class decK {

        constructor(dir, ops, ghcontext){

            this.dir = dir;
            this.ops = ops;
            this.ghcontext = ghcontext;

            // For local testing purpose
            if (ghcontext.actor=="nektos/act") {
                this.cmdString = 'node_modules/deck-test6/node_modules/.bin/deck ';
            }else{
                this.cmdString = 'deck ';
            }
        }


        ping(){
            try {
                let result = exec(this.cmdString+'ping '+this.ops).toString();
                console.log(result);
            } catch (error) {
                core.setFailed(error.message);
            }
        }

        async validate(){
            await this.exex_deck("validate");
        }


        async diff(){
            await this.exex_deck("diff");
        }

        async exex_deck(subCmd){
            try {
                const files = await this.ghcontext.get_files();

                let deck_files = files.filter(value => value.match(new RegExp(`^${this.dir}/.+\.(yml|yaml)`)));

                deck_files.forEach(file => {
                    console.log(`Executing: ${this.cmdString} ${subCmd} ${this.ops} -s ${file}`);  

                    const result = exec(`${this.cmdString} ${subCmd} ${this.ops} -s ${file}`).toString();
                
                    console.log(result);
                });
            } catch (error) {
                core.setFailed(error.message);
            }
        }

        async sync() {

            const files = await this.ghcontext.get_files();

            let deck_files = files.filter(value => value.match(new RegExp(`^${this.dir}/.+\.(yml|yaml)`)));

            console.log(`Creating GitHub Deployment API with ${deck_files} ...`);
            const deploy_id = await this.ghcontext.create_deployment(deck_files);


            // TODO: Need to fix: here deploy api is called whether sync executed or not
            deck_files.forEach(file => {
                try{
                    //dry-run
                    console.log(`Executing dry-run: ${this.cmdString} diff ${this.ops} -s ${file} --non-zero-exit-code`);  
                    let result = exec(`${this.cmdString} diff ${this.ops} -s ${file} --non-zero-exit-code`).toString();
                    console.log(result);
                }catch(error){
                    if(error.status==0){
                        console.log(`There is no diff to sync with ${file}`);
                    }else if(error.status==1){
                        throw new Error(error);
                    }else if(error.status==2){

                        console.log(`Executing: ${this.cmdString} sync ${this.ops} -s ${file}`);  

                        const result = exec(`${this.cmdString} sync ${this.ops} -s ${file}`).toString();
                    
                        console.log(result);
                    }
                }
            });

            console.log(`Updating Status of GitHub Deployment API with ${deck_files}: dep_id: ${deploy_id} ...`); 

            await this.ghcontext.createDeploymentStatus(deploy_id);
        }

        async dump(){
            try{
                console.log(`cd ${this.dir}`);
                console.log(`Executing: ${this.cmdString} dump ${this.ops}`);

                const out = exec(`cd ${this.dir}; ${this.cmdString} dump ${this.ops}`).toString();
                console.log(out);

                const branch = this.ghcontext.prepare_reverseSync();

                const PR_exists = await this.ghcontext.check_if_PR_exists();

                if (!PR_exists){
                    this.ghcontext.push_dumped_files(branch);
                    this.ghcontext.create_PR(branch);
                }else{
                    console.log("Pull Requests to reverse-sync are already existed");
                }
            } catch (error) {
                core.setFailed(error.message);
            }
        }
    }
    module.exports.decK = decK;

    class GHContext {
        constructor(token, actor, event_name, event_path, repository, sha){
            this.token = token;
            this.actor = actor;
            this.event_name = event_name;
            this.event_path = event_path;
            this.repository_long = repository;
            let repoArray = repository.split("/");
            this.owner = repoArray[0];
            this.repo = repoArray[1];
            this.sha = sha;
            this.octokit = new Octokit({
                auth: this.token,
                userAgent: `decK-action-local:${repository} v0.1.0`,
            });


        }
    
        async get_files(){
            if (this.event_name == "pull_request"){
                let pr_number = this.get_PR_num();
                const { data } = await this.octokit.pulls.listFiles({
                    owner: this.owner,
                    repo: this.repo,
                    pull_number: pr_number,
                });
                const files = data.map(d => d.filename);
                return files;
            }else if(this.event_name == "push"){
                const {data} = await this.octokit.repos.getCommit({
                    owner: this.owner,
                    repo: this.repo,
                    ref: this.sha,
                });
                const files = data.files.map(d => d.filename);
                return files;
            }

        }

        get_PR_num(){
            let event_json = JSON.parse(fs.readFileSync(this.event_path, "utf-8"));
            return event_json.number;
        }

        async create_deployment(file){
            const { data } = await this.octokit.repos.createDeployment({
                owner: this.owner,
                repo: this.repo,
                ref: this.sha,
                required_contexts: [],
                description: `Executing decK sync with ${file}.`
            }); 
            const dep_id = data.id;

            return dep_id;
        }

        async createDeploymentStatus(deploy_id){
            const { data } = await this.octokit.repos.createDeploymentStatus({
                owner: this.owner,
                repo: this.repo,
                deployment_id: deploy_id,
                state: "success",
                environment_url: "http://localhost:8002"
            });  
            console.log(data);
            return data;
        }


        prepare_reverseSync(){
            exec('git config --local user.email "noreply@example.com"').toString();
            exec(`git config --local user.name ${this.actor}`).toString();
            exec("git add $(ls)").toString();
            exec('git commit -m "Sync back from the Kong instance."').toString();
            const branch_name = "Kong-ReverseSync-"+Math.random().toString(32).substring(2);
            
            return branch_name;
        }

        async check_if_PR_exists(){
            const {data} = await this.octokit.search.issuesAndPullRequests({
                q: `Kong+type:pr+is:open+repo:${this.repository_long}+head:Kong-ReverseSync`,
            });
            const count = data.total_count;

            return count > 0;
        }

        push_dumped_files(branch){
            exec(`git checkout -b ${branch}`).toString();
            const remote_name = "deck"+Math.random().toString(32).substring(2);
            exec(`git remote add ${remote_name} https://${this.owner}:${this.token}@github.com/${this.repository_long}.git`).toString();
            exec(`git push ${remote_name} ${branch}`).toString();
    
        }

        async create_PR(branch){
            const { data} = await this.octokit.pulls.create({
                owner: this.owner,
                repo: this.repo,
                title: "Sync back from the Kong instance",
                head: `${this.owner}:${branch}`,
                base: "master",
                body: "This is a reverse-sync pull request from your Kong instance."
            });
            
        }
    }

    module.exports.GHContext = GHContext;

    const {decK, GHContext} = require('../src/main');
    const env = process.env;

    test ("When the event is PR, PR number should be extracted from the file path and the value should be 4.", () => {
        const ghcontext = new GHContext(env.GITHUB_TOKEN,"jest","pull_request","./action/test/github/event.json", "ikeike443/decK-action-local", "");

        expect(ghcontext.get_PR_num()).toBe(4);
    });

    test ("Test if it gets PR files", async () => {
        const ghcontext = new GHContext(env.GITHUB_TOKEN,"jest","pull_request","./action/test/github/event.json", "ikeike443/decK-action-local", "");
            
        const data = await ghcontext.get_files();
        
        expect(data).toStrictEqual(
            [
                ".github/workflows/PR.yml",
                ".github/workflows/PUSH.yml",
                ".github/workflows/main.yaml",
                "action/src/main.js",
                "action/src/sum.js",
                "action/test/github/event.json",
                "action/test/kong/Audi.yaml",
                "action/test/kong/BMW.yaml",
                "action/test/kong/Ford.yaml",
                "action/test/kong/Mercedes.yaml",
                "action/test/kong/Opel.yaml",
                "action/test/kong/Porsche.yaml",
                "action/test/kong/Volkswagen.yaml",
                "action/test/kong/default.yaml",
                "action/test/main.test.js",
                "action/test/sum.test.js",
                "package.json",
            ]
        );
        
    });

    const spyLog = jest.spyOn(console, 'log');
    spyLog.mockImplementation(x => x);
    
    test ("Test deck validate", async () => {
        const ghcontext = new GHContext(env.GITHUB_TOKEN,"jest","pull_request","./action/test/github/event.json", "ikeike443/decK-action-local", "");
        
        const deck = new decK("action/test/kong", "", ghcontext)
 
        const data = await deck.validate();
        
        expect(console.log).toBeCalled();
        expect(spyLog.mock.calls[14][0]).toEqual('Executing: deck  validate  -s action/test/kong/default.yaml');
        expect(spyLog.mock.calls[15][0]).toEqual('');
    });

    test ("Test deck diff", async () => {
        const ghcontext = new GHContext(env.GITHUB_TOKEN,"jest","pull_request","./action/test/github/event.json", "ikeike443/decK-action-local", "");
        
        const deck = new decK("action/test/kong", "", ghcontext)

        const data = await deck.diff();
        
        expect(console.log).toBeCalled();
        expect(spyLog.mock.calls[30][0]).toEqual('Executing: deck  diff  -s action/test/kong/default.yaml');
    });

    test ("Test if it gets commit files", async () => {
        const ghcontext = new GHContext(env.GITHUB_TOKEN,"jest","push","./action/test/github/event.json", "ikeike443/decK-action-local", "fe36b70c67bc2c86cb1220b8a203844997d4c338");
            
        const data = await ghcontext.get_files();
        
        expect(data).toStrictEqual(
            [
                ".github/workflows/PR.yml",
                ".github/workflows/PUSH.yml",
                ".github/workflows/main.yaml",
                "action/src/main.js",
                "action/src/sum.js",
                "action/test/github/event.json",
                "action/test/kong/Audi.yaml",
                "action/test/kong/BMW.yaml",
                "action/test/kong/Ford.yaml",
                "action/test/kong/Mercedes.yaml",
                "action/test/kong/Opel.yaml",
                "action/test/kong/Porsche.yaml",
                "action/test/kong/Volkswagen.yaml",
                "action/test/kong/default.yaml",
                "action/test/main.test.js",
                "action/test/sum.test.js",
                "package.json",
            ]
        );
        
    });


    test ("Test if deploy succeeds", async () => {
        const ghcontext = new GHContext(env.GITHUB_TOKEN,"jest","push","./action/test/github/event.json", "ikeike443/decK-action-local", "fe36b70c67bc2c86cb1220b8a203844997d4c338");
            
        const data = await ghcontext.create_deployment("dummy");
        
        expect(data).not.toBeNaN();

        const { result } = await ghcontext.createDeploymentStatus(data);

        expect(result).toStrictEqual(
            [
                ".github/workflows/PR.yml",
                ".github/workflows/PUSH.yml",
                ".github/workflows/main.yaml",
                "action/src/main.js",
                "action/src/sum.js",
                "action/test/github/event.json",
                "action/test/kong/Audi.yaml",
                "action/test/kong/BMW.yaml",
                "action/test/kong/Ford.yaml",
                "action/test/kong/Mercedes.yaml",
                "action/test/kong/Opel.yaml",
                "action/test/kong/Porsche.yaml",
                "action/test/kong/Volkswagen.yaml",
                "action/test/kong/default.yaml",
                "action/test/main.test.js",
                "action/test/sum.test.js",
                "package.json",
            ]
        );
        
    });
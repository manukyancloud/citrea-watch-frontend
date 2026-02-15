module.exports = {
    apps: [
        {
            name: "citrea-watch-frontend-staging",
            script: "npm",
            args: "run dev",
            env: {
                NODE_ENV: "development"
            }
        }
    ]
}

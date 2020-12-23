module.exports = {
    apps:[{
        name: "comps381f-project",
        script: "/var/www/comps381f/app.js",
        output: './out.log',
        error: './error.log',
        log: './combined.outerr.log',
        env:{
            NODE_ENV:'development'
        },
        env_test:{
            NODE_ENV:'test'
        },
        env_staging:{
            NODE_ENV:'staging'
        },
        env_production:{
            NODE_ENV:'production',
            PORT:'4000'
        }
    }]
}
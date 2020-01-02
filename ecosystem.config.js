
module.exports = {
    apps: [{
        name: 'uts_api',
        script: 'server.js',
        instances: 1,
        autorestart: true,
        watch: true,
        max_memory_restart: '1G',
        env_production: {
            NODE_ENV: 'production',
            UTS_PRIVATE_KEY: '',
            CONNECTION_STRING: '',
            ORIGIN_URL: '',
            CLIENTE_NAME: '',
            EMAIL_ADDRESS: '',
            EMAIL_PWD: ''
        }
    }]
};

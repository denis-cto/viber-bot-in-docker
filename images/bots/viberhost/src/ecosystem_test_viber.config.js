module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: [


        {
            name: 'viber_mobsted38',
            script: 'viber/index.js',
            instance_var: 'INSTANCE_ID',
            instances: 1,
            env_test: {
                NODE_ENV: 'test_mobsted38',
                port: 20000,
                Token: '46c189c3e367d6c4-94b2d6ba325cedfe-901014b22700d284',
                ApplicationId: 38,
                TenantName: 'denis',
                BotName: 'Mobsted Way2Mobi Bot',
                BotIcon: 'https://brusnika.mobsted.ru/tenants/brusnika/iconapp/38/icon512x512.jpg'
            }
        }

    ]


};

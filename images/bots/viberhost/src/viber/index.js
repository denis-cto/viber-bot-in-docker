console.log(process.env)
if (process.env.INSTANCE_ID==='0') {
    require('babel-core/register');
    require('babel-polyfill');
    require('./processStarter');
}

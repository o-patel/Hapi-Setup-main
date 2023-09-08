module.exports = {
  appName: 'cmt-api',
  port: 1400,
  baseUrl: 'https://cmt.techivies.com',
  debug: {
    request: ['error', 'info'],
    log: ['info', 'error', 'warning']
  },
  constants: {
    s3Prefix: 'dev',
    private_bucket : 'tspl-cmt-data',
    public_bucket : 'tspl-cmt-publicassets-data',
    API_BASEPATH: 'cmt-api.techivies.com',
    SERVER_TIMEZONE: 'Asia/Kolkata',
    TIMEZONE_API_URL :'https://worldtimeapi.org/api/timezone',
  },
  connections: {
    db: process.env.DB,
  }
}

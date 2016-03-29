# NSB Hackathon

NSB Hackathon starter kit built on NodeJS and Angular.

## Getting started
- `npm install`
- `bower install`

## Develop
- `gulp run` (will fire Node server and local dev environment)
- Use flag `--no-verify` when commiting/deploying for ignoring jshint

## Deploy
- Create Heroku account
- Follow instructions and deploy through Heroku
  - `bower install` and `gulp build --production` will run on Heroku install
  - Required `Procfile` is included

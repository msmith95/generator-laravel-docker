'use strict';
var Generator = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
const _s = require('underscore.string');
const mkdirp = require('mkdirp');

module.exports = class extends Generator{

  constructor(args, opts){
    super(args, opts);
    this.docker = {};
    this.props  = {};
  }

  prompting() {
    // Have Yeoman greet the user.
    this.log(yosay(
      'I will generate the scaffolding for a  ' + chalk.red('Laravel docker') + ' application!'
    ));

    var prompts = [{
        type: 'input',
        name: 'name',
        message: 'An nginx container will be created to host your Laravel application. Container\'s name?',
        default: _s.dasherize(_s.underscored(this.appname))
      },{
        type: 'list',
        name: 'database',
        message: 'Which database container should I create?',
        choices: [
          {
            name: 'MySQL Database (minimal configuration)',
            value: 'minimalMySQL',
            checked: true
          },
          {
            name: 'MySQL Database (small configuration)',
            value: 'smallMySQL'
          }
        ],
        store: true
      },{
        type: 'checkbox',
        name: 'extra',
        message: 'Which extra containers would you like created?',
        choices: [
          {
            name: 'Artisan Queue Daemon (Through Redis)',
            value: 'artisanQueue'
          },
          {
            name: 'Standalone Redis',
            value: 'redis'
          }
        ],
        store: true
      }
      ];

    return this.prompt(prompts).then((props) => {
      // To access props later use this.props.someAnswer;
      this.props = props;
      this.log(this.props);
    });
  }

  starting(){
    this.log("Setting up docker files and folder");
  }

  nginx(){
    mkdirp.sync('.docker/nginx/sites');
    this.docker.name = this.props.name;
    this.docker.links = [];
    this.docker.nginx = {
      links: []
    };
    this.docker.networkName = this.destinationRoot().split("/").pop().replace(/-/g, "") + "_" + this.docker.name + "-network";
    this.docker.phpContainer = this.docker.name + "-httpd";

    this.fs.copy(
      this.templatePath('conf/nginx/site.dev'),
      this.destinationPath('.docker/nginx/sites/site.dev')
    );

    this.fs.copyTpl(
        this.templatePath('Makefile'),
        this.destinationPath("Makefile"),
        {docker: this.docker}
    );
  }

  mysqlDB(){
    mkdirp.sync('.docker/mysql/conf');
    mkdirp.sync('.docker/mysql/db');
    this.docker.mysql = {
      links: []
    };
  }

  redis() {
    if ( this.props.extra && this.props.extra.indexOf('redis') !== -1 || !this.props.extra.indexOf("queue") !== -1) {
      return;
    }
    this.fs.write('.docker/redis/.gitignore', '*.aof');
  }

  queue(){

  }

  writing() {
    this.log('Creating docker-compose file...');
    this.fs.copyTpl(
      this.templatePath('docker-compose.yml'),
      this.destinationPath('docker-compose.yml'),
      {docker: this.docker}
    );
  }
};

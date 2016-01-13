# node-toukufm-slackbot (Yukiko)

Slackbot for the ToukuFM team to make our lives easier.


## Requirements

* Mongodb, use `mongod` to start - [Follow this useful guide](https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-14-04)
* Linux (Ubuntu 14.04) is recommended


## Installing

1) Clone this repository  
2) `npm install` in the repository directory  
3) `export SLACK_TOKEN=<your_slack_token>`  
4) Find your Bot user ID

   * Run the program using `node index`
   * Mention your @botname in Slack
   * Look at the program output and find the message in there
   * It'll look a bit like this: `"text":"<@U0J1BG81G> Hello there"`
   * `export SLACK_BOTNAME=your_bot_id` without the `<@` and `>`
   * So for me, it is `export SLACK_BOTNAME=U0J1BG81G`

5) Restart and use `node index` every next time to start the bot  


## Features
* Replies to `!commands`, `@botname: !commands` and `@botname: commands`
* Welcomes new team members with a heartfelt message
* Is very cute
* Is handy
* Type `!help` to find out more
* Roundup WebUI using `angular-material` and `ExpressJS`
    * Use `$ export IP=<ipaddr>` and `$ export PORT=<port>` to define which 
      port you want to use for the webserver.


## Planned Features

* Weekly roundup
* Twitter management functionality
* Soundcloud management functionality
* Facebook management functionality
* CMS panel using express with logs, roundup
* Important announcement posting via CMS->#announcements


## Contributing

I am always in need of people who like to help, submit an issue, PR or send me a request and we'll get some conversation going. I am open for just about anything, so throw your craziest ideas at me!


## License

This program is licensed under the GPL-3.0 license.

# X-Talk


<div align="center">
  <img src="https://i.imgflip.com/9iyul2.jpg" width="60%" alt="Diago" />
</div>
<hr>
<div align="center" style="line-height: 1;">
  <a href="https://www.rpggo.ai/" target="_blank" style="margin: 2px;">
    <img alt="Homepage" src="https://img.shields.io/badge/HomePage-RPGGO%20AI-7289da?&color=ffff66" style="display: inline-block; vertical-align: middle;"/>
  </a>
</div>

<div align="center" style="line-height: 1;">
  <a href="https://discord.com/invite/xZQHpSxyMT" target="_blank" style="margin: 2px;">
    <img alt="Discord" src="https://img.shields.io/badge/Discord-RPGGO%20AI-7289da?logo=discord&logoColor=white&color=7289da" style="display: inline-block; vertical-align: middle;"/>
  </a>
  <a href="" target="_blank" style="margin: 2px;">
    <img alt="Github" src="https://img.shields.io/badge/Github-RPGGO%20AI-brightgreen?logo=github&logoColor=white" style="display: inline-block; vertical-align: middle;"/>
  </a>
  <a href="https://x.com/rpggoai" target="_blank" style="margin: 2px;">
    <img alt="Twitter Follow" src="https://img.shields.io/badge/Twitter-RPGGO%20AI-white?logo=x&logoColor=white" style="display: inline-block; vertical-align: middle;"/>
  </a>
</div>

<div align="center" style="line-height: 1;">
  <a href="https://github.com/deepseek-ai/DeepSeek-R1/blob/main/LICENSE" style="margin: 2px;">
    <img alt="License" src="https://img.shields.io/badge/License-MIT-f5de53?&color=f5de53" style="display: inline-block; vertical-align: middle;"/>
  </a>
</div>

## 1. 📖Brief

We hear lots of requests from developers about how to build a AI game website like RPGGO, so we decide to open source a version of our frontend code. Of course this is not the latest version and we removed some functionalities which are not related to personal usage, but still, it is a great code example for those who want to have their own website.

We named this open source project as X-Talk, as to represent AI-driven, interactive, and dynamic conversations. The "X" symbolizes infinite possibilities, cross-domain communication, and next-gen AI dialogue systems, making it a strong fit for an AI-powered game interaction framework.

Check out the tutorial video as below

[![Setup a AI game site in 5 mins!](https://img.youtube.com/vi/_f0iuZsjHso/0.jpg)](https://www.youtube.com/watch?v=_f0iuZsjHso)


## 2. ⚙️Tech Details
We wrote a full description of the architecture design. You can read details here: 

@Add a link for document here

## 3. 📢 Chat Website & API Platform
You can experience the chat functionality in our official website: [www.rpggo.ai](https://www.rpggo.ai), and choose any game to play

If you are interested in the API platform behinds this frontend codebase, you can visit RPGGO Platform: [developer.rpggo.ai](https://developer.rpggo.ai/)


## 4. ⚡️How to Run Locally

4.1 start to clone the repo code to your local dev box

```
git clone https://github.com/RPGGO-AI/singularity.git
```

4.2 install Volta, the javascript tool manager
  
```
curl https://get.volta.sh | bash
```

> try to use "sudo curl https://get.volta.sh | bash" if not works in ubuntu

4.3 install Node, Yarn

```
volta install node

volta install yarn
```

4.4 install all dependencies

```
yarn install
```


4.5 get your token

Follow the instruction [How to Apply an API Key](https://developer.rpggo.ai/dev-docs/support/apply-your-test-key) to get your api key.

4.6 clone a config env. Note you should use environment variables if you try to deploy it in any cloud hosting platform

```
cp .env.template .env.local
```

And paste your previous api token to .env.local. But remove the "Bearer"! It should looks like 
> GAME_API_BEARER_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.J9EIQfKX-3VZh


4.7 run the code in dev

```
yarn dev
```

Here you go! You get your site fly. Copy below link to your browser and start from a quick test

```
http://localhost:3000/game/d6d9cf32-4a4e-404a-9c77-b4f5c75c39cf
```

Note, you can test more games as long as you have valid game ids. A bunch of games are available in RPGGO game lobby(https://www.rpggo.ai/). You can pick up from there.

## 7. ⚖️License
This code repository and the model weights are licensed under the [MIT License](https://).

We give you the freedom and hope you can make it better and better.


## 8. 👨‍💻‍Contributors

<a href="https://github.com/RPGGO-AI/singularity/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=RPGGO-AI/singularity" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

<br>

## 9. 🆘Future Works

We look forward to the community iteration on this code base. There are some directions worth for exploring:
- UI/UX - how to make the UI/UX configurable


## 9. 📧Contact
If you have any questions, please raise an issue or contact us at [dev@rpggo.ai](dev@rpggo.ai).

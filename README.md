# RPGGO Game (Name is TBD)


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

## 1. Introduction

We introduce our first opensource frontend for anyone who wants to host his/her own AI game site. 

@demo video here



## 2. Tech Details
We wrote a full description of the architecture design. You can read details here: 

@Add a link for document here

## 3. Chat Website & API Platform
You can experience the chat functionality in our official website: [www.rpggo.ai](https://www.rpggo.ai), and choose any game to play

If you are interested in the API platform behinds this frontend codebase, you can visit RPGGO Platform: [developer.rpggo.ai](https://developer.rpggo.ai/)


## 4. How to Run Locally

### clone repo

```git clone https://github.com/RPGGO-AI/singularity.git```

### install Volta
```curl https://get.volta.sh | bash```

### install Yarn
```volta install yarn```

### install dependencies
```yarn install```

### get your token
Follow the instruction [How to Apply an API Key](https://github.com/RPGGO-AI/stardewAIRPG/wiki/How-to-get-an-API-Key) to get your api key.

### config env
```cp .env.example .env.local```
paste your token to .env.local

### dev
```yarn dev```

### visit
```http://localhost:3000/game/d6d9cf32-4a4e-404a-9c77-b4f5c75c39cf```

## 7. License
This code repository and the model weights are licensed under the [MIT License](https://).

We give you the freedom and hope you can make it better and better.


## 8. Future Works

We look forward to the community iteration on this code base. There are some directions worth for exploring:
- UI/UX - how to make the UI/UX configurable



## 9. Contact
If you have any questions, please raise an issue or contact us at [dev@rpggo.ai](dev@rpggo.ai).

# Building a Web-Based Multi-Bot RPG with LLMs: The Frontend Behind RPGGO

> Ever imagined chatting with a house full of AI characters in a murder mystery? That’s exactly what we set out to build.

## Intro

Large Language Models (LLMs) are reshaping how we interact with software. But beyond AI chatbots and copilots, they’re also opening up new possibilities in interactive storytelling and gaming. At RPGGO, we asked ourselves a simple question:

> What if you could talk to a world full of intelligent characters—not just one?

This tech doc introduces the frontend design and architecture of our web-based, multi-NPC, LLM-powered role-playing game. We’ll walk through how we reengineered an existing open-source project to support complex dialogue flows, coordinated between multiple AI agents.

All the code we refer to is open source, and the game creation tool is free to use. If you've been excited by AI chat projects or dabbled with AI-powered games, you’ll know most of them are either single-bot or lack deeper narrative structures. We wanted to change that—with RPGGO, a multi-goal, multi-NPC text RPG platform that gives users a more immersive, game-like experience.

Code’s open source, too: https://github.com/RPGGO-AI/XTalk


## Project Overview
**Problem**

Most AI chat products—whether for productivity or entertainment—are based on single-agent dialogue. Even existing AI RPG demos often feature only one bot at a time, limiting immersion, narrative depth, and replayability.

We wanted to change that.

**Goal**

Build a front-end framework capable of:

- Supporting dynamic dialogue with multiple AI-controlled characters (NPCs)
- Provide a game-oriented UI (e.g., RPG-style chat window)
- Managing scene transitions, objectives, and game state
- Display contextual story backgrounds and NPC information
- Allowing users to switch between characters naturally
- Ensure responsiveness and extensibility through modular architecture


## Let’s Imagine a Scene
> A snowy night in 1903, London.
>
> John (a London famous Jeweler) invites George Moss (you, a detective), Mary (John's fiancée), Smith (business competitor), James (butler), and Lilith (your assistant, a neutral character) to a manor in the suburbs.
>
> ***An accident suddenly occurs after the meeting. Lilith found John's death on second floor in his room at 9:30PM. A bag of gems with blood scattered around John's body, he is killed by a heavy struck***. All people in the house gathered at John's room after hearing Lilith's screams, and, George Moss, you were the last one arrived at the room...
>
> Everyone walked upstairs at 8:45PM, and no one passed the stairs as you and Lilith were sitting at the first floor watching carefully. Now we are all at the living room on first floor, waiting for your investigations.
>
> All of the suspicious are at the first floor! It's your turn to investigate and find out who killed John.
>
> Your job is to interrogate them, piece together the clues, and solve the mystery.

All the characters except the player are AI Bots. The player must interact with them—through natural dialogue—to uncover clues, test alibis, and solve the mystery. This is not just a chatbot—this is a game powered by coordinated, responsive AI characters. This is the kind of immersive experience we’re enabling with RPGGO.

Want to try it? 👉 Play the game: [A Killer Among Us](https://www.rpggo.ai/game/d6d9cf32-4a4e-404a-9c77-b4f5c75c39cf)



## Technology Selection
We evaluated several open-source AI web chat frameworks including:
- LobeChat
- LibreChat
- ChatGPT-Next-Web

![Frontend Evaluation](./imgs/frontend%20evaluation.png)

And in the end, ChatGPT-Next-Web stood out due to its:

- Strong community and active development

- Rich plugin ecosystem and AI provider integrations

- Modern Next.js-based architecture

- Clean and extensible frontend design

This made it an ideal base for rapid prototyping and long-term extensibility.

## Architecture
The original architecture of ChatGPT-Next-Web was not designed with multi-bot conversation systems in mind and therefore could not directly support our requirements for a rich, RPG-style multi-character dialogue experience. To address this, we restructured the architecture significantly, enabling support for concurrent multi-Bot interactions.

Revised Architecture Overview:

![Architecture](./imgs/Architecture%20Diagram.png "Overall Architecture")

Beyond reworking the user interface—replacing the conventional chat window with a more immersive, RPG-style dialogue panel—the most substantial enhancements were the introduction of two new architectural layers: Logic APIs and Zajii.

Logic APIs: This layer encapsulates core game logic and interaction flow. As a developer, you no longer need to manage the complexities of invoking multiple LLM models, integrating external services, or handling API authentication and deployment. Logic APIs abstract away these details and provide a clean, unified interface for game progression and dialogue management.

Zajii Layer: This component acts as a lower-level abstraction layer over the LLMs. It not only simplifies how models are invoked but also ensures the consistency and stability of the game’s narrative logic. Zajii enables coordination between multiple NPCs and supports dynamic narrative control—critical for an engaging RPG experience.

For those who want to build on top of this system, the Logic API is publicly available here:
🔗 https://developer.rpggo.ai/dev-docs/creator-api/v2-api

With this new architecture, developers can focus more on designing meaningful stories and characters, while the underlying infrastructure handles model orchestration, state transitions, and response routing automatically.


## Dialogue Flow
Compared to traditional AI chat systems, implementing a multi-Bot dialogue flow introduces a significant layer of complexity. Fortunately, much of this complexity has been abstracted away in our backend implementation—so developers interacting with the frontend need not worry about the orchestration logic beneath.

Here’s an overview of the multi-Bot conversation workflow:

![Dialog Flow](./imgs/dialog%20flow.PNG)

In a conventional LLM-based chat system (such as ChatGPT), the user sends a message via a web interface, and the model responds in a streaming manner via a Server-Sent Events (SSE) connection. That’s a straightforward, single-agent loop.

However, in our redesigned system, the process is far more dynamic:

Bot Selection – Users can choose which NPC (Bot) to engage in conversation with. This selection dictates the immediate dialogue context.

Real-Time Switching – The user can switch between Bots at any point during the interaction.

Parallel NPC Participation – While the player is talking to one Bot, other Bots can also "observe" the conversation. With the help of the Zajii orchestration layer, relevant Bots may proactively join in if their logic dictates.

Dialogue Arbitration via DM – To maintain narrative coherence, a special AI agent we refer to as the DM (Dungeon Master) acts as a dialogue coordinator. It interprets inputs from the player and the Bots, makes decisions about narrative progression, and returns a synthesized, game-aware response to the frontend.

![Dialog Example](./imgs/dialog%20exmaple.png)

This process results in a rich and immersive player experience where conversations feel dynamic and responsive to in-game events and character knowledge.

We highly recommend trying the live demo to experience the full flow firsthand:
🎮 https://www.rpggo.ai/game/d6d9cf32-4a4e-404a-9c77-b4f5c75c39cf

While this post focuses on frontend engineering, it’s worth noting that the backend orchestration of LLMs and state management is itself a fascinating challenge. We’ll cover those architectural details in an upcoming post—stay tuned.

In the next section, we’ll focus on the frontend implementation: how the user interface and data flow are designed to support this multi-Bot RPG experience.


## Frontend Workflow

When a user enters the game (dialogue) page, the frontend initiates an API call to retrieve the current game data and stores it in the local **Game Store**. Once the player clicks the “Start” button, the frontend sends another request to initialize a new game session. The response from this request is then used to update the client-side state accordingly.

![Game Flow](./imgs/game%20flow.png)

---

## Interaction Flow

The interaction logic is illustrated in the following diagram. For a closer look at the implementation, refer to the open-source code at:  
🔗 [chat.tsx – GitHub](https://github.com/RPGGO-AI/XTalk/blob/main/app/components/chat.tsx)

![Interaction](./imgs/frontrend%20interaction.png)


The real gameplay begins the moment the user clicks the **Start** button. Here's a breakdown of what happens next:

#### 1. Game Session Initialization

An API request is sent to initiate the game, and a new session is created on the client side. Its structure looks like this:

```ts
{
  id: nanoid(),
  messages: [],
  gameId: gameId || characterId || cid,
  chapterId: "",
  gameState: GAME_ACTION.CURRENT,
}
```

- `messages`: A list storing the dialogue history between the player and the NPCs, including system-level messages.
- `gameId`: Unique identifier for the current game instance.
- `chapterId`: Each game is broken into chapters; this value tracks the current one.
- `gameState`: A critical field that reflects the current phase of the game, updated dynamically as the player interacts with NPCs.

The `gameState` values include:

```ts
export const GAME_ACTION = {
  CURRENT: 0,     // Dialogue is ongoing in the current chapter
  NEXT_GOAL: 1,   // Transition to the next game objective
  NEXT_SCENE: 2,  // Transition to the next scene
  END: 3,         // Game completed (success)
  FAIL_END: 4,    // Game over (failure)
};
```

#### 2. Updating the Game Store

Upon receiving the session initialization response, the frontend populates the local game state with the returned data, replacing the previously empty session.

##### 2.1 Setting the Scene

The first part of the update includes the **background narrative** of the current chapter. This is shown to the user at the beginning of the session, along with an update to the game status:

```ts
game: {
  ...{
    ...get().game,
    chapter,
    currentCharacter,
    characters,
  },
  state: GAME_STATE.inProgress,
}
```

In addition to the scene background, the **objective** and **chapter information** are displayed on the UI. This guides players on what they’re trying to accomplish and which NPCs they may need to speak with.

##### 2.2 Initial NPC Dialogue

Next, the frontend renders the initial messages from the NPCs. In our current example, this consists of opening lines from Lilith and James.

![NPC Dialog](./imgs/dialog%20example%202.png)

#### 3. NPC List Update

Each chapter has a unique set of NPCs. This list is included in the API response and is used to update the `characters` field within the **Chat Store**:

```ts
{
  characters: [],
  currentCharacter: {},
}
```

This setup allows the player to interact with a dynamic, context-aware cast of characters—each capable of reacting differently based on story progression and prior interactions.

---

## How Multi-Character Dialogue Works

You may have noticed that all messages in our system—whether from the user, an NPC, or the system—are stored in a single `messages` array. This unified structure simplifies data handling and allows us to render different message types distinctly in the UI.

There are three types of messages:

1. User messages  
2. NPC (Bot) messages  
3. System messages  

These message types are visually differentiated in the interface. For example, the player's avatar is always displayed on the right side of the dialogue window, while NPC avatars appear on the left—similar to how group chats are displayed in Discord.

To initiate a conversation with a specific NPC, the player simply clicks on the character’s avatar. Behind the scenes, this updates the `currentNPC` state. When a message is sent, it is added to the `messages` array using the following structure:

```ts
{
  id: nanoid(),
  date: new Date().toLocaleString(),
  role: "user",
  content: "",
  user: {},
  ...override,
  messageState: _messageState,
}
```

When the Zajii layer processes and generates a response, it could return either an NPC message or a system message. A typical NPC reply is structured as follows:

```ts
createMessage({
  logId,
  role,
  content: message,
  streaming: false,
  user: get().getCharacterById(nextCharacterId),
  systemMessage,
});
```

In cases where the system determines that the game state should be updated—such as when a goal is reached or the game ends—a system message is generated from the response data:

```ts
systemMessage: createSystemMessage({
  onlyKey: `${chapterId}_${GAME_ACTION.END}`,
  title: replyContent,
  description: replyText,
  type: SYSTEM_MESSAGE_TYPE.finish,
  action: GAME_ACTION.END,
});
```

System messages serve two main purposes:

1. Displaying background narrative or environmental descriptions.  
2. Updating the game state and notifying the player of progress or transitions.

With that, we’ve now covered the core mechanics of the dialogue system in our multi-Bot RPG experience.



---

## Custom UI Styling

If you have your own visual preferences or brand identity, the project is fully customizable. The frontend is built with Tailwind CSS, allowing you to modify UI themes, layout behaviors, and component appearances freely.

If you run into any issues or need help implementing your design ideas, feel free to submit an issue on GitHub:  
[https://github.com/RPGGO-AI/XTalk/issues](https://github.com/RPGGO-AI/XTalk/issues)

---

## Conclusion

RPGGO is committed to making game development more accessible, creative, and AI-driven. Whether you're a developer, designer, or storyteller, this platform and its open-source components empower you to bring interactive narratives to life with minimal effort.

Start building your own AI RPG today:  
[https://github.com/RPGGO-AI/XTalk](https://github.com/RPGGO-AI/XTalk)

We welcome contributions, feedback, and new ideas from the community—because the future of storytelling is collaborative, generative, and fun.

---

## More over - No-Code Game Creation

However, one question remains: how do you define the game’s progression, or even create your own RPG from scratch?

The game "Snow" showcased earlier is just one example, created using a predefined story, goals, and character interactions. But what if you want to create your own RPG game with custom chapters, characters, and plot twists?

We’ve built a dedicated tool to help you bring your own AI-driven worlds to life—let’s explore that next. That’s where the **RPGGO Creator Tool** comes in:  
[https://creator.rpggo.ai/](https://creator.rpggo.ai/)

RPGGO is an AI-powered game creation platform that allows users to build and play narrative-driven RPGs without writing any code. The key features include:

- **AI Copilot**: By simply describing your world and story in natural language, the AI helps you design characters, settings, goals, and branching narratives.
- **Zero-Code Game Creation**: No programming knowledge is required. Just tell the system what you want, and it generates the game content for you.
- **Dynamic, Replayable Experiences**: Player choices influence story progression, allowing for varied paths and multiple endings.
- **Multimodal Interaction**: Supports text, voice, and multimodal inputs for a richer, more immersive gameplay experience.
- **API Integration**: Developers can integrate RPGGO into their own apps or Discord servers using public APIs.
- **Free to Use**: RPGGO is completely free to use, making it accessible for creators of all backgrounds.

### How to Use the Creator Tool

1. **Login**: Sign in using Discord or Google.
2. **Game Creation**: Choose from templates or start from scratch. The AI Copilot will help streamline the design process.
3. **Start Playing**: Interact with NPCs and experience the game you just created. All dialogues are dynamically generated, with goals and chapters managed by the game engine.

By combining this no-code creation tool with our open-source frontend and public APIs, you can rapidly prototype and deploy a fully functional AI RPG on your preferred platform—be it AWS, Google Cloud, or anywhere else you’re comfortable.
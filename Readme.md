[![IMAGE ALT TEXT HERE](https://i.ibb.co/p2K24Xb/tron-Dance-Bg.png)](https://youtu.be/HENY8ek9ksw)


**Project Goal**: Onboard the millions of dancers into web3
**Project Track**: Gamefi
**Team Name**: TronDance
**Team Member(s)**: @zkman @ritumbhara
**DevPost URL**: [TronDance | Devpost ](https://devpost.com/software/trondance)
**Project Website**: [https://trondance.netlify.app/ ](https://trondance.netlify.app/)
**Project Test Instructions**: https://github.com/devshaaran/TronDance

![WithoutHeaders|690x389](https://global.discourse-cdn.com/business4/uploads/trondao/optimized/2X/c/c9604f91263fe036dd690ad794413b1b35fecfa3_2_1380x778.jpeg)


# TRON Dance: Your STAGE to WIN IT

Got some moves to show off? You’ve come to the right place! With TRON Dance you can make money while you MOVE on the BEAT.

There are around 264 Million dancers in the world, but most of them probably aren’t using WEB3. But we are here to change that!

The Web2 Gaming industry has an early turnover of over $400 Billion dollars worldwide. Although Web3 GameFi revenue recently reached $55 Billion in revenue in February, there’s still a long way to go.

We seek to increase WEB3 acceptance through TRON Dance by getting Dancers on board with us. On TRON Dance, dancers connect their wallets and stake TRX the easiest way to fight Dance Battles, with a variety of over 30+ tracks and awesome choreographies.

TRON Dance is the first ever Blockchain and AI driven Play to Earn game ever built, where dancers can compete, win and have fun without any prior WEB3 or even Gaming experience! How exciting! Isn’t it?

Checkout our short pitch below 👇🏽

https://www.youtube.com/watch?v=4n01-9PPdho

## So how does TRON Dance work?

It’s really simple! Dancers have 2 options:

**1) Free Battle :** Users don't have to bet any tokens, this mode lets users practice their strokes before getting into a real battle 

**2) Bet Battle :**  Users can bet TRX tokens in this mode and show-off their skills on a one-on-one battle with another user. 

**3) Marathon Battle :**  This is a 1-month contest, and users can only register at a time. There will be a registration fee for joining a battle which is fully refundable post the event completion; whoever wins the most number of matches over a period of 1 month will win TRX tokens for free (COMING SOON)

The winner takes all in a TRON Dance battle.

## How does TRON Dance decide who wins?

![Screenshot 2022-11-18 at 6.17.12 PM|690x448](https://global.discourse-cdn.com/business4/uploads/trondao/optimized/2X/5/5b09f50cbcc987c723da4d14f97e32e95b17cff4_2_1380x896.jpeg)

With the perfect blend and coordination of Blockchain and AI, we have created tech that forms the backbone for evaluating the accuracy of dance moves when compared to the given moves in the set challenge.

Evaluation of scores happens on-chain making the process completely trustless.

## High Level Architecture

![Architecure HL|690x414](https://global.discourse-cdn.com/business4/uploads/trondao/optimized/2X/c/c01b7ac5f51f2a0e1333db6e0c6c72a4d610e9ab_2_1380x828.png)

0) The user is requested to log-in the app by singing a message with his/her private key, once signed - the signature is transferred to the Authentication server which ensures the validity of the key and provides the access token to the frontend which is used to authenticate the user.

1) The user clicks "Bet Battle" on the frontend website interface when they are ready to engage.

2) The user's TronDance contract instance is checked by the backend app to see if there are sufficient funds staked.
If there are insufficient funds, the user is asked to add 5 TRX to the contract. If there are sufficient funds, the backend looks to see if any combat rooms are already open and invites the user to one of them.

3. If there isn't a Battle Room available, the Backend generates one with a (T+90) expiration time; if no one joins the BR within 90 seconds, the room expires.

4) When a new user joins the battle, the backend automatically selects a random song for the battle and initiates it after a 30-second delay, when both players are prepared.

5) To allow each player to be aware of their opponent's movements, the movements of both players are processed using pose estimation AI algorithms, and the interpolated data as well as the similarity fn between the user and the original dancer are transmitted via a web-socket.

6) Once the song is over, the websocket server sends the backend server all the interpolated movement data.

7) The data is processed by the backend server and stored in the backend database.

8) Another node server has a scheduled cron to pick up the data and post the data to the smart contract deployed on Tron. 

9) The smart contract on Tron, deploys basic logics to find out the winners from the data procured and transfers the funds to the winner.

## Our Business Model.

* **Battle Commission** 
Everytime a TRON Dance Battle ends, we charge a 5% fee which is deducted from the Winner’s Prize Pool out of which 3% goes to TronDance Foundation and 2% goes to the creator.

* **Power Ups** 
Dancers can purchase power-ups to help them fighting their opponent, for example:
a) Pick Song: The song of dance can be picked.
b) Blind other Player: The other player can be blinded with a stun screen for 6 seconds (only once per battle), where the other player won't be able to see the steps of the original artist.

![stunnedGame|690x448](https://global.discourse-cdn.com/business4/uploads/trondao/optimized/2X/1/1178237fcb90d869c7555326593a86fc45da6d27_2_1380x896.jpeg)

* **Viewer Commission** 
Viewers can bet on the player they feel will win at the beginning of the Dance Battle, a 5% fee will be deducted from the Winner’s Prize Pool.

## Scorenomics

Tokens are indeed helpful in growing the community however opening companies in BVI or Panama and procuring the necessary security license can be a hectic and expensive task (150K$-250K$) right at the time of launch. Although we have plans for launching a token in the future we will presently not release any token, nevertheless we will be releasing a game-wide score system which will be backed by Tron(TRX) as the primary in-game currency.

## How to Play?

1) Go to https://trondance.netlify.app 

2) Download Tronlink if you don't have already.

3) Click on Login ( Currently works only on NILE Testnet)

![Screenshot 2022-11-19 at 2.53.37 PM|301x500](https://global.discourse-cdn.com/business4/uploads/trondao/optimized/2X/f/fc468007a0b69ced3831bbd20d71410fd9ce633c_2_602x1000.png)

4) If you want to practice click on "Free Battle" and if you want to bet click "Bet Battle"

![Screenshot 2022-11-19 at 2.35.01 PM|690x411](https://global.discourse-cdn.com/business4/uploads/trondao/optimized/2X/1/13d7e7d116fdedcd2b02e87bef27369f9cb2a8be_2_1380x822.jpeg)

5) Wait until the game starts

![Screenshot 2022-11-19 at 2.35.19 PM|690x411](https://global.discourse-cdn.com/business4/uploads/trondao/optimized/2X/d/dc197c2647319e153aebc8d0faf0a83f4ff94807_2_1380x822.png)

6) Dance your best :stuck_out_tongue: 

![Screenshot 2022-11-18 at 5.49.52 PM|690x448](https://global.discourse-cdn.com/business4/uploads/trondao/optimized/2X/c/ca0af192e85e8a7c77a5952569db1570426fb141_2_1380x896.jpeg)

7) Reach the climax (if you win or loose)

![Image 19-11-22 at 2.50 PM|690x411](https://global.discourse-cdn.com/business4/uploads/trondao/optimized/2X/6/69b06ecd768d640d3b8d4b17cb2d2bfd91e88e89_2_1380x822.jpeg)

![Screenshot 2022-11-19 at 2.40.49 PM|690x411](https://global.discourse-cdn.com/business4/uploads/trondao/optimized/2X/2/2a7d58469c51dbd3ce39231dce229b54560fb3a6_2_1380x822.png)

Hoping to see you in one of the TRON Dance Battles anon
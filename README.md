# Mount Rushmore Draft

A live snake draft for you and your friends. Nobody needs an account. Hosted free on GitHub Pages, with a free Firebase database keeping everyone in sync.

## Files

- `index.html` is the page
- `app.js` runs the draft
- `config.js` holds your Firebase settings and host passcode (you edit this)
- `past-rounds.js` holds your 11 past rounds
- `firestore.rules` holds the database rules (you paste these into Firebase)

## 1. Make the Firebase database (about 5 minutes)

1. Go to https://console.firebase.google.com and sign in with a Google account.
2. Click **Create a project**. Name it something like `rushmore-draft`. You can turn off Google Analytics.
3. In the left menu, open **Build > Firestore Database** and click **Create database**. Pick a location near you (like `us-central`) and start in **production mode**.
4. Open the **Rules** tab, delete what's there, paste in everything from `firestore.rules`, then click **Publish**.
5. Click the gear icon > **Project settings**. Under **Your apps**, click the web icon `</>`. Name it anything and click **Register app**. Skip Firebase Hosting.
6. Firebase shows a `firebaseConfig = { ... }` block. Copy those values into `config.js`.
7. In `config.js`, change `HOST_CODE` to your own passcode.

## 2. Put it on GitHub Pages

1. Go to https://github.com/new. Name the repo `rushmore-draft`, set it to **Public** and click **Create repository**.
2. Click **uploading an existing file**. Drag in all 5 files plus this README, then click **Commit changes**.
3. Open the repo's **Settings > Pages**. Under **Branch**, pick `main` and `/ (root)`, then click **Save**.
4. Wait a minute or two. Your link will be `https://YOUR-USERNAME.github.io/rushmore-draft/`.

## 3. First run

1. Open your link. At the bottom of the home screen, open **I'm the host** and enter your passcode.
2. Open **Host tools** and tap **Load the 11 past rounds**. (The button only shows while past drafts are empty.)
3. Tap **Start a draft**, then text the link to your friends.

## How a draft works

- You enter the topic and names. The order gets shuffled and runs snake style for 4 rounds.
- Each friend picks their name from **I'm drafting as**. Their phone remembers it.
- Only the person on the clock gets a text box. Duplicate picks get blocked.
- When the last pick locks in, the draft saves to **See past drafts** automatically.

## Good to know

- There are no logins, so anyone with the link could pick as someone else or delete a past draft through the database. That's fine for friends. Don't post the link publicly.
- Firebase's free tier covers far more than a friend group will use.
- To change anything later, edit the file on GitHub (pencil icon) and commit. The site updates in a minute or two.

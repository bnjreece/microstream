![MicroStream Banner](https://bnji.org/microstream-banner.jpg)
# MicroStream 🚀

## Intro & Features ✨

MicroStream is a versatile microblogging API for individuals who are tired of walled garden microblogging services like Twitter and Mastodon. At its core, Microstream seeks to break free from the constraints of such platforms, offering users more autonomy and control over their content.

🌐 **Your Own Source of Truth**: With MicroStream, your data is saved to Supabase DB, ensuring that you always have access to your original content, irrespective of third-party platforms.

* ✅ **Post to Twitter/X**: Now Elon doesn't control your destiny.
* ✅ **Post to Mastodon**: Don't hold your breath for Threads to federate. 
* ✅ **Post to Threads**: Using http://threads.junho.io API
* ✅ **RSS Support**: Generates an RSS feed from your Microstream in Supabase. 

**Two Pre-Built Ways to Post** 

* ✅ **Input via Twilio SMS**: Just sent your post to a Twilio phone number via SMS.
* ✅ **Input via Frontend Template**: A simple frontend UI to post content powered by Next.JS for scalability.

Deploys for free to Supabase and Next.JS


```
+---------------------+         +--------+         +------------+
| Frontend Input UI   | ------> |  API   | ------> |  Twitter   |
| (Vercel/Next.js)    |         +--------+         +------------+
|           OR        |             |               +------------+
| Input via Twilio    |             +-------------->|  Mastodon  |
| Shortcut            |             |               +------------+
+---------------------+             |               +------------+
                                   +-------------->|  Threads   |
                                   |               +------------+
                                   |               +------------+
                                   +-------------->|  Supabase  |
                                   |               +------+-----+
                                   |                      |
                                   |                      |
                                   +----------------------+
                                                          |
                                                          v
                                                        +----+
                                                        | RSS |
                                                        +----+

```

## Installation 🛠

Deploying Microstream and setting it up is a breeze. Follow these steps to get started:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/bnjreece/microstream.git
   cd microstream

2. **Set Up Environment Variables**
Rename env-example.txt to .env.local and fill in the necessary values. Make sure you also add them to Vercel and Supabase. Here's a template

```
SUPABASE_URL=
SUPABASE_KEY=
TWITTER_CONSUMER_KEY=
TWITTER_CONSUMER_SECRET=
TWITTER_ACCESS_TOKEN_KEY=
TWITTER_ACCESS_TOKEN_SECRET=
MASTODON_API_URL=
MASTODON_ACCESS_TOKEN=
THREADS_USERNAME=
THREADS_PASSWORD=
TWITTER_OAUTH_CONSUMER_KEY=
TWITTER_OAUTH_TOKEN=
TWITTER_OAUTH_SIGNATURE_METHOD="HMAC-SHA1"
TWITTER_OAUTH_TIMESTAMP=
TWITTER_OAUTH_NONCE=
TWITTER_OAUTH_VERSION=
TWITTER_OAUTH_SIGNATURE=
```

3. **Deploy on Vercel**
Ensure you have the Vercel CLI installed. If not, install it using `npm i -g vercel`. Then, deploy it:
`vercel`

4. **Set Up Supabase**
Visit Supabase and create a new project.
Follow the instructions to set up the database and auth modules.
Use the provided URL and ANON KEY in your .env.local file.

5. **Run Locally** 
`npm install`
This will install various packages like @supabase/supabase-js, axios, feed, mastodon-api, next, twitter-lite, and others that are essential for the project to function correctly.
Build it 
`npm run build`
Then run the app locally: 
`npm run dev`


## Notes & Wish List 📝

Make sure to change your RSS details in the /pages/api/rss.ts file to your RSS details
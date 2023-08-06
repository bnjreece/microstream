# Microstream 🚀

## Intro & Features ✨

Microstream is a versatile microblogging API for individuals who are tired of walled garden microblogging services like Twitter and Mastodon. At its core, Microstream seeks to break free from the constraints of such platforms, offering users more autonomy and control over their content.

🌐 **Your Own Source of Truth**: With Microstream, your data is saved to Supabase DB, ensuring that you always have access to your original content, irrespective of third-party platforms.

✅ **Post to Twitter**: Seamlessly share your content on Twitter.
✅ **Post to Mastodon**: Extend your reach by posting to Mastodon.
✅ **Post to Threads**: Engage deeper by creating threaded content.
✅ **RSS Support**: Make your content more accessible with RSS feeds.
✅ **Frontend Input Template**: A simple frontend UI to post content.


```
+---------------------+         +--------+         +------------+
| Frontend Input UI   | ------> |  API   | ------> |  Twitter   |
+---------------------+         +--------+         +------------+
                                    |               +------------+
                                    +-------------->|  Mastodon  |
                                    |               +------------+
                                    |               +------------+
                                    +-------------->|  Threads   |
                                    |               +------------+
                                    |               +------------+
                                    +-------------->|  Supabase  |
                                                    +------------+
```

## Installation 🛠

Deploying Microstream and setting it up is a breeze. Follow these steps to get started:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/bnjreece/microstream.git
   cd microstream

2. **Set Up Environment Variables**
Rename .env.example to .env.local and fill in the necessary values. Here's a template

3. **Deploy on Vercel**
Ensure you have the Vercel CLI installed. If not, install it using npm i -g vercel. Then, run:
`vercel`

4. **Set Up Supabase**
Visit Supabase and create a new project.
Follow the instructions to set up the database and auth modules.
Use the provided URL and ANON KEY in your .env.local file.

5. **Run Locally** 
`npm install`
`npm run dev`

## Notes & Wish List 📝

Add more integrations to extend the reach of Microstream.
Optimize for performance and scalability.
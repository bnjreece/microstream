import { NextApiRequest, NextApiResponse } from 'next';
import Mastodon from 'mastodon-api';
import { createClient } from '@supabase/supabase-js';
import { ThreadsAPI } from 'threads-api';
import { TwitterApi } from 'twitter-api-v2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const postContent = req.body.Body ? req.body.Body : req.body.text;


    // Save to Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase environment variables are not set 2' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: supabaseData, error, status, statusText } = await supabase
      .from('posts')
      .insert([
        { content: postContent },
      ]);

    if (error || (status !== 200 && status !== 201)) {
      console.error('Error inserting into database:', { data: supabaseData, error, status, statusText });
      return res.status(500).json({ error: 'Error inserting into database', details: { data: supabaseData, error, status, statusText } });
    }

    console.log('Successfully inserted into database:', supabaseData);

    // Post to Mastodon
    const M = new Mastodon({
      access_token: process.env.MASTODON_ACCESS_TOKEN,
      timeout_ms: 60 * 1000,
      api_url: process.env.MASTODON_API_URL,
    });

    try {
      const mastodonResponse = await M.post('statuses', { status: postContent });
      console.log('Mastodon response:', mastodonResponse);
    } catch (mastodonError) {
      console.error('Error posting to Mastodon:', mastodonError);
      return res.status(500).json({ error: 'Error posting to Mastodon', details: mastodonError });
    }

// Post to Threads
    const threadsUsername = process.env.THREADS_USERNAME;
    const threadsPassword = process.env.THREADS_PASSWORD;
    
    if (!threadsUsername || !threadsPassword) {
      return res.status(500).json({ error: 'Threads environment variables are not set' });
    }
    
    const threadsAPI = new ThreadsAPI({
      username: threadsUsername, 
      password: threadsPassword,
      device: {
        manufacturer: 'Apple',
        model: 'MacBookPro18,4',
        os_version: 14.0,
        os_release: 'macOS',
      },
    });
    
    try {
      await threadsAPI.publish({ text: postContent });
      console.log('Successfully posted to Threads');
    } catch (threadsError) {
      console.error('Error posting to Threads:', threadsError);
      return res.status(500).json({ error: 'Error posting to Threads', details: threadsError });
    }

 // Initialize the Twitter API client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY as string,
  appSecret: process.env.TWITTER_CONSUMER_SECRET as string,
  accessToken: process.env.TWITTER_ACCESS_TOKEN as string,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET as string
});

// Get read-write client
const rwClient = twitterClient.readWrite;

try {
  // Get the current user
  const { data: currentUser } = await rwClient.currentUserV2();
  console.log('Current user:', currentUser.username);

  // Post a new tweet
  const { data: createdTweet } = await rwClient.v2.tweet(postContent);
  console.log('Twitter response:', createdTweet);
} catch (twitterError) {
  console.error('Error posting to Twitter:', twitterError);
  return res.status(500).json({ error: 'Error posting to Twitter', details: twitterError });
}
res.status(200).json({ message: 'Posted to Mastodon, Twitter, and stored in DB successfully.' });
} catch (err) {
  console.error('An error occurred:', err);
  if (err instanceof Error) {
    res.status(500).json({ error: `An error occurred while processing your request: ${err.message}`, stack: err.stack });
  } else {
    res.status(500).json({ error: `An error occurred while processing your request: ${String(err)}` });
  }
}
}
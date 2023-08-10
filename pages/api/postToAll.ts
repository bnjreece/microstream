import { NextApiRequest, NextApiResponse } from 'next';
import Mastodon from 'mastodon-api';
import { createClient } from '@supabase/supabase-js';
import { ThreadsAPI } from 'threads-api';
import { TwitterApi } from 'twitter-api-v2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const postContent = req.body.Body ? req.body.Body : req.body.text;

    await saveToSupabase(postContent);
    await postToMastodon(postContent);
    await postToTwitter(postContent);
    await postToThreads(postContent);

    res.status(200).json({ message: 'Posted to Mastodon, Twitter, Threads, and stored in DB successfully.' });
  } catch (err) {
    console.error('An error occurred:', err);
    if (err instanceof Error) {
      res.status(500).json({ error: `An error occurred while processing your request: ${err.message}`, stack: err.stack });
    } else {
      res.status(500).json({ error: `An error occurred while processing your request: ${String(err)}` });
    }
  }
}

async function saveToSupabase(postContent: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are not set');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: supabaseData, error, status } = await supabase.from('posts').insert([{ content: postContent }]);

  if (error || ![200, 201].includes(status)) {
    throw new Error(`Error inserting into database: ${JSON.stringify({ data: supabaseData, error, status })}`);
  }
}

async function postToMastodon(postContent: string) {
  const M = new Mastodon({
    access_token: process.env.MASTODON_ACCESS_TOKEN,
    timeout_ms: 60 * 1000,
    api_url: process.env.MASTODON_API_URL,
  });

  const mastodonResponse = await M.post('statuses', { status: postContent });

  if (!mastodonResponse) {
    throw new Error('Error posting to Mastodon');
  }
}

async function postToTwitter(postContent: string) {
  const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_CONSUMER_KEY as string,
    appSecret: process.env.TWITTER_CONSUMER_SECRET as string,
    accessToken: process.env.TWITTER_ACCESS_TOKEN as string,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET as string,
  });

  const rwClient = twitterClient.readWrite;
  const { data: createdTweet } = await rwClient.v2.tweet(postContent);

  if (!createdTweet) {
    throw new Error('Error posting to Twitter');
  }
}

async function postToThreads(postContent: string) {
  const threadsUsername = process.env.THREADS_USERNAME;
  const threadsPassword = process.env.THREADS_PASSWORD;

  if (!threadsUsername || !threadsPassword) {
    throw new Error('Threads environment variables are not set');
  }

  const threadsAPI = new ThreadsAPI({
    username: threadsUsername,
    password: threadsPassword,
   
  });

  await threadsAPI.publish({ text: postContent });
}

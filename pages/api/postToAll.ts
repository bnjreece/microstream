import { NextApiRequest, NextApiResponse } from 'next';
import Mastodon from 'mastodon-api';
import { createClient } from '@supabase/supabase-js';
import got from 'got';
import { ThreadsAPI } from 'threads-api';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

// Define a custom error type
interface GotError extends Error {
  response: {
    body: any;
  };
}

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


/*    // Post to Threads
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
 */

    // Define OAuth 1.0a object
    const oauth = OAuth({
      consumer: {
        key: process.env.TWITTER_CONSUMER_KEY,
        secret: process.env.TWITTER_CONSUMER_SECRET
      },
      signature_method: 'HMAC-SHA1',
      hash_function: (base_string: string, key: string) => crypto
        .createHmac('sha1', key)
        .update(base_string)
        .digest('base64')
    });
  
    // Define request data
    const requestData = {
      url: `https://api.twitter.com/2/users/${process.env.TWITTER_USER_ID}/tweets`,
      method: 'POST',
      data: { text: postContent },
    };
  
    // Define the OAuth access token
    const token = {
      key: process.env.TWITTER_ACCESS_TOKEN_KEY,
      secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    };
  
    // Post to Twitter
    try {
      const req = await got.post(requestData.url, {
        body: JSON.stringify(requestData.data),
        headers: {
          Authorization: oauth.toHeader(oauth.authorize(requestData, token))['Authorization'],
          'user-agent': "v2CreateTweetJS",
          'content-type': "application/json",
          'accept': "application/json"
        },
      });
  
      if (!req.body) {
        throw new Error('Unsuccessful request to Twitter');
      }
  
      console.log('Twitter response:', req.body);
    } catch (error) {
      const twitterError = error as GotError;
      console.error('Error posting to Twitter:', twitterError.response.body);
      return res.status(500).json({ error: 'Error posting to Twitter', details: twitterError.response.body });
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
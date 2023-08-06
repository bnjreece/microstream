import { NextApiRequest, NextApiResponse } from 'next';
import Mastodon from 'mastodon-api';
import { createClient } from '@supabase/supabase-js';
import got from 'got';
import { ThreadsAPI } from 'threads-api';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const postContent = req.body.Body ? req.body.Body : req.body.text;


    // Save to Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase environment variables are not set' });
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
    });

<<<<<<< HEAD
// Initialize OAuth for Twitter
=======
    try {
      await threadsAPI.publish({ text: postContent });
      console.log('Successfully posted to Threads');
    } catch (threadsError) {
      console.error('Error posting to Threads:', threadsError);
      return res.status(500).json({ error: 'Error posting to Threads', details: threadsError });
    }

    // Post to Twitter
    const endpointURL = `https://api.twitter.com/2/tweets`;
    const data = {
      "text": postContent
    };
    const oauthHeader = `OAuth oauth_consumer_key="${process.env.TWITTER_OAUTH_CONSUMER_KEY}",oauth_token="${process.env.TWITTER_OAUTH_TOKEN}",oauth_signature_method="${process.env.TWITTER_OAUTH_SIGNATURE_METHOD}",oauth_timestamp="${process.env.TWITTER_OAUTH_TIMESTAMP}",oauth_nonce="${process.env.TWITTER_OAUTH_NONCE}",oauth_version="${process.env.TWITTER_OAUTH_VERSION}",oauth_signature="${process.env.TWITTER_OAUTH_SIGNATURE}"`;
>>>>>>> parent of aac6bda (device fix)


const oauth = OAuth({
  consumer: {
      key: process.env.TWITTER_CONSUMER_KEY,
      secret: process.env.TWITTER_CONSUMER_SECRET
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string: string, key: string): string {
      return crypto
          .createHmac('sha1', key)
          .update(base_string)
          .digest('base64');
  },
});
const token = {
  key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
};

const request_data = {
  url: 'https://api.twitter.com/2/tweets',
  method: 'POST',
  data: { "text": postContent }
};

const headers = {
...oauth.toHeader(oauth.authorize(request_data, token)),
'User-Agent': 'v2CreateTweetJS',
'Content-Type': 'application/json'
};

try {
  const req = await got.post(request_data.url, {
      json: request_data.data,
      responseType: 'json',
      headers: headers
  });

    if (!req.body) {
        throw new Error('Unsuccessful request to Twitter');
    }
    console.log('Twitter response:', req.body);
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

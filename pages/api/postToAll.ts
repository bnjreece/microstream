import { NextApiRequest, NextApiResponse } from 'next';
import Mastodon from 'mastodon-api';
import { createClient } from '@supabase/supabase-js';
import got from 'got';
import { ThreadsAPI } from 'threads-api';
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

    // Post to Twitter
    const oauth_consumer_key = process.env.TWITTER_OAUTH_CONSUMER_KEY;
    const oauth_token = process.env.TWITTER_OAUTH_TOKEN;
    const oauth_signature_method = process.env.TWITTER_OAUTH_SIGNATURE_METHOD;
    const oauth_timestamp = Math.round(Date.now() / 1000);
    const oauth_nonce = crypto.randomBytes(32).toString('base64');
    const oauth_version = process.env.TWITTER_OAUTH_VERSION;

    if (!oauth_consumer_key || !oauth_token || !oauth_signature_method || !oauth_version) {
        throw new Error('Twitter OAuth environment variables are not set');
    }
    
    const consumer_secret = process.env.TWITTER_CONSUMER_SECRET;
    const token_secret = process.env.TWITTER_TOKEN_SECRET;

    if (!consumer_secret || !token_secret) {
        throw new Error('Twitter secret environment variables are not set');
    }

    const method = 'POST';
    const baseURL = 'https://api.twitter.com/2/tweets';
    
    type ParamsType = {
      [key:string]: string | number | undefined;
      oauth_consumer_key?: string;
      oauth_token?: string;
      oauth_signature_method?: string;
      oauth_timestamp?: number;
      oauth_nonce?: string;
      oauth_version?: string;
      oauth_signature?: string;
    }
    
    let params : ParamsType= {
        oauth_consumer_key,
        oauth_token,
        oauth_signature_method,
        oauth_timestamp,
        oauth_nonce,
        oauth_version,
      };

    // Percent encode every key and value that will be signed.
    let encodedParams = Object.keys(params).sort().map(key => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(params[key] as string | number)}`;
    }).join('&');

    // Create the signature base string.
    let signatureBaseString = `${method}&${encodeURIComponent(baseURL)}&${encodeURIComponent(encodedParams)}`;

    // Create the signing key.
    let signingKey = `${encodeURIComponent(consumer_secret)}&${encodeURIComponent(token_secret)}`;

    // Create the OAuth signature.
    let hmac = crypto.createHmac('sha1', signingKey);
    let signature = hmac.update(signatureBaseString).digest('base64');

    // Add the OAuth signature to the parameters.
    params['oauth_signature'] = signature;

    // Generate the OAuth header.
    let headerParams = Object.keys(params).sort().map(key => {
      return `${key}="${params[key]}"`;
    }).join(', ');

    let oauthHeader = `OAuth ${headerParams}`;

    console.log(oauthHeader);

    const endpointURL = `https://api.twitter.com/2/tweets`;
    const data = {
      "text": postContent
    };

    try {
      const req = await got.post(endpointURL, {
        json: data,
        responseType: 'json',
        headers: {
          Authorization: oauthHeader,
          'user-agent': "v2CreateTweetJS",
          'content-type': "application/json",
          'accept': "application/json"
        }
      });

      if (!req.body) {
        throw new Error('Unsuccessful request to Twitter');
      }
      console.log('Twitter response:', req.body);
    } catch (twitterError) {
      console.error('Error posting to Twitter:', twitterError);
      return res.status(500).json({ error: 'Error posting to Twitter', details: twitterError });
    }
  } catch (error) {
    console.error('Unhandled error:', error);
    return res.status(500).json({ error: 'Unhandled error', details: error });
  }
}

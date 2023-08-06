import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Feed } from 'feed';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Connect to Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: 'Supabase environment variables are not set' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Retrieve the most recent posts from the posts table
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    // Set up RSS feed
    const feed = new Feed({
        title: 'bnji-stream',
        description: 'a stream-of-thought via microstream api',
        link: 'https://bnji.org/api/rss',
        id: 'https://bnji.org/',  // This should be your site's base URL
        copyright: 'Copyright © 2023 bnjmn.org'  // Replace with the current year and your website name
      });
      
    // Add posts to the RSS feed
    posts.forEach((post) => {
      feed.addItem({
        title: post.content,
        link: `https://bnji.org/posts/${post.id}`,
        description: post.content,
        date: new Date(post.created_at),
      });
    });

    // Return the RSS feed as the response
    res.setHeader('Content-Type', 'application/rss+xml');
    res.status(200).send(feed.rss2());
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate RSS feed', details: err });
  }
}

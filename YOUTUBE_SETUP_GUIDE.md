# YouTube API Setup Guide for Yoh-Tech Solutions

## Your Channel Information
- **Channel ID**: `UC20UnSFgW5KadIRHbo-Rbkg`
- **Channel URL**: https://www.youtube.com/channel/UC20UnSFgW5KadIRHbo-Rbkg

## Step-by-Step Setup

### 1. Get YouTube API Key

1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select an existing one
3. Enable the **YouTube Data API v3**:
   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

### 2. Configure Environment Variables

Create or update your `.env.local` file in the project root:

```env
# YouTube API Configuration
YOUTUBE_API_KEY=your_actual_api_key_here
YOUTUBE_CHANNEL_ID=UC20UnSFgW5KadIRHbo-Rbkg
```

**Important**: Replace `your_actual_api_key_here` with your actual API key from step 1.

### 3. Restart Development Server

After adding the environment variables:

```bash
# Stop your development server (Ctrl+C)
# Then restart it
npm run dev
# or
yarn dev
```

### 4. Test the Configuration

1. Go to your Modem Tutorials page: http://localhost:3000/tools/modem-tutorials
2. Check the browser console for any error messages
3. The page should now load videos from your YouTube channel

## Troubleshooting

### Error: "YouTube API key not configured"
- Make sure you added `YOUTUBE_API_KEY` to your `.env.local` file
- Restart your development server after adding the environment variable

### Error: "YouTube channel ID not configured"
- Make sure you added `YOUTUBE_CHANNEL_ID=UC20UnSFgW5KadIRHbo-Rbkg` to your `.env.local` file
- The channel ID should be exactly: `UC20UnSFgW5KadIRHbo-Rbkg`

### Error: "Channel not found"
- Verify your API key is correct
- Make sure the YouTube Data API v3 is enabled in your Google Cloud project
- Check that your channel ID is correct: `UC20UnSFgW5KadIRHbo-Rbkg`

### Error: "Failed to fetch videos from YouTube"
- Check your API key permissions
- Make sure you haven't exceeded the YouTube API quota
- Verify your channel has videos uploaded

## API Quota Information

- YouTube Data API v3 has a daily quota of 10,000 units
- Each API call costs different amounts of quota:
  - Channel info: 1 unit
  - Playlist items: 1 unit
  - Video details: 1 unit
- Your app will make approximately 3-5 API calls per page load

## Security Notes

- Never commit your API key to version control
- The `.env.local` file should be in your `.gitignore`
- Consider restricting your API key to specific domains in production

## Testing Your Setup

You can test your API configuration by running the test script:

```bash
node test-youtube-api.js
```

Make sure to replace `YOUR_API_KEY_HERE` with your actual API key before running.

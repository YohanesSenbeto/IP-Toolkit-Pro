import { NextRequest, NextResponse } from 'next/server';

interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    duration: string;
    publishedAt: string;
    viewCount: number;
    likeCount: number;
    url: string;
    channelTitle: string;
    tags?: string[];
    modemModel?: string;
    connectionType?: string;
    difficulty?: string;
    serviceType?: string;
    relevanceScore?: number;
}

export async function GET(request: NextRequest) {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY;
        const channelId = process.env.YOUTUBE_CHANNEL_ID; // Your Yoh-Tech Solutions channel ID

        console.log('YouTube API Configuration Check:');
        console.log('API Key exists:', !!apiKey);
        console.log('Channel ID exists:', !!channelId);
        console.log('Channel ID value:', channelId);

        if (!apiKey) {
            console.error('YouTube API key not configured');
            return NextResponse.json(
                { error: 'YouTube API key not configured. Please add YOUTUBE_API_KEY to your environment variables.' },
                { status: 500 }
            );
        }

        if (!channelId) {
            console.error('YouTube channel ID not configured');
            return NextResponse.json(
                { error: 'YouTube channel ID not configured. Please add YOUTUBE_CHANNEL_ID=UC20UnSFgW5KadIRHbo-Rbkg to your environment variables.' },
                { status: 500 }
            );
        }

        // First, get the channel's uploads playlist
        const channelResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
        );

        if (!channelResponse.ok) {
            throw new Error('Failed to fetch channel information');
        }

        const channelData = await channelResponse.json();
        
        if (!channelData.items || channelData.items.length === 0) {
            return NextResponse.json(
                { error: 'Channel not found' },
                { status: 404 }
            );
        }

        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

        // Get videos from the uploads playlist
        const videosResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`
        );

        if (!videosResponse.ok) {
            throw new Error('Failed to fetch videos from playlist');
        }

        const videosData = await videosResponse.json();

        if (!videosData.items || videosData.items.length === 0) {
            return NextResponse.json({ videos: [] });
        }

        // Get video IDs for detailed information
        const videoIds = videosData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');

        // Get detailed video information
        const detailsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`
        );

        if (!detailsResponse.ok) {
            throw new Error('Failed to fetch video details');
        }

        const detailsData = await detailsResponse.json();

        // Transform the data to match our interface
        const videos: YouTubeVideo[] = detailsData.items.map((video: any) => ({
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
            duration: video.contentDetails.duration,
            publishedAt: video.snippet.publishedAt,
            viewCount: parseInt(video.statistics.viewCount || '0'),
            likeCount: parseInt(video.statistics.likeCount || '0'),
            url: `https://www.youtube.com/watch?v=${video.id}`,
            channelTitle: video.snippet.channelTitle,
            tags: video.snippet.tags || []
        }));

        // Filter videos that are related to modem/router configuration with enhanced criteria
        const filteredVideos = videos.filter(video => {
            const title = video.title.toLowerCase();
            const description = video.description.toLowerCase();
            
            // Primary modem/router keywords (must contain at least one)
            const primaryKeywords = [
                'modem', 'router', 'configuration', 'setup', 'wan', 'lan', 'wifi',
                'huawei', 'tp-link', 'tplink', 'd-link', 'dlink', 'cisco', 'netgear',
                'zte', 'linksys', 'fiber', 'copper', 'ethernet', 'dsl', 'pppoe',
                'network', 'internet', 'connection', 'tutorial', 'guide'
            ];
            
            // Secondary tech keywords (bonus points)
            const secondaryKeywords = [
                'ip', 'subnet', 'gateway', 'dns', 'dhcp', 'nat', 'firewall',
                'port', 'forwarding', 'qos', 'bandwidth', 'speed', 'latency',
                'mesh', 'access point', 'switch', 'bridge', 'repeater'
            ];
            
            // Exclude non-tech content
            const excludeKeywords = [
                'gaming', 'music', 'movie', 'song', 'entertainment', 'comedy',
                'cooking', 'travel', 'sports', 'news', 'politics', 'lifestyle',
                'fashion', 'beauty', 'health', 'fitness', 'education', 'school',
                'funny', 'tiktok', 'compilation', 'shorts', 'viral', 'meme',
                'prank', 'challenge', 'dance', 'reaction', 'review', 'unboxing',
                'vlog', 'daily', 'life', 'story', 'fail', 'win', 'epic',
                'amazing', 'incredible', 'shocking', 'crazy', 'insane'
            ];
            
            // Check for exclusion keywords first
            const hasExcludeKeywords = excludeKeywords.some(keyword => 
                title.includes(keyword) || description.includes(keyword)
            );
            
            if (hasExcludeKeywords) return false;
            
            // Check for primary keywords
            const hasPrimaryKeywords = primaryKeywords.some(keyword => 
                title.includes(keyword) || description.includes(keyword)
            );
            
            // Check for secondary keywords (bonus)
            const hasSecondaryKeywords = secondaryKeywords.some(keyword => 
                title.includes(keyword) || description.includes(keyword)
            );
            
            // Must have primary keywords, secondary keywords are bonus
            return hasPrimaryKeywords;
        });

        // Enhanced categorization function
        const categorizeVideo = (video: YouTubeVideo) => {
            const title = video.title.toLowerCase();
            const description = video.description.toLowerCase();
            const content = `${title} ${description}`;
            
            // Detect modem model
            let modemModel = 'Unknown';
            if (content.includes('huawei')) {
                if (content.includes('hg8245h')) modemModel = 'Huawei HG8245H';
                else if (content.includes('hg8245')) modemModel = 'Huawei HG8245';
                else if (content.includes('hg8240')) modemModel = 'Huawei HG8240';
                else modemModel = 'Huawei';
            } else if (content.includes('tp-link') || content.includes('tplink')) {
                if (content.includes('archer c6')) modemModel = 'TP-Link Archer C6';
                else if (content.includes('archer c7')) modemModel = 'TP-Link Archer C7';
                else if (content.includes('archer c8')) modemModel = 'TP-Link Archer C8';
                else if (content.includes('archer')) modemModel = 'TP-Link Archer Series';
                else modemModel = 'TP-Link';
            } else if (content.includes('d-link') || content.includes('dlink')) {
                if (content.includes('dir-825')) modemModel = 'D-Link DIR-825';
                else if (content.includes('dir-615')) modemModel = 'D-Link DIR-615';
                else if (content.includes('dir-')) modemModel = 'D-Link DIR Series';
                else modemModel = 'D-Link';
            } else if (content.includes('cisco')) {
                if (content.includes('rv320')) modemModel = 'Cisco RV320';
                else if (content.includes('rv340')) modemModel = 'Cisco RV340';
                else if (content.includes('rv')) modemModel = 'Cisco RV Series';
                else modemModel = 'Cisco';
            } else if (content.includes('netgear')) {
                if (content.includes('nighthawk')) modemModel = 'Netgear Nighthawk';
                else if (content.includes('r7000')) modemModel = 'Netgear R7000';
                else modemModel = 'Netgear';
            } else if (content.includes('zte')) {
                if (content.includes('f609')) modemModel = 'ZTE F609';
                else if (content.includes('f660')) modemModel = 'ZTE F660';
                else modemModel = 'ZTE';
            } else if (content.includes('linksys')) {
                modemModel = 'Linksys';
            }
            
            // Detect connection type
            let connectionType = 'FIBER';
            if (content.includes('copper') || content.includes('ethernet') || content.includes('dsl') || content.includes('adsl')) {
                connectionType = 'COPPER';
            } else if (content.includes('fiber') || content.includes('optical') || content.includes('ftth') || content.includes('fttp')) {
                connectionType = 'FIBER';
            }
            
            // Detect difficulty level
            let difficulty = 'BEGINNER';
            if (content.includes('advanced') || content.includes('professional') || content.includes('enterprise') || 
                content.includes('expert') || content.includes('complex') || content.includes('qos') || 
                content.includes('firewall') || content.includes('vlan')) {
                difficulty = 'ADVANCED';
            } else if (content.includes('intermediate') || content.includes('setup') || content.includes('configuration') || 
                      content.includes('install') || content.includes('basic') || content.includes('simple')) {
                difficulty = 'INTERMEDIATE';
            }
            
            // Detect service type
            let serviceType = 'BROADBAND';
            if (content.includes('pppoe') || content.includes('ppp')) {
                serviceType = 'PPPOE';
            } else if (content.includes('wan ip') || content.includes('static ip') || content.includes('wan-ip')) {
                serviceType = 'WAN_IP';
            }
            
            return {
                ...video,
                modemModel,
                connectionType,
                difficulty,
                serviceType,
                // Add relevance score for better sorting
                relevanceScore: calculateRelevanceScore(video, content)
            };
        };
        
        // Calculate relevance score based on content quality indicators
        const calculateRelevanceScore = (video: YouTubeVideo, content: string) => {
            let score = 0;
            
            // View count score (higher views = higher score)
            score += Math.log10(video.viewCount + 1) * 10;
            
            // Like count score
            score += Math.log10(video.likeCount + 1) * 5;
            
            // Content quality indicators
            if (content.includes('step by step') || content.includes('tutorial')) score += 20;
            if (content.includes('configuration') || content.includes('setup')) score += 15;
            if (content.includes('guide') || content.includes('how to')) score += 10;
            if (content.includes('complete') || content.includes('full')) score += 10;
            
            // Technical depth indicators
            if (content.includes('advanced') || content.includes('professional')) score += 15;
            if (content.includes('qos') || content.includes('firewall') || content.includes('vlan')) score += 20;
            if (content.includes('troubleshoot') || content.includes('fix') || content.includes('problem')) score += 10;
            
            // Brand specificity (more specific = higher score)
            const brandKeywords = ['huawei', 'tp-link', 'cisco', 'netgear', 'd-link', 'zte', 'linksys'];
            brandKeywords.forEach(brand => {
                if (content.includes(brand)) score += 5;
            });
            
            return Math.round(score);
        };

        // Categorize all filtered videos
        const categorizedVideos = filteredVideos.map(categorizeVideo);

        // Sort by relevance score (highest first), then by view count
        categorizedVideos.sort((a, b) => {
            if (b.relevanceScore !== a.relevanceScore) {
                return b.relevanceScore - a.relevanceScore;
            }
            return b.viewCount - a.viewCount;
        });

        return NextResponse.json({
            videos: categorizedVideos,
            totalCount: categorizedVideos.length,
            channelTitle: videosData.items[0]?.snippet?.channelTitle || 'Yoh-Tech Solutions',
            categories: {
                modemModels: [...new Set(categorizedVideos.map(v => v.modemModel))].sort(),
                connectionTypes: [...new Set(categorizedVideos.map(v => v.connectionType))].sort(),
                difficulties: [...new Set(categorizedVideos.map(v => v.difficulty))].sort(),
                serviceTypes: [...new Set(categorizedVideos.map(v => v.serviceType))].sort()
            }
        });

    } catch (error) {
        console.error('YouTube API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch videos from YouTube' },
            { status: 500 }
        );
    }
}

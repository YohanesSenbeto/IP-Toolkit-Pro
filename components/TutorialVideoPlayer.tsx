"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  Search,
  Filter,
  ExternalLink,
  Download,
  Share2
} from "lucide-react";
import { toast } from "sonner";

interface TutorialVideo {
  id: string;
  title: string;
  slug: string;
  videoUrl: string;
  category: string;
  routerModels: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface TutorialVideoPlayerProps {
  routerModel?: string;
  serviceType?: 'PPPOE' | 'WAN_IP';
  region?: string;
  onVideoSelect?: (video: TutorialVideo) => void;
}

const categories = [
  'All',
  'PPPOE Setup',
  'WAN IP Configuration',
  'Router Setup',
  'Troubleshooting',
  'Advanced Configuration'
];

const routerModels = [
  'All',
  'TP-Link Archer C6',
  'Huawei HG8245H',
  'D-Link DIR-825',
  'Netgear Nighthawk',
  'ASUS RT-AC68U',
  'Generic Router'
];

export default function TutorialVideoPlayer({
  routerModel,
  serviceType,
  region,
  onVideoSelect
}: TutorialVideoPlayerProps) {
  const [videos, setVideos] = useState<TutorialVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<TutorialVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<TutorialVideo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRouterModel, setSelectedRouterModel] = useState(routerModel || 'All');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  // Fetch tutorial videos
  useEffect(() => {
    fetchTutorialVideos();
  }, [routerModel, serviceType, region]);

  // Filter videos based on search and filters
  useEffect(() => {
    let filtered = videos;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(video =>
        video.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Filter by router model
    if (selectedRouterModel !== 'All') {
      filtered = filtered.filter(video =>
        video.routerModels.includes(selectedRouterModel)
      );
    }

    setFilteredVideos(filtered);
  }, [videos, searchQuery, selectedCategory, selectedRouterModel]);

  const fetchTutorialVideos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (routerModel) params.append('routerModel', routerModel);
      if (serviceType) params.append('serviceType', serviceType);
      if (region) params.append('region', region);

      const response = await fetch(`/api/tutorials?${params}`);
      const data = await response.json();

      if (data.success) {
        setVideos(data.tutorials);
      } else {
        toast.error('Failed to load tutorial videos');
      }
    } catch (error) {
      console.error('Error fetching tutorial videos:', error);
      toast.error('Error loading tutorial videos');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = (video: TutorialVideo) => {
    setSelectedVideo(video);
    onVideoSelect?.(video);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleShare = async (video: TutorialVideo) => {
    const shareData = {
      title: video.title,
      text: video.description,
      url: window.location.origin + `/knowledge-base/${video.slug}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Video shared successfully');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url);
      toast.success('Link copied to clipboard');
    }
  };

  const handleDownload = (video: TutorialVideo) => {
    // In a real implementation, this would download the video file
    toast.info('Download feature coming soon');
  };

  const getVideoEmbedUrl = (videoUrl: string) => {
    // Convert YouTube URL to embed URL
    if (videoUrl.includes('youtube.com/watch')) {
      const videoId = videoUrl.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (videoUrl.includes('youtu.be/')) {
      const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return videoUrl;
  };

  return (
    <div className="space-y-6">
      {/* Video Player */}
      {selectedVideo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedVideo.title}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleShare(selectedVideo)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(selectedVideo)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={getVideoEmbedUrl(selectedVideo.videoUrl)}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            
            {/* Video Controls */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleMuteToggle}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedVideo.category}</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(selectedVideo.videoUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Video Description */}
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{selectedVideo.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedVideo.routerModels.map((model, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {model}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Library */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Tutorial Video Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tutorials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedRouterModel} onValueChange={setSelectedRouterModel}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Router Model" />
                </SelectTrigger>
                <SelectContent>
                  {routerModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Video Grid */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading tutorials...</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tutorial videos found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <Card
                  key={video.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleVideoSelect(video)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      <Play className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {video.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {video.routerModels.slice(0, 2).map((model, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {model}
                        </Badge>
                      ))}
                      {video.routerModels.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{video.routerModels.length - 2}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


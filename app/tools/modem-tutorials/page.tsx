"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Play,
    Filter,
    Wifi,
    Cable,
    Router,
    Clock,
    Users,
    Star,
    ChevronDown,
    ChevronUp,
    Search,
    ExternalLink,
    Calendar,
    Eye,
} from "lucide-react";
import { toast } from "sonner";

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

export default function ModemTutorialPage() {
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedModemModel, setSelectedModemModel] = useState<string>("All");
    const [selectedLineType, setSelectedLineType] = useState<string>("All");
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch videos from YouTube API
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/youtube/videos");
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch videos");
                }

                setVideos(data.videos || []);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to load videos"
                );
                toast.error("Failed to load tutorial videos");
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    // Filter videos based on search and filters
    const filteredVideos = videos.filter((video) => {
        const matchesModem =
            selectedModemModel === "All" ||
            (video.modemModel &&
                video.modemModel
                    .toLowerCase()
                    .includes(selectedModemModel.toLowerCase()));

        const matchesLineType =
            selectedLineType === "All" ||
            (video.connectionType &&
                video.connectionType.toUpperCase() === selectedLineType);

        const matchesDifficulty =
            selectedDifficulty === "All" ||
            (video.difficulty &&
                video.difficulty.toUpperCase() === selectedDifficulty);

        const matchesSearch =
            searchQuery === "" ||
            video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (video.tags &&
                video.tags.some((tag) =>
                    tag.toLowerCase().includes(searchQuery.toLowerCase())
                )) ||
            (video.modemModel &&
                video.modemModel
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()));

        return (
            matchesModem &&
            matchesLineType &&
            matchesDifficulty &&
            matchesSearch
        );
    });

    const handleVideoPlay = (video: YouTubeVideo) => {
        toast.success(`Opening: ${video.title}`);
        window.open(video.url, "_blank");
    };

    const getDifficultyFromTitle = (video: YouTubeVideo): string => {
        return video.difficulty || "BEGINNER";
    };

    const getLineTypeFromTitle = (video: YouTubeVideo): string => {
        return video.connectionType || "FIBER";
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "BEGINNER":
                return "bg-green-100 text-green-800";
            case "INTERMEDIATE":
                return "bg-yellow-100 text-yellow-800";
            case "ADVANCED":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getLineTypeIcon = (lineType: string) => {
        return lineType === "FIBER" ? (
            <Wifi className="h-4 w-4" />
        ) : (
            <Cable className="h-4 w-4" />
        );
    };

    const formatDuration = (duration: string): string => {
        // Convert ISO 8601 duration to readable format
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return duration;

        const hours = parseInt(match[1] || "0");
        const minutes = parseInt(match[2] || "0");
        const seconds = parseInt(match[3] || "0");

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
                .toString()
                .padStart(2, "0")}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, "0")}`;
        }
    };

    const formatViewCount = (count: number): string => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        } else if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Extract unique modem models from API data
    const modemModels = Array.from(
        new Set(videos.map((video) => video.modemModel).filter(Boolean))
    ).sort();

    const difficultyLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
    const lineTypes = ["FIBER", "COPPER"] as const;

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">
                            Loading tutorial videos...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-8">
                    <div className="text-red-500 mb-4">
                        <Router className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Failed to load videos
                    </h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-background text-foreground">
            <div className="w-full max-w-screen-xl mx-auto px-2 sm:px-4 md:px-8 py-6 md:py-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 text-blue-800">
                        Modem Configuration Tutorials
                    </h1>
                    <p className="text-lg text-gray-600">
                        Learn how to configure your modem/router for optimal
                        internet connection. All tutorials are from Yoh-Tech
                        Solutions YouTube channel.
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                        <Badge
                            variant="outline"
                            className="bg-red-100 text-red-800 border-red-300"
                        >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            YouTube Channel
                        </Badge>
                        <Badge
                            variant="outline"
                            className="bg-blue-100 text-blue-800 border-blue-300"
                        >
                            {videos.length} Videos
                        </Badge>
                    </div>
                </div>

                {/* Search and Filters */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                Search & Filter Tutorials
                            </CardTitle>
                            <Button
                                className="bg-primary flex items-center gap-2"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                                {showFilters ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Search Bar */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search tutorials by title, description, or tags..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        {showFilters && (
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="grid md:grid-cols-3 gap-4">
                                    {/* Modem Model Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Modem Brand
                                        </label>
                                        <select
                                            value={selectedModemModel}
                                            onChange={(e) =>
                                                setSelectedModemModel(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="All">
                                                All Brands
                                            </option>
                                            {modemModels.map((model) => (
                                                <option
                                                    key={model}
                                                    value={model}
                                                >
                                                    {model}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Line Type Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Connection Type
                                        </label>
                                        <select
                                            value={selectedLineType}
                                            onChange={(e) =>
                                                setSelectedLineType(
                                                    e.target.value.toUpperCase()
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="All">
                                                All Types
                                            </option>
                                            {lineTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type === "FIBER"
                                                        ? "Fiber"
                                                        : "Copper"}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Difficulty Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Difficulty Level
                                        </label>
                                        <select
                                            value={selectedDifficulty}
                                            onChange={(e) =>
                                                setSelectedDifficulty(
                                                    e.target.value.toUpperCase()
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="All">
                                                All Levels
                                            </option>
                                            {difficultyLevels.map((level) => (
                                                <option
                                                    key={level}
                                                    value={level}
                                                >
                                                    {level}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Results Count */}
                        <div className="mt-4">
                            <p className="text-sm text-gray-600">
                                Showing {filteredVideos.length} of{" "}
                                {videos.length} tutorial
                                {filteredVideos.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Video Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredVideos.map((video) => {
                        const difficulty = getDifficultyFromTitle(video);
                        const lineType = getLineTypeFromTitle(video);

                        return (
                            <Card
                                key={video.id}
                                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                                onClick={() => handleVideoPlay(video)}
                            >
                                <div className="relative">
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full aspect-video object-cover rounded-t-lg"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                        <Play className="h-16 w-16 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100" />
                                    </div>
                                    <div className="absolute top-3 right-3">
                                        <Badge
                                            variant="secondary"
                                            className="bg-black bg-opacity-70 text-white"
                                        >
                                            {formatDuration(video.duration)}
                                        </Badge>
                                    </div>
                                </div>

                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        {/* Title and Line Type */}
                                        <div>
                                            <h3 className="font-semibold text-base line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                {video.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {getLineTypeIcon(lineType)}
                                                <span className="text-xs text-gray-500">
                                                    {lineType}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm text-gray-600 line-clamp-3">
                                            {video.description}
                                        </p>

                                        {/* Modem Model */}
                                        {video.modemModel &&
                                            video.modemModel !== "Unknown" && (
                                                <div className="flex items-center gap-2">
                                                    <Router className="h-3 w-3 text-gray-400" />
                                                    <span className="text-xs font-medium text-gray-700">
                                                        {video.modemModel}
                                                    </span>
                                                </div>
                                            )}

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />
                                                {formatViewCount(
                                                    video.viewCount
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(video.publishedAt)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                {video.likeCount > 0
                                                    ? formatViewCount(
                                                          video.likeCount
                                                      )
                                                    : "N/A"}
                                            </div>
                                        </div>

                                        {/* Difficulty Badge */}
                                        <div className="flex justify-between items-center">
                                            <Badge
                                                className={`text-xs px-2 py-1 ${getDifficultyColor(
                                                    difficulty
                                                )}`}
                                            >
                                                {difficulty}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                className="bg-primary text-xs"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleVideoPlay(video);
                                                }}
                                            >
                                                <ExternalLink className="h-3 w-3 mr-1" />
                                                Watch
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* No Results */}
                {filteredVideos.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <Router className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            No tutorials found
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Try adjusting your filters or search terms to find
                            relevant tutorials.
                        </p>
                        <Button
                            className="bg-primary"
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedModemModel("All");
                                setSelectedLineType("All");
                                setSelectedDifficulty("All");
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

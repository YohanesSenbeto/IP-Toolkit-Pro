"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Video, Router, Wifi, Cable } from "lucide-react";

const categories = [
  {
    id: "fiber",
    name: "Fiber Internet",
    description: "Setup and configuration guides for fiber optic connections",
    icon: Cable,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "dsl",
    name: "DSL Internet",
    description: "Digital Subscriber Line configuration and troubleshooting",
    icon: Wifi,
    color: "bg-green-100 text-green-600",
  },
  {
    id: "lte",
    name: "LTE/4G/5G",
    description: "Mobile broadband and wireless internet setups",
    icon: Wifi,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "routers",
    name: "Router Models",
    description: "Specific guides for different router manufacturers and models",
    icon: Router,
    color: "bg-orange-100 text-orange-600",
  },
];

const popularArticles = [
  {
    id: "configure-tplink-archer",
    title: "How to Configure TP-Link Archer C6 for Ethio Telecom Fiber",
    category: "Fiber",
    routerModels: ["TP-Link Archer C6", "TP-Link Archer A7"],
    videoUrl: "https://www.youtube.com/watch?v=example1",
  },
  {
    id: "huawei-ax3-setup",
    title: "Huawei AX3 Pro Setup for DSL Connections",
    category: "DSL",
    routerModels: ["Huawei AX3 Pro", "Huawei AX3"],
    videoUrl: "https://www.youtube.com/watch?v=example2",
  },
  {
    id: "basic-subnetting",
    title: "Basic IP Subnetting Concepts and Examples",
    category: "General",
    routerModels: [],
    videoUrl: "https://www.youtube.com/watch?v=example3",
  },
];

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKnowledgeBase = async () => {
      try {
        const response = await fetch('/api/knowledge-base');
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articles || []);
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching knowledge base:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKnowledgeBase();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Knowledge Base</h1>
        <p className="text-xl text-gray-600 mb-8">
          Comprehensive guides and tutorials for network configuration
        </p>
        
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search articles, tutorials, or router models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 text-lg"
          />
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Categories</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="bg-gray-200 h-12 w-12 rounded-full mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-9 bg-gray-200 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-100 text-blue-600 mb-4">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                  <CardDescription>{category.count} articles</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={() => {
                    // Navigate to category page
                    console.log(`Navigating to ${category.id} category`);
                  }}>
                    Browse Articles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Articles</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.slice(0, 6).map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription>
                    <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm mr-2">
                      {article.category}
                    </span>
                    {article.routerModels.length > 0 && (
                      <span className="text-sm text-gray-500">
                        {article.routerModels.join(", ")}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      // Navigate to article page
                      window.location.href = `/knowledge-base/${article.slug}`;
                    }}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Read Article
                    </Button>
                    {article.videoUrl && (
                      <Button variant="outline" size="sm" onClick={() => {
                        window.open(article.videoUrl, "_blank");
                      }}>
                        <Video className="h-4 w-4 mr-2" />
                        Watch Video
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No articles yet</h3>
            <p>Knowledge base articles will appear here once they are published.</p>
          </div>
        )}
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <CardContent className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-blue-600" />
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Can't find what you're looking for?</h3>
          <p className="text-gray-600 mb-6">
            Suggest new tutorial topics or request specific router configurations
          </p>
          <Button size="lg">
            Request Tutorial
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
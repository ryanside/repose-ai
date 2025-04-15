"use client";

import { useState, useEffect } from "react";

interface YouTubeShortsProps {
  topicQuery: string;
}

export default function YouTubeShorts({ topicQuery }: YouTubeShortsProps) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [searchQueryUsed, setSearchQueryUsed] = useState<string>("");

  // API key from your example
  const API_KEY = "AIzaSyCox-p0kSRp1-J0UpAFJKjYQ24SDZ9jR9I";

  useEffect(() => {
    // Skip if no topic or if we've already attempted for this topic
    if (!topicQuery || hasAttempted) return;

    const searchForShorts = async () => {
      // Simple direct search query for debugging
      const exactSearchQuery = `${topicQuery} python print shorts`;
      setSearchQueryUsed(exactSearchQuery);

      setIsLoading(true);
      setError(null);
      setHasAttempted(true); // Mark that we've attempted for this topic

      try {
        console.log("Searching YouTube for:", exactSearchQuery);

        // Search for YouTube videos related to the topic
        const searchResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(
            exactSearchQuery
          )}&type=video&safeSearch=strict&videoDuration=short&key=${API_KEY}`
        );

        if (!searchResponse.ok) {
          throw new Error("Failed to fetch search results");
        }

        const searchData = await searchResponse.json();
        console.log("Search results:", searchData);

        // Check if we got any results
        if (searchData.items && searchData.items.length > 0) {
          // Get the first result
          const selectedVideo = searchData.items[0];
          setVideoId(selectedVideo.id.videoId);
          setVideoTitle(selectedVideo.snippet.title);
          console.log("Selected video:", selectedVideo.snippet.title);
        } else {
          throw new Error("No videos found for this topic");
        }
      } catch (error) {
        console.error("Error searching for videos:", error);
        setError("Couldn't find a relevant video for this topic");
      } finally {
        setIsLoading(false);
      }
    };

    searchForShorts();
  }, [topicQuery, hasAttempted]);

  // Reset the attempt state when topic changes
  useEffect(() => {
    setHasAttempted(false);
    setVideoId(null);
    setVideoTitle("");
    setSearchQueryUsed("");
  }, [topicQuery]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center my-4 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-2 text-sm text-muted-foreground">
          Finding a relevant video for: <strong>{searchQueryUsed}</strong>
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center my-4 p-4 border border-amber-200 bg-amber-50 rounded-lg">
        <p className="text-amber-800 text-sm">{error}</p>
        <p className="text-amber-700 text-xs mt-1">
          Search query used: <strong>{searchQueryUsed}</strong>
        </p>
      </div>
    );
  }

  if (!videoId) return null;

  return (
    <div className="flex flex-col items-center my-6 mb-35">
      <div className="rounded-xl overflow-hidden shadow-lg border border-border max-w-[350px] w-full relative">
        {/* Set a fixed aspect ratio container */}
        <div className="relative w-full pb-[177.8%]">
          {" "}
          {/* 16:9 aspect ratio */}
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allowFullScreen
            title="YouTube Shorts"
          ></iframe>
        </div>
      </div>
      <div className="w-full max-w-[350px] px-2"></div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

interface YouTubeShortsProps {
  topicQuery: string;
}

export default function YouTubeShorts({ topicQuery }: YouTubeShortsProps) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API key from your example
  const API_KEY = "AIzaSyCox-p0kSRp1-J0UpAFJKjYQ24SDZ9jR9I";

  useEffect(() => {
    if (!topicQuery) return;

    const searchForShorts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Search for YouTube Shorts related to the topic
        // Adding "#shorts" to the query helps prioritize short-form content
        const searchResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(
            topicQuery + " #shorts tutorial"
          )}&type=video&videoDuration=short&key=${API_KEY}`
        );

        if (!searchResponse.ok) {
          throw new Error("Failed to fetch search results");
        }

        const searchData = await searchResponse.json();

        // Check if we got any results
        if (searchData.items && searchData.items.length > 0) {
          // Get the first result
          const videoId = searchData.items[0].id.videoId;

          // Fetch video details to confirm it's actually a Short
          const videoResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoId}&key=${API_KEY}`
          );

          if (!videoResponse.ok) {
            throw new Error("Failed to fetch video details");
          }

          const videoData = await videoResponse.json();

          if (videoData.items && videoData.items.length > 0) {
            setVideoId(videoId);
          } else {
            throw new Error("Could not fetch video details");
          }
        } else {
          throw new Error("No shorts found for this topic");
        }
      } catch (error) {
        console.error("Error searching for shorts:", error);
        setError("Couldn't find a relevant short for this topic");
      } finally {
        setIsLoading(false);
      }
    };

    searchForShorts();
  }, [topicQuery]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center my-4 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-2 text-sm text-muted-foreground">
          Finding a relevant YouTube Short...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center my-4 p-4 border border-amber-200 bg-amber-50 rounded-lg">
        <p className="text-amber-800 text-sm">{error}</p>
      </div>
    );
  }

  if (!videoId) return null;

  return (
    <div className="flex flex-col items-center my-6">
      <div className="rounded-xl overflow-hidden shadow-lg border border-border max-w-[350px] w-full">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full aspect-[9/16]"
          style={{ height: "622px" }}
          frameBorder="0"
          allowFullScreen
          title="YouTube Shorts"
        ></iframe>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Visual explanation of this topic
      </p>
    </div>
  );
}

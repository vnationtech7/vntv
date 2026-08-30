"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContentAccessGate } from "@/components/content";
import { useContentGate } from "@/hooks/use-content-gate";
import { Play, FileText } from "@/components/icons";

export default function GateDemoPage() {
  const [articleScroll, setArticleScroll] = useState(0);
  const [videoTime, setVideoTime] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoDuration] = useState(100); // Mock 100 second video

  const articleGate = useContentGate({
    type: "article",
    enabled: true,
    contentTitle: "Sample Article Title",
  });

  const videoGate = useContentGate({
    type: "video",
    enabled: true,
    contentTitle: "Sample Video Title",
  });

  // Simulate article scrolling
  useEffect(() => {
    if (articleScroll > 50 && !articleGate.isAuthenticated) {
      articleGate.triggerGate();
    }
  }, [articleScroll]);

  // Simulate video playback
  useEffect(() => {
    if (!isVideoPlaying) return;

    const interval = setInterval(() => {
      setVideoTime((prev) => {
        const newTime = prev + 1;
        const progress = (newTime / videoDuration) * 100;
        
        // Trigger gate at 25%
        if (progress >= 25 && !videoGate.isAuthenticated && !videoGate.showGate) {
          videoGate.triggerGate();
          setIsVideoPlaying(false);
        }
        
        return newTime >= videoDuration ? 0 : newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVideoPlaying, videoDuration]);

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-4xl space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Content Access Gate Demo
          </h1>
          <p className="text-text-secondary">
            Test the article and video gate components
          </p>
        </div>

        {/* Article Gate Demo */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Article Gate
            </h2>
            <Badge variant={articleGate.isAuthenticated ? "success" : "warning"}>
              {articleGate.isAuthenticated ? "Authenticated" : "Anonymous"}
            </Badge>
          </div>

          <div className="bg-background-panel border border-border rounded-lg p-6 space-y-4">
            <p className="text-text-secondary">
              Simulates article reading experience. Gate triggers when user scrolls past 50%.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Scroll Progress</span>
                <span className="font-medium text-text-primary">{articleScroll}%</span>
              </div>
              <div className="h-2 bg-background-panel-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-vntv-red transition-all duration-300"
                  style={{ width: `${articleScroll}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-text-tertiary">
                <span>Start</span>
                <span className="text-status-warning">Gate at 50%</span>
                <span>End</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setArticleScroll(Math.min(100, articleScroll + 10))}
                disabled={articleScroll >= 100}
              >
                Scroll Down (+10%)
              </Button>
              <Button
                variant="outline"
                onClick={() => setArticleScroll(0)}
              >
                Reset
              </Button>
            </div>
          </div>

          <ContentAccessGate
            type="article"
            isOpen={articleGate.showGate}
            onClose={articleGate.closeGate}
            onAuthenticated={() => {
              console.log("User authenticated via article gate");
              articleGate.closeGate();
            }}
            contentTitle="Sample Article Title"
          />
        </div>

        {/* Video Gate Demo */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Play className="h-6 w-6" />
              Video Gate
            </h2>
            <Badge variant={videoGate.isAuthenticated ? "success" : "warning"}>
              {videoGate.isAuthenticated ? "Authenticated" : "Anonymous"}
            </Badge>
          </div>

          <div className="bg-background-panel border border-border rounded-lg p-6 space-y-4">
            <p className="text-text-secondary">
              Simulates video playback. Gate triggers at 25% progress and pauses playback.
            </p>

            <div className="aspect-video bg-background-panel-2 rounded-lg flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-text-primary">
                  {Math.floor(videoTime)}s / {videoDuration}s
                </div>
                <Button
                  variant={isVideoPlaying ? "outline" : "primary"}
                  onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                  disabled={videoGate.showGate}
                >
                  {isVideoPlaying ? "Pause" : "Play"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Playback Progress</span>
                <span className="font-medium text-text-primary">
                  {Math.round((videoTime / videoDuration) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-background-panel-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-vntv-red transition-all duration-300"
                  style={{ width: `${(videoTime / videoDuration) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-text-tertiary">
                <span>0:00</span>
                <span className="text-status-warning">Gate at 25%</span>
                <span>{Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setVideoTime(0);
                setIsVideoPlaying(false);
              }}
            >
              Reset Video
            </Button>
          </div>

          <ContentAccessGate
            type="video"
            isOpen={videoGate.showGate}
            onClose={videoGate.closeGate}
            onAuthenticated={() => {
              console.log("User authenticated via video gate");
              setIsVideoPlaying(true); // Resume playback
              videoGate.closeGate();
            }}
            contentTitle="Sample Video Title"
          />
        </div>

        {/* Info */}
        <div className="bg-background-panel-2 border border-border rounded-lg p-6">
          <h3 className="font-semibold text-text-primary mb-2">How it works</h3>
          <ul className="text-sm text-text-secondary space-y-2">
            <li>• Gates only appear for anonymous (not logged in) users</li>
            <li>• Each gate can only trigger once per session</li>
            <li>• After authentication, content access resumes automatically</li>
            <li>• Article gate: Triggers after significant reading progress</li>
            <li>• Video gate: Triggers at 25% playback, pauses video</li>
            <li>• Mobile-optimized with smooth animations</li>
          </ul>
        </div>
      </div>
    </Container>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, config: any) => YT.Player;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }

  namespace YT {
    interface Player {
      playVideo(): void;
      pauseVideo(): void;
      stopVideo(): void;
      seekTo(seconds: number): void;
      getCurrentTime(): number;
      getDuration(): number;
      destroy(): void;
    }

    interface PlayerEvent {
      target: Player;
    }

    interface OnStateChangeEvent {
      data: number;
    }
  }
}

export {};

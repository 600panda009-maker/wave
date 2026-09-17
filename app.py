import webview
from pypresence import Presence
import time

# Replace with your actual Discord Developer Application Client ID
CLIENT_ID = '1549458730150666302' 

class DiscordAPI:
    def __init__(self):
        self.rpc = None
        self.connect_rpc()

    def connect_rpc(self):
        """Silently attempts to connect to the local Discord client."""
        try:
            self.rpc = Presence(CLIENT_ID)
            self.rpc.connect()
            print("Successfully connected to Discord RPC")
        except Exception as e:
            print(f"Discord not running or connection failed: {e}")
            self.rpc = None

    def update_presence(self, song_title, artist, large_text="OmniTune Desktop"):
        """Exposed to JavaScript via window.pywebview.api.update_presence"""
        # If disconnected, attempt a silent reconnect
        if not self.rpc:
            self.connect_rpc()
            
        if self.rpc:
            try:
                self.rpc.update(
                    details=f"🎵 {song_title}",
                    state=f"👤 {artist}",
                    large_image="omnitune_logo", # This key must exist in your Discord Developer Portal Rich Presence assets
                    large_text=large_text,
                    start=int(time.time()) # Shows "Elapsed time" in Discord
                )
                return {"status": "success"}
            except Exception as e:
                print(f"RPC Update Error: {e}")
                self.rpc = None # Reset connection on failure
                return {"status": "error", "message": str(e)}
                
        return {"status": "disconnected"}

if __name__ == '__main__':
    api = DiscordAPI()
    
    # Replace with your actual deployed app URL
    APP_URL = 'https://wave-beats.ai.studio/'
    
    window = webview.create_window(
        'OmniTune', 
        url=APP_URL, 
        js_api=api, 
        width=1280, 
        height=800,
        min_size=(800, 600)
    )
    
    # Start the webview GUI loop
    webview.start()

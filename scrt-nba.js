document.addEventListener("DOMContentLoaded", async () => {
            const video = document.getElementById('player');
            const youtubeEmbed = document.getElementById('youtube-player');
            const searchInput = document.querySelector('.search-input');
            const channelList = document.getElementById('channelList');
            
            let currentChannel = null;
            let shakaPlayer = null;
            let hlsPlayer = null;

            // Initialize Shaka Player
            shaka.polyfill.installAll();

            function initializeShakaPlayer() {
                if (shakaPlayer) {
                    shakaPlayer.destroy();
                }
                shakaPlayer = new shaka.Player(video);
                shakaPlayer.addEventListener('error', (error) => {
                    console.error('Shaka Player Error:', error);
                });
                return shakaPlayer;
            }

            function initializeHLSPlayer() {
                if (hlsPlayer) {
                    hlsPlayer.destroy();
                }
                if (Hls.isSupported()) {
                    hlsPlayer = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsPlayer.attachMedia(video);
                    hlsPlayer.on(Hls.Events.ERROR, (event, data) => {
                        console.error('HLS.js Error:', data);
                    });
                    return hlsPlayer;
                }
                return null;
            }
       const channels = [
{
        name: 'NBA TV Philippines',	
        logo: 'https://i.imgur.com/sG7zuX0.png',
        type: 'mpd',
        url: 'https://qp-pldt-live-grp-02-prod.akamaized.net/out/u/pl_nba.mpd',
        keyId: 'f36eed9e95f140fabbc88a08abbeafff',
        key: '0125600d0eb13359c28bdab4a2ebe75a',
                 },	 
         {        		 
        name: 'NBA- GAME 6-Indiana Pacers vs New York Knicks 8:00am (June 1, 2025)',
        logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxKvWOlRRjQqfWsCLfQB-Or4BQcA8juneenZJDBv5t6cBFXhqEvucmeVE&s=10',
        type: 'hls',
        url: 'https://honortv-sports.hf.space/watch/aHR0cHM6Ly96ZWtvbmV3Lm5ld2tzby5ydS96ZWtvL3ByZW1pdW0zMzgvbW9uby5tM3U4.m3u8',
		                  },	 
         {        		 
        name: 'UFC Fight Night Main Card : Erin Blanchfield vs Maycee Barber 6:30am (June 1, 2025)',
        logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXiuRiDnwZdWUhnSU2j19Bwf4c55jbykxBxWPwxqs7qGcbeCkZjvmTpugq&s=10',
        type: 'hls',
        url: 'https://honortv-sports.hf.space/watch/aHR0cHM6Ly93aW5kbmV3Lm5ld2tzby5ydS93aW5kL3ByZW1pdW02OC9tb25vLm0zdTg=.m3u8'
        		                  },	 
         {        		 
        name: 'WWE- Battleground Championship Wrestling 8:00am (June 1, 2025)',
        logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKpQ24FP-p7EaM6q1ll5l1oa42w0aBQ4HQcTQRTfdKyut2vIn9ggg0vakB&s=10',
        type: 'hls',
        url: 'https://honortv-sports.hf.space/watch/aHR0cHM6Ly9kZHk2bmV3Lm5ld2tzby5ydS9kZHk2L3ByZW1pdW0xNjcvbW9uby5tM3U4.m3u8'
         }
            ];	
			
	async function cleanupPlayers() {
                youtubeEmbed.src = '';
                youtubeEmbed.style.display = 'none';

                if (shakaPlayer) {
                    await shakaPlayer.destroy();
                    shakaPlayer = null;
                }

                if (hlsPlayer) {
                    hlsPlayer.destroy();
                    hlsPlayer = null;
                }

                video.style.display = 'block';
                video.src = '';
                video.load();
            }

            async function playStream(channel) {
                try {
                    await cleanupPlayers();

                    if (channel.type === 'youtube') {
                        video.style.display = 'none';
                        youtubeEmbed.style.display = 'block';
                        youtubeEmbed.src = `${channel.embedUrl}&autoplay=1`;
                    } else if (channel.type === 'hls') {
                        hlsPlayer = initializeHLSPlayer();
                        if (hlsPlayer) {
                            hlsPlayer.loadSource(channel.url);
                            hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
                                video.play();
                            });
                        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                            // Fallback for Safari
                            video.src = channel.url;
                            video.play();
                        }
                    } else if (channel.type === 'mpd') {
                        shakaPlayer = initializeShakaPlayer();
                        
                        if (channel.keyId && channel.key) {
                            shakaPlayer.configure({
                                drm: {
                                    clearKeys: {
                                        [channel.keyId]: channel.key
                                    }
                                }
                            });
                        }

                        await shakaPlayer.load(channel.url);
                        video.play();
                    }
                } catch (error) {
                    console.error('Error playing stream:', error);
                }
            }

            function renderChannelList(channelsToRender) {
                channelList.innerHTML = channelsToRender.map(channel => `
                    <li class="channel-item ${channel === currentChannel ? 'active' : ''}" data-channel-index="${channels.indexOf(channel)}">
                        <div class="channel-content">
                            <div class="channel-logo">
                                <img src="${channel.logo}" alt="${channel.name}" />
                            </div>
                            <div class="channel-info">
                                <div class="channel-name">${channel.name}</div>
                                <div class="channel-type">${channel.type.toUpperCase()}</div>
                            </div>
                        </div>
                    </li>
                `).join('');

                document.querySelectorAll('.channel-item').forEach(item => {
                    item.addEventListener('click', async () => {
                        const channel = channels[parseInt(item.dataset.channelIndex)];
                        currentChannel = channel;
                        await playStream(channel);
                        
                        document.querySelectorAll('.channel-item').forEach(i => i.classList.remove('active'));
                        item.classList.add('active');
                    });
                });
            }

            renderChannelList(channels);
            if (channels.length > 0) {
                currentChannel = channels[0];
                await playStream(currentChannel);
            }

            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredChannels = channels.filter(channel =>
                    channel.name.toLowerCase().includes(searchTerm)
                );
                renderChannelList(filteredChannels);
            });
        });

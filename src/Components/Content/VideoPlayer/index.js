import React from "react"
import VideoPlayer from "../VideoJsHook/index"

function VideoPlayerSource({ videoUrl, anime, info, index }) {
	return (
		<div>
			<VideoPlayer
				src={videoUrl}
				controls={true}
				autoplay={true}
				anime={anime}
				info={info}
				index={index}
			/>
		</div>
	)
}

export default VideoPlayerSource

import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import VideoEmbed from "../../../Components/Content/VideoEmbed"
import useDocumentTitle from "../../../Components/Content/DocumentTitleHook"
import { BsFillArrowLeftSquareFill } from "react-icons/bs"
import LoadingRequest from "../../../Components/Content/LoadingRequest"
import "./animewatch.css"
import VideoPlayer from "../VideoPlayer"

function AnimeWatch({ instance }) {
	const { anime } = useParams()
	const queryParams = new URLSearchParams(window.location.search)
	const index = queryParams.get("index")
	const specialid = queryParams.get("specialid")
	const [info, setInfo] = useState([])
	const [watchDetail, setWatchDetail] = useState("Đang tải")
	const [videoUrl, setVideoUrl] = useState([])
	const [videoEmbed, setVideoEmbed] = useState("")
	const [videoLoading, setVideoLoading] = useState(true)
	const [mainId, setMainId] = useState()
	const prevAnilist = useRef()

	useEffect(() => {
		const CancelToken = axios.CancelToken
		const source = CancelToken.source()
		if (prevAnilist.current !== anime) {
			const getList = async () => {
				const { data } = await instance
					.get(`/watch/${anime}`, {
						cancelToken: source.token,
					})
					.catch((thrown) => {
						if (axios.isCancel(thrown)) return
					})
				setInfo(data.data.episodes)
				setMainId(data.data.id)
			}
			getList()
			prevAnilist.current = anime
		}
		return () => {
			source.cancel()
		}
	}, [anime, instance])

	useEffect(() => {
		const CancelToken = axios.CancelToken
		const source = CancelToken.source()
		if (mainId && index !== null) {
			const getAnime = async () => {
				const numIndex = Number(index)
				await instance
					.get(`/anime/${mainId}/episodes/${numIndex}`, {
						cancelToken: source.token,
					})
					.then((response) => {
						if (typeof response.data.data?.videoSource !== "undefined") {
							setVideoUrl([
								{
									default: true,
									url: response.data.data.videoSource,
									html: response.data.data.quality,
								},
							])
						} else {
							setVideoEmbed(response.data.data.embedSource)
						}
						const watchFilm = response.data.data.film_name
						const watchEpisodeName = response.data.data.full_name
						setWatchDetail(watchFilm + ` (${watchEpisodeName})`)
						setVideoLoading(false)
					})
					.catch((thrown) => {
						if (axios.isCancel(thrown)) return
					})
			}
			getAnime()
		}

		if (mainId && specialid !== null) {
			const getAnimeSpecial = async () => {
				const numSpecialId = Number(specialid)
				await instance
					.get(`/specialanime/${mainId}/${numSpecialId}`)
					.then((res) => {
						// VIDEO URL IS HERE
						const watchFilm = res.data.data.film_name
						const watchEpisodeName = res.data.data.full_name
						setWatchDetail(watchFilm + ` (${watchEpisodeName})`)
						setVideoUrl([
							{
								default: true,
								url: res.data.data.videoSource,
								html: res.data.data.quality,
							},
						])
						setVideoLoading(false)
					})
					.catch((thrown) => {
						if (axios.isCancel(thrown)) return
					})
			}
			getAnimeSpecial()
		}

		const element = document.getElementsByClassName("active")[0]
		if (element) {
			element.scrollIntoView({ behavior: "smooth" })
		}
	}, [index, instance, mainId, specialid])

	useDocumentTitle(watchDetail)

	return (
		<>
			<div>
				<div className="flex max-lg:flex-col">
					{videoLoading ? (
						<LoadingRequest />
					) : videoUrl.length > 0 ? (
						<VideoPlayer videoUrl={videoUrl} />
					) : (
						videoEmbed && <VideoEmbed videoEmbed={videoEmbed} />
					)}
					<div className="episode-content">
						<div className="episode-section">
							<div className="episode-section-fixed">
								<Link
									to={`/info/${anime}`}
									className="group hover:opacity-80 duration-200 ease-in-out"
								>
									<button className="bg-[#000] border-none flex items-center justify-center">
										<BsFillArrowLeftSquareFill style={{ color: "white" }} />
									</button>
								</Link>
								<div className="episode-heading-section">
									<h5 className="episode-section-title text-center text-white font-bold">
										DANH SÁCH TẬP PHIM
									</h5>
								</div>
							</div>
						</div>
						<div className="lg:h-[calc(100vh-60px)] overflow-y-scroll bg-[#222] h-[20vh]">
							{info.map((item, i) => (
								<Link
									to={`/watch/${anime}?index=${item.name}`}
									key={i}
									title={item.full_name}
									className={`w-100 h-[70px] px-[12px] leading-normal py-1 hover:text-white hover:opacity-80 hover:bg-white/20 duration-200 ease-in-out line-clamp-2 ${
										parseInt(index) === parseInt(item.name)
											? "bg-white/50 active"
											: "odd:bg-[#111111] even:bg-[#272727]"
									}`}
									onClick={() => setVideoLoading(true)}
								>
									{item.full_name}
								</Link>
							))}
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
export default AnimeWatch
